import WhyRules from "@/components/WhyRules";

/**
 * CLARIVO — #why section (server component, no client state).
 * Heading uses the existing `data-split`; each row uses the existing `data-reveal`.
 * Top-rule drawing is handled by the tiny <WhyRules /> helper via `data-rule`.
 */

const reasons: [string, string][] = [
    ["Start with what is there", "Film is applied to existing glazing where it is suitable, so you are not defaulting to replacement."],
    ["Assessed before quoted", "Every project begins by checking the glass, so recommendations fit your windows."],
    ["Specifications on request", "Performance details are confirmed against the product datasheet for your project."],
];

export default function WhySection() {
    return (
        <section id="why" className="relative bg-silver px-6 py-28 text-obsidian md:px-12 md:py-40 lg:py-48">
            <div className="mx-auto grid max-w-[1500px] gap-14 lg:grid-cols-12 lg:gap-x-10">
                {/* Heading column */}
                <div className="lg:col-span-6 lg:self-start">
                    <p className="flex items-center gap-4 text-[11px] uppercase tracking-[.28em] text-obsidian/60">
                        <span>Why Clarivo</span>
                        <span aria-hidden className="h-px w-10 bg-obsidian/30" />
                    </p>
                    <h2
                        data-split
                        className="display mt-8 text-[clamp(2.6rem,6vw,5.5rem)] !leading-[1.2] tracking-[-0.01em] lg:max-w-[12ch]"
                    >
                        Upgrade the glass you already have.
                    </h2>
                </div>

                {/* Reasons column */}
                <dl className="lg:col-span-5 lg:col-start-8 lg:pt-6">
                    {reasons.map(([t, d], i) => (
                        <div
                            data-reveal
                            key={t}
                            className="relative pb-10 pt-7 last:border-b last:border-obsidian/25 md:pb-12"
                        >
                            <div data-rule aria-hidden className="absolute inset-x-0 top-0 h-px bg-obsidian/25" />
                            <dt className="flex items-baseline gap-5">
                                <span aria-hidden className="w-8 shrink-0 text-[11px] tracking-[.28em] text-obsidian/60">
                                    0{i + 1}
                                </span>
                                <span className="display text-[1.7rem] leading-tight md:text-3xl">{t}</span>
                            </dt>
                            <dd className="mt-4 max-w-md text-[.95rem] leading-relaxed text-obsidian/70 pl-[3.25rem]">{d}</dd>
                        </div>
                    ))}
                </dl>
            </div>

            <WhyRules />
        </section>
    );
}
