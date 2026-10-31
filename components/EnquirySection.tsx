import Enquiry from "@/components/Enquiry";
import { site } from "@/lib/site";

/**
 * CLARIVO — #enquiry section (server component, no client state).
 * Heading uses the existing `data-split`; supporting blocks and the form panel use `data-reveal`.
 *
 * The <Enquiry /> component itself is NOT modified: its fields, validation, submission path and
 * state handling stay exactly as they are. Its appearance is restyled through the scoped
 * `#enquiry .enq-form` rules below (inputs, labels, focus, errors, submit button).
 */

export default function EnquirySection() {
    const c = site.contact;
    const hasContact = Boolean(c.email || c.phone || c.address);

    return (
        <section id="enquiry" className="relative px-6 py-28 md:px-12 md:py-40 lg:py-48">
            <div className="mx-auto grid max-w-[1500px] gap-16 lg:grid-cols-12 lg:gap-x-12">
                {/* ---------- Invitation ---------- */}
                <div className="lg:col-span-5">
                    <p className="flex items-center gap-4 text-[11px] uppercase tracking-[.28em] text-eucalyptus">
                        <span>Start a conversation</span>
                        <span aria-hidden className="h-px w-10 bg-eucalyptus/60" />
                    </p>

                    <h2
                        data-split
                        className="display mt-8 text-[clamp(2.6rem,5.5vw,5rem)] leading-[1.15] tracking-[-0.01em] text-ink"
                    >
                        Tell us about your glass.
                    </h2>

                    <p data-reveal className="mt-8 max-w-md leading-relaxed text-ink/70">
                        Share a few details and we will come back to you about suitability and next steps for your {site.region}{" "}
                        project.
                    </p>

                    {hasContact && (
                        <dl data-reveal className="mt-12 max-w-md border-t border-line">
                            {c.email && (
                                <div className="grid grid-cols-[6.5rem_1fr] items-baseline gap-4 border-b border-line py-4">
                                    <dt className="text-[11px] uppercase tracking-[.22em] text-ink/70">Email</dt>
                                    <dd>
                                        <a
                                            className="break-all text-ink/90 underline decoration-eucalyptus/50 underline-offset-4 transition-colors hover:text-ink hover:decoration-eucalyptus"
                                            href={`mailto:${c.email}`}
                                        >
                                            {c.email}
                                        </a>
                                    </dd>
                                </div>
                            )}
                            {c.phone && (
                                <div className="grid grid-cols-[6.5rem_1fr] items-baseline gap-4 border-b border-line py-4">
                                    <dt className="text-[11px] uppercase tracking-[.22em] text-ink/70">Phone</dt>
                                    <dd>
                                        <a
                                            className="text-ink/90 underline decoration-eucalyptus/50 underline-offset-4 transition-colors hover:text-ink hover:decoration-eucalyptus"
                                            href={`tel:${c.phone}`}
                                        >
                                            {c.phone}
                                        </a>
                                    </dd>
                                </div>
                            )}
                            {c.address && (
                                <div className="grid grid-cols-[6.5rem_1fr] items-baseline gap-4 border-b border-line py-4">
                                    <dt className="text-[11px] uppercase tracking-[.22em] text-ink/70">Address</dt>
                                    <dd className="text-ink/90">{c.address}</dd>
                                </div>
                            )}
                        </dl>
                    )}

                    <p data-reveal className="display mt-12 max-w-xs text-xl italic leading-snug text-ink/80">
                        Every project starts with understanding your glass.
                    </p>
                </div>

                {/* ---------- Form ---------- */}
                <div className="lg:col-span-6 lg:col-start-7">
                    <div
                        data-reveal
                        className="enq-form relative border border-line bg-limestone/60 p-6 md:p-10 lg:p-12"
                    >
                        {/* Fine architectural corner detail */}
                        <span aria-hidden className="pointer-events-none absolute -left-px -top-px h-6 w-6 border-l border-t border-eucalyptus/70" />
                        <span aria-hidden className="pointer-events-none absolute -bottom-px -right-px h-6 w-6 border-b border-r border-eucalyptus/70" />
                        <Enquiry />
                    </div>
                </div>
            </div>
        </section>
    );
}
