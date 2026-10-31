"use client";

/**
 * CLARIVO — #spaces section
 * Drop-in replacement for the existing <section id="spaces">.
 *
 * Motion is fully scoped here (gsap.context + gsap.matchMedia). The section deliberately does NOT
 * use data-speed / data-clip / data-split, so the global <Motion> utility cannot double-animate it.
 *
 * Image keys: residential, office, boardroom, hospitality come from site.img as before.
 * Commercial reads `site.img.commercial` if you add it (recommended: reception / clinic / retail glazing);
 * until then it falls back to site.img.hero so the section never breaks.
 */

import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import Media from "@/components/Media";
import { site } from "@/lib/site";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type ImgSrc = typeof site.img.hero;
const imgs = site.img as unknown as Record<string, ImgSrc | undefined>;

type Item = {
    n: string;
    title: string;
    desc: string;
    src: ImgSrc;
    alt: string;
    dir: "l" | "r" | "t" | "b" | "c"; // reveal direction
    amp: number; // parallax amplitude (% of oversized layer), scaled per breakpoint
    wrap: string; // grid placement
    aspect: string; // image proportion
};

const ITEMS: Item[] = [
    {
        n: "01",
        title: "Residential",
        desc: "Bedrooms, bathrooms and street-facing glass.",
        src: imgs.residential ?? site.img.hero,
        alt: "Contemporary home with expansive glazed doors and windows",
        dir: "l",
        amp: 3,
        wrap: "md:col-span-12 lg:col-span-8",
        aspect: "aspect-[4/3] md:aspect-[16/10]",
    },
    {
        n: "02",
        title: "Offices",
        desc: "Meeting rooms and open-plan partitions.",
        src: imgs.office ?? site.img.hero,
        alt: "Contemporary workplace with glazed meeting rooms and partitions",
        dir: "b",
        amp: 6,
        wrap: "md:col-span-6 lg:col-span-4 lg:col-start-9 lg:mt-44",
        aspect: "aspect-[4/5] md:aspect-[3/4]",
    },
    {
        n: "03",
        title: "Boardrooms",
        desc: "Discretion for confidential conversations.",
        src: imgs.boardroom ?? site.img.hero,
        alt: "Boardroom with glass partitions and a refined meeting-room interior",
        dir: "t",
        amp: 5,
        wrap: "md:col-span-6 md:mt-20 lg:col-span-5 lg:col-start-2 lg:mt-0",
        aspect: "aspect-[4/5]",
    },
    {
        n: "04",
        title: "Hospitality",
        desc: "Private dining and treatment spaces.",
        src: imgs.hospitality ?? site.img.hero,
        alt: "Refined hospitality interior with glazed screens",
        dir: "r",
        amp: 3,
        wrap: "md:col-span-12 lg:col-span-6 lg:col-start-7 lg:mt-32",
        aspect: "aspect-[4/3] md:aspect-[16/10] lg:aspect-[3/2]",
    },
    {
        n: "05",
        title: "Commercial",
        desc: "Shopfronts, clinics and reception areas, assessed project by project.",
        src: imgs.commercial ?? site.img.hero,
        alt: "Commercial reception area with glazing",
        dir: "c",
        amp: 2.5,
        wrap: "md:col-span-12 lg:col-span-9 lg:col-start-4",
        aspect: "aspect-[4/3] md:aspect-[2/1] lg:aspect-[16/8]",
    },
];

const CLIP_FROM: Record<Item["dir"], string> = {
    l: "inset(0% 100% 0% 0%)",
    r: "inset(0% 0% 0% 100%)",
    t: "inset(0% 0% 100% 0%)",
    b: "inset(100% 0% 0% 0%)",
    c: "inset(18% 12% 18% 12%)",
};

