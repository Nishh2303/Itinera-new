import { CalendarDays, CloudSun, Info, Loader2, Minus, Plus, Sparkles } from "lucide-react";
import DestinationInput from "./DestinationInput.jsx";
import { ErrorBanner } from "./Feedback.jsx";
import { addDays, formatRange, quickRanges, todayISO, tripLength } from "../lib/dates.js";
import { currencies, groupDigits, money } from "../lib/format.js";
import { MAX_DAYS, styles } from "../lib/trip.js";
import { useTripSuggestions } from "../lib/useTripSuggestions.js";

const groupPresets = [
  ["Solo", 1],
  ["Couple", 2],
  ["Family", 4],
  ["Friends", 6],
];

const commonNeeds = ["Vegetarian food", "Travelling with kids", "Travelling with seniors", "Avoid long drives", "Nightlife", "Photography spots", "Wheelchair accessible"];

const Chip = ({ on, onClick, children, accent }) => (
  <button
    type="button"
    aria-pressed={on}
    onClick={onClick}
    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium whitespace-nowrap transition-colors ${
      on ? "border-ink bg-ink text-paper" : accent ? "border-accent/40 bg-accent-soft/60 text-ink hover:border-accent" : "border-line bg-card text-muted hover:border-muted/60 hover:text-ink"
    }`}
  >
    {children}
  </button>
);

const Skeleton = ({ className }) => <span className={`block animate-pulse rounded-xl bg-line/70 ${className}`} />;

export default function TripForm({ form, setForm, onSubmit, loading, error }) {
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));
  const today = todayISO();
  const days = tripLength(form.startDate, form.endDate);
  const hints = useTripSuggestions(form);
  const s = hints.data;

  const setStart = (v) =>
    setForm((f) => ({
      ...f,
      startDate: v,
      endDate: !f.endDate || f.endDate < v ? addDays(v, (s?.ideal_days || 4) - 1) : f.endDate,
    }));

  const setLength = (n) => setForm((f) => ({ ...f, endDate: addDays(f.startDate, n - 1) }));

  const togglePref = (id) =>
    set("preferences")(form.preferences.includes(id) ? form.preferences.filter((p) => p !== id) : [...form.preferences, id]);

  const noteLines = form.notes.split("\n").map((l) => l.trim()).filter(Boolean);
  const toggleNote = (text) =>
    set("notes")((noteLines.includes(text) ? noteLines.filter((l) => l !== text) : [...noteLines, text]).join("\n"));

  const lengths = [...new Set([2, 3, 4, 5, 7, 10, s?.ideal_days].filter((n) => n >= 1 && n <= MAX_DAYS))].sort((a, b) => a - b);
  const perPersonDay = days > 0 && Number(form.budget) > 0 ? Number(form.budget) / days / form.travellers : 0;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="card space-y-7 p-5 shadow-xl shadow-ink/[0.03] sm:p-8"
      noValidate
    >
      {/* Destination */}
      <div>
        <DestinationInput
          value={form.destination}
          onChange={set("destination")}
          onCommit={set("place")}
          committed={Boolean(form.place)}
        />
        {form.place && (
          <p className="mt-2 flex min-h-5 items-start gap-1.5 text-sm text-muted" aria-live="polite">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-accent" />
            {s ? s.place_summary : hints.status === "error" ? "Suggestions unavailable right now — you can still plan." : "Finding ideas for this destination…"}
          </p>
        )}
      </div>

      {/* Dates */}
      <div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="start" className="label">Start date</label>
            <input id="start" type="date" className="input" min={today} value={form.startDate} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div>
            <label htmlFor="end" className="label">
              End date {days > 0 && <span className="ml-1 tracking-normal normal-case text-accent">· {days} day{days > 1 ? "s" : ""}</span>}
            </label>
            <input
              id="end"
              type="date"
              className="input"
              min={form.startDate || today}
              max={form.startDate ? addDays(form.startDate, MAX_DAYS - 1) : undefined}
              value={form.endDate}
              onChange={(e) => set("endDate")(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {form.startDate ? (
            <>
              <span className="self-center pr-1 text-xs font-medium text-muted">Length</span>
              {lengths.map((n) => (
                <Chip key={n} on={days === n} accent={n === s?.ideal_days && days !== n} onClick={() => setLength(n)}>
                  {n === s?.ideal_days && <Sparkles className="h-3 w-3 text-accent" />}
                  {n} days
                </Chip>
              ))}
            </>
          ) : (
            quickRanges().map((r) => (
              <Chip key={r.label} onClick={() => setForm((f) => ({ ...f, startDate: r.start, endDate: r.end }))}>
                <CalendarDays className="h-3.5 w-3.5" /> {r.label}
              </Chip>
            ))
          )}
        </div>
        {s?.season_note && (
          <p className="rise mt-3 flex items-start gap-2 rounded-xl bg-sage-soft px-3.5 py-2.5 text-sm text-sage">
            <CloudSun className="mt-0.5 h-4 w-4 flex-shrink-0" />
            {s.season_note}
          </p>
        )}
      </div>

      {/* Travellers */}
      <div>
        <span className="label" id="travellers-label">Travellers</span>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex h-11 items-center rounded-xl border border-line bg-card" role="group" aria-labelledby="travellers-label">
            <button type="button" className="px-3 py-2.5 text-muted hover:text-ink disabled:opacity-30" onClick={() => set("travellers")(form.travellers - 1)} disabled={form.travellers <= 1} aria-label="Fewer travellers">
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-7 text-center font-semibold tabular-nums" aria-live="polite">{form.travellers}</span>
            <button type="button" className="px-3 py-2.5 text-muted hover:text-ink disabled:opacity-30" onClick={() => set("travellers")(form.travellers + 1)} disabled={form.travellers >= 20} aria-label="More travellers">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {groupPresets.map(([label, n]) => (
            <Chip key={label} on={form.travellers === n} onClick={() => set("travellers")(n)}>{label}</Chip>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div>
        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <div>
            <label htmlFor="budget" className="label">Total budget <span className="tracking-normal normal-case font-normal">(excl. flights)</span></label>
            <input
              id="budget"
              inputMode="numeric"
              className="input"
              placeholder={s ? `e.g. ${groupDigits(String(s.budget_tiers[1]?.amount ?? ""), form.currency)}` : "e.g. 80,000"}
              value={groupDigits(form.budget, form.currency)}
              onChange={(e) => set("budget")(e.target.value.replace(/\D/g, "").slice(0, 12))}
            />
          </div>
          <div>
            <label htmlFor="currency" className="label">Currency</label>
            <select id="currency" className="input pr-8" value={form.currency} onChange={(e) => set("currency")(e.target.value)}>
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>{c.code} · {c.name}</option>
              ))}
            </select>
          </div>
        </div>
        {perPersonDay > 0 && (
          <p className="mt-2 text-xs text-muted">≈ {money(perPersonDay, form.currency)} per person per day</p>
        )}
        {form.place && (
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {s
              ? s.budget_tiers.map((t) => {
                  const on = Number(form.budget) === Math.round(t.amount);
                  return (
                    <button
                      key={t.tier}
                      type="button"
                      aria-pressed={on}
                      onClick={() => set("budget")(String(Math.round(t.amount)))}
                      className={`rise rounded-xl border p-3 text-left transition-colors ${on ? "border-ink bg-ink text-paper" : "border-line bg-card hover:border-muted/60"}`}
                    >
                      <span className={`text-[11px] font-semibold tracking-wide uppercase ${on ? "text-accent" : "text-muted"}`}>{t.tier}</span>
                      <span className="block font-semibold tabular-nums">{money(t.amount, form.currency)}</span>
                      <span className={`block text-xs leading-snug ${on ? "text-paper/70" : "text-muted"}`}>{t.description}</span>
                    </button>
                  );
                })
              : hints.status === "loading" && [0, 1, 2].map((i) => <Skeleton key={i} className="h-[74px]" />)}
          </div>
        )}
        {s && !days && <p className="mt-2 text-xs text-muted">Budgets assume a {s.ideal_days}-day trip until you pick dates.</p>}
      </div>

      {/* Styles */}
      <fieldset>
        <legend className="label">Travel style</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {styles.map(({ id, icon: Icon }) => {
            const on = form.preferences.includes(id);
            const rec = s?.recommended_styles.includes(id);
            return (
              <button
                key={id}
                type="button"
                aria-pressed={on}
                onClick={() => togglePref(id)}
                className={`relative flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-sm font-medium transition-all ${
                  on ? "border-ink bg-ink text-paper" : rec ? "border-accent/40 bg-accent-soft/50 hover:border-accent" : "border-line bg-card text-ink hover:border-muted/60"
                }`}
              >
                <Icon className={`h-4 w-4 ${on || rec ? "text-accent" : "text-muted"}`} />
                {id}
                {rec && <Sparkles className={`absolute top-1.5 right-1.5 h-3 w-3 ${on ? "text-accent" : "text-accent/70"}`} aria-label="Suggested" />}
              </button>
            );
          })}
        </div>
        {s && form.preferences.length === 0 && (
          <button type="button" className="mt-2 text-xs font-medium text-accent-dark hover:underline" onClick={() => set("preferences")(s.recommended_styles)}>
            Use suggested: {s.recommended_styles.join(", ")}
          </button>
        )}
      </fieldset>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="label">Must-dos and needs <span className="tracking-normal normal-case font-normal">(optional)</span></label>
        {s && (
          <div className="mb-2">
            <p className="mb-1.5 flex items-center gap-1 text-xs text-muted"><Sparkles className="h-3 w-3 text-accent" /> Ideas for {form.place.split(",")[0]}</p>
            <div className="flex flex-wrap gap-2">
              {s.ideas.map((t) => (
                <Chip key={t} accent on={noteLines.includes(t)} onClick={() => toggleNote(t)}>{noteLines.includes(t) ? "✓" : "+"} {t}</Chip>
              ))}
            </div>
          </div>
        )}
        <div className="mb-2 flex flex-wrap gap-2">
          {commonNeeds.map((t) => (
            <Chip key={t} on={noteLines.includes(t)} onClick={() => toggleNote(t)}>{t}</Chip>
          ))}
        </div>
        <textarea
          id="notes"
          rows={3}
          maxLength={1000}
          className="input resize-none"
          placeholder="Tap ideas above, or write your own: a sunrise hike, a birthday dinner, no early starts…"
          value={form.notes}
          onChange={(e) => set("notes")(e.target.value)}
        />
      </div>

      {/* Summary + submit */}
      <TripSummary form={form} days={days} />
      <ErrorBanner message={error} />

      <button type="submit" className="btn-accent w-full py-4 text-base" disabled={loading}>
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
        {loading ? "Planning your trip…" : "Build my itinerary"}
      </button>
    </form>
  );
}

function TripSummary({ form, days }) {
  const parts = [
    ["Destination", form.place || form.destination.trim()],
    ["Dates", days > 0 && days <= MAX_DAYS ? `${formatRange(form.startDate, form.endDate)} · ${days}d` : ""],
    ["Group", `${form.travellers} ${form.travellers === 1 ? "traveller" : "travellers"}`],
    ["Budget", Number(form.budget) > 0 ? money(form.budget, form.currency) : ""],
    ["Style", form.preferences.join(", ")],
  ];
  const done = parts.filter(([, v]) => v).length;
  return (
    <div className="rounded-xl border border-dashed border-line bg-paper/60 p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted uppercase"><Info className="h-3.5 w-3.5" /> Your trip</p>
        <span className="text-xs text-muted tabular-nums">{done}/{parts.length} ready</span>
      </div>
      <dl className="grid gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
        {parts.map(([k, v]) => (
          <div key={k} className="flex gap-2">
            <dt className="w-20 flex-shrink-0 text-muted">{k}</dt>
            <dd className={v ? "font-medium" : "text-muted/60"}>{v || "—"}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
