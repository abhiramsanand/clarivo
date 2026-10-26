"use client";

/**
 * CLARIVO — #how section
 * Drop-in replacement for the existing <section id="how">.
 *
 * - Desktop (≥1024px, ≥640px tall, motion allowed): ONE pinned, scrubbed GSAP timeline drives
 *   the three steps (assess → apply → switch), progress line, image zoom, film wipe and the
 *   clear→private demonstration.
 * - Tablet / mobile / short viewports: no pin; natural vertical sequence with light reveals.
 * - Reduced motion / no JS: complete static layout, glass comparison still works via the slider.
 *
 * This section deliberately does NOT use data-how / data-how-bar / data-step / data-film /
 * data-how-frost / data-split, so the global <Motion> utility cannot double-animate or double-pin it.
 */

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import type { CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScanLine, Layers, Sparkles } from "lucide-react";
import Media from "@/components/Media";
import { site } from "@/lib/site";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const STEPS = [
    {
        Icon: ScanLine,
        title: "Assess your existing glass",
        body: "We check the type, condition and size of your glazing to confirm whether film suits it.",
    },
    {
        Icon: Layers,
        title: "Apply the film",
        body: "Where the glass is suitable, the film is fitted directly to your existing window or door.",
    },
    {
        Icon: Sparkles,
        title: "Switch between states",
        body: "Keep the view clear, or move to a private state when you want it.",
    },
];

/** The glazing area inside the photo. Tune these four values to sit on the glass in your image. */
const PANE: CSSProperties = { top: "9%", right: "8%", bottom: "9%", left: "8%" };

const NOISE =
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

