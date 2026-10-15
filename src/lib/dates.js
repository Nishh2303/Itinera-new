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
