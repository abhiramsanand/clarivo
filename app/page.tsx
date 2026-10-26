import { ArrowUpRight, Sun, ShieldCheck, Layers, Thermometer, Eye, ScanLine, Sparkles, ToggleRight } from "lucide-react";
import Motion from "@/components/Motion";
import Media from "@/components/Media";
import Enquiry from "@/components/Enquiry";
import { site } from "@/lib/site";

const nav = [["Product", "#product"], ["How it works", "#how"], ["Spaces", "#spaces"], ["Why Clarivo", "#why"]];
const tickIcons = [Eye, Sun, Thermometer, ShieldCheck, Layers];
const btn = "inline-flex items-center gap-2 rounded-full px-7 py-4 text-[15px] font-medium transition";

export default function Page() {
  const c = site.contact;
  return (
    <Motion>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-silver/10 bg-obsidian/75 px-5 py-4 text-silver backdrop-blur-md md:px-12 md:py-5">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">
          <a href="#top" className="display shrink-0 text-xl tracking-[.08em]" aria-label="Clarivo home">{site.brand}</a>
          <nav aria-label="Primary" className="hidden items-center gap-7 text-sm lg:flex">{nav.map(([l, h]) => <a key={h} href={h} className="text-silver/80 transition hover:text-silver">{l}</a>)}</nav>
          <details className="mobile-nav relative lg:hidden"><summary className="cursor-pointer list-none rounded-full border border-silver/40 px-4 py-2 text-sm">Menu</summary><nav aria-label="Primary" className="absolute right-0 top-12 flex min-w-48 flex-col gap-4 border border-silver/20 bg-obsidian p-5 shadow-xl">{nav.map(([l, h]) => <a key={h} href={h} className="text-silver/85">{l}</a>)}</nav></details>
          <a href="#enquiry" className="shrink-0 rounded-full border border-champagne/70 px-5 py-2 text-sm text-silver transition hover:bg-champagne hover:text-obsidian">Enquire</a>
        </div>
      </header>

      <main id="top">
        {/* HERO */}
        <section data-hero className="relative min-h-[680px] h-[100svh] overflow-hidden grain md:min-h-[720px]">
          <div data-hero-img className="absolute inset-0"><Media src={site.img.hero} alt="Luxury interior with floor-to-ceiling windows" eager className="h-full w-full" /></div>
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/30 to-obsidian/50" />
          <div data-hero-frost style={{ opacity: 0 }} className="frost absolute inset-0" aria-hidden />
          <div data-hero-veil style={{ opacity: 0 }} className="absolute inset-0 bg-obsidian" aria-hidden />
          <div data-hero-copy className="relative z-10 flex h-full flex-col justify-end px-6 pb-16 md:px-12 md:pb-20">
            <h1 data-split className="display max-w-[12ch] text-[clamp(3.35rem,9.5vw,9.5rem)]">Privacy. When You Need It.</h1>
            <div className="mt-10 grid items-end gap-8 md:grid-cols-[1fr_auto]">
              <p data-hero-in className="max-w-md text-lg leading-relaxed text-silver/80">Smart film that turns the glass you already have from clear to private, for Queensland homes and workplaces.</p>
              <div data-hero-in className="flex flex-wrap gap-3">
                <a data-magnetic href="#enquiry" className={`${btn} bg-champagne text-obsidian hover:bg-silver`}>Start a project enquiry <ArrowUpRight className="h-4 w-4" /></a>
                <button data-toggle aria-pressed="false" className={`${btn} border border-silver/40 backdrop-blur hover:bg-silver/10`}><ToggleRight className="h-4 w-4" /><span>Switch to private</span></button>
              </div>
            </div>
          </div>
        </section>

        {/* TICKER */}
        <section aria-label="Key benefits" className="overflow-hidden border-y border-silver/15 bg-charcoal py-6">
          <div className="marquee-track flex w-max" aria-label={site.ticker.join(" · ")}>
            {[0, 1].map((copy) => <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0 gap-10 whitespace-nowrap pr-10 md:gap-14 md:pr-14">{site.ticker.map((t, i) => { const I = tickIcons[i % tickIcons.length]; return <li key={t} className="display flex items-center gap-4 text-2xl text-silver/90 md:text-3xl"><I className="h-5 w-5 text-champagne" strokeWidth={1.25} />{t}</li>; })}</ul>)}
          </div>
        </section>

        {/* PRODUCT */}
        <section id="product" className="relative overflow-hidden px-6 py-32 md:px-12 md:py-48">
          <p aria-hidden data-x="12" className="display pointer-events-none absolute left-0 top-10 whitespace-nowrap text-[22vw] text-silver/[.04]">Clear · Private · Clear</p>
          <div className="relative grid gap-16 md:grid-cols-12">
            <div className="md:col-span-5 md:pt-24">
              <h2 data-split className="display text-[clamp(2.6rem,6vw,5.5rem)]">The window stays. The view becomes yours to control.</h2>
              <p data-reveal className="mt-8 max-w-md leading-relaxed text-silver/70">Clarivo film is applied to existing glass, so windows and doors that already suit your space can gain a private state without being replaced. Suitability depends on the glass, which is why we start with an assessment.</p>
            </div>
            <div className="relative md:col-span-7">
              <div data-speed="-0.06"><Media data-clip src={site.img.showcase} alt="Modern home with large glazed doors and windows" className="aspect-[4/5] w-full md:aspect-[5/6]" /></div>
              <div data-speed="0.18" className="absolute -bottom-16 -left-4 w-[62%] max-w-sm md:-left-24">
                <div className="frost relative aspect-[3/2] border border-silver/40 shadow-[0_40px_80px_-20px_rgba(0,0,0,.7)]">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-glacier/30" />
                  <span className="absolute bottom-3 left-4 text-sm text-obsidian/80">Clarivo smart film</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS (pinned on desktop) */}
        <section id="how" data-how className="relative overflow-hidden bg-charcoal px-6 py-24 md:flex md:min-h-[100svh] md:items-center md:px-12 md:py-16">
          <div className="grid w-full items-center gap-14 md:grid-cols-12">
            <div className="relative md:col-span-5">
              <div data-how-bar aria-hidden className="absolute -left-6 top-0 hidden h-full w-px origin-top scale-y-0 bg-champagne md:block" />
              <h2 data-split className="display mb-12 text-[clamp(2.4rem,5vw,4.5rem)]">From clear glass to private room in three steps.</h2>
              <ol className="space-y-10">
                {[[ScanLine, "Assess your existing glass", "We check the type, condition and size of your glazing to confirm whether film suits it."],
                  [Layers, "Apply the film", "Where your glass is suitable, the film is fitted to the existing window or door."],
                  [Sparkles, "Switch between states", "Clear when you want the view, private when you do not."]].map(([I, t, d], i) => { const Ic = I as typeof Sun; return (
                  <li key={i} data-step className="flex gap-5"><Ic className="mt-1 h-6 w-6 shrink-0 text-champagne" strokeWidth={1.25} />
                    <div><h3 className="display text-2xl">{i + 1}. {t as string}</h3><p className="mt-2 max-w-sm text-silver/70">{d as string}</p></div></li>); })}
              </ol>
            </div>
            <div className="md:col-span-7">
              <div className="relative aspect-[4/3] w-full overflow-hidden grain">
                <Media src={site.img.residential} alt="Interior seen through a window, shown clear then frosted" className="h-full w-full" />
                <div data-film className="absolute inset-[6%] border border-silver/50" aria-hidden />
                <div data-how-frost className="frost absolute inset-0" style={{ opacity: 0.85 }} aria-hidden />
              </div>
            </div>
          </div>
        </section>

        {/* SPACES */}
        <section id="spaces" className="px-6 py-32 md:px-12 md:py-48">
          <h2 data-split className="display max-w-[14ch] text-[clamp(2.8rem,7vw,6.5rem)]">One film. Five kinds of space.</h2>
          <div className="mt-20 grid gap-y-24 md:grid-cols-12 md:gap-x-8">
            {[
              ["Residential", "Bedrooms, bathrooms and street-facing glass.", "residential", "md:col-span-7", "aspect-[16/11]", "0.05"],
              ["Offices", "Meeting rooms and open-plan partitions.", "office", "md:col-span-4 md:col-start-9 md:mt-40", "aspect-[3/4]", "-0.08"],
              ["Boardrooms", "Discretion for confidential conversations.", "boardroom", "md:col-span-5 md:col-start-2", "aspect-[4/5]", "0.1"],
              ["Hospitality", "Private dining and treatment spaces.", "hospitality", "md:col-span-6 md:col-start-7 md:mt-24", "aspect-[16/11]", "-0.05"],
            ].map(([t, d, k, cls, ar, sp]) => (
              <article key={t} className={cls}>
                <div className="relative"><div data-speed={sp}><Media data-clip src={site.img[k as keyof typeof site.img]} alt={`${t} space with glass walls`} className={`${ar} w-full`} /></div></div>
                <h3 className="display mt-6 text-3xl">{t}</h3><p className="mt-2 max-w-xs text-silver/65">{d}</p>
              </article>))}
            <article className="md:col-span-5 md:col-start-8"><div className="border-t border-silver/25 pt-6"><h3 className="display text-3xl">Commercial</h3><p className="mt-2 max-w-xs text-silver/65">Shopfronts, clinics and reception areas, assessed project by project.</p></div></article>
          </div>
        </section>

        {/* WHY */}
        <section id="why" className="relative bg-silver px-6 py-32 text-obsidian md:px-12 md:py-44">
          <div className="grid gap-16 md:grid-cols-12">
            <h2 data-split className="display text-[clamp(2.6rem,6vw,5.5rem)] md:col-span-6">Upgrade the glass you already have.</h2>
            <dl className="md:col-span-5 md:col-start-8">
              {[["Start with what is there", "Film is applied to existing glazing where it is suitable, so you are not defaulting to replacement."],
                ["Assessed before quoted", "Every project begins by checking the glass, so recommendations fit your windows."],
                ["Specifications on request", "Performance details are confirmed against the product datasheet for your project."]].map(([t, d]) => (
                <div data-reveal key={t} className="border-t border-obsidian/20 py-7"><dt className="display text-2xl">{t}</dt><dd className="mt-2 max-w-md text-obsidian/70">{d}</dd></div>))}
            </dl>
          </div>
        </section>

        {/* ENQUIRY */}
        <section id="enquiry" className="px-6 py-32 md:px-12 md:py-44">
          <div className="grid gap-16 md:grid-cols-12">
            <div className="md:col-span-4">
              <h2 data-split className="display text-[clamp(2.6rem,5.5vw,5rem)]">Tell us about your glass.</h2>
              <p className="mt-6 max-w-sm text-silver/70">Share a few details and we will come back to you about suitability and next steps for your {site.region} project.</p>
              <ul className="mt-8 space-y-2 text-silver/80">{c.email && <li><a className="underline underline-offset-4" href={`mailto:${c.email}`}>{c.email}</a></li>}{c.phone && <li><a href={`tel:${c.phone}`}>{c.phone}</a></li>}{c.address && <li>{c.address}</li>}</ul>
            </div>
            <div className="md:col-span-7 md:col-start-6"><Enquiry /></div>
          </div>
        </section>
      </main>

      <footer className="border-t border-silver/15 px-6 py-12 md:px-12">
        <div className="flex flex-col justify-between gap-8 md:flex-row">
          <div><p className="display text-2xl tracking-[.08em]">{site.brand}</p><p className="mt-2 text-sm text-silver/60">{site.product} for {site.region}</p>{c.abn && <p className="mt-1 text-sm text-silver/60">ABN {c.abn}</p>}</div>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-silver/70">{[...nav, ["Enquire", "#enquiry"]].map(([l, h]) => <a key={h} href={h} className="hover:text-silver">{l}</a>)}</nav>
        </div>
        <p className="mt-10 text-xs text-silver/40">© {new Date().getFullYear()} {site.brand}. All rights reserved.</p>
      </footer>
    </Motion>
  );
}
