"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

export interface LiquidGlassProps {
  children?: ReactNode;
  /** Fill layered on top of the refracted backdrop. Any CSS colour. */
  tint?: string;
  /** Corner radius in pixels. */
  cornerRadius?: number;
  /** Continuity of the corner curve — 0 is a plain circular arc, 100 a full squircle. */
  cornerSmoothing?: number;
  /** How strongly the backdrop bends at the edges. 0–100. */
  refraction?: number;
  /** Thickness of the refracting edge band — the perceived glass depth. 0–100. */
  depth?: number;
  /** Chromatic aberration: how far the red and blue channels split apart. 0–100. */
  dispersion?: number;
  /** Backdrop blur in pixels. */
  frost?: number;
  /** How far the bend spreads inward from the rim. 0 is a crisp lens, 100 a wide swell. 0–100. */
  splay?: number;
  /** Direction the specular highlight comes from, in degrees. */
  lightAngle?: number;
  /** Strength of the specular highlight and the rim stroke. 0–100. */
  lightIntensity?: number;
  /** Width of the inside rim stroke in pixels. */
  borderWidth?: number;
  /** Height of the drop shadow cast behind the panel. 0–100. */
  elevation?: number;
  /**
   * Applied to each effect layer rather than to the container — a mask on the
   * container would form a backdrop root and blank the effect out.
   */
  layerClassName?: string;
  className?: string;
  style?: CSSProperties;
}

/** Largest displacement map we rasterise; bigger elements sample a scaled copy. */
const MAP_MAX = 512;
/** Refractive index of the bevel. Roughly crown glass. */
const IOR = 1.46;
/** Deviation at a grazing rim, used to normalise the profile to 0–1. */
const MAX_DEVIATION = Math.tan(Math.PI / 2 - Math.asin(1 / IOR));

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Superellipse exponent for a smoothing amount. 2 is a circular corner. */
function cornerExponent(cornerSmoothing: number) {
  return 2 + clamp01(cornerSmoothing / 100) * 3.2;
}

/**
 * Signed distance to a superellipse-cornered rectangle centred on the origin.
 * Negative inside. At n = 2 this is the exact rounded-rect distance; above that
 * the corner switches to an Lp norm, which is the squircle Apple draws.
 */
function sdSuperRect(
  px: number,
  py: number,
  hw: number,
  hh: number,
  r: number,
  n: number
): number {
  const qx = Math.abs(px) - hw + r;
  const qy = Math.abs(py) - hh + r;
  if (qx > 0 && qy > 0) {
    return Math.pow(Math.pow(qx, n) + Math.pow(qy, n), 1 / n) - r;
  }
  return Math.min(Math.max(qx, qy), 0) + Math.max(qx, 0) + Math.max(qy, 0) - r;
}

/**
 * The same shape as an SVG path, sampled straight off the superellipse so the
 * silhouette, the rim stroke and the displacement map always agree.
 */
function squirclePath(w: number, h: number, radius: number, n: number): string {
  const r = Math.max(0, Math.min(radius, Math.min(w, h) / 2));
  const p = (v: number) => v.toFixed(2);
  if (r < 0.5) return `M0 0H${p(w)}V${p(h)}H0Z`;

  const SEGMENTS = 20;
  const arc = (point: (f: number, g: number) => [number, number]) => {
    let out = "";
    for (let i = 1; i <= SEGMENTS; i++) {
      const t = (i / SEGMENTS) * (Math.PI / 2);
      const [x, y] = point(Math.pow(Math.sin(t), 2 / n), Math.pow(Math.cos(t), 2 / n));
      out += `L${p(x)} ${p(y)}`;
    }
    return out;
  };

  return (
    `M${p(r)} 0L${p(w - r)} 0` +
    arc((f, g) => [w - r + r * f, r - r * g]) +
    `L${p(w)} ${p(h - r)}` +
    arc((f, g) => [w - r + r * g, h - r + r * f]) +
    `L${p(r)} ${p(h)}` +
    arc((f, g) => [r - r * f, h - r + r * g]) +
    `L0 ${p(r)}` +
    arc((f, g) => [r - r * g, r - r * f]) +
    "Z"
  );
}

