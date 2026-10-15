export const requestItinerary = ({ trip, previous, refinement }, signal) =>
  post("/api/itinerary", { trip, previous, refinement }, signal);

export const requestSuggestions = (params, signal) => post("/api/suggest", params, signal);

async function post(path, body, signal) {
  let res;
  try {
    res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new Error("Couldn't reach the server. Check your connection and try again.");
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status}).`);
  return data;
}
