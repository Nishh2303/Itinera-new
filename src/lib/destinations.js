// Offline fallback for destination search, used when Geoapify is unavailable
// or returns nothing.
const popular = [
  ["Goa, India", "in"], ["Jaipur, India", "in"], ["Udaipur, India", "in"], ["Kerala, India", "in"],
  ["Manali, India", "in"], ["Leh-Ladakh, India", "in"], ["Varanasi, India", "in"], ["Rishikesh, India", "in"],
  ["Mumbai, India", "in"], ["Andaman Islands, India", "in"], ["Paris, France", "fr"], ["London, United Kingdom", "gb"],
  ["Rome, Italy", "it"], ["Florence, Italy", "it"], ["Venice, Italy", "it"], ["Barcelona, Spain", "es"],
  ["Amsterdam, Netherlands", "nl"], ["Prague, Czech Republic", "cz"], ["Vienna, Austria", "at"],
  ["Santorini, Greece", "gr"], ["Interlaken, Switzerland", "ch"], ["Istanbul, Türkiye", "tr"],
  ["Dubai, United Arab Emirates", "ae"], ["Tokyo, Japan", "jp"], ["Kyoto, Japan", "jp"], ["Seoul, South Korea", "kr"],
  ["Singapore", "sg"], ["Bangkok, Thailand", "th"], ["Phuket, Thailand", "th"], ["Bali, Indonesia", "id"],
  ["Hanoi, Vietnam", "vn"], ["Maldives", "mv"], ["Colombo, Sri Lanka", "lk"], ["Kathmandu, Nepal", "np"],
  ["New York, United States", "us"], ["San Francisco, United States", "us"], ["Sydney, Australia", "au"],
  ["Cape Town, South Africa", "za"], ["Marrakech, Morocco", "ma"], ["Cusco, Peru", "pe"],
  ["Mexico City, Mexico", "mx"], ["Rio de Janeiro, Brazil", "br"],
].map(([name, countryCode]) => ({ name, countryCode, kind: "Popular" }));

const domestic = popular.filter((d) => d.countryCode === "in").slice(0, 5);
const abroad = popular.filter((d) => d.countryCode !== "in").slice(0, 5);

const matches = (d, q) => d.name.toLowerCase().includes(q);

// Sections shown before the user types anything.
export function browseSections() {
  const recent = loadRecent();
  return [
    recent.length && { title: "Recent", items: recent.map((d) => ({ ...d, kind: "Recent" })) },
    { title: "Popular in India", items: domestic },
    { title: "Popular abroad", items: abroad },
  ].filter(Boolean);
}

const label = (p) =>
  [p.name, p.type === "country" || p.type === "state" ? null : p.state, p.country]
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i)
    .join(", ");

const kinds = { city: "City", state: "Region", country: "Country", district: "Area", locality: "Area", county: "Region" };

// OpenStreetMap categories worth travelling to: settlements, regions, nature,
// parks, water and heritage. Shops, roads and buildings are dropped.
const travelKeys = new Set(["place", "natural", "boundary", "water", "waterway", "tourism", "historic", "leisure", "mountain_pass"]);

const osmKinds = {
  city: "City", town: "Town", village: "Village", hamlet: "Village", suburb: "Area", neighbourhood: "Area",
  quarter: "Area", locality: "Area", island: "Island", islet: "Island", archipelago: "Islands", state: "Region",
  region: "Region", province: "Region", county: "Region", country: "Country", peak: "Peak", valley: "Valley",
  beach: "Beach", lake: "Lake", river: "River", glacier: "Glacier", waterfall: "Waterfall", nature_reserve: "Nature reserve",
  national_park: "National park", protected_area: "Protected area", attraction: "Attraction", viewpoint: "Viewpoint",
  park: "Park", garden: "Garden", castle: "Castle", fort: "Fort", monument: "Monument", archaeological_site: "Heritage site",
};

const kindOf = (p) =>
  osmKinds[p.osm_value] || kinds[p.type] || (p.osm_value && p.osm_value !== "yes" ? p.osm_value.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase()) : "Place");

const cache = new Map();

