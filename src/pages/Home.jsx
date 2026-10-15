import { ArrowRight, FileDown, Map, Scale, Wallet, Wand2 } from "lucide-react";

const ideas = ["Udaipur, India", "Kyoto, Japan", "Bali, Indonesia", "Leh-Ladakh, India", "Lisbon, Portugal", "Istanbul, Türkiye"];

const startWith = (d) => {
  try {
    sessionStorage.setItem("itinera:prefill", d);
  } catch {
    /* ignore */
  }
  window.location.hash = "/plan";
};

const features = [
  [Scale, "Three plans, side by side", "Balanced, Luxury and Explorer options for every trip, each priced against your budget."],
  [Wallet, "Costed down to the activity", "A breakdown across stays, food, activities and transport, plus per-person and per-day cost."],
  [Wand2, "Refine in plain words", "\"More street food\", \"slower day 3\", \"cut 20%\". Describe a change and the plan updates."],
  [FileDown, "A report you can take", "Save as PDF or Markdown with the itinerary, stays, tips and a packing checklist."],
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <section className="grid items-center gap-12 pt-14 pb-20 sm:pt-20 lg:grid-cols-[1.15fr_1fr]">
        <div className="rise">
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-xs font-medium text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" /> AI trip planning
          </p>
          <h1 className="mt-5 font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Your whole trip, planned <em className="text-accent">and priced.</em>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Tell Itinera where, when and how you like to travel. You get three day-by-day itineraries,
            each costed against your budget, ready to refine and download.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#/plan" className="btn-accent px-7 py-3.5 text-base">
              Plan my trip <ArrowRight className="h-5 w-5" />
            </a>
            <a href="#/business" className="btn-ghost px-7 py-3.5 text-base">For travel businesses</a>
          </div>
          <div className="mt-10">
            <p className="text-xs font-semibold tracking-wide text-muted uppercase">Try one</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {ideas.map((d) => (
                <button key={d} onClick={() => startWith(d)} className="rounded-full border border-line bg-card px-3.5 py-1.5 text-sm hover:border-ink">
                  {d.split(",")[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <SamplePlan />
      </section>

      <section className="border-t border-line py-20">
        <h2 className="max-w-xl font-display text-4xl leading-tight">More than a list of places.</h2>
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
          {features.map(([Icon, title, body]) => (
            <div key={title} className="bg-card p-7 sm:p-9">
              <Icon className="h-6 w-6 text-accent" />
              <h3 className="mt-4 font-display text-2xl">{title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-ink p-8 text-paper sm:flex-row sm:items-center sm:p-12">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl">Ready when you are.</h2>
            <p className="mt-2 text-paper/70">It takes under a minute, and you don't need an account.</p>
          </div>
          <a href="#/plan" className="btn-accent px-7 py-3.5 text-base">
            Start planning <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </section>
    </div>
  );
}

function SamplePlan() {
  const rows = [
    ["Morning", "City Palace & Jagdish Temple", "₹1,800"],
    ["Afternoon", "Bagore ki Haveli & old-city lanes", "₹600"],
    ["Evening", "Sunset boat on Lake Pichola", "₹1,600"],
  ];
  return (
    <div className="rise relative [animation-delay:150ms]" aria-hidden="true">
      <div className="absolute -inset-4 -z-10 rotate-2 rounded-3xl bg-accent-soft" />
      <div className="card overflow-hidden shadow-2xl shadow-ink/10">
        <div className="flex items-center justify-between bg-ink px-6 py-5 text-paper">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-accent uppercase">Balanced · 4 days</p>
            <p className="mt-1 font-display text-2xl">Udaipur, slowly</p>
          </div>
          <Map className="h-6 w-6 text-paper/60" />
        </div>
        <div className="flex items-baseline gap-3 border-b border-line px-6 py-4">
          <span className="font-display text-3xl text-accent">01</span>
          <span className="font-display text-lg">Palaces and the old city</span>
        </div>
        {rows.map(([t, a, c]) => (
          <div key={t} className="flex items-center justify-between gap-4 border-b border-line px-6 py-3.5 text-sm">
            <div>
              <p className="text-[10px] font-semibold tracking-wide text-muted uppercase">{t}</p>
              <p className="font-medium">{a}</p>
            </div>
            <span className="tabular-nums">{c}</span>
          </div>
        ))}
        <div className="px-6 py-5">
          <div className="flex h-2.5 overflow-hidden rounded-full">
            <span className="w-[42%] bg-ink" /><span className="w-[24%] bg-accent" /><span className="w-[18%] bg-sage" /><span className="w-[10%] bg-[#c9a227]" /><span className="w-[6%] bg-muted/50" />
          </div>
          <div className="mt-3 flex justify-between text-sm">
            <span className="text-muted">Estimated total</span>
            <span className="font-semibold">₹62,400 <span className="font-normal text-sage">· ₹17,600 under</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