/**
 * Displacement map. Every pixel inside the edge band stores the shape's outward
 * normal scaled by how hard a ray bends at that point on the bevel, so the
 * backdrop is pulled around the corners along the true surface direction rather
 * than along the x and y axes.
 *
 * The bevel is modelled as a quarter-round of thickness `band`: at depth u into
 * it (0 at the rim, 1 at the inner edge) the surface tilts by asin(1 - u), and
 * Snell's law turns that tilt into a deviation that climbs steeply over the
 * last few pixels. That concentration is what reads as liquid.
 */
function buildDisplacementMap(
  width: number,
  height: number,
  radius: number,
  band: number,
  splay: number,
  n: number
): string {
  const fit = Math.min(1, MAP_MAX / Math.max(width, height));
  const w = Math.max(2, Math.round(width * fit));
  const h = Math.max(2, Math.round(height * fit));
  const r = Math.max(0, Math.min(radius, Math.min(width, height) / 2)) * fit;
  const t = Math.max(1, band * fit);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const image = ctx.createImageData(w, h);
  const data = image.data;
  const hw = w / 2;
  const hh = h / 2;
  // splay flattens the profile's shoulder, spreading the bend further inward.
  const shoulder = 1 - 0.62 * clamp01(splay / 100);
  const eps = 0.75;

  for (let y = 0; y < h; y++) {
    const py = y + 0.5 - hh;
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const px = x + 0.5 - hw;
      let red = 128;
      let blue = 128;
      const raw = sdSuperRect(px, py, hw, hh, r, n);

      if (raw > -t * 1.4 && raw < t) {
        const gx =
          sdSuperRect(px + eps, py, hw, hh, r, n) - sdSuperRect(px - eps, py, hw, hh, r, n);
        const gy =
          sdSuperRect(px, py + eps, hw, hh, r, n) - sdSuperRect(px, py - eps, hw, hh, r, n);
        const glen = Math.hypot(gx, gy) || 1;
        // The Lp norm overstates distance in the corners; dividing by the
        // gradient length rescales it back to true pixels.
        const dist = (raw * 2 * eps) / glen;

        if (dist < 0.5) {
          const u = clamp01(-dist / t);
          const tilt = Math.asin(clamp01(1 - u));
          const deviation = Math.tan(tilt - Math.asin(Math.sin(tilt) / IOR)) / MAX_DEVIATION;
          // Snell's curve reaches zero with slope to spare, which would leave a
          // visible crease where the band meets the flat centre. Smoothstep the
          // inner third so both the offset and its gradient land at zero.
          const k = clamp01((1 - u) / 0.35);
          let m = Math.pow(clamp01(deviation), shoulder) * k * k * (3 - 2 * k);
          // Feather the outermost pixel so the rim does not alias.
          if (dist > -0.5) m *= clamp01(0.5 - dist);
          red = Math.round(128 + 127 * (gx / glen) * m);
          blue = Math.round(128 + 127 * (gy / glen) * m);
        }
      }

      data[i] = red;
      data[i + 1] = 128;
      data[i + 2] = blue;
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL();
}

/** A CSS mask that keeps only a band hugging the shape's outline. */
function outlineMask(w: number, h: number, path: string, width: number, blur: number): string {
  const stroke = (sw: number, opacity: number) =>
    `<path d="${path}" fill="none" stroke="#fff" stroke-opacity="${opacity}" stroke-width="${sw.toFixed(
      2
    )}"/>`;
  const body =
    blur > 0
      ? stroke(width, 0.28) + stroke(width * 0.55, 0.55) + stroke(width * 0.22, 1)
      : stroke(width, 1);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    (blur > 0
      ? `<defs><filter id="s" x="-50%" y="-50%" width="200%" height="200%">` +
        `<feGaussianBlur stdDeviation="${blur.toFixed(2)}"/></filter></defs>` +
        `<g filter="url(#s)">${body}</g>`
      : body) +
    `</svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

/**
 * Specular ring. A lit bevel flares where its normal faces the light, then
 * again — more faintly — on the far arc where the light leaves the glass. That
 * twin highlight is what makes Apple's edges read as a solid rim of material
 * rather than a drawn border.
 */
function specularRing(angle: number, peak: number): string {
  const stops: [number, number][] = [
    [1, 0],
    [0.34, 44],
    [0.09, 88],
    [0.28, 138],
    [0.62, 180],
    [0.28, 222],
    [0.09, 272],
    [0.34, 316],
    [1, 360],
  ];
  const body = stops
    .map(([k, deg]) => `rgba(255,255,255,${Math.min(1, peak * k).toFixed(3)}) ${deg}deg`)
    .join(",");
  return `conic-gradient(from ${angle + 90}deg at 50% 50%, ${body})`;
}

export function LiquidGlass({
  children,
  tint = "rgba(17, 21, 27, 0.8)",
  cornerRadius = 0,
  cornerSmoothing = 60,
  refraction = 100,
  depth = 60,
  dispersion = 70,
  frost = 7,
  splay = 30,
  lightAngle = -35,
  lightIntensity = 50,
  borderWidth = 1,
  elevation = 20,
  layerClassName,
  className,
  style,
}: LiquidGlassProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const rawId = useId();
  const filterId = `lg-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize((prev) => {
        const next = { width: Math.round(width), height: Math.round(height) };
        return prev.width === next.width && prev.height === next.height ? prev : next;
      });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { width, height } = size;
  const measured = width > 1 && height > 1;
  const exponent = cornerExponent(cornerSmoothing);
  // The bevel is a fixed slice of the smaller side, capped so large panels keep
  // a rim instead of turning into one big lens.
  const band = Math.max(2, (depth / 100) * Math.min(Math.min(width, height) * 0.18, 26));

  const shape = useMemo(
    () => (measured ? squirclePath(width, height, cornerRadius, exponent) : ""),
    [measured, width, height, cornerRadius, exponent]
  );

  const map = useMemo(
    () => (measured ? buildDisplacementMap(width, height, cornerRadius, band, splay, exponent) : ""),
    [measured, width, height, cornerRadius, band, splay, exponent]
  );

  const ready = measured && map !== "";
  // feDisplacementMap moves a pixel by scale * (channel - 0.5) and the map only
  // reaches 127/255 at the rim, so double the offset we actually want there.
  const displacement = (refraction / 100) * band * 2;
  const spread = (dispersion / 100) * 0.1;

  const radians = (lightAngle * Math.PI) / 180;
  const dirX = Math.cos(radians);
  const dirY = Math.sin(radians);
  const light = clamp01(lightIntensity / 100);
  const bevel = Math.max(1, band * 0.42);

  const clip: CSSProperties = shape
    ? { clipPath: `path("${shape}")`, WebkitClipPath: `path("${shape}")` }
    : {};

  const layer: CSSProperties = {
    position: "absolute",
    inset: 0,
    borderRadius: "inherit",
    pointerEvents: "none",
    ...clip,
  };

  const maskLayer = (maskWidth: number, blur: number, peak: number): CSSProperties => {
    const mask = outlineMask(width, height, shape, maskWidth, blur);
    return {
      ...layer,
      background: specularRing(lightAngle, peak),
      maskImage: mask,
      WebkitMaskImage: mask,
      maskSize: "100% 100%",
      WebkitMaskSize: "100% 100%",
      maskRepeat: "no-repeat",
      WebkitMaskRepeat: "no-repeat",
    };
  };

  return (
    <div
      ref={hostRef}
      className={className}
      style={{ position: "relative", borderRadius: cornerRadius, ...style }}
    >
      {ready && (
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
          <defs>
            <filter
              id={filterId}
              x="0%"
              y="0%"
              width="100%"
              height="100%"
              colorInterpolationFilters="sRGB"
            >
              <feImage
                href={map}
                x="0"
                y="0"
                width={width}
                height={height}
                preserveAspectRatio="none"
                result="map"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="map"
                scale={displacement * (1 + spread)}
                xChannelSelector="R"
                yChannelSelector="B"
                result="dR"
              />
              <feColorMatrix
                in="dR"
                type="matrix"
                values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0"
                result="cR"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="map"
                scale={displacement}
                xChannelSelector="R"
                yChannelSelector="B"
                result="dG"
              />
              <feColorMatrix
                in="dG"
                type="matrix"
                values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0"
                result="cG"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="map"
                scale={displacement * (1 - spread)}
                xChannelSelector="R"
                yChannelSelector="B"
                result="dB"
              />
              <feColorMatrix
                in="dB"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0"
                result="cB"
              />
              <feBlend in="cR" in2="cG" mode="screen" result="rg" />
              <feBlend in="rg" in2="cB" mode="screen" result="rgb" />
              {/* Smooths the 8-bit steps in the map without softening the panel. */}
              <feGaussianBlur in="rgb" stdDeviation="0.35" />
            </filter>
          </defs>
        </svg>
      )}

      {/* lift off the backdrop */}
      {elevation > 0 && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            pointerEvents: "none",
            boxShadow: [
              `0 ${(elevation * 0.45).toFixed(1)}px ${(elevation * 1.15).toFixed(1)}px ${(
                -elevation * 0.35
              ).toFixed(1)}px rgba(0,0,0,0.34)`,
              `0 ${(elevation * 0.12).toFixed(1)}px ${(elevation * 0.3).toFixed(1)}px ${(
                -elevation * 0.1
              ).toFixed(1)}px rgba(0,0,0,0.2)`,
            ].join(", "),
          }}
        />
      )}

      {/* refraction */}
      <div
        aria-hidden="true"
        className={layerClassName}
        style={{
          ...layer,
          backdropFilter: ready ? `url(#${filterId})` : undefined,
          WebkitBackdropFilter: ready ? `url(#${filterId})` : undefined,
        }}
      />

      {/* frost + tint + bevel shading */}
      <div
        aria-hidden="true"
        className={layerClassName}
        style={{
          ...layer,
          background: tint,
          backdropFilter: `blur(${frost}px) saturate(1.55)`,
          WebkitBackdropFilter: `blur(${frost}px) saturate(1.55)`,
          boxShadow: [
            `inset ${(dirX * bevel).toFixed(2)}px ${(dirY * bevel).toFixed(2)}px ${(
              bevel * 1.15
            ).toFixed(2)}px ${(-bevel * 0.45).toFixed(2)}px rgba(255,255,255,${(
              0.3 * light
            ).toFixed(3)})`,
            `inset ${(-dirX * bevel).toFixed(2)}px ${(-dirY * bevel).toFixed(2)}px ${(
              bevel * 1.15
            ).toFixed(2)}px ${(-bevel * 0.6).toFixed(2)}px rgba(255,255,255,${(
              0.12 * light
            ).toFixed(3)})`,
            `inset 0 0 ${(bevel * 0.9).toFixed(2)}px rgba(0,0,0,${(0.1 * light).toFixed(3)})`,
          ].join(", "),
        }}
      />

      {/* the lit bevel — a soft specular band following the outline */}
      {ready && band > 2 && (
        <div
          aria-hidden="true"
          className={layerClassName}
          style={maskLayer(band * 1.2, band * 0.3, 0.24 * light)}
        />
      )}

      {/* crisp rim stroke, drawn inside the outline */}
      {ready && borderWidth > 0 && (
        <div
          aria-hidden="true"
          className={layerClassName}
          style={maskLayer(borderWidth * 2, 0, 0.95 * light)}
        />
      )}

      <div style={{ position: "relative" }}>{children}</div>
    </div>
  );
}

export default LiquidGlass;
