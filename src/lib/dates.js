// Dates travel as "YYYY-MM-DD" strings and are always read as local calendar
// days, so timezones never shift a trip by one day.

export const todayISO = () => {
  const d = new Date();
  return toISO(d);
};

export const toISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const fromISO = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (iso, n) => {
  const d = fromISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
};

export const tripLength = (start, end) =>
  start && end ? Math.round((fromISO(end) - fromISO(start)) / 86400000) + 1 : 0;

export const formatDate = (iso, opts = { day: "numeric", month: "short", year: "numeric" }) =>
  iso ? fromISO(iso).toLocaleDateString("en-GB", opts) : "";

export const formatRange = (start, end) =>
  `${formatDate(start, { day: "numeric", month: "short" })} – ${formatDate(end)}`;

// Quick date ranges offered under the date fields.
export function quickRanges() {
  const today = fromISO(todayISO());
  const dow = today.getDay();
  const sat = new Date(today);
  sat.setDate(today.getDate() + ((6 - dow + 7) % 7));
  const thisSat = toISO(sat);
  const nextSat = addDays(thisSat, 7);
  const firstOfNext = toISO(new Date(today.getFullYear(), today.getMonth() + 1, 1));
  return [
    { label: "This weekend", start: thisSat, end: addDays(thisSat, 1) },
    { label: "Next weekend", start: nextSat, end: addDays(nextSat, 1) },
    { label: "Long weekend", start: addDays(nextSat, -1), end: addDays(nextSat, 2) },
    { label: "A week, in 2 weeks", start: addDays(toISO(today), 14), end: addDays(toISO(today), 20) },
    { label: "Next month · 5 days", start: firstOfNext, end: addDays(firstOfNext, 4) },
  ];
}
