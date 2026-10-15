export default function Logo({ className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
        <rect width="32" height="32" rx="8" className="fill-ink" />
        <circle cx="16" cy="16" r="9" fill="none" className="stroke-paper" strokeWidth="2" />
        <path d="M16 8.5 19 16l-3 7.5L13 16Z" className="fill-accent" />
      </svg>
      <span className="font-display text-2xl font-semibold tracking-tight">Itinera</span>
    </span>
  );
}
