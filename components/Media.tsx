/* eslint-disable @next/next/no-img-element */
export default function Media({ src, alt, className = "", eager = false, ...rest }: { src: string; alt: string; className?: string; eager?: boolean; [k: `data-${string}`]: unknown }) {
  // Dark gradient sits behind the photo so a slow or failed load never shows an empty block.
  return (
    <div {...(rest as object)} className={`relative overflow-hidden bg-gradient-to-br from-slate2 to-obsidian ${className}`}>
      <img src={src} alt={alt} data-img loading={eager ? "eager" : "lazy"} decoding="async" className="absolute inset-0 h-full w-full object-cover will-change-transform" />
    </div>
  );
}
