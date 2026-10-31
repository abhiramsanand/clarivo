"use client";

/**
 * CLARIVO — Gallery route (app/gallery/page.tsx)
 * Single file. No new components, dependencies, CSS or config.
 *
 * Assumptions (adjust at the top of the file if needed):
 *  - `Media` is the default export of "@/components/Media" (props: src, alt, className, eager).
 *  - `site.img` has: hero, showcase, residential, office, boardroom, hospitality. `commercial` is optional;
 *    if the key does not exist, the Commercial entry (and its filter) is simply left out. No image is repeated.
 *  - The site header/footer are NOT provided by a layout for this route. Set SHOW_BAR to false if they are.
 *  - Client component, so this file cannot export route `metadata`.
 */

import { useEffect, useRef, useState } from "react";
import type { MouseEvent, TouchEvent } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import Media from "@/components/Media";
import { site } from "@/lib/site";

const SHOW_BAR = true;

type ImgSrc = typeof site.img.hero;
const imgs = site.img as unknown as Record<string, ImgSrc | undefined>;

type Cat = "Residential" | "Offices" | "Boardrooms" | "Hospitality" | "Commercial";
type Item = {
  key: string;
  cat: Cat;
  title: string;
  caption: string;
  src: ImgSrc;
  alt: string;
  orient: "l" | "p";
  dir: "l" | "r" | "t" | "b" | "c";
  amp: number;
  wrap: string;
  aspect: string;
  bleed?: boolean;
};

const RAW: (Omit<Item, "src"> & { src?: ImgSrc })[] = [
  {
    key: "residential",
    cat: "Residential",
    title: "Living with the view",
    caption: "Existing glazing, assessed for suitability before any film is considered.",
    src: imgs.residential,
    alt: "Residential interior with large glazing",
    orient: "l",
    dir: "l",
    amp: 3,
    wrap: "md:col-span-12 lg:col-span-8",
    aspect: "aspect-[4/5] md:aspect-[16/10]",
  },
  {
    key: "showcase",
    cat: "Residential",
    title: "Glass at the threshold",
    caption: "Doors and windows that already suit the space, kept in place.",
    src: imgs.showcase,
    alt: "Modern home with large glazed doors and windows",
    orient: "p",
    dir: "b",
    amp: 6,
    wrap: "ml-auto w-[80%] md:ml-0 md:w-auto md:col-span-6 lg:col-span-4 lg:col-start-9 lg:mt-56",
    aspect: "aspect-[4/5]",
  },
  {
    key: "office",
    cat: "Offices",
    title: "Rooms within the room",
    caption: "Meeting rooms and partitions, with privacy when the work calls for it.",
    src: imgs.office,
    alt: "Contemporary workplace with glazed meeting rooms and partitions",
    orient: "p",
    dir: "t",
    amp: 5,
    wrap: "w-[88%] md:w-auto md:col-span-6 md:mt-20 lg:col-span-4 lg:col-start-2 lg:mt-0",
    aspect: "aspect-[3/4] lg:aspect-[4/5]",
  },
  {
    key: "boardroom",
    cat: "Boardrooms",
    title: "Discretion, on demand",
    caption: "A clear room for the day, a private one for the conversation that matters.",
    src: imgs.boardroom,
    alt: "Boardroom with glass partitions and a refined meeting-room interior",
    orient: "p",
    dir: "r",
    amp: 6,
    wrap: "ml-auto w-[80%] md:ml-0 md:w-auto md:col-span-6 md:mt-40 lg:col-span-4 lg:col-start-8 lg:mt-44",
    aspect: "aspect-[4/5] lg:aspect-[2/3]",
  },
  {
    key: "hospitality",
    cat: "Hospitality",
    title: "Private by degrees",
    caption: "Dining and treatment spaces that can open to the view or close around the guest.",
    src: imgs.hospitality,
    alt: "Refined hospitality interior with glazed screens",
    orient: "l",
    dir: "c",
    amp: 5,
    wrap: "-mx-6 md:-mx-12 md:col-span-12",
    aspect: "aspect-[4/3] md:aspect-[21/9]",
    bleed: true,
  },
  {
    key: "commercial",
    cat: "Commercial",
    title: "Front of house",
    caption: "Reception areas, clinics and shopfronts, assessed project by project.",
    src: imgs.commercial,
    alt: "Commercial space with glazing",
    orient: "l",
    dir: "l",
    amp: 3,
    wrap: "md:col-span-12 lg:col-span-8 lg:col-start-5",
    aspect: "aspect-[4/5] md:aspect-[16/9]",
  },
];

