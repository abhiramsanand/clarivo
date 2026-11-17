"use client";

import { useEffect, useState } from "react";

type Props = {
    roomSrc: string; // the clear room photo (site.img.howRoom)
    frostSrc: string;
    maskSrc: string;
    /** px (at working size) to grow the glass area everywhere except protected objects */
    grow?: number;
    /** px around the glass where light-green outside leaves get frosted */
    reach?: number;
    /** fills specks/holes in the mask up to ~2x this size */
    closeRadius?: number;
    /** pixels darker than this (0-255 luminance) are "inside" objects and never frosted */
    insideLum?: number;
    /** mask alpha (0-255) above which a pixel counts as glass */
    maskThreshold?: number;
};

const load = (src: string) =>
    new Promise<HTMLImageElement>((res, rej) => {
        const i = new Image();
        i.crossOrigin = "anonymous";
        i.onload = () => res(i);
        i.onerror = rej;
        i.src = src;
    });

// Square dilation (separable, O(n))
function dilate(src: Uint8Array, w: number, h: number, r: number) {
    if (r <= 0) return src.slice();
    const tmp = new Uint8Array(w * h);
    const out = new Uint8Array(w * h);

    for (let y = 0; y < h; y++) {
        const row = y * w;
        let last = -1e9;
        for (let x = 0; x < w; x++) {
            if (src[row + x]) last = x;
            if (x - last <= r) tmp[row + x] = 1;
        }
        last = 1e9;
        for (let x = w - 1; x >= 0; x--) {
            if (src[row + x]) last = x;
            if (last - x <= r) tmp[row + x] = 1;
        }
    }
    for (let x = 0; x < w; x++) {
        let last = -1e9;
        for (let y = 0; y < h; y++) {
            if (tmp[y * w + x]) last = y;
            if (y - last <= r) out[y * w + x] = 1;
        }
        last = 1e9;
        for (let y = h - 1; y >= 0; y--) {
            if (tmp[y * w + x]) last = y;
            if (last - y <= r) out[y * w + x] = 1;
        }
    }
    return out;
}

function erode(src: Uint8Array, w: number, h: number, r: number) {
    const inv = src.map((v) => (v ? 0 : 1)) as Uint8Array;
    return dilate(inv, w, h, r).map((v) => (v ? 0 : 1)) as Uint8Array;
}

function boxBlur(a: Float32Array, w: number, h: number, r: number) {
    const t = new Float32Array(w * h);
    const o = new Float32Array(w * h);
    const d = 2 * r + 1;

    for (let y = 0; y < h; y++) {
        const row = y * w;
        let s = 0;
        for (let x = -r; x <= r; x++) s += a[row + Math.min(w - 1, Math.max(0, x))];
        for (let x = 0; x < w; x++) {
            t[row + x] = s / d;
            s += a[row + Math.min(w - 1, x + r + 1)] - a[row + Math.max(0, x - r)];
        }
    }
    for (let x = 0; x < w; x++) {
        let s = 0;
        for (let y = -r; y <= r; y++) s += t[Math.min(h - 1, Math.max(0, y)) * w + x];
        for (let y = 0; y < h; y++) {
            o[y * w + x] = s / d;
            s += t[Math.min(h - 1, y + r + 1) * w + x] - t[Math.max(0, y - r) * w + x];
        }
    }
    return o;
}

export default function FrostLayer({
    roomSrc,
    frostSrc,
    maskSrc,
    grow = 4,
    reach = 40,
    closeRadius = 3,
    insideLum = 115,
    maskThreshold = 20,
}: Props) {
    const [maskUrl, setMaskUrl] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const [room, mask] = await Promise.all([load(roomSrc), load(maskSrc)]);
                if (cancelled) return;

                const scale = Math.min(1, 1600 / Math.max(room.naturalWidth, room.naturalHeight));
                const w = Math.round(room.naturalWidth * scale);
                const h = Math.round(room.naturalHeight * scale);
                const n = w * h;

                const read = (img: HTMLImageElement) => {
                    const c = document.createElement("canvas");
                    c.width = w;
                    c.height = h;
                    const ctx = c.getContext("2d", { willReadFrequently: true })!;
                    ctx.drawImage(img, 0, 0, w, h);
                    return ctx.getImageData(0, 0, w, h).data;
                };
                const photo = read(room);
                const maskPx = read(mask);

                // 1) Original glass mask, hardened, with specks and holes closed
                let m = new Uint8Array(n);
                for (let i = 0; i < n; i++) m[i] = maskPx[i * 4 + 3] > maskThreshold ? 1 : 0;
                m = erode(dilate(m, w, h, closeRadius), w, h, closeRadius) as Uint8Array<ArrayBuffer>;

                // 2) Classify photo pixels using colour
                const inside = new Uint8Array(n); // dark = inside plant, sofa, frame
                const leaf = new Uint8Array(n); // light green = outside plant
                for (let i = 0; i < n; i++) {
                    const r = photo[i * 4];
                    const g = photo[i * 4 + 1];
                    const b = photo[i * 4 + 2];
                    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
                    if (lum < insideLum) inside[i] = 1;
                    else if (g > b + 4 && g >= r * 0.95) leaf[i] = 1;
                }
                const protect = dilate(inside, w, h, 1); // also protects anti-aliased leaf edges

                // 3) Combine
                const grown = dilate(m, w, h, grow);
                const zone = dilate(m, w, h, reach);
                const alpha = new Float32Array(n);
                for (let i = 0; i < n; i++) {
                    const on =
                        m[i] ||
                        (grown[i] && !protect[i]) ||
                        (zone[i] && leaf[i] && !protect[i]);
                    alpha[i] = on ? 1 : 0;
                }

                // 4) Smooth blocky edges, then re-sharpen with a narrow soft edge
                const sm = boxBlur(alpha, w, h, 2);
                const out = document.createElement("canvas");
                out.width = w;
                out.height = h;
                const octx = out.getContext("2d")!;
                const img = octx.createImageData(w, h);
                for (let i = 0; i < n; i++) {
                    const t = Math.min(1, Math.max(0, (sm[i] - 0.4) / 0.2));
                    const a = t * t * (3 - 2 * t);
                    img.data[i * 4] = 255;
                    img.data[i * 4 + 1] = 255;
                    img.data[i * 4 + 2] = 255;
                    img.data[i * 4 + 3] = Math.round(a * 255);
                }
                octx.putImageData(img, 0, 0);

                if (!cancelled) setMaskUrl(out.toDataURL("image/png"));
            } catch (e) {
                console.error("FrostLayer: could not build mask, using original", e);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [roomSrc, maskSrc, grow, reach, closeRadius, insideLum, maskThreshold]);

    const mask = `url(${maskUrl ?? maskSrc})`;

    return (
        <div
            data-hero-frost
            style={{
                opacity: 0,
                backgroundImage: `url(${frostSrc})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                WebkitMaskImage: mask,
                maskImage: mask,
                WebkitMaskSize: "cover",
                maskSize: "cover",
                WebkitMaskPosition: "center",
                maskPosition: "center",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
            }}
            className="pointer-events-none absolute inset-0"
            aria-hidden
        />
    );
}