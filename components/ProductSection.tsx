"use client";

/**
 * CLARIVO — #product section
 * Drop-in replacement for the existing <section id="product">.
 *
 * ASSUMPTIONS (adjust to your project):
 *  - `Media` and `site` import paths below.
 *  - Tailwind tokens `obsidian`, `silver`, `glacier` exist; ivory/champagne use arbitrary values.
 *  - This section deliberately does NOT use data-x / data-split / data-reveal / data-speed / data-clip,
 *    so a global animation utility that scans those attributes won't double-animate it.
 *    All motion is scoped to this component via gsap.context() + gsap.matchMedia().
 */

import { useLayoutEffect, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Media from "@/components/Media";
import { site } from "@/lib/site";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type Props = { ctaHref?: string };

export default function ProductSection({ ctaHref = "#how" }: Props) {
  const root = useRef<HTMLElement>(null);

  useIsoLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger); // safe if already registered
    const el = root.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          desktop: "(min-width: 1024px)",
          tablet: "(min-width: 768px) and (max-width: 1023px)",
          mobile: "(max-width: 767px)",
        },
        (c) => {
          const { motion, desktop, tablet } = c.conditions as Record<string, boolean>;
          if (!motion) return; // static, fully visible layout

          const k = desktop ? 1 : tablet ? 0.6 : 0.35; // movement intensity
          const scrub = { trigger: el, start: "top bottom", end: "bottom top", scrub: true };

          /* ---------- A. Entrance (plays once, content stays) ---------- */
          const tl = gsap.timeline({
            defaults: { ease: "power3.out" },
            scrollTrigger: { trigger: el, start: "top 70%", once: true },
          });

          tl.from(q("[data-bgtype-in]"), { opacity: 0, duration: 1.6, ease: "power2.out" }, 0)
            .fromTo(
              q("[data-frame]"),
              { clipPath: "inset(14% 10% 14% 10%)" },
              { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "expo.inOut" },
              0.25
            )
            .from(q("[data-scale]"), { scale: 1.22, duration: 1.9, ease: "power2.out" }, 0.25)
            .from(q("[data-eyebrow]"), { opacity: 0, y: 12, duration: 0.8 }, 0.6)
            .from(q("[data-line]"), { yPercent: 110, duration: 1.1, stagger: 0.11 }, 0.7)
            .from(q("[data-fade]"), { opacity: 0, y: 24, duration: 1, stagger: 0.12 }, 1.2)
            .from(q("[data-rule]"), { scaleX: 0, transformOrigin: "left center", duration: 1.2 }, 1.1)
            .from(q("[data-film-enter]"), { opacity: 0, y: 48 * k + 16, duration: 1.4 }, 1.5);

          /* ---------- B/C. Layered parallax (each on its own element) ---------- */
          // Image: moves inside the clipped frame (layer is oversized, so no edges show)
          gsap.fromTo(q("[data-img-parallax]"), { yPercent: -4 * k }, { yPercent: 4 * k, ease: "none", scrollTrigger: scrub });

          // Background type: much slower, independent horizontal + vertical drift
          gsap.fromTo(
            q("[data-bgtype]"),
            { xPercent: 3, yPercent: -2 * k },
            { xPercent: -9 * k - 2, yPercent: 4 * k, ease: "none", scrollTrigger: scrub }
          );
          // Exit: type dissolves gently as the section leaves (no hard reset)
          gsap.fromTo(
            q("[data-bgtype-fade]"),
            { opacity: 1 },
            {
              opacity: 0.25,
              ease: "none",
              scrollTrigger: { trigger: el, start: "55% top", end: "bottom top", scrub: true },
            }
          );

          // Text: barely moves, readability first
          gsap.fromTo(q("[data-text-parallax]"), { y: 14 * k }, { y: -14 * k, ease: "none", scrollTrigger: scrub });

          // Linework: restrained
          gsap.fromTo(q("[data-line-parallax]"), { y: 20 * k }, { y: -20 * k, ease: "none", scrollTrigger: scrub });

          if (desktop || tablet) {
            // Film: faster than the image for foreground depth
            gsap.fromTo(
              q("[data-film-parallax]"),
              { y: 46 * k },
              { y: -46 * k, ease: "none", scrollTrigger: scrub }
            );
            // Highlight sweep across the film as you scroll
            gsap.fromTo(
              q("[data-film-glint]"),
              { xPercent: -60 },
              { xPercent: 140, ease: "none", scrollTrigger: scrub }
            );
          }

          /* ---------- D. Slow suspended float (separate element, no conflicts) ---------- */
          gsap.to(q("[data-film-float]"), {
            y: -8,
            rotation: 0.4,
            duration: 4.8,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          });
        }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="product"
      ref={root}
      className="relative overflow-hidden bg-obsidian px-6 py-28 md:px-12 md:py-40 lg:py-48"
    >
      {/* Atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_75%_30%,rgba(150,190,215,.10),transparent_70%),radial-gradient(50%_40%_at_10%_90%,rgba(201,180,138,.05),transparent_70%)]"
      />

      {/* Background typography (three isolated layers: entrance / parallax / exit fade) */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-8 select-none md:top-6">
        <div data-bgtype-in>
          <div data-bgtype-fade>
            <div data-bgtype className="will-change-transform">
              <p
                className="display whitespace-nowrap text-[26vw] leading-none text-silver/[.05] md:text-[20vw]"
                style={{
                  WebkitMaskImage: "linear-gradient(180deg,#000 30%,transparent 95%)",
                  maskImage: "linear-gradient(180deg,#000 30%,transparent 95%)",
                }}
              >
                Clear · Private · Clear
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto grid max-w-[1500px] gap-14 md:grid-cols-12 md:gap-10 lg:gap-16">
        {/* ---------- Text column ---------- */}
        <div className="md:col-span-5 md:pt-20 lg:pt-28">
          <div data-text-parallax>
            <div data-eyebrow className="flex items-center gap-4 text-[11px] uppercase tracking-[.28em] text-champagne">
              <span>01</span>
              <span aria-hidden className="h-px w-10 bg-champagne/60" />
              <span>The Smart Film Difference</span>
            </div>

            <h2 className="display mt-8 text-[clamp(2.4rem,5.2vw,5rem)] leading-[1.02] tracking-[-0.01em] text-[#f4efe6]">
              <span className="block overflow-hidden pb-[.2em]">
                <span data-line className="block">The window stays.</span>
              </span>
              <span className="block overflow-hidden pb-[.1em]">
                <span data-line className="block">The view becomes</span>
              </span>
              <span className="block overflow-hidden pb-[.2em]">
                <span data-line className="block italic text-[#f4efe6]/90">yours to control.</span>
              </span>
            </h2>

            <div data-rule aria-hidden className="mt-10 h-px w-full max-w-md bg-silver/25" />

            <p data-fade className="mt-8 max-w-md leading-relaxed text-silver/70">
              Clarivo film is applied to existing glass, so windows and doors that already suit your space can gain a
              private state without being replaced. Suitability depends on the glass, which is why we start with an
              assessment.
            </p>

            <a
              data-fade
              href={ctaHref}
              className="group mt-10 inline-flex items-center gap-4 border-b border-champagne/40 pb-2 text-sm uppercase tracking-[.2em] text-[#f4efe6] transition-colors duration-500 hover:border-champagne"
            >
              Discover the film
              <svg
                aria-hidden
                width="22"
                height="10"
                viewBox="0 0 22 10"
                fill="none"
                className="text-champagne transition-transform duration-500 ease-out group-hover:translate-x-1.5"
              >
                <path d="M0 5h20M16 1l4 4-4 4" stroke="currentColor" strokeWidth="1" />
              </svg>
            </a>
          </div>
        </div>

        {/* ---------- Visual column ---------- */}
        <div className="relative md:col-span-7">
          {/* Decorative linework */}
          <div data-line-parallax aria-hidden className="pointer-events-none absolute -right-2 -top-8 hidden h-40 w-40 md:block">
            <div className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-silver/30 to-transparent" />
            <div className="absolute right-0 top-0 h-px w-full bg-gradient-to-l from-silver/30 to-transparent" />
          </div>

          {/* Image: frame (clip) > parallax layer > scale layer > Media */}
          <div
            data-frame
            className="relative aspect-[4/5] w-full overflow-hidden border border-silver/20 md:aspect-[5/6] lg:aspect-[6/7]"
          >
            <div data-img-parallax className="absolute inset-x-0 -inset-y-[6%] will-change-transform">
              <div data-scale className="h-full w-full will-change-transform">
                <Media
                  src={site.img.showcase}
                  alt="Modern home with large glazed doors and windows"
                  className="h-full w-full object-cover saturate-[.9] contrast-[1.05]"
                />
              </div>
            </div>
            {/* Controlled grade */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(8,10,12,.0)_55%,rgba(8,10,12,.55)_100%),linear-gradient(120deg,rgba(150,190,215,.10),transparent_45%)]"
            />
            {/* Corner index */}
            <span className="absolute left-4 top-4 text-[10px] uppercase tracking-[.3em] text-[#f4efe6]/70">
              Fig. 01 — Glazing
            </span>
          </div>

          {/* Film detail.
              Mobile: in flow, below image, no overlap.
              md+: overlaps the image's lower-left corner (never reaches the text column's copy/CTA). */}
          <div
            data-film-parallax
            className="relative mt-6 ml-auto w-[78%] max-w-sm md:absolute md:-bottom-10 md:left-6 md:mt-0 md:ml-0 md:w-[52%] lg:-bottom-14 lg:-left-16 lg:w-[46%]"
          >
            <div data-film-enter>
              <div data-film-float className="relative will-change-transform">
                <FilmSheet />
                <div className="mt-4 flex items-center gap-3">
                  <span aria-hidden className="h-px w-8 bg-champagne/70" />
                  <span className="text-[10px] uppercase tracking-[.3em] text-[#f4efe6]/80">Switchable Smart Film</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom breathing room so the overlap never touches the next section */}
      <div aria-hidden className="h-10 md:h-16" />
    </section>
  );
}

