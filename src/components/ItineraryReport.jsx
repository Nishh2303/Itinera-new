import { useState } from "react";
import {
  BedDouble, Bus, CalendarDays, Check, Coffee, Download, FileText, Lightbulb, Loader2, Luggage,
  Moon, RotateCcw, Sun, Users, Utensils, Wand2,
} from "lucide-react";
import { formatDate, formatRange } from "../lib/dates.js";
import { money } from "../lib/format.js";
import { breakdownLabels, downloadFile, slug, toMarkdown } from "../lib/report.js";

const segmentColors = {
  accommodation: "bg-ink",
  food: "bg-accent",
  activities: "bg-sage",
  local_transport: "bg-[#c9a227]",
  miscellaneous: "bg-muted/50",
};

const optionBlurb = {
  Balanced: "Best value within budget",
  Luxury: "Premium stays and experiences",
  Explorer: "Leaner spend, more ground covered",
};

export default function ItineraryReport({ plan, onRefine, refining, onReset }) {
  const { trip, itinerary } = plan;
  const [active, setActive] = useState(0);
  const [refinement, setRefinement] = useState("");
  const option = itinerary.options[active] ?? itinerary.options[0];
  const $ = (v) => money(v, trip.currency);

  const exportMarkdown = () =>
    downloadFile(`itinera-${slug(trip.destination)}-${slug(option.type)}.md`, toMarkdown(trip, itinerary, option));

  const submitRefine = (e) => {
    e.preventDefault();
    if (refinement.trim()) onRefine(refinement.trim()).then((ok) => ok && setRefinement(""));
  };

  return (
    <article className="rise space-y-6" aria-labelledby="report-title">
      {/* Header */}
      <header className="card overflow-hidden">
        <div className="border-b border-line bg-ink px-5 py-7 text-paper sm:px-8">
          <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">Trip report</p>
          <h2 id="report-title" className="mt-2 font-display text-3xl leading-tight sm:text-4xl">{itinerary.trip_title}</h2>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-paper/75">
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />{formatRange(trip.startDate, trip.endDate)} · {trip.days} days</span>
            <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" />{trip.travellers} traveller{trip.travellers > 1 ? "s" : ""}</span>
            <span>Budget {$(trip.budget)}</span>
            <span>{trip.preferences.join(" · ")}</span>
          </div>
        </div>
        <div className="no-print flex flex-wrap gap-2 px-5 py-4 sm:px-8">
          <button className="btn-primary px-4 py-2 text-sm" onClick={() => window.print()}>
            <Download className="h-4 w-4" /> Save as PDF
          </button>
          <button className="btn-ghost px-4 py-2 text-sm" onClick={exportMarkdown}>
            <FileText className="h-4 w-4" /> Markdown
          </button>
          <button className="btn-ghost ml-auto px-4 py-2 text-sm" onClick={onReset}>
            <RotateCcw className="h-4 w-4" /> New trip
          </button>
        </div>
      </header>

      {/* Option picker */}
      <div className="no-print grid gap-3 sm:grid-cols-3" role="tablist" aria-label="Plan options">
        {itinerary.options.map((o, i) => {
          const diff = o.estimated_total_cost - trip.budget;
          const on = i === active;
          return (
            <button
              key={o.type}
              role="tab"
              aria-selected={on}
              onClick={() => setActive(i)}
              className={`rounded-2xl border p-4 text-left transition-all ${on ? "border-ink bg-card shadow-lg shadow-ink/5" : "border-line bg-card/60 hover:border-muted/60"}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-xl">{o.type}</span>
                {on && <Check className="h-5 w-5 text-accent" />}
              </div>
              <p className="mt-0.5 text-xs text-muted">{optionBlurb[o.type]}</p>
              <p className="mt-3 text-lg font-semibold tabular-nums">{$(o.estimated_total_cost)}</p>
              <p className={`text-xs font-medium ${diff > 0 ? "text-accent-dark" : "text-sage"}`}>
                {diff > 0 ? `${$(diff)} over budget` : `${$(-diff)} under budget`}
              </p>
            </button>
          );
        })}
      </div>

      {/* Overview + costs */}
      <section className="grid gap-6 lg:grid-cols-5">
        <div className="card p-5 sm:p-7 lg:col-span-3">
          <h3 className="font-display text-2xl">Overview <span className="hidden text-muted print:inline">· {option.type} plan</span></h3>
          <p className="mt-3 leading-relaxed text-ink/85">{itinerary.overview}</p>
          <p className="mt-3 border-l-2 border-accent pl-4 leading-relaxed text-muted">{option.summary}</p>
        </div>
        <div className="card keep p-5 sm:p-7 lg:col-span-2">
          <h3 className="font-display text-2xl">Estimated cost</h3>
          <p className="mt-1 text-3xl font-semibold tabular-nums">{$(option.estimated_total_cost)}</p>
          <p className="text-sm text-muted">
            ≈ {$(option.estimated_total_cost / trip.travellers)} per person · {$(option.estimated_total_cost / trip.days)} per day
          </p>
          <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-line" aria-hidden="true">
            {Object.keys(breakdownLabels).map((k) => (
              <span
                key={k}
                className={segmentColors[k]}
                style={{ width: `${(option.cost_breakdown[k] / (option.estimated_total_cost || 1)) * 100}%` }}
              />
            ))}
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            {Object.entries(breakdownLabels).map(([k, label]) => (
              <div key={k} className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${segmentColors[k]}`} />
                <dt className="flex-1 text-muted">{label}</dt>
                <dd className="font-medium tabular-nums">{$(option.cost_breakdown[k])}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Days */}
      <section aria-label="Day by day" className="space-y-4">
        <h3 className="font-display text-2xl">Day by day</h3>
        <ol className="space-y-4">
          {option.days.map((d) => (
            <li key={d.day} className="card overflow-hidden">
              <div className="keep flex items-baseline gap-3 border-b border-line px-5 py-4 sm:px-7">
                <span className="font-display text-3xl text-accent tabular-nums">{String(d.day).padStart(2, "0")}</span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold tracking-wide text-muted uppercase">
                    {formatDate(d.date, { weekday: "long", day: "numeric", month: "short" })}
                  </p>
                  <h4 className="font-display text-xl leading-snug">{d.theme}</h4>
                </div>
              </div>
              <div className="divide-y divide-line">
                {[["Morning", Coffee, d.morning], ["Afternoon", Sun, d.afternoon], ["Evening", Moon, d.evening]].map(([label, Icon, s]) => (
                  <div key={label} className="keep flex gap-4 px-5 py-4 sm:px-7">
                    <Icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold tracking-wide text-muted uppercase">{label}</p>
                      <p className="font-semibold">{s.activity}</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-muted">{s.description}</p>
                    </div>
                    <span className="text-sm font-medium whitespace-nowrap tabular-nums">
                      {s.estimated_cost > 0 ? $(s.estimated_cost) : "Free"}
                    </span>
                  </div>
                ))}
                <div className="keep flex gap-4 bg-accent-soft/50 px-5 py-4 sm:px-7">
                  <Utensils className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" aria-hidden="true" />
                  <div className="grid flex-1 gap-2 text-sm sm:grid-cols-2">
                    <p><span className="font-semibold">Lunch · </span>{d.food.lunch}</p>
                    <p><span className="font-semibold">Dinner · </span>{d.food.dinner}</p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Stays */}
      <section className="space-y-4">
        <h3 className="flex items-center gap-2 font-display text-2xl"><BedDouble className="h-6 w-6 text-accent" /> Where to stay</h3>
        <div className="grid gap-4 md:grid-cols-3 print:grid-cols-3">
          {option.stays.map((s) => (
            <div key={s.name} className="card keep flex flex-col p-5">
              <p className="text-xs font-semibold tracking-wide text-muted uppercase">{s.type} · {s.area}</p>
              <h4 className="mt-1 font-display text-lg leading-snug">{s.name}</h4>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{s.description}</p>
              <p className="mt-4 text-sm"><span className="font-semibold tabular-nums">{$(s.price_per_night)}</span> <span className="text-muted">/ night</span></p>
            </div>
          ))}
        </div>
      </section>

      {/* Practical */}
      <section className="grid gap-6 md:grid-cols-2 print:grid-cols-1">
        <div className="card space-y-5 p-5 sm:p-7">
          <div>
            <h3 className="flex items-center gap-2 font-display text-xl"><Bus className="h-5 w-5 text-accent" /> Getting around</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{itinerary.getting_around}</p>
          </div>
          <div>
            <h3 className="flex items-center gap-2 font-display text-xl"><CalendarDays className="h-5 w-5 text-accent" /> When you're there</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{itinerary.best_time_notes}</p>
          </div>
          <div>
            <h3 className="flex items-center gap-2 font-display text-xl"><Lightbulb className="h-5 w-5 text-accent" /> Tips</h3>
            <ul className="mt-2 space-y-2 text-sm leading-relaxed text-muted">
              {itinerary.travel_tips.map((t) => (
                <li key={t} className="flex gap-2"><span className="text-accent">—</span>{t}</li>
              ))}
            </ul>
          </div>
        </div>
        <PackingList items={itinerary.packing_list} />
      </section>

      {/* Refine */}
      <form onSubmit={submitRefine} className="no-print card p-5 sm:p-7">
        <h3 className="flex items-center gap-2 font-display text-xl"><Wand2 className="h-5 w-5 text-accent" /> Fine-tune this plan</h3>
        <p className="mt-1 text-sm text-muted">Describe a change and all three options are regenerated with it.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {["Make day 2 more relaxed", "More local street food", "Cut the budget by 20%", "Add a day trip"].map((s) => (
            <button key={s} type="button" onClick={() => setRefinement(s)} className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-muted hover:border-ink hover:text-ink">
              {s}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            className="input flex-1"
            maxLength={1000}
            placeholder="e.g. Swap the museum on day 3 for a hike"
            value={refinement}
            onChange={(e) => setRefinement(e.target.value)}
            disabled={refining}
          />
          <button className="btn-primary" disabled={refining || !refinement.trim()}>
            {refining ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            {refining ? "Updating…" : "Update plan"}
          </button>
        </div>
      </form>

      <p className="text-center text-xs text-muted">
        Prices are AI estimates in {trip.currency}. Confirm prices, opening hours and bookings before you travel.
      </p>
    </article>
  );
}

function PackingList({ items }) {
  const [done, setDone] = useState(() => new Set());
  const toggle = (item) =>
    setDone((s) => {
      const n = new Set(s);
      n.has(item) ? n.delete(item) : n.add(item);
      return n;
    });
  return (
    <div className="card p-5 sm:p-7">
      <h3 className="flex items-center justify-between font-display text-xl">
        <span className="flex items-center gap-2"><Luggage className="h-5 w-5 text-accent" /> Packing list</span>
        <span className="font-sans text-xs font-medium text-muted tabular-nums">{done.size}/{items.length}</span>
      </h3>
      <ul className="mt-3 space-y-1">
        {items.map((item) => (
          <li key={item}>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-paper">
              <input type="checkbox" className="h-4 w-4 accent-[#d4572a]" checked={done.has(item)} onChange={() => toggle(item)} />
              <span className={done.has(item) ? "text-muted line-through" : ""}>{item}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
