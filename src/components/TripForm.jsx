import { Loader2, Minus, Plus, Sparkles } from "lucide-react";
import DestinationInput from "./DestinationInput.jsx";
import { ErrorBanner } from "./Feedback.jsx";
import { addDays, todayISO, tripLength } from "../lib/dates.js";
import { MAX_DAYS, styles } from "../lib/trip.js";
import { currencies, groupDigits } from "../lib/format.js";

export default function TripForm({ form, setForm, onSubmit, loading, error }) {
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));
  const today = todayISO();
  const days = tripLength(form.startDate, form.endDate);

  const setStart = (v) =>
    setForm((f) => ({
      ...f,
      startDate: v,
      endDate: !f.endDate || f.endDate < v ? addDays(v, 3) : f.endDate,
    }));

  const togglePref = (id) =>
    set("preferences")(
      form.preferences.includes(id) ? form.preferences.filter((p) => p !== id) : [...form.preferences, id],
    );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="card space-y-6 p-5 shadow-xl shadow-ink/[0.03] sm:p-8"
      noValidate
    >
      <DestinationInput value={form.destination} onChange={set("destination")} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="start" className="label">Start date</label>
          <input id="start" type="date" className="input" min={today} value={form.startDate} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div>
          <label htmlFor="end" className="label">
            End date {days > 0 && <span className="ml-1 normal-case tracking-normal text-accent">· {days} day{days > 1 ? "s" : ""}</span>}
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

      <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto]">
        <div>
          <label htmlFor="budget" className="label">Total budget</label>
          <input
            id="budget"
            inputMode="numeric"
            className="input"
            placeholder="e.g. 80,000"
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
        <div>
          <span className="label" id="travellers-label">Travellers</span>
          <div className="flex h-[50px] items-center rounded-xl border border-line bg-card" role="group" aria-labelledby="travellers-label">
            <button type="button" className="px-3.5 py-3 text-muted hover:text-ink disabled:opacity-30" onClick={() => set("travellers")(form.travellers - 1)} disabled={form.travellers <= 1} aria-label="Fewer travellers">
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center font-semibold tabular-nums" aria-live="polite">{form.travellers}</span>
            <button type="button" className="px-3.5 py-3 text-muted hover:text-ink disabled:opacity-30" onClick={() => set("travellers")(form.travellers + 1)} disabled={form.travellers >= 20} aria-label="More travellers">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <fieldset>
        <legend className="label">Travel style</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {styles.map(({ id, icon: Icon }) => {
            const on = form.preferences.includes(id);
            return (
              <button
                key={id}
                type="button"
                aria-pressed={on}
                onClick={() => togglePref(id)}
                className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-sm font-medium transition-all ${
                  on ? "border-ink bg-ink text-paper" : "border-line bg-card text-ink hover:border-muted/60"
                }`}
              >
                <Icon className={`h-4 w-4 ${on ? "text-accent" : "text-muted"}`} />
                {id}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label htmlFor="notes" className="label">Anything else? <span className="normal-case tracking-normal font-normal">(optional)</span></label>
        <textarea
          id="notes"
          rows={3}
          maxLength={1000}
          className="input resize-none"
          placeholder="Vegetarian food, travelling with grandparents, must see a sunrise, avoid long drives…"
          value={form.notes}
          onChange={(e) => set("notes")(e.target.value)}
        />
      </div>

      <ErrorBanner message={error} />

      <button type="submit" className="btn-accent w-full py-4 text-base" disabled={loading}>
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
        {loading ? "Planning your trip…" : "Build my itinerary"}
      </button>
    </form>
  );
}