/**
 * Smart-film sheet built from layered gradients.
 * - Flat translucent sheet with cool silver/glacier body
 * - Rolled edge on the left: cylindrical shading + inner curl shadow
 * - Fine edge highlight, soft specular glint (animated via [data-film-glint])
 */
function FilmSheet() {
  return (
    <div className="relative aspect-[3/2] w-full drop-shadow-[0_30px_40px_rgba(0,0,0,.55)]">
      {/* Sheet body */}
      <div
        className="absolute inset-y-[3%] left-[12%] right-0 overflow-hidden rounded-r-[3px]"
        style={{
          background:
            "linear-gradient(135deg, rgba(235,244,250,.55) 0%, rgba(170,200,220,.28) 38%, rgba(120,160,190,.22) 70%, rgba(220,235,245,.40) 100%)",
          backdropFilter: "blur(10px) saturate(1.2)",
          WebkitBackdropFilter: "blur(10px) saturate(1.2)",
          boxShadow:
            "inset 0 0 0 1px rgba(255,255,255,.22), inset 0 1px 0 rgba(255,255,255,.55), inset 0 -18px 30px -18px rgba(20,40,60,.35)",
        }}
      >
        {/* Fine linear grain from the film substrate */}
        <div
          className="absolute inset-0 opacity-[.18] mix-blend-overlay"
          style={{
            backgroundImage:
              "repeating-linear-gradient(100deg, rgba(255,255,255,.7) 0 1px, transparent 1px 5px)",
          }}
        />
        {/* Soft diagonal highlight */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(115deg, transparent 20%, rgba(255,255,255,.38) 32%, transparent 44%)",
          }}
        />
        {/* Scroll-driven glint */}
        <div
          data-film-glint
          className="absolute inset-y-0 left-0 w-[35%] mix-blend-screen"
          style={{
            background:
              "linear-gradient(100deg, transparent 0%, rgba(255,255,255,.55) 50%, transparent 100%)",
            filter: "blur(6px)",
          }}
        />
        {/* Top/right edge highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-white/70" />
      </div>

      {/* Rolled edge (cylinder) */}
      <div
        className="absolute inset-y-0 left-0 w-[17%] rounded-[999px/12%]"
        style={{
          background:
            "linear-gradient(90deg, rgba(40,60,78,.85) 0%, rgba(120,150,175,.75) 14%, rgba(240,248,255,.95) 34%, rgba(170,200,220,.8) 52%, rgba(90,120,145,.75) 78%, rgba(30,48,64,.85) 100%)",
          boxShadow:
            "inset 0 0 0 1px rgba(255,255,255,.25), 6px 0 14px -4px rgba(0,0,0,.45)",
        }}
      >
        {/* Specular line down the roll */}
        <div className="absolute inset-y-[6%] left-[36%] w-[6%] rounded-full bg-white/80 blur-[1.5px]" />
        {/* Spiral hint at the roll's end */}
        <div
          className="absolute inset-x-[8%] top-0 h-[7%] rounded-[50%]"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, rgba(10,18,26,.85) 0 30%, rgba(190,215,232,.9) 32% 48%, rgba(60,85,105,.9) 50% 100%)",
          }}
        />
      </div>

      {/* Contact shadow where the sheet rests off the roll */}
      <div
        aria-hidden
        className="absolute left-[16%] top-[3%] h-[94%] w-[6%] bg-gradient-to-r from-black/35 to-transparent"
      />
    </div>
  );
}