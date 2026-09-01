"use client";

import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LiquidGlass } from "@/components/liquid-glass";
import { CodeBlock } from "@/components/code-block";
import { CopyButton } from "@/components/copy-button";
import {
  BACKDROPS,
  BACKDROP_WORDS,
  PLAYGROUND_DEFAULTS,
  SLIDERS,
  TINTS,
  buildJsx,
  colorToHex,
  isHexColor,
  normalizeHex,
  type BackdropId,
  type GlassConfig,
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
  const [dragging, setDragging] = useState(false);
  const [customTint, setCustomTint] = useState(() => colorToHex(PLAYGROUND_DEFAULTS.tint));

  const { layerClassName, ...glassProps } = config;
  const named = TINTS.find((t) => t.value === config.tint);
  const active = BACKDROPS.find((b) => b.id === backdrop) ?? BACKDROPS[0];
  const jsx = buildJsx(config);

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
            setConfig(PLAYGROUND_DEFAULTS);
            setCustomTint(colorToHex(PLAYGROUND_DEFAULTS.tint));
          }}
        >
          Reset to defaults
        </button>
      </div>

      <div className="pg-grid">
        <aside className="controls">
          <div className="controls-title">Props</div>

          <div className="tint-block">
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
                glass updates as soon as the value is a valid #RGB/#RRGGBB(AA). */}
            <div className="tint-custom" data-valid={isHexColor(customTint)}>
              <span
                className="tint-preview"
                style={{ background: isHexColor(customTint) ? customTint : "transparent" }}
                aria-hidden="true"
              />
              <input
                type="text"
                className="tint-hex"
                value={customTint}
                spellCheck={false}
                autoComplete="off"
                aria-label="Custom hex tint"
                placeholder="#7c6cff"
                onChange={(e) => {
                  const next = normalizeHex(e.target.value);
                  setCustomTint(next);
                  if (isHexColor(next)) setConfig((c) => ({ ...c, tint: next }));
                }}
              />
            </div>
          </div>

          <div className="sliders">
            {SLIDERS.map((s) => (
              <div key={s.key}>
                <div className="control-label">
                  <label htmlFor={`prop-${s.key}`}>{s.key}</label>
                  <span className="control-value">
                    {config[s.key]}
                    {s.unit}
                  </span>
                </div>
                <input
                  id={`prop-${s.key}`}
                  type="range"
                  min={s.min}
                  max={s.max}
                  step={s.step}
                  value={config[s.key]}
                  onChange={(e) => setConfig((c) => ({ ...c, [s.key]: Number(e.target.value) }))}
                />
              </div>
            ))}
          </div>

          <div className="layer-field">
            <label htmlFor="prop-layer">layerClassName</label>
            <input
              id="prop-layer"
              type="text"
              placeholder="e.g. mask-radial"
              value={config.layerClassName}
              onChange={(e) => setConfig((c) => ({ ...c, layerClassName: e.target.value }))}
            />
            <p>
              Passed through to each effect layer. Utility classes have no effect in this preview,
              but they appear in the generated code.
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
                    <div className="pg-card">
                      <LiquidGlass {...glassProps} layerClassName={layerClassName || undefined}>
                        <div className="pg-card-inner">
                          <div className="card-row" style={{ marginBottom: 14 }}>
                            <h3>Liquid Glass</h3>
                            <span className="pg-live">live</span>
                          </div>
                          <p>
                            Drag the backdrop under the panel and the rim answers — the displacement
                            map is rebuilt from the component&apos;s measured size.
                          </p>
                          <div className="pg-actions">
                            <i className="primary">Continue</i>
                            <i className="ghost">Later</i>
                          </div>
                        </div>
                      </LiquidGlass>
                    </div>
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
