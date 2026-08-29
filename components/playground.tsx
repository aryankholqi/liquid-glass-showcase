"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LiquidGlass } from "@/components/liquid-glass";
import { CodeBlock } from "@/components/code-block";
import { CopyButton } from "@/components/copy-button";
import { PLAYGROUND_DEFAULTS, SLIDERS, TINTS, buildJsx, type GlassConfig } from "@/lib/props";

export function Playground() {
  const [config, setConfig] = useState<GlassConfig>(PLAYGROUND_DEFAULTS);
  const [tab, setTab] = useState<"preview" | "code">("preview");

  const { layerClassName, ...glassProps } = config;
  const named = TINTS.find((t) => t.value === config.tint);
  const jsx = buildJsx(config);

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
        <button type="button" className="reset-btn" onClick={() => setConfig(PLAYGROUND_DEFAULTS)}>
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
                  onClick={() => setConfig((c) => ({ ...c, tint: t.value }))}
                />
              ))}
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
                  <div className="stage-bg" style={{ background: "linear-gradient(160deg,#141728,#0d0f1c)" }} />
                  <span className="g1" style={{ position: "absolute", top: "-25%", left: "-8%", width: "65%", height: "100%", background: "radial-gradient(closest-side,#7a6ae2,transparent 70%)", opacity: 0.9, animation: "lgdrift 20s ease-in-out infinite" }} />
                  <span className="g2" style={{ position: "absolute", bottom: "-30%", right: "-8%", width: "70%", height: "100%", background: "radial-gradient(closest-side,#2b86b4,transparent 70%)", opacity: 0.8, animation: "lgdrift2 26s ease-in-out infinite" }} />
                  <span className="g3" style={{ position: "absolute", top: "34%", left: "-5%", width: "60%", height: "60%", background: "radial-gradient(closest-side,#c95a8f,transparent 70%)", opacity: 0.5, animation: "lgdrift 31s ease-in-out infinite" }} />
                  <div className="stage-center">
                    <div className="pg-card">
                      <LiquidGlass {...glassProps} layerClassName={layerClassName || undefined}>
                        <div className="pg-card-inner">
                          <div className="card-row" style={{ marginBottom: 14 }}>
                            <h3>Liquid Glass</h3>
                            <span className="pg-live">live</span>
                          </div>
                          <p>
                            Drag the sliders and the surface answers immediately — the displacement
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
                  <div className="stage-note right">backdrop-filter + feDisplacementMap</div>
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