const dedupe = (list) => {
  const seen = new Set();
  return list.filter((d) => {
    const k = d.name?.toLowerCase();
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

// Open-Meteo (GeoNames): fast, population-ranked towns and villages worldwide.
async function openMeteo(term, signal) {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.search = new URLSearchParams({ name: term, count: "10", language: "en", format: "json" });
  const data = await (await fetch(url, { signal })).json();
  return (data.results || []).map((r) => {
    const fc = r.feature_code || "";
    const kind = fc.startsWith("PCL") ? "Country" : fc.startsWith("ADM") ? "Region" : fc === "PPLC" ? "Capital"
      : fc.startsWith("PPL") ? (r.population > 100000 ? "City" : r.population > 10000 ? "Town" : "Village")
      : osmKinds[{ GLCR: "glacier", LK: "lake", MT: "peak", VAL: "valley", ISL: "island", PRK: "park" }[fc]] || "Place";
    return {
      name: [r.name, kind === "Country" || kind === "Region" ? null : r.admin1, r.country]
        .filter(Boolean)
        .filter((v, i, a) => a.indexOf(v) === i)
        .join(", "),
      countryCode: r.country_code,
      kind,
    };
  });
}

// Photon (OpenStreetMap): slower, but also finds valleys, treks, lakes, parks and heritage sites.
async function photon(term, signal) {
  const url = new URL("https://photon.komoot.io/api/");
  url.search = new URLSearchParams({ q: term, limit: "15", lang: "en" });
  const data = await (await fetch(url, { signal })).json();
  return (data.features || [])
    .map(({ properties: p }) => p)
    .filter((p) => travelKeys.has(p.osm_key) && p.type !== "house" && p.type !== "street")
    .map((p) => ({ name: label(p), countryCode: p.countrycode, kind: kindOf(p) }));
}

async function geoapify(term, signal) {
  const url = new URL("https://api.geoapify.com/v1/geocode/autocomplete");
  url.search = new URLSearchParams({ text: term, apiKey: GEOAPIFY_KEY, limit: "8", format: "json", lang: "en" });
  const data = await (await fetch(url, { signal })).json();
  return (data.results || []).map((r) => ({
    name: label({ name: r.city || r.name || r.state || r.country, state: r.state, country: r.country, type: r.result_type }),
    countryCode: r.country_code,
    kind: kinds[r.result_type] || "Place",
  }));
}

// Worldwide search. Sources run in parallel; `onUpdate` receives merged results
// as each one arrives, so fast results show immediately. No API key required.
export async function searchDestinations(term, signal, onUpdate = () => {}) {
  const key = term.trim().toLowerCase();
  if (cache.has(key)) {
    onUpdate(cache.get(key));
    return cache.get(key);
  }
  const local = popular.filter((d) => matches(d, key)).slice(0, 3);
  const sources = GEOAPIFY_KEY ? [geoapify] : [openMeteo, photon];
  const found = sources.map(() => []);
  // Interleave so landmark-style matches (lakes, valleys, parks) aren't crowded out by villages.
  const merged = () =>
    dedupe([...local, ...found.flatMap((r) => r.slice(0, 4)), ...found.flatMap((r) => r.slice(4))]).slice(0, 8);

  const settled = await Promise.allSettled(
    sources.map((source, i) =>
      source(term, signal).then((r) => {
        found[i] = r;
        if (!signal?.aborted) onUpdate(merged());
      }),
    ),
  );
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
  const result = merged();
  if (settled.some((s) => s.status === "fulfilled")) cache.set(key, result);
  return result;
}

const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;
const RECENT_KEY = "itinera:recent-destinations";

export function loadRecent() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
  } catch {
    return [];
  }
}

export function rememberDestination(d) {
  try {
    const next = [d, ...loadRecent().filter((r) => r.name !== d.name)].slice(0, 4);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next.map(({ name, countryCode }) => ({ name, countryCode }))));
  } catch {
    /* storage unavailable */
  }
}

export const flagUrl = (code) =>
  code?.length === 2 ? `https://flagcdn.com/w40/${code.toLowerCase()}.png` : null;
