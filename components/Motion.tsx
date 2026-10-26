"use client";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

/** One place for all scroll choreography. Sections opt in with data-attributes. */
export default function Motion({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const r = root.current!;
    const q = <T extends HTMLElement>(s: string) => gsap.utils.toArray<T>(s, r);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Hero frost toggle (user-triggered; works with reduced motion, minus the easing)
    const btn = r.querySelector<HTMLButtonElement>("[data-toggle]");
    let on = false;
    const toggle = () => {
      on = !on;
      gsap.to("[data-hero-frost]", { opacity: on ? 1 : 0, duration: reduce ? 0 : 1.6, ease: "power2.inOut" });
      btn?.setAttribute("aria-pressed", String(on));
      const l = btn?.querySelector("span"); if (l) l.textContent = on ? "Switch to clear" : "Switch to private";
    };
    btn?.addEventListener("click", toggle);

    const mm = gsap.matchMedia(r);
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Hero intro: one orchestrated moment
      q("[data-split]").forEach((el) => {
        el.setAttribute("aria-label", el.textContent || "");
        el.innerHTML = (el.textContent || "").split(" ").map((w) => `<span aria-hidden="true" class="inline-block overflow-hidden align-bottom pb-[.08em]"><span data-w class="inline-block">${w}</span></span>`).join(" ");
        const words = el.querySelectorAll("[data-w]");
        gsap.set(words, { yPercent: 115, rotate: 3 });
        const hero = !!el.closest("[data-hero]");
        gsap.to(words, { yPercent: 0, rotate: 0, duration: 1.2, ease: "expo.out", stagger: 0.07, delay: hero ? 0.3 : 0,
          ...(hero ? {} : { scrollTrigger: { trigger: el, start: "top 85%" } }) });
      });
      gsap.from("[data-hero-in]", { opacity: 0, y: 24, duration: 1.2, ease: "power3.out", stagger: 0.12, delay: 1.1 });
      gsap.from("[data-hero-img]", { scale: 1.18, duration: 2.4, ease: "expo.out" });

      // Hero scroll: depth + fade
      gsap.timeline({ scrollTrigger: { trigger: "[data-hero]", start: "top top", end: "bottom top", scrub: true } })
        .to("[data-hero-img]", { yPercent: 14, scale: 1.08, ease: "none" }, 0)
        .to("[data-hero-copy]", { yPercent: -22, opacity: 0, ease: "none" }, 0)
        .to("[data-hero-veil]", { opacity: 1, ease: "none" }, 0);

      // Multi-speed parallax
      q("[data-speed]").forEach((el) => gsap.to(el, { yPercent: parseFloat(el.dataset.speed!) * 100, ease: "none",
        scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: 0.6 } }));
      q("[data-x]").forEach((el) => gsap.fromTo(el, { xPercent: -parseFloat(el.dataset.x!) }, { xPercent: parseFloat(el.dataset.x!), ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.8 } }));

      // Clip-mask image reveals with inner scale
      q("[data-clip]").forEach((el) => {
        const img = el.querySelector("[data-img]");
        gsap.timeline({ scrollTrigger: { trigger: el, start: "top 90%", end: "top 30%", scrub: 0.7 } })
          .fromTo(el, { clipPath: "inset(14% 10% 14% 10%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none" }, 0)
          .fromTo(img, { scale: 1.3 }, { scale: 1, ease: "none" }, 0);
      });
      q("[data-reveal]").forEach((el) => gsap.from(el, { opacity: 0, y: 36, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } }));
    });

    // Pinned story: clear -> frosted, synced with steps (desktop only; mobile stacks)
    mm.add("(prefers-reduced-motion: no-preference) and (min-width: 768px)", () => {
      const steps = q("[data-step]"); gsap.set("[data-film]", { opacity: 0 }); gsap.set("[data-how-frost]", { opacity: 0 });
      gsap.set(steps, { opacity: 0.25 }); gsap.set(steps[0], { opacity: 1 });
      const tl = gsap.timeline({ scrollTrigger: { trigger: "[data-how]", start: "top top", end: "+=240%", scrub: 0.6, pin: true, anticipatePin: 1 } });
      tl.to(steps[0], { opacity: 0.25, duration: 0.5 }, 0.5).to(steps[1], { opacity: 1, duration: 0.5 }, 0.5)
        .to("[data-film]", { yPercent: 0, opacity: 1, duration: 1, ease: "power2.out" }, 0.5)
        .to(steps[1], { opacity: 0.25, duration: 0.5 }, 1.5).to(steps[2], { opacity: 1, duration: 0.5 }, 1.5)
        .to("[data-how-frost]", { opacity: 1, duration: 1, ease: "power2.inOut" }, 1.5)
        .to("[data-how-bar]", { scaleY: 1, duration: 2, ease: "none" }, 0);
    });

    // Magnetic buttons (fine pointers only)
    mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const offs: Array<() => void> = [];
      q("[data-magnetic]").forEach((el) => {
        const mv = (e: MouseEvent) => { const b = el.getBoundingClientRect(); gsap.to(el, { x: (e.clientX - b.left - b.width / 2) * 0.25, y: (e.clientY - b.top - b.height / 2) * 0.35, duration: 0.4, ease: "power3.out" }); };
        const lv = () => gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1,.4)" });
        el.addEventListener("mousemove", mv); el.addEventListener("mouseleave", lv);
        offs.push(() => { el.removeEventListener("mousemove", mv); el.removeEventListener("mouseleave", lv); });
      });
      // Soft cursor halo
      const halo = r.querySelector<HTMLElement>("[data-halo]");
      const xTo = halo && gsap.quickTo(halo, "x", { duration: 0.5, ease: "power3" }); const yTo = halo && gsap.quickTo(halo, "y", { duration: 0.5, ease: "power3" });
      const mv = (e: MouseEvent) => { xTo?.(e.clientX); yTo?.(e.clientY); };
      window.addEventListener("mousemove", mv);
      return () => { offs.forEach((f) => f()); window.removeEventListener("mousemove", mv); };
    });

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    return () => { btn?.removeEventListener("click", toggle); window.removeEventListener("load", refresh); mm.revert(); };
  }, []);
  return <div ref={root}>{children}<div data-halo aria-hidden className="pointer-events-none fixed left-0 top-0 z-50 hidden h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-champagne/40 mix-blend-difference [@media(hover:hover)_and_(pointer:fine)]:block" /></div>;
}
