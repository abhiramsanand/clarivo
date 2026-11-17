import {
  ArrowUpRight,
  Sun,
  ShieldCheck,
  Layers,
  Thermometer,
  Eye,
  ToggleRight,
} from "lucide-react";

import Motion from "@/components/Motion";
import Media from "@/components/Media";
import { site } from "@/lib/site";
import ProductSection from "@/components/ProductSection";
import HowSection from "@/components/HowSection";
import SpacesSection from "@/components/SpacesSection";
import ApproachSection from "@/components/ApproachSection";
import EnquirySection from "@/components/EnquirySection";
import FrostLayer from "@/components/FrostLayer";

const nav = [
  ["Product", "#product"],
  ["How it works", "#how"],
  ["Spaces", "#spaces"],
  ["How to Approach", "#approach"],
  ["Gallery", "/gallery"],
];

const tickIcons = [Eye, Sun, Thermometer, ShieldCheck, Layers];

const btn =
  "inline-flex items-center gap-2 rounded-full px-7 py-4 text-[15px] font-medium transition";

export default function Page() {
  const c = site.contact;

  return (
    <Motion>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-line bg-ivory/80 px-5 py-4 text-ink backdrop-blur-md md:px-12 md:py-5">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">

          {/* LOGO */}
          <a
            href="#top"
            className="display shrink-0 text-xl tracking-[.08em]"
            aria-label="Privolux home"
          >
            {site.brand}
          </a>

          {/* DESKTOP NAVIGATION */}
          <nav
            aria-label="Primary"
            className="hidden items-center gap-7 text-sm lg:flex"
          >
            {nav.map(([l, h]) => (
              <a
                key={h}
                href={h}
                className="text-ink/80 transition hover:text-eucalyptus"
              >
                {l}
              </a>
            ))}
          </nav>

          {/* MOBILE NAVIGATION */}
          <details className="mobile-nav relative lg:hidden">
            <summary className="cursor-pointer list-none rounded-full border border-eucalyptus/40 px-4 py-2 text-sm text-eucalyptus">
              Menu
            </summary>

            <nav
              aria-label="Primary"
              className="absolute right-0 top-12 flex min-w-48 flex-col gap-4 border border-line bg-warm p-5 shadow-xl"
            >
              {nav.map(([l, h]) => (
                <a
                  key={h}
                  href={h}
                  className="text-ink/85 transition hover:text-eucalyptus"
                >
                  {l}
                </a>
              ))}
            </nav>
          </details>

          {/* ENQUIRY BUTTON */}
          <a
            href="#enquiry"
            className="shrink-0 rounded-full border border-eucalyptus/70 px-5 py-2 text-sm text-eucalyptus transition hover:bg-eucalyptus hover:text-warm"
          >
            Enquire
          </a>
        </div>
      </header>

      <main id="top">

        {/* HERO */}
        <section
          data-hero
          className="relative min-h-[680px] h-[100svh] overflow-hidden grain md:min-h-[720px]"
        >

          <div
            data-hero-img
            className="absolute left-1/2 top-1/2"
            style={{
              width: "max(100%, calc(100svh * 1.775862))",
              aspectRatio: "1648 / 928",
              transform: "translate(-50%, -50%)",
            }}
          >
            {/* Base clear image */}
            <Media
              src={site.img.howRoom}
              alt="Modern living room with a large clear garden-facing window"
              eager
              className="h-full w-full"
            />

            {/* Frost effect restricted to window glass */}
            <FrostLayer
              roomSrc={site.img.howRoom}
              frostSrc={site.img.howGlassFrost}
              maskSrc={site.img.howGlassMask}
            />
          </div>


          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-ink/50" />

          <div
            data-hero-veil
            style={{ opacity: 0 }}
            className="absolute inset-0 bg-ink"
            aria-hidden
          />

          <div
            data-hero-copy
            className="relative z-10 flex h-full flex-col justify-end px-6 pb-16 text-ivory md:px-12 md:pb-20"
          >
            <h1
              data-split
              className="display max-w-[12ch] text-[clamp(3.35rem,9.5vw,9.5rem)]"
            >
              Privacy is the new luxury.
            </h1>

            <div className="mt-10 grid items-end gap-8 md:grid-cols-[1fr_auto]">
              <p
                data-hero-in
                className="max-w-md text-lg leading-relaxed text-warm/85"
              >
                Beautifully open when you want the view. Effortlessly private when you need you space. Discover switchable smart film for refined queensland living.
              </p>

              <div data-hero-in className="flex flex-wrap gap-3">
                <a
                  data-magnetic
                  href="#enquiry"
                  className={`${btn} bg-eucalyptus text-warm ring-1 ring-mist/40 hover:bg-ink`}
                >
                  Start a project enquiry
                  <ArrowUpRight className="h-4 w-4" />
                </a>

                <button
                  data-toggle
                  aria-pressed="false"
                  className={`${btn} border border-warm/50 text-warm backdrop-blur hover:bg-warm/10`}
                >
                  <ToggleRight className="h-4 w-4" />
                  <span>Switch to private</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* TICKER */}
        <section
          aria-label="Key benefits"
          className="overflow-hidden border-y border-line bg-limestone py-6"
        >
          <div
            className="marquee-track flex w-max"
            aria-label={site.ticker.join(" · ")}
          >
            {[0, 1].map((copy) => (
              <ul
                key={copy}
                aria-hidden={copy === 1}
                className="flex shrink-0 gap-10 whitespace-nowrap pr-10 md:gap-14 md:pr-14"
              >
                {site.ticker.map((t, i) => {
                  const I = tickIcons[i % tickIcons.length];

                  return (
                    <li
                      key={t}
                      className="display flex items-center gap-4 text-2xl text-ink/90 md:text-3xl"
                    >
                      <I
                        className="h-5 w-5 text-eucalyptus"
                        strokeWidth={1.25}
                      />
                      {t}
                    </li>
                  );
                })}
              </ul>
            ))}
          </div>
        </section>

        {/* PRODUCT */}
        <ProductSection />

        {/* HOW IT WORKS */}
        <HowSection />

        {/* SPACES */}
        <SpacesSection />

        {/* WHY PRIVOLUX */}
        <ApproachSection />

        {/* ENQUIRY */}
        <EnquirySection />

      </main>

      {/* FOOTER */}
      <footer className="border-t border-mist/20 bg-ink px-6 py-12 text-ivory md:px-12">
        <div className="flex flex-col justify-between gap-8 md:flex-row">

          <div>
            <p className="display text-2xl tracking-[.08em]">
              {site.brand}
            </p>

            <p className="mt-2 text-sm text-warm/60">
              {site.product} - {site.region}
            </p>

            {c.abn && (
              <p className="mt-1 text-sm text-warm/60">
                ABN {c.abn}
              </p>
            )}
          </div>

          {/* FOOTER NAVIGATION */}
          <nav
            aria-label="Footer"
            className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-warm/70"
          >
            {[
              ...nav,
              ["Enquire", "#enquiry"],
            ].map(([l, h]) => (
              <a
                key={h}
                href={h}
                className="transition hover:text-ivory"
              >
                {l}
              </a>
            ))}
          </nav>
        </div>

        <p className="mt-10 text-xs text-warm/50">
          © {new Date().getFullYear()} {site.brand}. All rights reserved.
        </p>
      </footer>
    </Motion>
  );
}