"use client";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Coordinates page motion within this component's GSAP context. */
export default function Motion({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const ctx = gsap.context(() => {
      const select = gsap.utils.selector(element);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const toggle = element.querySelector<HTMLButtonElement>("[data-toggle]");
      let privateState = false;
      const setFilmState = () => {
        privateState = !privateState;
        gsap.to(select("[data-hero-frost]"), { opacity: privateState ? 1 : 0, duration: reduce ? 0 : 1.4, ease: "power2.inOut" });
        toggle?.setAttribute("aria-pressed", String(privateState));
        const label = toggle?.querySelector("span");
        if (label) label.textContent = privateState ? "Switch to clear" : "Switch to private";
      };
      toggle?.addEventListener("click", setFilmState);

      const mm = gsap.matchMedia(element);
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Split text into spans without replacing the semantic heading.
        select<HTMLElement>("[data-split]").forEach((heading) => {
          const words = heading.textContent?.trim().split(/\s+/) ?? [];
          heading.setAttribute("aria-label", words.join(" "));
          heading.replaceChildren(...words.map((word) => {
            const clip = document.createElement("span");
            const inner = document.createElement("span");
            clip.className = "inline-block overflow-hidden align-bottom pb-[.08em]";
            clip.setAttribute("aria-hidden", "true");
            inner.className = "inline-block";
            inner.dataset.word = "";
            inner.textContent = word;
            clip.append(inner);
            return clip;
          }).flatMap((node, index) => index ? [document.createTextNode(" "), node] : [node]));
          const wordsEls = heading.querySelectorAll("[data-word]");
          gsap.set(wordsEls, { yPercent: 115, rotate: 3 });
          const isHero = Boolean(heading.closest("[data-hero]"));
          gsap.to(wordsEls, { yPercent: 0, rotate: 0, duration: 1.15, ease: "expo.out", stagger: 0.065, delay: isHero ? 0.25 : 0,
            ...(isHero ? {} : { scrollTrigger: { trigger: heading, start: "top 85%" } }) });
        });

        gsap.from(select("[data-hero-in]"), { opacity: 0, y: 22, duration: 1.1, ease: "power3.out", stagger: 0.12, delay: 1 });
        gsap.from(select("[data-hero-img]"), { scale: 1.12, duration: 2.2, ease: "expo.out" });
        gsap.timeline({ scrollTrigger: { trigger: select("[data-hero]"), start: "top top", end: "bottom top", scrub: true } })
          .to(select("[data-hero-img]"), { yPercent: 12, scale: 1.06, ease: "none" }, 0)
          .to(select("[data-hero-copy]"), { yPercent: -16, opacity: 0, ease: "none" }, 0)
          .to(select("[data-hero-veil]"), { opacity: 0.45, ease: "none" }, 0);

        select<HTMLElement>("[data-speed]").forEach((item) => {
          const speed = Number.parseFloat(item.dataset.speed ?? "0");
          gsap.to(item, { yPercent: speed * 100, ease: "none", scrollTrigger: { trigger: item.parentElement ?? item, start: "top bottom", end: "bottom top", scrub: 0.6 } });
        });
        select<HTMLElement>("[data-x]").forEach((item) => gsap.fromTo(item,
          { xPercent: -Number.parseFloat(item.dataset.x ?? "0") },
          { xPercent: Number.parseFloat(item.dataset.x ?? "0"), ease: "none", scrollTrigger: { trigger: item, start: "top bottom", end: "bottom top", scrub: 0.8 } }));
        select<HTMLElement>("[data-clip]").forEach((item) => {
          const img = item.querySelector("[data-img]");
          gsap.timeline({ scrollTrigger: { trigger: item, start: "top 90%", end: "top 30%", scrub: 0.7 } })
            .fromTo(item, { clipPath: "inset(10% 7% 10% 7%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none" }, 0)
            .fromTo(img, { scale: 1.2 }, { scale: 1, ease: "none" }, 0);
        });
        select<HTMLElement>("[data-reveal]").forEach((item) => gsap.from(item, { opacity: 0, y: 28, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: item, start: "top 88%" } }));
      });

      mm.add("(prefers-reduced-motion: no-preference) and (min-width: 768px)", () => {
        const steps = select<HTMLElement>("[data-step]");
        if (steps.length !== 3) return;
        gsap.set(select("[data-film]"), { opacity: 0 });
        gsap.set(select("[data-how-frost]"), { opacity: 0 });
        gsap.set(steps, { opacity: 0.28 });
        gsap.set(steps[0], { opacity: 1 });
        const story = gsap.timeline({ scrollTrigger: { trigger: select("[data-how]"), start: "top top", end: "+=190%", scrub: 0.7, pin: true, anticipatePin: 1, invalidateOnRefresh: true } });
        story.to(steps[0], { opacity: 0.28, duration: 0.5 }, 0.5)
          .to(steps[1], { opacity: 1, duration: 0.5 }, 0.5)
          .to(select("[data-film]"), { opacity: 1, duration: 0.6, ease: "power2.out" }, 0.5)
          .to(steps[1], { opacity: 0.28, duration: 0.5 }, 1.35)
          .to(steps[2], { opacity: 1, duration: 0.5 }, 1.35)
          .to(select("[data-how-frost]"), { opacity: 1, duration: 0.8, ease: "power2.inOut" }, 1.35)
          .to(select("[data-how-bar]"), { scaleY: 1, duration: 1.85, ease: "none" }, 0);
      });

      mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
        const cleanups: Array<() => void> = [];
        select<HTMLElement>("[data-magnetic]").forEach((item) => {
          const move = (event: MouseEvent) => {
            const box = item.getBoundingClientRect();
            gsap.to(item, { x: (event.clientX - box.left - box.width / 2) * 0.12, y: (event.clientY - box.top - box.height / 2) * 0.16, duration: 0.35, ease: "power3.out" });
          };
          const leave = () => gsap.to(item, { x: 0, y: 0, duration: 0.55, ease: "power2.out" });
          item.addEventListener("mousemove", move);
          item.addEventListener("mouseleave", leave);
          cleanups.push(() => { item.removeEventListener("mousemove", move); item.removeEventListener("mouseleave", leave); });
        });
        return () => cleanups.forEach((cleanup) => cleanup());
      });

      const refresh = () => ScrollTrigger.refresh();
      element.querySelectorAll("img").forEach((img) => {
        if (!img.complete) img.addEventListener("load", refresh, { once: true });
      });
      window.addEventListener("load", refresh, { once: true });
      requestAnimationFrame(refresh);
      return () => {
        toggle?.removeEventListener("click", setFilmState);
        window.removeEventListener("load", refresh);
        element.querySelectorAll("img").forEach((img) => img.removeEventListener("load", refresh));
        mm.revert();
      };
    }, element);
    return () => ctx.revert();
  }, []);

  return <div ref={root}>{children}</div>;
}
