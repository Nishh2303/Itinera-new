import { useEffect, useId, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { flagUrl, searchDestinations } from "../lib/destinations.js";

export default function DestinationInput({ value, onChange }) {
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState(-1);
  const picked = useRef(value);
  const box = useRef(null);
  const listId = useId();

  useEffect(() => {
    if (!open || value === picked.current) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setBusy(true);
      try {
        setResults(await searchDestinations(value, ctrl.signal));
        setActive(-1);
      } catch {
        /* aborted */
      } finally {
        if (!ctrl.signal.aborted) setBusy(false);
      }
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [value, open]);

  useEffect(() => {
    const close = (e) => box.current && !box.current.contains(e.target) && setOpen(false);
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  const choose = (d) => {
    picked.current = d.name;
    onChange(d.name);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      choose(results[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showList = open && (busy || results.length > 0);

  return (
    <div className="relative" ref={box}>
      <label htmlFor="destination" className="label">Where to?</label>
      <div className="relative">
        <MapPin className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted" />
        <input
          id="destination"
          className="input pl-11 text-base"
          placeholder="City, region or country"
          autoComplete="off"
          value={value}
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          onChange={(e) => {
            picked.current = null;
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            picked.current = null;
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          required
        />
        {busy && <Loader2 className="absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 animate-spin text-muted" />}
      </div>
      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-line bg-card py-1 shadow-xl shadow-ink/5"
        >
          {results.map((d, i) => (
            <li
              key={d.name}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => choose(d)}
              onMouseEnter={() => setActive(i)}
              className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 ${i === active ? "bg-accent-soft" : ""}`}
            >
              {flagUrl(d.countryCode) ? (
                <img src={flagUrl(d.countryCode)} alt="" className="h-3.5 w-5 rounded-[2px] object-cover" />
              ) : (
                <MapPin className="h-4 w-4 text-muted" />
              )}
              <span className="flex-1 truncate">{d.name}</span>
              <span className="text-xs text-muted capitalize">{d.kind}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
