"use client";

/**
 * Draws the thin top rules of the #why rows as they enter the viewport.
 * Renders nothing. It only adds a scroll-triggered scaleX on [data-rule] elements inside #why,
 * so it never touches the heading (data-split) or the rows (data-reveal) that <Motion> already animates.
 * Skipped entirely when the visitor prefers reduced motion; rules then simply show.
 */

import { useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function WhyRules() {
    useIsoLayoutEffect(() => {
        gsap.registerPlugin(ScrollTrigger);
        const root = document.getElementById("why");
        if (!root) return;

        const ctx = gsap.context(() => {
            const mm = gsap.matchMedia();
            mm.add("(prefers-reduced-motion: no-preference)", () => {
                gsap.utils.toArray<HTMLElement>("[data-rule]", root).forEach((rule) => {
                    gsap.from(rule, {
                        scaleX: 0,
                        transformOrigin: "left center",
                        duration: 1.4,
                        ease: "expo.inOut",
                        scrollTrigger: { trigger: rule, start: "top 88%", once: true },
                    });
                });
            });
        }, root);

        return () => ctx.revert();
    }, []);

    return null;
}