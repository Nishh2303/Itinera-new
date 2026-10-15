import { useState } from "react";
import { Mail, Send } from "lucide-react";

const EMAIL = import.meta.env.VITE_CONTACT_EMAIL || "contact@itinera.ai";

export default function Contact() {
  const [f, setF] = useState({ name: "", message: "" });
  const mailto = `mailto:${EMAIL}?subject=${encodeURIComponent(`Itinera enquiry from ${f.name || "a visitor"}`)}&body=${encodeURIComponent(f.message)}`;

  return (
    <div className="mx-auto grid max-w-5xl gap-12 px-4 pt-14 sm:px-6 sm:pt-20 md:grid-cols-2">
      <div className="rise">
        <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">Contact</p>
        <h1 className="mt-3 font-display text-5xl leading-tight">Say hello.</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          Questions, partnerships, or feedback on a plan, we read everything.
        </p>
        <a href={`mailto:${EMAIL}`} className="mt-8 inline-flex items-center gap-3 font-medium hover:text-accent">
          <Mail className="h-5 w-5 text-accent" /> {EMAIL}
        </a>
      </div>
      <form
        className="card space-y-5 p-6 sm:p-8"
        onSubmit={(e) => {
          e.preventDefault();
          window.location.href = mailto;
        }}
      >
        <div>
          <label htmlFor="c-name" className="label">Your name</label>
          <input id="c-name" className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required />
        </div>
        <div>
          <label htmlFor="c-msg" className="label">Message</label>
          <textarea id="c-msg" rows={5} className="input resize-none" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} required />
        </div>
        <button className="btn-primary w-full"><Send className="h-4 w-4" /> Open in email</button>
      </form>
    </div>
  );
}
