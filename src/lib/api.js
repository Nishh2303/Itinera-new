export async function requestItinerary({ trip, previous, refinement }, signal) {
  let res;
  try {
    res = await fetch("/api/itinerary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trip, previous, refinement }),
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
