"use client";
import { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

type F = { name: string; email: string; phone: string; suburb: string; type: string; message: string; consent: boolean; website: string };
const empty: F = { name: "", email: "", phone: "", suburb: "", type: "", message: "", consent: false, website: "" };
export function validate(f: F) {
  const e: Partial<Record<keyof F, string>> = {};
  if (f.name.trim().length < 2) e.name = "Enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email)) e.email = "Enter a valid email address.";
  if (f.phone && !/^[+\d][\d\s()-]{7,16}$/.test(f.phone)) e.phone = "Enter a valid phone number, or leave it blank.";
  if (f.suburb.trim().length < 2) e.suburb = "Tell us the suburb or town.";
  if (!f.type) e.type = "Choose a space type.";
  if (f.message.trim().length < 10) e.message = "Add a few details about the glass (at least 10 characters).";
  if (!f.consent) e.consent = "Please confirm we may contact you.";
  return e;
}
const field = "w-full border-0 border-b border-silver/25 bg-transparent py-3 text-silver placeholder:text-silver/40 focus:border-champagne focus:outline-none focus:ring-0";

export default function Enquiry() {
  const [f, setF] = useState<F>(empty);
  const [err, setErr] = useState<ReturnType<typeof validate>>({});
  const [state, setState] = useState<"idle" | "sending" | "ok" | "fail">("idle");
  const set = <K extends keyof F>(k: K, v: F[K]) => setF((p) => ({ ...p, [k]: v }));
  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate(f); setErr(e);
    if (Object.keys(e).length) { document.querySelector<HTMLElement>("[aria-invalid=true]")?.focus(); return; }
    setState("sending");
    try {
      const res = await fetch("/api/enquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      if (!res.ok) throw new Error(); setState("ok"); setF(empty);
    } catch { setState("fail"); }
  }
  if (state === "ok") return (
    <div role="status" className="border border-champagne/40 p-10"><CheckCircle2 className="mb-4 text-champagne" />
      <p className="display text-3xl">Thanks, your enquiry is in.</p><p className="mt-3 text-silver/70">We will reply about your glass and next steps.</p>
      <button className="mt-6 text-sm text-glacier underline underline-offset-4" onClick={() => setState("idle")}>Send another enquiry</button></div>);
  const Err = ({ k }: { k: keyof F }) => err[k] ? <p id={`${k}-e`} className="mt-1 text-sm text-[#f2a58e]">{err[k]}</p> : null;
  const a = (k: keyof F) => ({ "aria-invalid": !!err[k], "aria-describedby": err[k] ? `${k}-e` : undefined });
  return (
    <form onSubmit={submit} noValidate className="grid gap-x-10 gap-y-7 md:grid-cols-2">
      <label className="block"><span className="text-sm text-silver/70">Name</span><input className={field} autoComplete="name" value={f.name} onChange={(e) => set("name", e.target.value)} {...a("name")} /><Err k="name" /></label>
      <label className="block"><span className="text-sm text-silver/70">Email</span><input type="email" className={field} autoComplete="email" value={f.email} onChange={(e) => set("email", e.target.value)} {...a("email")} /><Err k="email" /></label>
      <label className="block"><span className="text-sm text-silver/70">Phone (optional)</span><input type="tel" className={field} autoComplete="tel" value={f.phone} onChange={(e) => set("phone", e.target.value)} {...a("phone")} /><Err k="phone" /></label>
      <label className="block"><span className="text-sm text-silver/70">Suburb or town</span><input className={field} autoComplete="address-level2" value={f.suburb} onChange={(e) => set("suburb", e.target.value)} {...a("suburb")} /><Err k="suburb" /></label>
      <label className="block md:col-span-2"><span className="text-sm text-silver/70">Space</span>
        <select className={`${field} bg-obsidian`} value={f.type} onChange={(e) => set("type", e.target.value)} {...a("type")}>
          <option value="">Select</option>{["Home", "Office", "Boardroom", "Hospitality", "Other commercial"].map((o) => <option key={o}>{o}</option>)}</select><Err k="type" /></label>
      <label className="block md:col-span-2"><span className="text-sm text-silver/70">Tell us about the glass: windows or doors, rough sizes, glass type if known</span>
        <textarea rows={4} className={field} value={f.message} onChange={(e) => set("message", e.target.value)} {...a("message")} /><Err k="message" /></label>
      <input tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={f.website} onChange={(e) => set("website", e.target.value)} />
      <div className="md:col-span-2"><label className="flex items-start gap-3 text-sm text-silver/70"><input type="checkbox" className="mt-1 accent-[#d6b98a]" checked={f.consent} onChange={(e) => set("consent", e.target.checked)} {...a("consent")} />I agree to be contacted about this enquiry.</label><Err k="consent" /></div>
      <div className="flex flex-wrap items-center gap-6 md:col-span-2">
        <button data-magnetic disabled={state === "sending"} className="inline-flex items-center gap-2 rounded-full bg-champagne px-8 py-4 font-medium text-obsidian transition hover:bg-silver disabled:opacity-60">
          {state === "sending" && <Loader2 className="h-4 w-4 animate-spin" />}{state === "sending" ? "Sending" : "Send enquiry"}</button>
        {state === "fail" && <p role="alert" className="flex items-center gap-2 text-sm text-[#f2a58e]"><AlertCircle className="h-4 w-4" />That did not send. Check your connection and try again.</p>}
      </div>
    </form>
  );
}
