"use client";

import {
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { hexToHsva, hsvaToHex, type Hsva } from "@/lib/props";

type TintPaletteProps = {
  /** Current hex. While it is not a valid hex the palette keeps its last colour. */
  value: string;
  onChange: (hex: string) => void;
};

/** Distance from either end of a strip to the thumb's centre at 0 and 1. */
const INSET = 7;

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/** Where a pointer sits inside an element, as 0–1 on each axis. `inset` keeps
 *  the ends of a strip reachable under a thumb that never leaves the track. */
function pointerFraction(e: ReactPointerEvent<HTMLElement>, inset = 0) {
  const rect = e.currentTarget.getBoundingClientRect();
  return {
    x: clamp01((e.clientX - rect.left - inset) / Math.max(1, rect.width - inset * 2)),
    y: clamp01((e.clientY - rect.top) / Math.max(1, rect.height)),
  };
}

/** Pointer handlers that report every position from press to release. */
function dragHandlers(inset: number, onMove: (x: number, y: number) => void) {
  const track = (e: ReactPointerEvent<HTMLElement>) => {
    const { x, y } = pointerFraction(e, inset);
    onMove(x, y);
  };
  return {
    onPointerDown(e: ReactPointerEvent<HTMLElement>) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      track(e);
    },
    onPointerMove(e: ReactPointerEvent<HTMLElement>) {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) track(e);
    },
  };
}

/** Arrow keys as a signed step; Shift takes ten at a time. */
function arrowStep(e: ReactKeyboardEvent, axis: "x" | "y"): number {
  const keys = axis === "x" ? ["ArrowLeft", "ArrowRight"] : ["ArrowDown", "ArrowUp"];
  const dir = e.key === keys[1] ? 1 : e.key === keys[0] ? -1 : 0;
  if (dir) e.preventDefault();
  return dir * (e.shiftKey ? 10 : 1);
}

type StripProps = {
  label: string;
  className: string;
  /** 0–1 along the strip. */
  fraction: number;
  valueNow: number;
  valueMax: number;
  valueText: string;
  style?: CSSProperties;
  onFraction: (fraction: number) => void;
  /** One arrow-key step, as a fraction of the strip. */
  keyStep: number;
};

function Strip({ label, className, fraction, valueNow, valueMax, valueText, style, onFraction, keyStep }: StripProps) {
  return (
    <div
      className={`palette-strip ${className}`}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={valueMax}
      aria-valuenow={valueNow}
      aria-valuetext={valueText}
      style={{ ...style, "--p": fraction } as CSSProperties}
      {...dragHandlers(INSET, (x) => onFraction(x))}
      onKeyDown={(e) => {
        const step = arrowStep(e, "x") || arrowStep(e, "y");
        if (step) onFraction(clamp01(fraction + step * keyStep));
      }}
    >
      <span className="palette-thumb" aria-hidden="true" />
    </div>
  );
}

/**
 * A spectrum picker for the tint: a saturation/brightness field, a hue strip
 * and an alpha strip over a checkerboard. It holds its own HSVA so the hue
 * survives a trip through grey — a hex alone forgets it at zero saturation.
 */
export function TintPalette({ value, onChange }: TintPaletteProps) {
  const [hsva, setHsva] = useState<Hsva>(
    () => hexToHsva(value) ?? { h: 249, s: 0.39, v: 0.85, a: 0.18 },
  );
  const [seen, setSeen] = useState(value);

  /* Follow the hex when it changes from outside — a preset, the text field, a
     reset — but not when it is only the echo of what the palette just sent. */
  if (value !== seen) {
    setSeen(value);
    const next = hexToHsva(value);
    if (next && hsvaToHex(hsva) !== value.toLowerCase()) setHsva(next);
  }

  const update = (patch: Partial<Hsva>) => {
    const next = { ...hsva, ...patch };
    setHsva(next);
    const hex = hsvaToHex(next);
    if (hex !== value) onChange(hex);
  };

  const opaque = hsvaToHex({ ...hsva, a: 1 });
  const channels = [1, 3, 5].map((i) => parseInt(opaque.slice(i, i + 2), 16));
  const alpha = Math.round(hsva.a * 100) / 100;

  return (
    <div className="palette" style={{ "--hue": hsva.h, "--solid": opaque } as CSSProperties}>
      <div
        className="palette-area"
        role="slider"
        tabIndex={0}
        aria-label="Saturation and brightness"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(hsva.s * 100)}
        aria-valuetext={`Saturation ${Math.round(hsva.s * 100)}%, brightness ${Math.round(hsva.v * 100)}%`}
        {...dragHandlers(0, (x, y) => update({ s: x, v: 1 - y }))}
        onKeyDown={(e) => {
          const dx = arrowStep(e, "x");
          const dy = arrowStep(e, "y");
          if (dx) update({ s: clamp01(hsva.s + dx / 100) });
          if (dy) update({ v: clamp01(hsva.v + dy / 100) });
        }}
      >
        <span
          className="palette-thumb"
          style={{ left: `${hsva.s * 100}%`, top: `${(1 - hsva.v) * 100}%` }}
          aria-hidden="true"
        />
      </div>

      <Strip
        label="Hue"
        className="palette-hue"
        fraction={hsva.h / 360}
        valueNow={Math.round(hsva.h)}
        valueMax={360}
        valueText={`${Math.round(hsva.h)}°`}
        keyStep={1 / 360}
        onFraction={(f) => update({ h: f * 360 })}
      />
      <Strip
        label="Alpha"
        className="palette-alpha"
        fraction={hsva.a}
        valueNow={Math.round(hsva.a * 100)}
        valueMax={100}
        valueText={`${Math.round(hsva.a * 100)}%`}
        keyStep={1 / 100}
        onFraction={(f) => update({ a: f })}
      />

      <div className="palette-readout">
        <span>rgba({channels.join(", ")}, {alpha})</span>
        <span>{Math.round(hsva.a * 100)}%</span>
      </div>
    </div>
  );
}
