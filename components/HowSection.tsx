"use client";

/**
 * CLARIVO — #how section
 * Drop-in replacement for the existing <section id="how">.
 *
 * - Desktop (≥1024px, ≥640px tall, motion allowed): ONE pinned, scrubbed GSAP timeline drives
 *   the three steps (assess → apply → switch), progress line, a subtle image zoom, the film sweep
 *   and the clear→private demonstration.
 * - Only the glass changes: pane geometry lives in lib/glazing.ts and the glass-only mask / frost
 *   plate are built by scripts/build-glass-assets.py from the same polygons. The stage keeps the
 *   photo's aspect ratio, so every overlay is positioned in % of the photo and cannot drift.
 * - Interaction policy: scroll drives the demo; a manual slider input takes over until the visitor
 *   scrolls again, at which point control eases back to scroll. The slider always mirrors what is drawn.
 * - Tablet / mobile / short viewports: no pin; natural vertical sequence with light reveals.
 * - Reduced motion / no JS: complete static layout, glass comparison still works via the slider.
 *
 * This section deliberately does NOT use data-how / data-how-bar / data-step / data-film /
 * data-how-frost / data-split, so the global <Motion> utility cannot double-animate or double-pin it.
 */

import { useCallback, useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScanLine, Layers, Sparkles } from "lucide-react";
import Media from "@/components/Media";
import { site } from "@/lib/site";
import { GLAZING_BOX, PANES, polygon, svgPoints } from "@/lib/glazing";

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

const MASK_URL = `url(${site.img.howGlassMask})`;
/** Visible glass only: inner glazing minus the plant, ottoman and sofa that sit in front of it. */
const GLASS_MASK: CSSProperties = {
    WebkitMaskImage: MASK_URL,
    maskImage: MASK_URL,
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
};
/** x position (in % of the stage) of a 0–100 value mapped across the glazing span. */
const AT = (v: string) => `calc((var(--gl) + var(${v}) * var(--gw) / 100) * 1%)`;
const REVEAL = (v: string) => `inset(0 calc(100% - (var(--gl) + var(${v}) * var(--gw) / 100) * 1%) 0 0)`;

const NOISE =
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

