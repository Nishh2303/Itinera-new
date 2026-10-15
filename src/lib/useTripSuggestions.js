import { useEffect, useState } from "react";
import { requestSuggestions } from "./api.js";
import { tripLength } from "./dates.js";
import { MAX_DAYS } from "./trip.js";

const cache = new Map();

// Fetches destination-aware hints (budget tiers, styles, ideas, season) once a
// destination is chosen, and again when dates, group size or currency change.
export function useTripSuggestions({ place, startDate, endDate, travellers, currency }) {
  const days = tripLength(startDate, endDate);
  const datesOk = days >= 1 && days <= MAX_DAYS;
  const params = place
    ? { destination: place, travellers, currency, ...(datesOk ? { startDate, endDate } : {}) }
    : null;
  const key = params && JSON.stringify(params);
  const [state, setState] = useState({ key: null, place: null, status: "idle", data: null });

  useEffect(() => {
    if (!key) return;
    if (cache.has(key)) {
      setState({ key, place: params.destination, status: "ready", data: cache.get(key) });
      return;
    }
    const ctrl = new AbortController();
    // Keep showing the previous hints for the same place while refreshing.
    setState((s) => ({ key, place: params.destination, status: "loading", data: s.place === params.destination ? s.data : null }));
    const t = setTimeout(async () => {
      try {
        const data = await requestSuggestions(params, ctrl.signal);
        cache.set(key, data);
        setState({ key, place: params.destination, status: "ready", data });
      } catch (err) {
        if (err.name !== "AbortError") setState((s) => ({ ...s, status: "error" }));
      }
    }, 450);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `key` captures params
  }, [key]);

  if (!place || state.place !== place) return { status: place ? "loading" : "idle", data: null };
  return state;
}
