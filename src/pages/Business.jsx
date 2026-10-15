import { ArrowRight, Briefcase, Code2, Plane } from "lucide-react";

const offers = [
  [Plane, "Travel agencies", "Draft costed, multi-day itineraries for clients in minutes and send them as a branded report."],
  [Briefcase, "Corporate travel", "Plan budget-compliant trips around meetings, with per-person and per-day costs built in."],
  [Code2, "API & white-label", "Use the same planning engine in your own app or website, under your brand."],
];

export default function Business() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-14 sm:px-6 sm:pt-20">
      <div className="rise max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">For business</p>
        <h1 className="mt-3 font-display text-5xl leading-tight sm:text-6xl">Itineraries at the speed of a reply.</h1>
        <p className="mt-5 text-lg leading-relaxed text-muted">
          Itinera turns a client brief into three priced, day-by-day options, so your team can spend its time
          on the parts that need a human.
        </p>
      </div>
      <div className="mt-14 grid gap-4 md:grid-cols-3">
        {offers.map(([Icon, title, body]) => (
          <div key={title} className="card p-7">
            <Icon className="h-6 w-6 text-accent" />
            <h2 className="mt-4 font-display text-2xl">{title}</h2>
            <p className="mt-2 leading-relaxed text-muted">{body}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-3xl bg-ink p-8 text-paper sm:flex-row sm:items-center sm:p-10">
        <p className="font-display text-2xl sm:text-3xl">Want a walkthrough for your team?</p>
        <a href="#/contact" className="btn-accent">Request a demo <ArrowRight className="h-4 w-4" /></a>
      </div>
    </div>
  );
}