export default function HowSection() {
    const root = useRef<HTMLElement>(null);
    const frameRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const chipRef = useRef<HTMLSpanElement>(null);
    const lastLabel = useRef("Comparing");
    /** Manual-input override: `on` while the visitor owns the state; `k` eases control back to scroll. */
    const manual = useRef({ on: false, v: 50, at: 0, k: 1 });

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
        i?.setAttribute(
            "aria-valuetext",
            label === "Comparing" ? `Comparing, ${rounded}% private` : label,
        );
    }, []);

    const onManualInput = useCallback(
        (v: number) => {
            const m = manual.current;
            gsap.killTweensOf(m);
            m.on = true;
            m.k = 1;
            m.v = v;
            m.at = window.scrollY;
            apply(v);
        },
        [apply],
    );

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);
        const el = root.current;
        if (!el) return;

        let ctx: gsap.Context | undefined;
        let pinTrigger: ScrollTrigger | null = null;
        let cancelled = false;
        let raf = 0;
        let watchdog: ReturnType<typeof setTimeout> | undefined;
        let retried = false;

        const build = () => {
            if (cancelled) return;
            ctx = gsap.context(() => {
                const q = gsap.utils.selector(el);
                const mm = gsap.matchMedia();

                mm.add(
                    {
                        motion: "(prefers-reduced-motion: no-preference)",
                        pin: "(min-width: 1024px) and (min-height: 640px)",
                    },
                    (c) => {
                        const { motion, pin } = c.conditions as Record<string, boolean>;
                        if (!motion) return; // static, fully visible layout

                        /* ---------- Entrance (shared, plays once) ---------- */
                        gsap
                            .timeline({
                                defaults: { ease: "power3.out" },
                                scrollTrigger: { trigger: el, start: "top 75%", once: true },
                            })
                            .from(q("[data-eyebrow]"), { opacity: 0, y: 12, duration: 0.8 })
                            .from(
                                q("[data-line]"),
                                { yPercent: 110, duration: 1.1, stagger: 0.11 },
                                0.1,
                            )
                            .fromTo(
                                q("[data-frame]"),
                                { clipPath: "inset(12% 8% 12% 8%)" },
                                {
                                    clipPath: "inset(0% 0% 0% 0%)",
                                    duration: 1.5,
                                    ease: "expo.inOut",
                                },
                                0.2,
                            )
                            .from(
                                q("[data-enter]"),
                                { scale: 1.06, duration: 1.8, ease: "power2.out" },
                                0.2,
                            );

                        /* ---------- Non-pinned: natural vertical sequence ---------- */
                        if (!pin) {
                            gsap.utils.toArray<HTMLElement>("[data-step]", el).forEach((s) =>
                                gsap.from(s, {
                                    opacity: 0,
                                    y: 24,
                                    duration: 0.9,
                                    ease: "power3.out",
                                    scrollTrigger: { trigger: s, start: "top 88%", once: true },
                                }),
                            );
                            const list = el.querySelector("[data-steps]");
                            if (list) {
                                gsap.fromTo(
                                    q("[data-bar]"),
                                    { scaleY: 0 },
                                    {
                                        scaleY: 1,
                                        ease: "none",
                                        scrollTrigger: {
                                            trigger: list,
                                            start: "top 75%",
                                            end: "bottom 60%",
                                            scrub: true,
                                        },
                                    },
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
                        const m = manual.current;
                        m.on = false;
                        m.k = 1;
                        const D = 3.3; // timeline length: switch ends at 2.85, then the private state holds

                        /** What is drawn: scroll value, unless the visitor has taken over (or control is easing back). */
                        const show = () => {
                            const v = m.on ? m.v : m.k < 1 ? m.v + (st.p - m.v) * m.k : st.p;
                            apply(v);
                        };

                        list?.setAttribute("data-dim", "true");
                        gsap.set(countWrap, { autoAlpha: 1 });
                        gsap.set(q("[data-scan]"), { yPercent: 0 });
                        apply(0);

                        let cur = -1;
                        const setActive = (prog: number) => {
                            const i = prog < 0.3 ? 0 : prog < 0.62 ? 1 : 2;
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
                                end: () => `+=${Math.round(window.innerHeight * 2.8)}`,
                                pin: true,
                                scrub: 0.6,
                                anticipatePin: 1,
                                invalidateOnRefresh: true,
                                onUpdate: (self) => {
                                    setActive(self.progress);
                                    // Scrolling hands control back from the slider to the scroll sequence.
                                    if (m.on && Math.abs(self.scroll() - m.at) > 6) {
                                        m.on = false;
                                        m.k = 0;
                                        gsap.to(m, {
                                            k: 1,
                                            duration: 0.35,
                                            ease: "power2.out",
                                            overwrite: true,
                                            onUpdate: show,
                                        });
                                    }
                                },
                                onRefresh: (self) => setActive(self.progress),
                            },
                        });

                        // Whole-sequence layers (progress, restrained glass reflection, type drift)
                        tl.fromTo(q("[data-bar]"), { scaleY: 0 }, { scaleY: 1, duration: D }, 0)
                            .fromTo(
                                q("[data-glint]"),
                                { xPercent: -90 },
                                { xPercent: 260, duration: D },
                                0,
                            )
                            .fromTo(
                                q("[data-bgtype]"),
                                { xPercent: 2 },
                                { xPercent: -12, duration: D },
                                0,
                            );

                        // Step 1 — Assess: the glazing is outlined and scanned (photo stays clear)
                        tl.fromTo(
                            q("[data-pane-border]"),
                            { opacity: 0.3 },
                            { opacity: 1, duration: 0.6, ease: "power2.out" },
                            0,
                        )
                            .fromTo(
                                q("[data-scan]"),
                                { opacity: 0 },
                                { opacity: 1, duration: 0.1 },
                                0.02,
                            )
                            .to(
                                q("[data-scan]"),
                                { yPercent: 100, duration: 0.8, ease: "power1.inOut" },
                                0.05,
                            )
                            .to(q("[data-scan]"), { opacity: 0, duration: 0.1 }, 0.85);

                        // Step 2 — Apply: a gentle push-in, film sweeps across every pane, then settles
                        tl.to(
                            q("[data-zoom]"),
                            { scale: 1.035, duration: 0.5, ease: "power2.inOut" },
                            0.95,
                        )
                            .fromTo(
                                pane,
                                { "--film": 0 },
                                { "--film": 100, duration: 0.8, ease: "power1.inOut" },
                                1.15,
                            )
                            .to(q("[data-film]"), { opacity: 0, duration: 0.25 }, 1.95)
                            .to(
                                q("[data-zoom]"),
                                { scale: 1, duration: 0.5, ease: "power2.inOut" },
                                2.0,
                            );

                        // Step 3 — Switch: all panes move clear → private together, then hold
                        tl.to(
                            st,
                            {
                                p: 100,
                                duration: 0.7,
                                ease: "power1.inOut",
                                onUpdate: show,
                                onReverseComplete: show,
                            },
                            2.15,
                        );

                        pinTrigger = tl.scrollTrigger ?? null;

                        return () => {
                            pinTrigger = null;
                            gsap.killTweensOf(m);
                            m.on = false;
                            m.k = 1;
                            list?.removeAttribute("data-dim");
                            stepEls.forEach((s) => {
                                s.removeAttribute("data-active");
                                s.removeAttribute("aria-current");
                            });
                            apply(50);
                        };
                    },
                );
            }, el);

            // Layout may have settled after fonts/images: re-measure once everything exists.
            ScrollTrigger.refresh();

            // Safety net: if another script killed our pin trigger, rebuild once.
            watchdog = setTimeout(() => {
                if (cancelled || retried) return;
                const expected =
                    window.matchMedia("(min-width: 1024px) and (min-height: 640px)")
                        .matches &&
                    window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
                if (
                    expected &&
                    (!pinTrigger || !ScrollTrigger.getAll().includes(pinTrigger))
                ) {
                    retried = true;
                    ctx?.revert();
                    build();
                }
            }, 1500);
        };

        // Defer creation until after the page (and any global animation setup) has finished initialising.
        // In production, child effects run before the parent <Motion> effects, so building immediately
        // can be undone by a parent that resets ScrollTrigger on mount.
        const start = () => {
            raf = requestAnimationFrame(() => {
                raf = requestAnimationFrame(build);
            });
        };
        if (typeof document !== "undefined" && document.fonts?.ready) {
            document.fonts.ready.then(start);
        } else {
            start();
        }

        return () => {
            cancelled = true;
            cancelAnimationFrame(raf);
            if (watchdog) clearTimeout(watchdog);
            ctx?.revert();
        };
    }, [apply]);

    return (
        <section
            id="how"
            ref={root}
            className="relative overflow-hidden bg-limestone px-6 py-24 md:px-12 md:py-32 lg:flex lg:min-h-[100svh] lg:items-center lg:pb-8 lg:pt-24 [@media(min-width:1024px)_and_(min-height:640px)]:h-[100svh]"
        >
            {/* Background typography — slow drift */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-2 select-none"
            >
                <div data-bgtype className="will-change-transform">
                    <p className="display whitespace-nowrap text-[18vw] leading-none text-ink/[.03]">
                        Assess · Apply · Switch
                    </p>
                </div>
            </div>

            <div className="relative mx-auto grid w-full max-w-[1500px] gap-12 lg:h-full lg:grid-cols-12 lg:grid-rows-[auto_minmax(0,1fr)] lg:gap-x-14 lg:gap-y-6">
                {/* ---------- Headline ---------- */}
                <div className="lg:col-span-5 lg:row-start-1">
                    <p
                        data-eyebrow
                        className="flex items-center gap-4 text-[11px] uppercase tracking-[.28em] text-eucalyptus"
                    >
                        <span>How it works</span>
                        <span aria-hidden className="text-ink/70">
                            /
                        </span>
                        <span>01—03</span>
                    </p>
                    <h2 className="display mt-5 text-[clamp(2rem,8vw,3rem)] leading-[1.04] tracking-[-0.01em] text-ink lg:text-[clamp(1.8rem,min(3vw,5.4vh),3rem)]">
                        <span className="block overflow-hidden pb-[.1em]">
                            <span data-line className="block">
                                From clear glass
                            </span>
                        </span>
                        <span className="block overflow-hidden pb-[.1em]">
                            <span data-line className="block">
                                to private space.
                            </span>
                        </span>
                        <span className="block overflow-hidden pb-[.1em]">
                            <span data-line className="block italic text-ink/85">
                                Three simple steps.
                            </span>
                        </span>
                    </h2>
                </div>

                {/* ---------- Image + glass demonstration ---------- */}
                <div className="lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1 lg:flex lg:min-h-0 lg:flex-col">
                    <div className="how-slot">
                        <div
                            ref={frameRef}
                            data-frame
                            style={
                                {
                                    "--p": 50,
                                    "--film": 0,
                                    "--gl": GLAZING_BOX.left,
                                    "--gw": GLAZING_BOX.width,
                                } as CSSProperties
                            }
                            className="how-stage"
                        >
                            <div data-enter className="absolute inset-0">
                                <div data-zoom className="absolute inset-0 will-change-transform">
                                    <Media
                                        src={site.img.howRoom}
                                        alt="Modern living room with floor-to-ceiling sliding windows, shown with the glass clear and private"
                                        className="absolute inset-0 h-full w-full"
                                    />

                                    {/* Glazing overlay: masked to the visible glass only (frames, plant, ottoman and sofa stay untouched) */}
                                    <div
                                        data-pane
                                        aria-hidden
                                        className="pointer-events-none absolute inset-0"
                                        style={GLASS_MASK}
                                    >
                                        {/* Step 3: private state, revealed from the left across every pane */}
                                        <div
                                            data-frost
                                            className="absolute inset-0"
                                            style={{
                                                clipPath: REVEAL("--p"),
                                                backgroundImage: `url(${site.img.howGlassFrost})`,
                                                backgroundSize: "100% 100%",
                                            }}
                                        >
                                            <div
                                                className="absolute inset-0 opacity-[.22] mix-blend-soft-light"
                                                style={{ backgroundImage: NOISE }}
                                            />
                                            <div
                                                className="absolute inset-0"
                                                style={{
                                                    background:
                                                        "linear-gradient(110deg, transparent 25%, rgba(252,251,248,.12) 40%, transparent 55%)",
                                                }}
                                            />
                                        </div>

                                        {/* One element per pane, each clipped to its own inner glass boundary */}
                                        {PANES.map((p) => (
                                            <div
                                                key={p.id}
                                                data-glass-pane={p.id}
                                                className="absolute inset-0 overflow-hidden"
                                                style={{ clipPath: polygon(p.points) }}
                                            >
                                                {/* Step 1: scan line */}
                                                <div
                                                    data-scan
                                                    className="absolute inset-x-0 opacity-0"
                                                    style={{
                                                        top: `${GLAZING_BOX.top}%`,
                                                        height: `${GLAZING_BOX.height}%`,
                                                    }}
                                                >
                                                    <div className="h-px w-full bg-warm shadow-[0_0_10px_rgba(252,251,248,.7)]" />
                                                </div>

                                                {/* Step 2: film sheet installed across the glass */}
                                                <div data-film className="absolute inset-0">
                                                    <div
                                                        className="absolute inset-0"
                                                        style={{
                                                            clipPath: REVEAL("--film"),
                                                            background:
                                                                "linear-gradient(120deg, rgba(184,196,197,.18), rgba(150,168,170,.08) 55%, rgba(244,241,234,.14))",
                                                        }}
                                                    />
                                                    <div
                                                        className="absolute inset-y-0 w-px bg-warm/60"
                                                        style={{
                                                            left: AT("--film"),
                                                            opacity: "calc(var(--film) * 1)",
                                                        }}
                                                    />
                                                </div>

                                                {/* Restrained reflection travelling across the glass */}
                                                <div
                                                    data-glint
                                                    className="absolute inset-y-0 left-0 w-1/3 opacity-30 mix-blend-screen"
                                                    style={{
                                                        background:
                                                            "linear-gradient(105deg, transparent 0%, rgba(252,251,248,.16) 50%, transparent 100%)",
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Glazing outline (inner glass boundaries, not the outer frame) */}
                                    <svg
                                        data-pane-border
                                        aria-hidden
                                        viewBox="0 0 100 100"
                                        preserveAspectRatio="none"
                                        className="pointer-events-none absolute inset-0 h-full w-full"
                                    >
                                        {PANES.map((p) => (
                                            <polygon
                                                key={p.id}
                                                points={svgPoints(p.points)}
                                                fill="none"
                                                stroke="rgba(252,251,248,.5)"
                                                strokeWidth={1}
                                                vectorEffect="non-scaling-stroke"
                                            />
                                        ))}
                                    </svg>

                                    {/* Interactive comparison: native range input = mouse, touch and keyboard.
                                        Its range is exactly the glazing span, so the thumb, divider and frost edge coincide. */}
                                    <input
                                        ref={inputRef}
                                        type="range"
                                        min={0}
                                        max={100}
                                        step={1}
                                        defaultValue={50}
                                        aria-label="Compare the private and clear glass states"
                                        aria-valuetext="Comparing, 50% private"
                                        onInput={(e) => onManualInput(Number(e.currentTarget.value))}
                                        className="glass-range peer absolute z-10 m-0 cursor-ew-resize touch-pan-y opacity-0"
                                        style={{
                                            left: `${GLAZING_BOX.left}%`,
                                            width: `${GLAZING_BOX.width}%`,
                                            top: `${GLAZING_BOX.top}%`,
                                            height: `${GLAZING_BOX.height}%`,
                                        }}
                                    />
                                    <div
                                        aria-hidden
                                        className="pointer-events-none absolute w-px bg-warm/80 peer-focus-visible:[&>span]:ring-2 peer-focus-visible:[&>span]:ring-warm"
                                        style={{
                                            left: AT("--p"),
                                            top: `${GLAZING_BOX.top}%`,
                                            height: `${GLAZING_BOX.height}%`,
                                        }}
                                    >
                                        <span className="absolute left-1/2 top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-warm/70 bg-ink/50 backdrop-blur-sm">
                                            <svg
                                                width="20"
                                                height="10"
                                                viewBox="0 0 20 10"
                                                fill="none"
                                                className="text-warm"
                                            >
                                                <path
                                                    d="M6 1 1 5l5 4M14 1l5 4-5 4"
                                                    stroke="currentColor"
                                                    strokeWidth="1"
                                                />
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Fixed UI: frame line, tonal grade, side tags, state label */}
                            <div
                                aria-hidden
                                className="pointer-events-none absolute inset-0 border border-warm/20 bg-gradient-to-t from-ink/35 via-transparent to-transparent"
                            />
                            <span className="pointer-events-none absolute left-3 top-3 bg-ink/55 px-2 py-1 text-[10px] uppercase tracking-[.3em] text-warm/90 backdrop-blur-sm">
                                Private
                            </span>
                            <span className="pointer-events-none absolute right-3 top-3 bg-ink/55 px-2 py-1 text-[10px] uppercase tracking-[.3em] text-warm/90 backdrop-blur-sm">
                                Clear
                            </span>
                            <div className="pointer-events-none absolute bottom-4 left-4 flex items-center gap-3 border border-warm/25 bg-ink/60 px-3 py-2 text-[10px] uppercase tracking-[.3em] text-warm backdrop-blur-sm">
                                <span
                                    aria-hidden
                                    className="h-1.5 w-1.5 rounded-full bg-mist"
                                />
                                <span ref={chipRef} role="status">
                                    Comparing
                                </span>
                            </div>
                        </div>
                    </div>

                    <p className="mt-3 shrink-0 text-[11px] uppercase tracking-[.22em] text-ink/70">
                        Illustrative demonstration · drag or use arrow keys to compare
                    </p>
                </div>

                {/* ---------- Steps ---------- */}
                <div className="lg:col-span-5 lg:row-start-2 lg:self-start">
                    <p
                        data-count-wrap
                        className="invisible mb-4 hidden text-[11px] uppercase tracking-[.28em] text-ink/70 lg:block"
                    >
                        Step{" "}
                        <span data-count className="text-eucalyptus">
                            01
                        </span>{" "}
                        / 03
                    </p>
                    <div className="relative pl-8 md:pl-10">
                        <div
                            aria-hidden
                            className="absolute bottom-1 left-0 top-1 w-px bg-line"
                        />
                        <div
                            data-bar
                            aria-hidden
                            className="absolute bottom-1 left-0 top-1 w-px origin-top bg-eucalyptus"
                        />
                        <ol data-steps className="group space-y-8 lg:space-y-5">
                            {STEPS.map(({ Icon, title, body }, i) => (
                                <li
                                    key={title}
                                    data-step
                                    className="transition-opacity duration-500 group-data-[dim=true]:opacity-30 group-data-[dim=true]:data-[active=true]:opacity-100"
                                >
                                    <div className="flex gap-4">
                                        <Icon
                                            className="mt-1 h-5 w-5 shrink-0 text-eucalyptus"
                                            strokeWidth={1.25}
                                        />
                                        <div>
                                            <span className="text-[11px] uppercase tracking-[.28em] text-eucalyptus/80">
                                                Step 0{i + 1}
                                            </span>
                                            <h3 className="display mt-1 text-xl leading-tight text-ink md:text-2xl lg:text-[1.35rem]">
                                                {title}
                                            </h3>
                                            <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink/70 md:text-base lg:text-[.9rem] lg:leading-snug">
                                                {body}
                                            </p>
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
