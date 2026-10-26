import { NextResponse } from "next/server";
export async function POST(req: Request) {
  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return NextResponse.json({ error: "Bad request" }, { status: 400 }); }
  if (b.website) return NextResponse.json({ ok: true }); // honeypot
  const s = (k: string) => (typeof b[k] === "string" ? (b[k] as string).trim() : "");
  if (s("name").length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s("email")) || s("suburb").length < 2 || !s("type") || s("message").length < 10 || b.consent !== true)
    return NextResponse.json({ error: "Invalid enquiry" }, { status: 422 });
  // TODO: deliver the enquiry (email provider, CRM or webhook). Until wired, it is logged server-side only.
  if (process.env.ENQUIRY_WEBHOOK_URL) {
    const r = await fetch(process.env.ENQUIRY_WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: s("name"), email: s("email"), phone: s("phone"), suburb: s("suburb"), type: s("type"), message: s("message") }) });
    if (!r.ok) return NextResponse.json({ error: "Delivery failed" }, { status: 502 });
  } else console.log("[enquiry]", { name: s("name"), email: s("email"), suburb: s("suburb"), type: s("type") });
  return NextResponse.json({ ok: true });
}
