import { ArrowUpRight, Sun, ShieldCheck, Layers, Thermometer, Eye, ScanLine, Sparkles, ToggleRight } from "lucide-react";
import Motion from "@/components/Motion";
import Media from "@/components/Media";
import { site } from "@/lib/site";
import ProductSection from "@/components/ProductSection";
import HowSection from "@/components/HowSection";
import SpacesSection from "@/components/SpacesSection";
import WhySection from "@/components/WhySection";
import EnquirySection from "@/components/EnquirySection";

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
        <ProductSection />

        {/* HOW IT WORKS (pinned on desktop) */}
        <HowSection />

        {/* SPACES */}
        <SpacesSection />

        {/* WHY */}
        <WhySection />

        {/* ENQUIRY */}
        <EnquirySection />
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