export default function SpacesSection() {
    const root = useRef<HTMLElement>(null);

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
                    desktop: "(min-width: 1024px)",
                    tablet: "(min-width: 768px) and (max-width: 1023px)",
                },
                (c) => {
                    const { motion, desktop, tablet } = c.conditions as Record<string, boolean>;
                    if (!motion) return; // complete static gallery

                    const k = desktop ? 1 : tablet ? 0.5 : 0; // parallax intensity (0 = off on mobile)
                    const intro = el.querySelector<HTMLElement>("[data-intro]");

                    /* ---------- Intro entrance ---------- */
                    if (intro) {
                        gsap
                            .timeline({
                                defaults: { ease: "power3.out" },
                                scrollTrigger: { trigger: intro, start: "top 80%", once: true },
                            })
                            .from(q("[data-eyebrow]"), { opacity: 0, y: 12, duration: 0.8 })
                            .from(q("[data-line]"), { yPercent: 110, duration: 1.1, stagger: 0.12 }, 0.1)
                            .from(q("[data-rule]"), { scaleX: 0, transformOrigin: "left center", duration: 1.4, ease: "expo.inOut" }, 0.5)
                            .from(q("[data-intro-p]"), { opacity: 0, y: 24, duration: 1 }, 0.9);

                        // Headline eases out of focus as the gallery takes over
                        gsap.to(q("[data-intro-drift]"), {
                            yPercent: -10 * k,
                            opacity: 0.35,
                            ease: "none",
                            scrollTrigger: { trigger: intro, start: "top 20%", end: "bottom top", scrub: true },
                        });
                    }

                    /* ---------- Gallery items ---------- */
                    gsap.utils.toArray<HTMLElement>("[data-item]", el).forEach((item) => {
                        const frame = item.querySelector<HTMLElement>("[data-frame]");
                        const enter = item.querySelector<HTMLElement>("[data-enter]");
                        const par = item.querySelector<HTMLElement>("[data-par]");
                        const caps = item.querySelectorAll("[data-cap]");
                        const dir = (item.dataset.dir || "l") as Item["dir"];
                        const amp = Number(item.dataset.amp || 3);
                        if (!frame || !enter) return;

                        // Image establishes itself first, caption follows
                        gsap
                            .timeline({
                                defaults: { ease: "power3.out" },
                                scrollTrigger: { trigger: item, start: "top 82%", once: true },
                            })
                            .fromTo(
                                frame,
                                { clipPath: CLIP_FROM[dir] },
                                { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.inOut" }
                            )
                            .from(enter, { scale: 1.18, duration: 1.8, ease: "power2.out" }, 0)
                            .from(caps, { opacity: 0, y: 20, duration: 0.9, stagger: 0.1 }, 0.75);

                        // Individual, restrained parallax inside the clipped frame
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

                    /* ---------- Background layers: slower than the photographs ---------- */
                    const whole = { trigger: el, start: "top bottom", end: "bottom top", scrub: true };
                    const kx = desktop ? 1 : tablet ? 0.8 : 0.6; // sideways travel of the big background word
                    gsap.fromTo(q("[data-bgtype]"), { xPercent: 20 }, { xPercent: -55 * kx, ease: "none", scrollTrigger: whole });
                    if (k > 0) {
                        gsap.fromTo(q("[data-hairline]"), { y: -30 * k }, { y: 30 * k, ease: "none", scrollTrigger: whole });
                    }

                    /* ---------- Closing line ---------- */
                    gsap.from(q("[data-end]"), {
                        opacity: 0,
                        y: 20,
                        duration: 1,
                        ease: "power3.out",
                        scrollTrigger: { trigger: q("[data-end]")[0], start: "top 92%", once: true },
                    });
                }
            );
        }, el);

        return () => ctx.revert();
    }, []);

    return (
        <section id="spaces" ref={root} className="relative overflow-hidden px-6 py-28 md:px-12 md:py-40 lg:py-48">
            {/* Decorative background (slow independent drift) */}
            <div aria-hidden className="pointer-events-none absolute inset-0 select-none">
                <div data-bgtype className="absolute right-0 top-[18%] will-change-transform">
                    <p className="display whitespace-nowrap text-[26vw] leading-none text-ink/[.05]">Spaces</p>
                </div>
                <div
                    data-hairline
                    className="absolute bottom-24 left-6 top-40 w-px bg-gradient-to-b from-transparent via-line to-transparent will-change-transform md:left-12"
                />
            </div>

            <div className="relative mx-auto max-w-[1500px]">
                {/* ---------- Introduction ---------- */}
                <div data-intro className="grid gap-10 lg:grid-cols-12 lg:gap-x-8">
                    <div className="lg:col-span-9">
                        <p
                            data-eyebrow
                            className="flex items-center gap-4 text-[11px] uppercase tracking-[.28em] text-eucalyptus"
                        >
                            <span>Designed for different spaces</span>
                        </p>
                        <div data-intro-drift className="will-change-transform">
                            <h2 className="display mt-8 text-[clamp(3rem,9vw,8.5rem)] leading-[.98] tracking-[-0.015em] text-ink">
                                <span className="block overflow-hidden pb-[.08em]">
                                    <span data-line className="block">One film.</span>
                                </span>
                                <span className="block overflow-hidden pb-[.08em]">
                                    <span data-line className="block">Five kinds</span>
                                </span>
                                <span className="block overflow-hidden pb-[.08em]">
                                    <span data-line className="block italic text-ink">of space.</span>
                                </span>
                            </h2>
                        </div>
                    </div>
                    <div className="lg:col-span-4 lg:col-start-9 lg:self-end">
                        <p data-intro-p className="max-w-sm leading-relaxed text-ink/70">
                            Switchable smart film can be considered for suitable existing glass across homes, workplaces and
                            public-facing spaces. Each project begins with an assessment of the glazing already in place.
                        </p>
                    </div>
                    <div data-rule aria-hidden className="h-px w-full bg-line lg:col-span-12" />
                </div>

                {/* ---------- Gallery ---------- */}
                <div className="mt-20 grid gap-y-20 md:mt-28 md:grid-cols-12 md:gap-x-6 lg:mt-36 lg:gap-x-8 lg:gap-y-28">
                    {ITEMS.map((it) => (
                        <article key={it.title} data-item data-dir={it.dir} data-amp={it.amp} className={`group relative ${it.wrap}`}>
                            {/* frame (clip reveal) > par (parallax) > enter (scale) > hover (CSS) > Media */}
                            <div data-frame className={`relative w-full overflow-hidden border border-line ${it.aspect}`}>
                                <div data-par className="absolute inset-x-0 -inset-y-[8%] will-change-transform">
                                    <div data-enter className="h-full w-full will-change-transform">
                                        <div className="h-full w-full saturate-[.94] transition-[transform,filter] duration-700 ease-out [@media(hover:hover)]:group-hover:scale-[1.04] [@media(hover:hover)]:group-hover:saturate-100 [@media(hover:hover)]:group-hover:brightness-[1.06]">
                                            <Media src={it.src} alt={it.alt} className="h-full w-full" />
                                        </div>
                                    </div>
                                </div>
                                <div
                                    aria-hidden
                                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent"
                                />
                            </div>

                            {/* Caption: consistent alignment regardless of image proportion */}
                            <div className="mt-6 border-t border-line pt-5">
                                <div data-cap className="flex items-center gap-4 text-[11px] uppercase tracking-[.28em] text-eucalyptus">
                                    <span>{it.n}</span>
                                    <span
                                        aria-hidden
                                        className="h-px w-8 bg-eucalyptus/60 transition-[width] duration-500 ease-out [@media(hover:hover)]:group-hover:w-14"
                                    />
                                    <span className="text-ink/70">/ 05</span>
                                </div>
                                <h3 data-cap className="display mt-4 text-3xl text-ink md:text-4xl">{it.title}</h3>
                                <p data-cap className="mt-2 max-w-xs text-ink/70">{it.desc}</p>
                            </div>
                        </article>
                    ))}
                </div>

                {/* ---------- Closing line into the next section ---------- */}
                <div
                    data-end
                    className="mt-24 flex flex-col gap-6 border-t border-line pt-8 md:flex-row md:items-center md:justify-between lg:mt-32"
                >
                    <p className="max-w-md text-sm leading-relaxed text-ink/70">
                        Suitability depends on your existing glass, so every project starts with an assessment.
                    </p>
                    <a
                        href="#enquiry"
                        className="group/cta inline-flex items-center gap-3 self-start border-b border-eucalyptus/40 pb-2 text-sm uppercase tracking-[.2em] text-ink transition-colors duration-500 hover:border-eucalyptus md:self-auto"
                    >
                        Start with an assessment
                        <ArrowUpRight className="h-4 w-4 text-eucalyptus transition-transform duration-500 group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5" />
                    </a>
                </div>
            </div>
        </section>
    );
}