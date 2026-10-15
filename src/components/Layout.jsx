import { useState } from "react";
import { Menu, X } from "lucide-react";
import Logo from "./Logo.jsx";

const links = [
  ["/", "Home"],
  ["/plan", "Planner"],
  ["/business", "For business"],
  ["/contact", "Contact"],
];

export default function Layout({ route, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="no-print sticky top-0 z-40 border-b border-line/80 bg-paper/85 backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <a href="#/" aria-label="Itinera home" onClick={() => setOpen(false)}>
            <Logo />
          </a>
          <div className="hidden items-center gap-1 md:flex">
            {links.map(([to, label]) => (
              <a
                key={to}
                href={`#${to}`}
                aria-current={route === to ? "page" : undefined}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  route === to ? "bg-ink text-paper" : "text-muted hover:text-ink"
                }`}
              >
                {label}
              </a>
            ))}
          </div>
          <a href="#/plan" className="btn-accent hidden px-5 py-2 text-sm md:inline-flex">
            Plan a trip
          </a>
          <button
            className="rounded-full p-2 md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X /> : <Menu />}
          </button>
        </nav>
        {open && (
          <div className="border-t border-line px-4 pb-4 md:hidden">
            {links.map(([to, label]) => (
              <a
                key={to}
                href={`#${to}`}
                onClick={() => setOpen(false)}
                className={`block rounded-xl px-3 py-3 font-medium ${route === to ? "bg-ink/5" : ""}`}
              >
                {label}
              </a>
            ))}
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="no-print mt-24 border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:px-6">
          <Logo className="scale-90" />
          <p>© {new Date().getFullYear()} Itinera. Costs are AI estimates; always confirm before booking.</p>
        </div>
      </footer>
    </div>
  );
}
