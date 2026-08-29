"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";

export interface LiquidGlassProps {
  children?: ReactNode;
  /** Fill layered on top of the refracted backdrop. Any CSS colour. */
  tint?: string;
  /** Corner radius in pixels. */
  cornerRadius?: number;
  /** How strongly the backdrop bends at the edges. 0–100. */
  refraction?: number;
  /** Thickness of the refracting edge band — the perceived glass depth. 0–100. */
  depth?: number;
  /** Chromatic aberration: how far the red and blue channels split apart. 0–100. */
  dispersion?: number;
  /** Backdrop blur in pixels. */
  frost?: number;
  /** How softly the refracting band fades into the flat centre. 0–100. */
  splay?: number;
  /** Direction the specular highlight comes from, in degrees. */
  lightAngle?: number;
  /** Strength of the specular highlight and the gradient stroke. 0–100. */
  lightIntensity?: number;
  /** Width of the inside gradient stroke in pixels. */
  borderWidth?: number;
  /**
   * Applied to each effect layer rather than to the container — a mask on the
   * container would form a backdrop root and blank the effect out.
   */
  layerClassName?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Displacement map: red ramps horizontally, blue vertically, and a blurred
 * neutral rect flattens the centre so the bend survives only in a band around
 * the edge. `depth` sets the band width, `splay` how softly it fades.
 */
function buildDisplacementMap(
  width: number,
  height: number,
  radius: number,
  depth: number,
  splay: number
): string {
  const band = Math.max(2, (depth / 100) * Math.min(width, height) * 0.4);
  const blur = Math.max(0.5, (splay / 100) * band);
  const innerRadius = Math.max(0, radius - band);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    `<defs>` +
    `<linearGradient id="x" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#000000"/><stop offset="100%" stop-color="#ff0000"/></linearGradient>` +
    `<linearGradient id="y" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#000000"/><stop offset="100%" stop-color="#0000ff"/></linearGradient>` +
    `<filter id="soften" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="${blur}"/></filter>` +
    `</defs>` +
    `<rect width="${width}" height="${height}" fill="#000000"/>` +
    `<rect width="${width}" height="${height}" fill="url(#x)" style="mix-blend-mode:screen"/>` +
    `<rect width="${width}" height="${height}" fill="url(#y)" style="mix-blend-mode:screen"/>` +
    `<rect x="${band}" y="${band}" width="${Math.max(0, width - band * 2)}" height="${Math.max(
      0,
      height - band * 2
    )}" rx="${innerRadius}" fill="#808080" filter="url(#soften)"/>` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function LiquidGlass({
  children,
  tint = "rgba(17, 21, 27, 0.8)",
  cornerRadius = 0,
  refraction = 100,
  depth = 100,
  dispersion = 100,
  frost = 7,
  splay = 40,
  lightAngle = -35,
  lightIntensity = 50,
  borderWidth = 1,
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

  const measured = size.width > 0 && size.height > 0;
  const scale = (refraction / 100) * Math.min(Math.min(size.width, size.height) * 0.6, 100);
  const spread = (dispersion / 100) * 0.18;

  const radians = (lightAngle * Math.PI) / 180;
  const highlight = (lightIntensity / 100) * 0.55;
  const offsetX = Math.cos(radians) * 2;
  const offsetY = Math.sin(radians) * 2;

  const layer: CSSProperties = {
    position: "absolute",
    inset: 0,
    borderRadius: "inherit",
    pointerEvents: "none",
  };

  return (
    <div
      ref={hostRef}
      className={className}
      style={{ position: "relative", borderRadius: cornerRadius, ...style }}
    >
      {measured && (
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
                href={buildDisplacementMap(size.width, size.height, cornerRadius, depth, splay)}
                x="0"
                y="0"
                width={size.width}
                height={size.height}
                preserveAspectRatio="none"
                result="map"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="map"
                scale={scale * (1 + spread)}
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
                scale={scale}
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
                scale={scale * (1 - spread)}
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
              <feBlend in="rg" in2="cB" mode="screen" />
            </filter>
          </defs>
        </svg>
      )}

      {/* refraction */}
      <div
        aria-hidden="true"
        className={layerClassName}
        style={{
          ...layer,
          backdropFilter: measured ? `url(#${filterId})` : undefined,
          WebkitBackdropFilter: measured ? `url(#${filterId})` : undefined,
        }}
      />

      {/* frost + tint + inner shading */}
      <div
        aria-hidden="true"
        className={layerClassName}
        style={{
          ...layer,
          background: tint,
          backdropFilter: `blur(${frost / 2}px)`,
          WebkitBackdropFilter: `blur(${frost / 2}px)`,
          boxShadow: [
            `inset ${offsetX.toFixed(2)}px ${offsetY.toFixed(2)}px ${(8 + depth / 8).toFixed(
              2
            )}px 0 rgba(255, 255, 255, ${(highlight * 0.35).toFixed(3)})`,
            `inset ${(-offsetX).toFixed(2)}px ${(-offsetY).toFixed(2)}px ${(10 + depth / 6).toFixed(
              2
            )}px 0 rgba(0, 0, 0, ${(0.22 * (lightIntensity / 100)).toFixed(3)})`,
          ].join(", "),
        }}
      />

      {/* gradient stroke, drawn inside the box */}
      {borderWidth > 0 && (
        <div
          aria-hidden="true"
          className={layerClassName}
          style={{
            ...layer,
            padding: borderWidth,
            background: `linear-gradient(${lightAngle + 90}deg, rgba(255,255,255,${highlight.toFixed(
              3
            )}) 0%, rgba(255,255,255,${(highlight * 0.12).toFixed(3)}) 38%, rgba(255,255,255,${(
              highlight * 0.08
            ).toFixed(3)}) 62%, rgba(255,255,255,${(highlight * 0.75).toFixed(3)}) 100%)`,
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
            WebkitMaskComposite: "xor",
          }}
        />
      )}

      <div style={{ position: "relative" }}>{children}</div>
    </div>
  );
}

export default LiquidGlass;
