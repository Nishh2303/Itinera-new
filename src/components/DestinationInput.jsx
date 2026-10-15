import { Fragment, useEffect, useId, useRef, useState } from "react";
import { Clock, CornerDownLeft, Loader2, MapPin, Search, X } from "lucide-react";
import { browseSections, flagUrl, rememberDestination, searchDestinations } from "../lib/destinations.js";

const Highlight = ({ text, query }) => {
  const i = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-transparent font-semibold text-ink">{text.slice(i, i + query.length)}</mark>
      {text.slice(i + query.length)}
    </>
  );
};

export default function DestinationInput({ value, onChange, onCommit, committed }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState([]);
  const [active, setActive] = useState(-1);
  const box = useRef(null);
  const input = useRef(null);
  const listId = useId();

  const query = committed ? "" : value.trim();
  const typing = query.length >= 2;

  useEffect(() => {
    if (!open || !typing) return;
    const ctrl = new AbortController();
    setBusy(true);
    setResults([]);
    const t = setTimeout(async () => {
      let first = true;
      try {
        await searchDestinations(query, ctrl.signal, (list) => {
          setResults(list);
          if (first) setActive(0);
          first = false;
        });
      } catch {
        /* aborted */
      } finally {
        if (!ctrl.signal.aborted) setBusy(false);
      }
    }, 220);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query, open, typing]);

  useEffect(() => {
    const close = (e) => {
      if (box.current && !box.current.contains(e.target)) {
        setOpen(false);
        // Accept free text so any place can be planned, even without a match.
        if (!committed && value.trim().length >= 2) onCommit(value.trim());
      }
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [committed, value, onCommit]);

  // What the dropdown shows: grouped browse lists, or search results plus a "use as typed" row.
  const sections = typing
    ? [
        { title: busy && results.length === 0 ? null : "Places", items: results },
        { title: null, items: [{ name: query, kind: "custom" }] },
      ]
    : browseSections();
  const flat = sections.flatMap((s) => s.items);

  const choose = (d) => {
    if (d.kind !== "custom") rememberDestination(d);
    onChange(d.name);
    onCommit(d.name);
    setOpen(false);
    input.current?.blur();
  };

  const onKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % flat.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + flat.length) % flat.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flat[active]) choose(flat[active]);
      else if (value.trim().length >= 2) choose({ name: value.trim(), kind: "custom" });
    } else if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Tab" && open && typing && flat[active]) {
      choose(flat[active]);
    }
  };

  let index = -1;

  return (
    <div className="relative" ref={box}>
      <label htmlFor="destination" className="label">Where to?</label>
      <div className="relative">
        <MapPin className={`pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 ${committed ? "text-accent" : "text-muted"}`} />
        <input
          ref={input}
          id="destination"
          className="input pr-11 pl-11 text-base"
          placeholder="Search any city, region or country"
          autoComplete="off"
          spellCheck={false}
          value={value}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
          onChange={(e) => {
            onChange(e.target.value);
            onCommit(null);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
        {busy && typing ? (
          <Loader2 className="absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 animate-spin text-muted" />
        ) : (
          value && (
            <button
              type="button"
              aria-label="Clear destination"
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-muted hover:bg-line hover:text-ink"
              onClick={() => {
                onChange("");
                onCommit(null);
                setOpen(true);
                input.current?.focus();
              }}
            >
              <X className="h-4 w-4" />
            </button>
          )
        )}
      </div>

      {open && flat.length > 0 && (
        <div
          id={listId}
          role="listbox"
          className="absolute z-30 mt-2 max-h-[22rem] w-full overflow-y-auto rounded-xl border border-line bg-card py-1.5 shadow-2xl shadow-ink/10"
        >
          {sections.map((section, si) => (
            <Fragment key={si}>
              {section.title && (
                <p className="px-4 pt-2.5 pb-1 text-[11px] font-semibold tracking-wide text-muted uppercase">{section.title}</p>
              )}
              {section.items.map((d) => {
                index += 1;
                const i = index;
                const on = i === active;
                const custom = d.kind === "custom";
                return (
                  <div
                    key={`${si}-${d.name}`}
                    id={`${listId}-${i}`}
                    role="option"
                    aria-selected={on}
                    onPointerDown={(e) => e.preventDefault()}
                    onClick={() => choose(d)}
                    onMouseMove={() => setActive(i)}
                    className={`mx-1.5 flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2.5 ${on ? "bg-accent-soft" : ""} ${custom ? "mt-1 border-t border-line pt-3" : ""}`}
                  >
                    {custom ? (
                      <Search className="h-4 w-4 text-muted" />
                    ) : d.kind === "Recent" ? (
                      <Clock className="h-4 w-4 text-muted" />
                    ) : flagUrl(d.countryCode) ? (
                      <img src={flagUrl(d.countryCode)} alt="" className="h-3.5 w-5 rounded-[2px] object-cover shadow-[0_0_0_1px_rgba(0,0,0,0.06)]" />
                    ) : (
                      <MapPin className="h-4 w-4 text-muted" />
                    )}
                    <span className="flex-1 truncate text-[15px] text-ink/80">
                      {custom ? (
                        <>Plan a trip to “<span className="font-semibold text-ink">{d.name}</span>”</>
                      ) : (
                        <Highlight text={d.name} query={query} />
                      )}
                    </span>
                    {on ? (
                      <CornerDownLeft className="h-3.5 w-3.5 text-accent" />
                    ) : (
                      typing && !custom && <span className="text-xs text-muted">{d.kind}</span>
                    )}
                  </div>
                );
              })}
            </Fragment>
          ))}
          {typing && busy && (
            <p className="flex items-center gap-2 px-4 py-2 text-xs text-muted">
              <Loader2 className="h-3 w-3 animate-spin" />
              {results.length ? "Searching more places…" : "Searching places worldwide…"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
