"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LiquidGlass } from "@/components/liquid-glass";
import { TailwindJit } from "@/components/tailwind-jit";
import { CodeBlock } from "@/components/code-block";
import { CopyButton } from "@/components/copy-button";
import { PropSlider } from "@/components/prop-slider";
import { TintPalette } from "@/components/tint-palette";
import { PresetPreview } from "@/components/preset-preview";
import {
  BACKDROPS,
  BACKDROP_WORDS,
  PLAYGROUND_DEFAULTS,
  PRESETS,
  SLIDERS,
  TINTS,
  buildJsx,
  colorToHex,
  isHexColor,
  normalizeHex,
  type BackdropId,
  type GlassConfig,
  type PresetId,
} from "@/lib/props";

/** The scrollable surface behind the panel. Every preset is CSS — the elements
 *  here are only the pieces a gradient cannot draw. */
function BackdropCanvas({ id }: { id: BackdropId }) {
  return (
    <div className="pg-canvas" data-bg={id} aria-hidden="true">
      {id === "aurora" && (
        <>
          <span className="blob b1" />
          <span className="blob b2" />
          <span className="blob b3" />
        </>
      )}
      {id === "grid" && (
        <>
          <span className="grid-mark m1" />
          <span className="grid-mark m2" />
          <span className="grid-mark m3" />
        </>
      )}
      {id === "type" && (
        <div className="bg-type">
          {BACKDROP_WORDS.map((word, i) => (
            <span key={word} style={{ marginLeft: `${(i % 3) * 7 - 7}%` }}>
              {word} {word}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function Playground() {
  const [config, setConfig] = useState<GlassConfig>(PLAYGROUND_DEFAULTS);
  const [tab, setTab] = useState<"preview" | "code">("preview");
  const [backdrop, setBackdrop] = useState<BackdropId>("aurora");
  const [presetId, setPresetId] = useState<PresetId>("card");
  const [dragging, setDragging] = useState(false);
  const [customTint, setCustomTint] = useState(() => colorToHex(PLAYGROUND_DEFAULTS.tint));
  const [paletteOpen, setPaletteOpen] = useState(false);
  const tintRef = useRef<HTMLDivElement | null>(null);
  const paletteToggleRef = useRef<HTMLButtonElement | null>(null);

  /* The palette floats over the sliders, so a press anywhere outside the tint
     block, or Escape, puts it away. */
  useEffect(() => {
    if (!paletteOpen) return;
    const onDown = (e: PointerEvent) => {
      if (!tintRef.current?.contains(e.target as Node)) setPaletteOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setPaletteOpen(false);
      paletteToggleRef.current?.focus();
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [paletteOpen]);

  /** From the hex field or the palette — the glass only takes a valid hex. */
  const applyTint = (hex: string) => {
    setCustomTint(hex);
    if (isHexColor(hex)) setConfig((c) => ({ ...c, tint: hex }));
  };

  const { layerClassName, ...glassProps } = config;
  const named = TINTS.find((t) => t.value === config.tint);
  const active = BACKDROPS.find((b) => b.id === backdrop) ?? BACKDROPS[0];
  const preset = PRESETS.find((p) => p.id === presetId) ?? PRESETS[0];
  const jsx = buildJsx(config, preset);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const origin = useRef<{ x: number; y: number; left: number; top: number } | null>(null);

  /* The canvas overflows the stage on both axes, so park it in the middle on
     mount — the panel then sits over the centre of the artwork and there is
     room to pan in every direction. */
  const attachScroll = useCallback((el: HTMLDivElement | null) => {
    scrollRef.current = el;
    if (!el) return;
    el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    el.scrollTop = (el.scrollHeight - el.clientHeight) / 2;
  }, []);

  /* Touch already pans natively, with momentum — only pointer drags need this. */
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el || e.pointerType === "touch" || e.button !== 0) return;
    origin.current = { x: e.clientX, y: e.clientY, left: el.scrollLeft, top: el.scrollTop };
    el.setPointerCapture(e.pointerId);
    setDragging(true);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    const from = origin.current;
    if (!el || !from) return;
    el.scrollLeft = from.left - (e.clientX - from.x);
    el.scrollTop = from.top - (e.clientY - from.y);
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!origin.current) return;
    origin.current = null;
    if (el?.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    setDragging(false);
  };

  return (
    <>
      <TailwindJit />
      <div className="pg-head">
        <div>
          <h2>Playground</h2>
          <p>
            Every prop, live, starting from the component&apos;s own defaults. Switch to Code for the
            matching JSX.
          </p>
        </div>
        <button
          type="button"
          className="reset-btn"
          onClick={() => {
            // Defaults, with the geometry of whichever preset is showing.
            setConfig({ ...PLAYGROUND_DEFAULTS, ...preset.config });
            setCustomTint(colorToHex(PLAYGROUND_DEFAULTS.tint));
          }}
        >
          Reset to defaults
        </button>
      </div>

      <div className="pg-grid">
        <aside className="controls">
          <div className="controls-title">Props</div>

          <div className="tint-block" ref={tintRef}>
            <div className="control-label">
              <label>tint</label>
              <span className="control-value">{named ? named.name : config.tint}</span>
            </div>
            <div className="swatches">
              {TINTS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  className="swatch"
                  title={t.name}
                  aria-label={t.name}
                  data-on={config.tint === t.value}
                  style={{ background: `linear-gradient(${t.value}, ${t.value}), #0d0f1c` }}
                  onClick={() => {
                    setConfig((c) => ({ ...c, tint: t.value }));
                    setCustomTint(colorToHex(t.value));
                  }}
                />
              ))}
            </div>

            {/* Custom hex tint. The field keeps a leading "#" and only accepts
                hex digits; the swatch on the left previews the colour and the
                glass updates as soon as the value is a valid #RGB/#RRGGBB(AA).
                The swatch and the palette button both open the spectrum picker. */}
            <div className="tint-custom" data-valid={isHexColor(customTint)}>
              <span
                className="tint-preview"
                style={{ background: isHexColor(customTint) ? customTint : "transparent" }}
                aria-hidden="true"
                onClick={() => setPaletteOpen((o) => !o)}
              />
              <input
                type="text"
                className="tint-hex"
                value={customTint}
                spellCheck={false}
                autoComplete="off"
                aria-label="Custom hex tint"
                placeholder="#7c6cff"
                onChange={(e) => applyTint(normalizeHex(e.target.value))}
              />
              <button
                ref={paletteToggleRef}
                type="button"
                className="tint-palette-toggle"
                title="Colour palette"
                aria-label="Colour palette"
                aria-expanded={paletteOpen}
                aria-controls="tint-palette"
                data-on={paletteOpen}
                onClick={() => setPaletteOpen((o) => !o)}
              >
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M8 1.75a6.25 6.25 0 0 0 0 12.5c.85 0 1.35-.55 1.35-1.25 0-.85-.75-1.15-.75-1.95 0-.7.55-1.2 1.25-1.2h1.65a3.25 3.25 0 0 0 3.25-3.25C14.75 3.85 11.8 1.75 8 1.75Z"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinejoin="round"
                  />
                  <circle cx="4.75" cy="7.5" r="1" fill="currentColor" />
                  <circle cx="6.75" cy="4.6" r="1" fill="currentColor" />
                  <circle cx="10.1" cy="4.6" r="1" fill="currentColor" />
                </svg>
              </button>
            </div>

            <AnimatePresence>
              {paletteOpen && (
                <motion.div
                  id="tint-palette"
                  className="tint-popover"
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                >
                  <TintPalette value={customTint} onChange={applyTint} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="sliders">
            {SLIDERS.map((s) => (
              <PropSlider
                key={s.key}
                id={`prop-${s.key}`}
                label={s.key}
                value={config[s.key]}
                min={s.min}
                max={s.max}
                step={s.step}
                unit={s.unit}
                onChange={(v) => setConfig((c) => ({ ...c, [s.key]: v }))}
              />
            ))}
          </div>

          <div className="layer-field">
            <label htmlFor="prop-layer">layerClassName</label>
            <input
              id="prop-layer"
              type="text"
              placeholder="e.g. opacity-70 blur-sm mix-blend-overlay"
              value={config.layerClassName}
              onChange={(e) => setConfig((c) => ({ ...c, layerClassName: e.target.value }))}
            />
            <p>
              Passed through to each effect layer. Tailwind utility classes are compiled in the
              browser, so whatever you type applies live in the preview and in the generated code.
            </p>
          </div>
        </aside>

        <div className="panel">
          <div className="panel-bar">
            <div className="tabs">
              {(["preview", "code"] as const).map((name) => (
                <button
                  key={name}
                  type="button"
                  className="tab"
                  data-on={tab === name}
                  onClick={() => setTab(name)}
                >
                  {name === "preview" ? "Preview" : "Code"}
                </button>
              ))}
              <motion.div
                className="tab-underline"
                animate={{ x: tab === "code" ? 80 : 0 }}
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            </div>
            <CopyButton value={jsx} label="Copy code" />
          </div>

          <div className="panel-body">
            <AnimatePresence mode="wait" initial={false}>
              {tab === "preview" ? (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                  className="pg-stage"
                >
                  <div
                    ref={attachScroll}
                    className="pg-scroll"
                    data-drag={dragging}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                  >
                    <BackdropCanvas id={backdrop} />
                  </div>

                  {/* Held dead centre of the stage, outside the scroller, so the
                      backdrop moves and the glass does not. */}
                  <div className="stage-center">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={preset.id}
                        className="pg-card"
                        data-preset={preset.id}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <LiquidGlass {...glassProps} layerClassName={layerClassName || undefined}>
                          <PresetPreview id={preset.id} />
                        </LiquidGlass>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <div className="pg-presetbar" role="group" aria-label="Preview element">
                    {PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className="bg-chip"
                        data-on={presetId === p.id}
                        aria-pressed={presetId === p.id}
                        onClick={() => {
                          setPresetId(p.id);
                          setConfig((c) => ({ ...c, ...p.config }));
                        }}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>

                  <div className="pg-bgbar" role="group" aria-label="Preview backdrop">
                    {BACKDROPS.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        className="bg-chip"
                        data-on={backdrop === b.id}
                        aria-pressed={backdrop === b.id}
                        onClick={() => setBackdrop(b.id)}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>

                  <div className="stage-note right">{active.note} · drag to pan</div>
                </motion.div>
              ) : (
                <motion.div
                  key="code"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                  className="code-pane"
                >
                  <CodeBlock code={jsx} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}