const ITEMS: Item[] = RAW.filter((i): i is Item => Boolean(i.src));
const CATS: string[] = ["All", ...Array.from(new Set(ITEMS.map((i) => i.cat)))];

const CLIP_FROM: Record<Item["dir"], string> = {
  l: "inset(0% 100% 0% 0%)",
  r: "inset(0% 0% 0% 100%)",
  t: "inset(0% 0% 100% 0%)",
  b: "inset(100% 0% 0% 0%)",
  c: "inset(14% 10% 14% 10%)",
};

const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const pad = (n: number) => String(n).padStart(2, "0");

export default function GalleryPage() {
  const root = useRef<HTMLElement>(null);

  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState<number | null>(null); // index within `visible`
  const visible = ITEMS.filter((i) => filter === "All" || i.cat === filter);
  const isOpen = open !== null;
  const current = open !== null ? visible[open] : undefined;

  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const dirRef = useRef(1);
  const closing = useRef(false);
  const swipeX = useRef<number | null>(null);
  const shown = useRef(false);

  const openAt = (key: string, e: MouseEvent<HTMLElement>) => {
    triggerRef.current = e.currentTarget;
    const idx = visible.findIndex((v) => v.key === key);
    if (idx >= 0) setOpen(idx);
  };

  const go = (d: 1 | -1) => {
    if (visible.length < 2) return;
    dirRef.current = d;
    setOpen((i) => (i === null ? i : (i + d + visible.length) % visible.length));
  };

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    const done = () => {
      setOpen(null);
      closing.current = false;
    };
    if (prefersReduced() || !overlayRef.current) return done();
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.3, ease: "power2.in", onComplete: done });
  };

  /* ---------- Page animation (scoped, matchMedia, cleaned up) ---------- */
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
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
        },
        (c) => {
          const { motion, desktop, tablet } = c.conditions as Record<string, boolean>;
          if (!motion) return;
          const k = desktop ? 1 : tablet ? 0.5 : 0;

          /* Hero entrance */
          gsap
            .timeline({ defaults: { ease: "power3.out" } })
            .from(q("[data-h-eyebrow]"), { opacity: 0, y: 12, duration: 0.8 }, 0.1)
            .from(q("[data-h-line]"), { yPercent: 110, duration: 1.2, stagger: 0.12 }, 0.2)
            .fromTo(
              q("[data-h-frame]"),
              { clipPath: "inset(100% 0% 0% 0%)" },
              { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "expo.inOut" },
              0.1
            )
            .from(q("[data-h-scale]"), { scale: 1.2, duration: 2, ease: "power2.out" }, 0.1)
            .from(q("[data-h-fade]"), { opacity: 0, y: 20, duration: 0.9, stagger: 0.1 }, 1.0);

          /* Hero scroll movement */
          const hero = q("[data-hero]")[0];
          if (hero && k > 0) {
            const st = { trigger: hero, start: "top top", end: "bottom top", scrub: true };
            gsap.to(q("[data-h-par]"), { yPercent: 12 * k, ease: "none", scrollTrigger: st });
            gsap.to(q("[data-h-drift]"), { yPercent: -8 * k, ease: "none", scrollTrigger: st });
          }
          if (hero) {
            gsap.to(q("[data-h-cue]"), {
              opacity: 0,
              ease: "none",
              scrollTrigger: { trigger: hero, start: "top top", end: "30% top", scrub: true },
            });
          }

          /* Scroll cue line */
          const cue = q("[data-cue-line]")[0];
          if (cue) {
            gsap
              .timeline({ repeat: -1, repeatDelay: 0.3 })
              .set(cue, { transformOrigin: "top center", scaleY: 0 })
              .to(cue, { scaleY: 1, duration: 0.9, ease: "power2.inOut" })
              .set(cue, { transformOrigin: "bottom center" })
              .to(cue, { scaleY: 0, duration: 0.9, ease: "power2.inOut" });
          }

          /* Index header */
          const idx = q("[data-index]")[0];
          if (idx) {
            gsap
              .timeline({
                defaults: { ease: "power3.out" },
                scrollTrigger: { trigger: idx, start: "top 85%", once: true },
              })
              .from(q("[data-i-rule]"), { scaleX: 0, transformOrigin: "left center", duration: 1.3, ease: "expo.inOut" })
              .from(q("[data-i-fade]"), { opacity: 0, y: 18, duration: 0.9, stagger: 0.1 }, 0.3);
          }

          /* Gallery items: image first, caption after; each with its own parallax */
          gsap.utils.toArray<HTMLElement>("[data-item]", el).forEach((item) => {
            const frame = item.querySelector<HTMLElement>("[data-frame]");
            const enter = item.querySelector<HTMLElement>("[data-enter]");
            const par = item.querySelector<HTMLElement>("[data-par]");
            const caps = item.querySelectorAll("[data-cap]");
            const dir = (item.dataset.dir || "l") as Item["dir"];
            const amp = Number(item.dataset.amp || 3);
            if (!frame || !enter) return;

            gsap
              .timeline({
                defaults: { ease: "power3.out" },
                scrollTrigger: { trigger: item, start: "top 84%", once: true },
              })
              .fromTo(
                frame,
                { clipPath: CLIP_FROM[dir] },
                { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.inOut" }
              )
              .from(enter, { scale: 1.16, duration: 1.8, ease: "power2.out" }, 0)
              .from(caps, { opacity: 0, y: 18, duration: 0.9, stagger: 0.09 }, 0.75);

            if (k > 0 && par) {
              gsap.fromTo(
                par,
                { yPercent: -amp * k },
                {
                  yPercent: amp * k,
                  ease: "none",
                  scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true },
                }
              );
            }
          });

          /* Closing */
          const end = q("[data-close]")[0];
          if (end) {
            gsap
              .timeline({
                defaults: { ease: "power3.out" },
                scrollTrigger: { trigger: end, start: "top 70%", once: true },
              })
              .from(q("[data-c-line]"), { yPercent: 110, duration: 1.2, stagger: 0.12 })
              .from(q("[data-c-rule]"), { scaleX: 0, transformOrigin: "left center", duration: 1.4, ease: "expo.inOut" }, 0.3)
              .from(q("[data-c-fade]"), { opacity: 0, y: 20, duration: 0.9, stagger: 0.1 }, 0.6);
            if (k > 0) {
              gsap.fromTo(
                q("[data-c-hair]"),
                { yPercent: -10 },
                { yPercent: 10, ease: "none", scrollTrigger: { trigger: end, start: "top bottom", end: "bottom top", scrub: true } }
              );
            }
          }
        }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  /* ---------- Viewer: scroll lock, focus, keyboard ---------- */
  useEffect(() => {
    if (!isOpen) return;
    const body = document.body;
    const prevOverflow = body.style.overflow;
    const prevPad = body.style.paddingRight;
    const sw = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (sw > 0) body.style.paddingRight = `${sw}px`;
    closeRef.current?.focus();
    const trigger = triggerRef.current;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "ArrowRight") {
        go(1);
      } else if (e.key === "ArrowLeft") {
        go(-1);
      } else if (e.key === "Tab") {
        const f = dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled])");
        if (!f || f.length === 0) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPad;
      trigger?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  /* ---------- Viewer: open transition ---------- */
  useEffect(() => {
    if (!isOpen || !overlayRef.current) return;
    shown.current = false;
    const ctx = gsap.context(() => {
      if (prefersReduced()) return;
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" });
      gsap.fromTo(
        stageRef.current,
        { clipPath: "inset(6% 6% 6% 6%)", scale: 1.03 },
        { clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: 0.8, ease: "expo.out" }
      );
      gsap.from("[data-vui]", { opacity: 0, y: 12, duration: 0.6, delay: 0.25, stagger: 0.06 });
    }, overlayRef);
    return () => ctx.revert();
  }, [isOpen]);

  /* ---------- Viewer: previous / next transition ---------- */
  useEffect(() => {
    if (open === null) {
      shown.current = false;
      return;
    }
    if (!shown.current) {
      shown.current = true;
      return;
    }
    if (prefersReduced() || !imgRef.current) return;
    const t = gsap.fromTo(
      imgRef.current,
      { opacity: 0, x: dirRef.current * 40 },
      { opacity: 1, x: 0, duration: 0.5, ease: "power3.out" }
    );
    return () => {
      t.kill();
    };
  }, [open]);

  const onTouchStart = (e: TouchEvent) => {
    swipeX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: TouchEvent) => {
    if (swipeX.current === null) return;
    const dx = e.changedTouches[0].clientX - swipeX.current;
    swipeX.current = null;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  };

  return (
    <main ref={root} className="relative min-h-screen overflow-x-clip bg-ivory text-ink">
      {SHOW_BAR && (
        <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between bg-gradient-to-b from-ivory/90 to-transparent px-6 py-5 md:px-12">
          <Link href="/" className="display text-xl tracking-[.08em] text-ink" aria-label="Clarivo home">
            {site.brand}
          </Link>
          <Link
            href="/#enquiry"
            className="rounded-full border border-eucalyptus/70 px-5 py-2 text-sm text-eucalyptus transition hover:bg-eucalyptus hover:text-warm"
          >
            Enquire
          </Link>
        </div>
      )}

      {/* ================= A. EDITORIAL HERO ================= */}
      <header data-hero className="relative overflow-hidden px-6 pb-14 pt-28 md:px-12 lg:min-h-[100svh] lg:pb-16">
        <div className="relative z-10 flex flex-col lg:min-h-[calc(100svh-11rem)] lg:justify-between">
          <div data-h-drift className="will-change-transform">
            <p data-h-eyebrow className="flex items-center gap-4 text-[11px] uppercase tracking-[.28em] text-eucalyptus">
              <span>The Clarivo Collection</span>
              <span aria-hidden className="h-px w-10 bg-eucalyptus/60" />
            </p>
            <h1 className="display mt-8 text-[clamp(3rem,9.2vw,9.5rem)] leading-[.96] tracking-[-0.02em] text-ink">
              <span className="block overflow-hidden pb-[.08em]">
                <span data-h-line className="block">Spaces,</span>
              </span>
              <span className="block overflow-hidden pb-[.08em]">
                <span data-h-line className="block">seen</span>
              </span>
              <span className="block overflow-hidden pb-[0.9em]">
                <span data-h-line className="block italic">differently.</span>
              </span>
            </h1>
          </div>

          <div className="mt-8 flex items-end justify-between gap-8 lg:mt-12">
            <p data-h-fade className="max-w-sm leading-relaxed text-ink/70">
              An exhibition of the residential and commercial environments where switchable smart film can be
              considered for suitable existing glass. Imagery is illustrative of these kinds of space.
            </p>
            <div data-h-cue data-h-fade className="hidden shrink-0 items-center gap-4 text-[11px] uppercase tracking-[.28em] text-ink/70 lg:flex">
              <span>Scroll</span>
              <span aria-hidden className="relative block h-12 w-px overflow-hidden bg-line">
                <span data-cue-line className="absolute inset-0 origin-top bg-eucalyptus" />
              </span>
            </div>
          </div>
        </div>

        {/* Hero photograph: bleeds off the right edge on desktop, stacks on mobile */}
        <div
          data-h-frame
          className="relative mt-10 aspect-[4/5] overflow-hidden md:aspect-[16/11] lg:absolute lg:inset-y-0 lg:right-0 lg:mt-0 lg:aspect-auto lg:w-[62%]"
        >
          <div data-h-par className="absolute inset-x-0 -inset-y-[8%] will-change-transform">
            <div data-h-scale className="h-full w-full will-change-transform">
              <Media src={imgs.hero ?? site.img.hero} alt="Luxury interior with floor-to-ceiling windows" eager className="h-full w-full" />
            </div>
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent lg:bg-gradient-to-r lg:from-ivory lg:via-ivory/45 lg:to-transparent"
          />
        </div>
      </header>

      {/* ================= B. CURATED GALLERY ================= */}
      <section aria-labelledby="gallery-title" className="px-6 pb-24 pt-16 md:px-12 md:pb-32 md:pt-24 lg:pb-40">
        <div className="mx-auto max-w-[1800px]">
          {/* Index + editorial filter */}
          <div data-index className="relative pt-7">
            <div data-i-rule aria-hidden className="absolute inset-x-0 top-0 h-px bg-line" />
            <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <div>
                <p data-i-fade className="text-[11px] uppercase tracking-[.28em] text-eucalyptus">Index of spaces</p>
                <h2 data-i-fade id="gallery-title" className="display mt-4 text-[clamp(2rem,4vw,3.5rem)] leading-tight text-ink">
                  Selected spaces
                </h2>
              </div>
              <div data-i-fade role="group" aria-label="Filter the collection by category" className="flex flex-wrap gap-x-7 gap-y-1">
                {CATS.map((cat) => {
                  const active = filter === cat;
                  const count = cat === "All" ? ITEMS.length : ITEMS.filter((i) => i.cat === cat).length;
                  return (
                    <button
                      key={cat}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setFilter(cat)}
                      className={`group/f relative flex min-h-11 items-center gap-2 text-[11px] uppercase tracking-[.24em] transition-colors duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-eucalyptus ${active ? "text-ink" : "text-ink/70 hover:text-ink"
                        }`}
                    >
                      {cat}
                      <sup className="text-[9px] tracking-normal text-eucalyptus">{pad(count)}</sup>
                      <span
                        aria-hidden
                        className={`absolute inset-x-0 bottom-1.5 h-px origin-left bg-eucalyptus transition-transform duration-500 ${active ? "scale-x-100" : "scale-x-0 group-hover/f:scale-x-50"
                          }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
            <p className="sr-only" aria-live="polite">
              Showing {visible.length} of {ITEMS.length} spaces
            </p>
          </div>

          {/* Composition */}
          <div className="mt-14 grid gap-y-16 md:mt-20 md:grid-cols-12 md:gap-x-6 lg:mt-28 lg:gap-x-8 lg:gap-y-28">
            {ITEMS.map((it, n) => {
              const dim = filter !== "All" && it.cat !== filter;
              return (
                <article
                  key={it.key}
                  data-item
                  data-dir={it.dir}
                  data-amp={it.amp}
                  className={`group relative transition-[opacity,filter] duration-700 ${it.wrap} ${dim ? "pointer-events-none opacity-[.14] grayscale" : ""
                    }`}
                >
                  <button
                    type="button"
                    tabIndex={dim ? -1 : 0}
                    onClick={(e) => openAt(it.key, e)}
                    aria-label={`View larger: ${it.title}, ${it.cat}`}
                    className="relative block w-full cursor-zoom-in text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-eucalyptus"
                  >
                    {/* frame (clip reveal) > par (parallax) > enter (scale) > hover (CSS) > Media */}
                    <div
                      data-frame
                      className={`relative w-full overflow-hidden border-line ${it.bleed ? "border-y" : "border"} ${it.aspect}`}
                    >
                      <div data-par className="absolute inset-x-0 -inset-y-[8%] will-change-transform">
                        <div data-enter className="h-full w-full will-change-transform">
                          <div className="h-full w-full saturate-[.94] transition-[transform,filter] duration-700 ease-out [@media(hover:hover)]:group-hover:scale-[1.04] [@media(hover:hover)]:group-hover:saturate-100 [@media(hover:hover)]:group-hover:brightness-[1.06]">
                            <Media src={it.src} alt={it.alt} className="h-full w-full" />
                          </div>
                        </div>
                      </div>
                      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent" />
                      <span
                        aria-hidden
                        className="pointer-events-none absolute left-4 top-4 text-[10px] uppercase tracking-[.3em] text-warm/90"
                      >
                        {pad(n + 1)}
                      </span>
                      <span
                        aria-hidden
                        className="pointer-events-none absolute bottom-4 right-4 hidden items-center gap-3 text-[10px] uppercase tracking-[.3em] text-warm opacity-0 transition-opacity duration-500 [@media(hover:hover)]:flex [@media(hover:hover)]:group-hover:opacity-100"
                      >
                        View
                        <span className="h-px w-8 bg-warm" />
                      </span>
                    </div>
                  </button>

                  {/* Caption: same structure for every image */}
                  <div className={`mt-5 border-t border-line pt-5 ${it.bleed ? "px-6 md:px-12" : ""}`}>
                    <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div data-cap className="flex items-center gap-4 text-[11px] uppercase tracking-[.28em] text-eucalyptus">
                          <span>{pad(n + 1)}</span>
                          <span
                            aria-hidden
                            className="h-px w-8 bg-eucalyptus/60 transition-[width] duration-500 ease-out [@media(hover:hover)]:group-hover:w-14"
                          />
                          <span className="text-ink/70">{it.cat}</span>
                        </div>
                        <h3 data-cap className="display mt-4 text-3xl leading-tight text-ink md:text-4xl">{it.title}</h3>
                      </div>
                      <p data-cap className="max-w-xs text-sm leading-relaxed text-ink/70 md:mt-9">{it.caption}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= D. CLOSING ================= */}
      <section data-close className="relative overflow-hidden bg-eucalyptus px-6 py-32 text-ivory md:px-12 md:py-48">
        <div
          data-c-hair
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-6 top-0 w-px bg-gradient-to-b from-transparent via-mist/40 to-transparent will-change-transform md:left-12"
        />
        <div className="relative mx-auto max-w-[1800px]">
          <p data-c-fade className="text-[11px] uppercase tracking-[.28em] text-mist">Start a project</p>
          <h2 className="display mt-8 text-[clamp(3rem,10vw,9.5rem)] leading-[.98] tracking-[-0.02em] text-ivory">
            <span className="block overflow-hidden pb-[.08em]">
              <span data-c-line className="block">Your space</span>
            </span>
            <span className="block overflow-hidden pb-[.08em]">
              <span data-c-line className="block italic text-ivory/85">could be next.</span>
            </span>
          </h2>
          <div data-c-rule aria-hidden className="mt-14 h-px w-full bg-ivory/20 md:mt-20" />
          <div className="mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <p data-c-fade className="max-w-md leading-relaxed text-warm/70">
              Tell us about the glass you already have. We will assess its suitability and talk through the next steps
              for your project.
            </p>
            <Link
              data-c-fade
              href="/#enquiry"
              className="group/cta inline-flex items-center gap-4 self-start border-b border-mist/40 pb-2 text-sm uppercase tracking-[.2em] text-ivory transition-colors duration-500 hover:border-mist md:self-auto"
            >
              Discuss your project
              <ArrowUpRight className="h-4 w-4 text-mist transition-transform duration-500 group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= C. VIEWER ================= */}
      {isOpen && current && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[100] bg-ink/95 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={`${current.title}, ${current.cat}`}
            className="flex h-full flex-col px-5 py-5 md:px-10 md:py-8"
            onClick={(e) => {
              if (e.target === e.currentTarget) close();
            }}
          >
            <div data-vui className="flex items-center justify-between text-[11px] uppercase tracking-[.28em] text-warm/60">
              <span>
                <span className="text-mist">{pad((open ?? 0) + 1)}</span> / {pad(visible.length)}
              </span>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                className="flex min-h-11 items-center gap-3 px-1 text-ivory transition-colors hover:text-mist focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mist"
              >
                Close
                <svg aria-hidden width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1l12 12M13 1 1 13" stroke="currentColor" strokeWidth="1" />
                </svg>
              </button>
            </div>

            <div
              className="flex min-h-0 flex-1 items-center justify-center py-4"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
              onClick={(e) => {
                if (e.target === e.currentTarget) close();
              }}
            >
              <div ref={stageRef} className="overflow-hidden border border-warm/15">
                <div
                  ref={imgRef}
                  className="relative"
                  style={{
                    aspectRatio: current.orient === "p" ? "4 / 5" : "3 / 2",
                    width:
                      current.orient === "p"
                        ? "min(82vw, calc((100svh - 16rem) * 0.8))"
                        : "min(92vw, calc((100svh - 16rem) * 1.5))",
                  }}
                >
                  <Media key={current.key} src={current.src} alt={current.alt} eager className="h-full w-full" />
                </div>
              </div>
            </div>

            <div data-vui className="flex items-end justify-between gap-6">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[.28em] text-mist">{current.cat}</p>
                <p className="display mt-2 text-2xl text-ivory md:text-3xl">{current.title}</p>
                <p className="mt-2 hidden max-w-md text-sm text-warm/65 md:block">{current.caption}</p>
              </div>
              {visible.length > 1 && (
                <div className="flex shrink-0 items-center gap-3">
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    aria-label="Previous image"
                    className="grid h-12 w-12 place-items-center border border-warm/30 text-ivory transition-colors hover:border-mist hover:text-mist focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mist"
                  >
                    <svg aria-hidden width="20" height="10" viewBox="0 0 20 10" fill="none">
                      <path d="M20 5H1M5 1 1 5l4 4" stroke="currentColor" strokeWidth="1" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    aria-label="Next image"
                    className="grid h-12 w-12 place-items-center border border-warm/30 text-ivory transition-colors hover:border-mist hover:text-mist focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mist"
                  >
                    <svg aria-hidden width="20" height="10" viewBox="0 0 20 10" fill="none">
                      <path d="M0 5h19M15 1l4 4-4 4" stroke="currentColor" strokeWidth="1" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}