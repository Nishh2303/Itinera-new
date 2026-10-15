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

export const searchPopular = (term, limit = 6) => {
  const q = term.trim().toLowerCase();
  if (!q) return popular.slice(0, limit);
  return popular.filter((d) => d.name.toLowerCase().includes(q)).slice(0, limit);
};

const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;

export async function searchDestinations(term, signal) {
  const local = searchPopular(term);
  if (!GEOAPIFY_KEY || term.trim().length < 2) return local;

  try {
    const url = new URL("https://api.geoapify.com/v1/geocode/autocomplete");
    url.search = new URLSearchParams({
      text: term,
      apiKey: GEOAPIFY_KEY,
      limit: "8",
      format: "json",
      lang: "en",
      type: "city",
    });
    const res = await fetch(url, { signal });
    if (!res.ok) return local;
    const data = await res.json();
    const remote = (data.results || [])
      .filter((r) => r.formatted && r.country_code)
      .map((r) => ({
        name: [r.city || r.name || r.state, r.state && r.city ? r.state : null, r.country]
          .filter(Boolean)
          .filter((v, i, a) => a.indexOf(v) === i)
          .join(", ") || r.formatted,
        countryCode: r.country_code,
        kind: r.result_type ? r.result_type.replace("_", " ") : "Place",
      }));
    const seen = new Set();
    return [...remote, ...local].filter((d) => {
      const k = d.name.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    }).slice(0, 8);
  } catch (err) {
    if (err.name === "AbortError") throw err;
    return local;
  }
}

export const flagUrl = (code) =>
  code?.length === 2 ? `https://flagcdn.com/w40/${code.toLowerCase()}.png` : null;
