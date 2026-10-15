import { useEffect, useState } from "react";
import { AlertTriangle, Compass } from "lucide-react";

const steps = [
  "Reading your preferences",
  "Mapping neighbourhoods and routes",
  "Pricing stays, food and activities",
  "Balancing three plan options",
  "Writing your trip report",
];

export function Loading() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => Math.min(n + 1, steps.length - 1)), 3500);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="card rise p-8 text-center sm:p-12" role="status" aria-live="polite">
      <Compass className="mx-auto h-10 w-10 animate-spin text-accent [animation-duration:3s]" />
      <p className="mt-5 font-display text-2xl">{steps[i]}…</p>
      <p className="mt-2 text-sm text-muted">This usually takes 20–40 seconds.</p>
      <div className="mx-auto mt-6 flex max-w-xs gap-1.5">
        {steps.map((_, n) => (
          <span key={n} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${n <= i ? "bg-accent" : "bg-line"}`} />
        ))}
      </div>
    </div>
  );
}

export function ErrorBanner({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="rise flex items-start gap-3 rounded-2xl border border-accent/30 bg-accent-soft p-4 text-sm" role="alert">
      <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent-dark" />
      <p className="flex-1">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="font-semibold text-accent-dark underline underline-offset-2">
          Try again
        </button>
      )}
    </div>
  );
}
