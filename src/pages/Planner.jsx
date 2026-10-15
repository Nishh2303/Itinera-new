import { useEffect, useRef, useState } from "react";
import TripForm from "../components/TripForm.jsx";
import { validate } from "../lib/trip.js";
import ItineraryReport from "../components/ItineraryReport.jsx";
import { ErrorBanner, Loading } from "../components/Feedback.jsx";
import { requestItinerary } from "../lib/api.js";
import { loadPlan, savePlan } from "../lib/storage.js";

const emptyForm = {
  destination: "",
  place: "",
  startDate: "",
  endDate: "",
  budget: "",
  currency: "INR",
  travellers: 2,
  preferences: [],
  notes: "",
};

const prefill = () => {
  try {
    const d = sessionStorage.getItem("itinera:prefill");
    sessionStorage.removeItem("itinera:prefill");
    return d ? { ...emptyForm, destination: d, place: d } : emptyForm;
  } catch {
    return emptyForm;
  }
};

export default function Planner() {
  const [form, setForm] = useState(prefill);
  const [plan, setPlan] = useState(loadPlan);
  const [status, setStatus] = useState("idle"); // idle | generating | refining
  const [error, setError] = useState(null);
  const [lastAction, setLastAction] = useState(null);
  const resultsRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => savePlan(plan), [plan]);
  useEffect(() => setError(null), [form]);
  useEffect(() => () => abortRef.current?.abort(), []);

  const run = async (body, mode) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setStatus(mode);
    setError(null);
    setLastAction(() => () => run(body, mode));
    if (mode === "generating") requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    try {
      const result = await requestItinerary(body, ctrl.signal);
      setPlan(result);
      if (mode === "refining") resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return true;
    } catch (err) {
      if (err.name !== "AbortError") setError(err.message);
      return false;
    } finally {
      if (abortRef.current === ctrl) setStatus("idle");
    }
  };

  const generate = () => {
    const problem = validate(form);
    if (problem) return setError(problem);
    setPlan(null);
    const { place, ...trip } = form;
    run({ trip: { ...trip, destination: place || trip.destination.trim(), budget: Number(trip.budget) } }, "generating");
  };

  const refine = (refinement) => run({ trip: plan.trip, previous: plan.itinerary, refinement }, "refining");

  const reset = () => {
    abortRef.current?.abort();
    setPlan(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const showForm = !plan && status !== "generating";

  return (
    <div className="mx-auto max-w-5xl px-4 pt-10 sm:px-6 sm:pt-14">
      {showForm && (
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">Planner</p>
            <h1 className="mt-2 font-display text-4xl sm:text-5xl">Where are we going?</h1>
            <p className="mt-3 text-muted">Three costed plans, day by day, in under a minute.</p>
          </div>
          <TripForm form={form} setForm={setForm} onSubmit={generate} loading={status !== "idle"} error={error} />
        </div>
      )}

      <div ref={resultsRef} className="scroll-mt-24 space-y-6 pt-6">
        {!showForm && <ErrorBanner message={error} onRetry={status === "idle" ? lastAction : null} />}
        {status === "generating" && <Loading />}
        {plan && (
          <div className={status === "refining" ? "pointer-events-none opacity-60 transition-opacity" : "transition-opacity"}>
            <ItineraryReport key={JSON.stringify(plan.itinerary.options.map((o) => o.estimated_total_cost))} plan={plan} onRefine={refine} refining={status === "refining"} onReset={reset} />
          </div>
        )}
      </div>
    </div>
  );
}