export default function HowSection() {
    const root = useRef<HTMLElement>(null);
    const frameRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const chipRef = useRef<HTMLSpanElement>(null);
    const lastLabel = useRef("Comparing");

    /** Single source of truth for the demo: v = % of the pane that is private (from the left). */
    const apply = useCallback((v: number) => {
        const f = frameRef.current;
        if (!f) return;
        f.style.setProperty("--p", String(v));
        const i = inputRef.current;
        const rounded = Math.round(v);
        if (i) i.value = String(rounded);
        const label = v <= 3 ? "Clear" : v >= 97 ? "Private" : "Comparing";
        if (label !== lastLabel.current) {
            lastLabel.current = label;
            if (chipRef.current) chipRef.current.textContent = label;
        }
        i?.setAttribute("aria-valuetext", label === "Comparing" ? `Comparing, ${rounded}% private` : label);
    }, []);

    useIsoLayoutEffect(() => {
        gsap.registerPlugin(ScrollTrigger);
        const el = root.current;
        if (!el) return;

        const ctx = gsap.context(() => {
            const q = gsap.utils.selector(el);
            const mm = gsap.matchMedia();

            mm.add(
                {
                    motion: "(prefers-reduced-motion: no-preference)",
                    pin: "(min-width: 1024px) and (min-height: 720px)",
                    tablet: "(min-width: 768px)",
                },
                (c) => {
                    const { motion, pin, tablet } = c.conditions as Record<string, boolean>;
                    if (!motion) return; // static, fully visible layout

                    /* ---------- Entrance (shared, plays once) ---------- */
                    gsap
                        .timeline({
                            defaults: { ease: "power3.out" },
                            scrollTrigger: { trigger: el, start: "top 75%", once: true },
                        })
                        .from(q("[data-eyebrow]"), { opacity: 0, y: 12, duration: 0.8 })
                        .from(q("[data-line]"), { yPercent: 110, duration: 1.1, stagger: 0.11 }, 0.1)
                        .fromTo(
                            q("[data-frame]"),
                            { clipPath: "inset(12% 8% 12% 8%)" },
                            { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "expo.inOut" },
                            0.2
                        )
                        .from(q("[data-enter]"), { scale: 1.12, duration: 1.8, ease: "power2.out" }, 0.2);

                    /* ---------- Non-pinned: natural vertical sequence ---------- */
                    if (!pin) {
                        gsap.utils.toArray<HTMLElement>("[data-step]", el).forEach((s) =>
                            gsap.from(s, {
                                opacity: 0,
                                y: 24,
                                duration: 0.9,
                                ease: "power3.out",
                                scrollTrigger: { trigger: s, start: "top 88%", once: true },
                            })
                        );
                        const list = el.querySelector("[data-steps]");
                        if (list) {
                            gsap.fromTo(
                                q("[data-bar]"),
                                { scaleY: 0 },
                                {
                                    scaleY: 1,
                                    ease: "none",
                                    scrollTrigger: { trigger: list, start: "top 75%", end: "bottom 60%", scrub: true },
                                }
                            );
                        }
                        if (tablet) {
                            gsap.fromTo(
                                q("[data-par]"),
                                { yPercent: -2 },
                                {
                                    yPercent: 2,
                                    ease: "none",
                                    scrollTrigger: { trigger: q("[data-frame]")[0], start: "top bottom", end: "bottom top", scrub: true },
                                }
                            );
                        }
                        return;
                    }

                    /* ---------- Desktop: one pinned, scrubbed storytelling timeline ---------- */
                    const stepEls = gsap.utils.toArray<HTMLElement>("[data-step]", el);
                    const list = el.querySelector<HTMLElement>("[data-steps]");
                    const countEl = el.querySelector<HTMLElement>("[data-count]");
                    const countWrap = q("[data-count-wrap]");
                    const pane = q("[data-pane]")[0];
                    const st = { p: 0 };

                    list?.setAttribute("data-dim", "true");
                    gsap.set(countWrap, { autoAlpha: 1 });
                    gsap.set(q("[data-scan]"), { yPercent: 0 });
                    apply(0);

                    let cur = -1;
                    const setActive = (prog: number) => {
                        const i = prog < 0.31 ? 0 : prog < 0.64 ? 1 : 2;
                        if (i === cur) return;
                        cur = i;
                        stepEls.forEach((s, n) => {
                            if (n === i) {
                                s.setAttribute("data-active", "true");
                                s.setAttribute("aria-current", "step");
                            } else {
                                s.removeAttribute("data-active");
                                s.removeAttribute("aria-current");
                            }
                        });
                        if (countEl) countEl.textContent = "0" + (i + 1);
                    };
                    setActive(0);

                    const tl = gsap.timeline({
                        defaults: { ease: "none" },
                        scrollTrigger: {
                            trigger: el,
                            start: "top top",
                            end: () => `+=${Math.round(window.innerHeight * 3.6)}`,
                            pin: true,
                            scrub: 1.1,
                            snap: {
                                snapTo: [0, 1 / 3, 2 / 3, 1],
                                delay: 0.12,
                                duration: { min: 0.25, max: 0.7 },
                                ease: "power1.inOut",
                            },
                            anticipatePin: 2,
                            invalidateOnRefresh: true,
                            onUpdate: (self) => setActive(self.progress),
                            onRefresh: (self) => setActive(self.progress),
                        },
                    });

                    // Whole-sequence layers (progress, depth)
                    tl.fromTo(q("[data-bar]"), { scaleY: 0 }, { scaleY: 1, duration: 3 }, 0)
                        .fromTo(q("[data-par]"), { yPercent: -3 }, { yPercent: 3, duration: 3 }, 0)
                        .fromTo(q("[data-glint]"), { xPercent: -90 }, { xPercent: 260, duration: 3 }, 0)
                        .fromTo(q("[data-bgtype]"), { xPercent: 2 }, { xPercent: -12, duration: 3 }, 0);

                    // Step 1 — Assess: existing glass is outlined and scanned (image stays clear)
                    tl.fromTo(q("[data-pane-border]"), { opacity: 0.3 }, { opacity: 1, duration: 0.6, ease: "power2.out" }, 0)
                        .fromTo(q("[data-scan]"), { opacity: 0 }, { opacity: 1, duration: 0.1 }, 0.02)
                        .to(q("[data-scan]"), { yPercent: 100, duration: 0.8, ease: "power1.inOut" }, 0.05)
                        .to(q("[data-scan]"), { opacity: 0, duration: 0.1 }, 0.85);

                    // Step 2 — Apply: closer view, film sheet wipes across the pane, then settles
                    tl.to(q("[data-zoom]"), { scale: 1.12, duration: 0.4, ease: "power2.inOut" }, 0.95)
                        .fromTo(pane, { "--film": 0 }, { "--film": 100, duration: 0.6, ease: "power1.inOut" }, 1.25)
                        .to(q("[data-film]"), { opacity: 0, duration: 0.25 }, 2.0)
                        .to(q("[data-zoom]"), { scale: 1, duration: 0.5, ease: "power2.inOut" }, 2.0);

                    // Step 3 — Switch: demonstration moves from clear to private, then holds
                    tl.to(
                        st,
                        {
                            p: 100,
                            duration: 0.6,
                            ease: "power1.inOut",
                            onUpdate: () => apply(st.p),
                            onReverseComplete: () => apply(0),
                        },
                        2.25
                    );

                    return () => {
                        list?.removeAttribute("data-dim");
                        stepEls.forEach((s) => {
                            s.removeAttribute("data-active");
                            s.removeAttribute("aria-current");
                        });
                        apply(50);
                    };
                }
            );
        }, el);

        return () => ctx.revert();
    }, [apply]);

    return (
        <section
            id="how"
            ref={root}
            className="relative overflow-hidden bg-charcoal px-6 py-24 md:px-12 md:py-32 lg:flex lg:min-h-[100svh] lg:items-center lg:pb-8 lg:pt-24 [@media(min-width:1024px)_and_(min-height:720px)]:h-[100svh]"
        >
            {/* Background typography — slow drift */}
            <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-2 select-none">
                <div data-bgtype className="will-change-transform">
                    <p className="display whitespace-nowrap text-[18vw] leading-none text-silver/[.03]">Assess · Apply · Switch</p>
                </div>
            </div>

            <div className="relative mx-auto grid w-full max-w-[1500px] gap-12 lg:h-full lg:grid-cols-12 lg:grid-rows-[auto_minmax(0,1fr)] lg:gap-x-14 lg:gap-y-6">
                {/* ---------- Headline ---------- */}
                <div className="lg:col-span-5 lg:row-start-1">
                    <p data-eyebrow className="flex items-center gap-4 text-[11px] uppercase tracking-[.28em] text-champagne">
                        <span>How it works</span>
                        <span aria-hidden className="text-silver/40">/</span>
                        <span>01—03</span>
                    </p>
                    <h2 className="display mt-5 text-[clamp(2rem,8vw,3rem)] leading-[1.04] tracking-[-0.01em] text-[#f4efe6] lg:text-[clamp(1.8rem,min(3vw,5.4vh),3rem)]">
                        <span className="block overflow-hidden pb-[.1em]">
                            <span data-line className="block">From clear glass</span>
                        </span>
                        <span className="block overflow-hidden pb-[.1em]">
                            <span data-line className="block">to private space.</span>
                        </span>
                        <span className="block overflow-hidden pb-[.1em]">
                            <span data-line className="block italic text-[#f4efe6]/85">Three simple steps.</span>
                        </span>
                    </h2>
                </div>

                {/* ---------- Image + glass demonstration ---------- */}
                <div className="lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1 lg:flex lg:min-h-0 lg:flex-col">
                    <div
                        ref={frameRef}
                        data-frame
                        style={{ "--p": 50, "--film": 0 } as CSSProperties}
                        className="relative aspect-[4/3] w-full overflow-hidden border border-silver/20 lg:aspect-auto lg:min-h-[26rem] lg:flex-1"
                    >
                        {/* parallax layer (oversized so it never exposes edges) */}
                        <div data-par className="absolute inset-x-0 -inset-y-[4%] will-change-transform">
                            <div data-zoom className="relative h-full w-full will-change-transform">
                                <div data-enter className="relative h-full w-full">
                                    <Media
                                        src={site.img.residential}
                                        alt="Interior seen through large glazing, shown in its clear and private states"
                                        className="h-full w-full"
                                    />

                                    {/* The glazing pane: everything product-related lives inside it, aligned to the photo */}
                                    <div data-pane className="absolute" style={PANE}>
                                        <div data-pane-border aria-hidden className="absolute inset-0 border border-silver/55" />

                                        {/* Step 1: scan line */}
                                        <div data-scan aria-hidden className="pointer-events-none absolute inset-0 opacity-0">
                                            <div className="h-px w-full bg-glacier shadow-[0_0_12px_rgba(150,200,230,.8)]" />
                                        </div>

                                        {/* Step 2: film sheet wiping across the glass */}
                                        <div data-film aria-hidden className="pointer-events-none absolute inset-0">
                                            <div
                                                className="absolute inset-0"
                                                style={{
                                                    clipPath: "inset(0 calc(100% - var(--film) * 1%) 0 0)",
                                                    background:
                                                        "linear-gradient(120deg, rgba(190,220,238,.16), rgba(120,170,200,.08) 55%, rgba(220,238,248,.14))",
                                                }}
                                            />
                                            <div
                                                className="absolute inset-y-0 w-px bg-white/70 shadow-[0_0_10px_rgba(255,255,255,.55)]"
                                                style={{ left: "calc(var(--film) * 1%)", opacity: "var(--film)" }}
                                            />
                                        </div>

                                        {/* Step 3: frosted (private) state, revealed from the left up to the divider */}
                                        <div
                                            data-frost
                                            aria-hidden
                                            className="pointer-events-none absolute inset-0"
                                            style={{
                                                clipPath: "inset(0 calc(100% - var(--p) * 1%) 0 0)",
                                                backdropFilter: "blur(18px) saturate(.8) brightness(1.08)",
                                                WebkitBackdropFilter: "blur(18px) saturate(.8) brightness(1.08)",
                                                background:
                                                    "linear-gradient(135deg, rgba(238,246,250,.26) 0%, rgba(196,218,232,.14) 55%, rgba(238,246,250,.22) 100%)",
                                            }}
                                        >
                                            <div
                                                className="absolute inset-0 opacity-[.28] mix-blend-soft-light"
                                                style={{ backgroundImage: NOISE }}
                                            />
                                            <div
                                                className="absolute inset-0"
                                                style={{
                                                    background:
                                                        "linear-gradient(110deg, transparent 25%, rgba(255,255,255,.14) 40%, transparent 55%)",
                                                }}
                                            />
                                        </div>

                                        {/* Interactive comparison: native range input = mouse, touch and keyboard for free */}
                                        <input
                                            ref={inputRef}
                                            type="range"
                                            min={0}
                                            max={100}
                                            step={1}
                                            defaultValue={50}
                                            aria-label="Compare the private and clear glass states"
                                            aria-valuetext="Comparing, 50% private"
                                            onInput={(e) => apply(Number(e.currentTarget.value))}
                                            className="peer absolute inset-0 z-10 m-0 h-full w-full cursor-ew-resize touch-pan-y opacity-0"
                                        />
                                        <div
                                            aria-hidden
                                            className="pointer-events-none absolute inset-y-0 w-px bg-[#f4efe6]/80 peer-focus-visible:[&>span]:ring-2 peer-focus-visible:[&>span]:ring-champagne"
                                            style={{ left: "calc(var(--p) * 1%)" }}
                                        >
                                            <span className="absolute left-1/2 top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-[#f4efe6]/70 bg-obsidian/50 backdrop-blur-sm">
                                                <svg width="20" height="10" viewBox="0 0 20 10" fill="none" className="text-[#f4efe6]">
                                                    <path d="M6 1 1 5l5 4M14 1l5 4-5 4" stroke="currentColor" strokeWidth="1" />
                                                </svg>
                                            </span>
                                        </div>

                                        {/* Side tags */}
                                        <span className="pointer-events-none absolute left-3 top-3 text-[10px] uppercase tracking-[.3em] text-[#f4efe6]/80">
                                            Private
                                        </span>
                                        <span className="pointer-events-none absolute right-3 top-3 text-[10px] uppercase tracking-[.3em] text-[#f4efe6]/80">
                                            Clear
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Foreground glass reflection (independent, subtle) + tonal grade */}
                        <div
                            data-glint
                            aria-hidden
                            className="pointer-events-none absolute inset-y-0 left-0 w-1/3 opacity-40 mix-blend-screen"
                            style={{
                                background: "linear-gradient(105deg, transparent 0%, rgba(255,255,255,.16) 50%, transparent 100%)",
                            }}
                        />
                        <div
                            aria-hidden
                            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-obsidian/45 via-transparent to-transparent"
                        />

                        {/* State label */}
                        <div className="pointer-events-none absolute bottom-4 left-4 flex items-center gap-3 border border-silver/25 bg-obsidian/60 px-3 py-2 text-[10px] uppercase tracking-[.3em] text-[#f4efe6] backdrop-blur-sm">
                            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-champagne" />
                            <span ref={chipRef}>Comparing</span>
                        </div>
                    </div>

                    <p className="mt-3 shrink-0 text-[11px] uppercase tracking-[.22em] text-silver/50">
                        Illustrative demonstration · drag or use arrow keys to compare
                    </p>
                </div>

                {/* ---------- Steps ---------- */}
                <div className="lg:col-span-5 lg:row-start-2 lg:self-start">
                    <p
                        data-count-wrap
                        className="invisible mb-4 hidden text-[11px] uppercase tracking-[.28em] text-silver/50 lg:block"
                    >
                        Step <span data-count className="text-champagne">01</span> / 03
                    </p>
                    <div className="relative pl-8 md:pl-10">
                        <div aria-hidden className="absolute bottom-1 left-0 top-1 w-px bg-silver/15" />
                        <div data-bar aria-hidden className="absolute bottom-1 left-0 top-1 w-px origin-top bg-champagne" />
                        <ol data-steps className="group space-y-8 lg:space-y-5">
                            {STEPS.map(({ Icon, title, body }, i) => (
                                <li
                                    key={title}
                                    data-step
                                    className="transition-opacity duration-500 group-data-[dim=true]:opacity-30 group-data-[dim=true]:data-[active=true]:opacity-100"
                                >
                                    <div className="flex gap-4">
                                        <Icon className="mt-1 h-5 w-5 shrink-0 text-champagne" strokeWidth={1.25} />
                                        <div>
                                            <span className="text-[11px] uppercase tracking-[.28em] text-champagne/80">Step 0{i + 1}</span>
                                            <h3 className="display mt-1 text-xl leading-tight text-[#f4efe6] md:text-2xl lg:text-[1.35rem]">{title}</h3>
                                            <p className="mt-2 max-w-sm text-sm leading-relaxed text-silver/70 md:text-base lg:text-[.9rem] lg:leading-snug">{body}</p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </div>
        </section>
    );
}