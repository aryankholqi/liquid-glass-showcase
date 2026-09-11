"use client";

import { useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";

type PropSliderProps = {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
};

/** Distance from either end of the bar to the handle's centre at min and max. */
const INSET = 7;
/** A touch has to travel this far sideways before it counts as a drag. */
const TOUCH_SLOP = 4;

/** Most tick marks a bar gets before they stop reading as positions. */
const MAX_TICKS = 12;

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

/**
 * How many divisions to mark. A short range gets one per step, so every value
 * the handle can land on has its own tick — borderWidth's 0–4 shows four. A
 * long range gets the most divisions that each span a whole number of steps,
 * so a tick still sits on a real value: 0–64 in eights, −180–180 in thirties.
 */
function tickCount(min: number, max: number, step: number): number {
  const steps = Math.round((max - min) / step);
  if (steps <= MAX_TICKS) return Math.max(0, steps);
  for (let n = MAX_TICKS; n >= 4; n--) {
    if (steps % n === 0) return n;
  }
  return 10;
}

/**
 * A bar with the label, value, fill and handle all inside it. The native range
 * input stays underneath — invisible, and focused on press — so arrow keys and
 * screen readers get a real control. Pointer drags are handled here instead so
 * a press anywhere on the bar behaves the same everywhere, iOS included.
 */
export function PropSlider({ id, label, value, min, max, step, unit = "", onChange }: PropSliderProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  /* A touch only turns into a drag once it moves sideways — otherwise swiping
     down the controls to scroll would change every slider it crosses. */
  const press = useRef<{ x: number; y: number; armed: boolean } | null>(null);
  const [dragging, setDragging] = useState(false);
  /* Focusing the input from a press reads as keyboard focus to :focus-visible,
     so the ring is held back until the focus next comes from a key. */
  const [pointerFocus, setPointerFocus] = useState(false);

  const p = max > min ? clamp((value - min) / (max - min), 0, 1) : 0;
  const decimals = (String(step).split(".")[1] ?? "").length;
  const ticks = tickCount(min, max, step);

  const commit = (clientX: number) => {
    const el = barRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const t = clamp((clientX - rect.left - INSET) / Math.max(1, rect.width - INSET * 2), 0, 1);
    const snapped = min + Math.round((t * (max - min)) / step) * step;
    const next = clamp(Number(snapped.toFixed(decimals)), min, max);
    if (next !== value) onChange(next);
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const armed = e.pointerType === "mouse";
    press.current = { x: e.clientX, y: e.clientY, armed };
    e.currentTarget.setPointerCapture(e.pointerId);
    setPointerFocus(true);
    inputRef.current?.focus({ preventScroll: true });
    if (armed) {
      setDragging(true);
      commit(e.clientX);
    }
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const from = press.current;
    if (!from) return;
    if (!from.armed) {
      const dx = Math.abs(e.clientX - from.x);
      if (dx < TOUCH_SLOP || dx < Math.abs(e.clientY - from.y)) return;
      from.armed = true;
      setDragging(true);
    }
    commit(e.clientX);
  };

  const release = (e: ReactPointerEvent<HTMLDivElement>) => {
    press.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setDragging(false);
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    // A tap that never moved still sets the value where it landed.
    if (press.current) commit(e.clientX);
    release(e);
  };

  return (
    <div
      ref={barRef}
      className="prop-slider"
      data-drag={dragging}
      data-pointer-focus={pointerFocus}
      style={{ "--p": p } as CSSProperties}
      // Keeps the press from moving focus off the input it just focused, or
      // starting a text selection.
      onMouseDown={(e) => e.preventDefault()}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={release}
    >
      {/* The tick at min always sits under the fill, so it is skipped. */}
      {Array.from({ length: ticks }, (_, i) => (
        <span
          key={i}
          className="prop-slider-tick"
          style={{ "--t": (i + 1) / ticks } as CSSProperties}
          aria-hidden="true"
        />
      ))}
      <span className="prop-slider-fill" aria-hidden="true" />
      <label htmlFor={id} className="prop-slider-label">
        {label}
      </label>
      <span className="prop-slider-value" aria-hidden="true">
        {value}
        {unit}
      </span>
      <span className="prop-slider-handle" aria-hidden="true" />
      <input
        ref={inputRef}
        id={id}
        type="range"
        className="prop-slider-input"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={`${value}${unit}`}
        onChange={(e) => onChange(Number(e.target.value))}
        onKeyDown={() => setPointerFocus(false)}
        onBlur={() => setPointerFocus(false)}
      />
    </div>
  );
}
