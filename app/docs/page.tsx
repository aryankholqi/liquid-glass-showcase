import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { CopyButton } from "@/components/copy-button";
import { Reveal } from "@/components/reveal";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import { INSTALL_COMMAND, PROP_ROWS, RECIPES, USAGE_SNIPPET } from "@/lib/props";
import { FIGMA_MAPPING, FIGMA_PLUGIN_URL, PULL_COMMAND, PULL_OPTIONS } from "@/lib/figma-plugin";

export const metadata: Metadata = {
  title: "Docs — liquid-glass-cli",
  description:
    "Installation, usage, props, the Liquid Glass Export Figma plugin and browser support for the Liquid Glass component.",
};

export default function DocsPage() {
  return (
    <>
      <SiteNav current="docs" />

      <div className="docs-shell wrap-narrow pad">
        <aside className="toc">
          <div className="toc-title">On this page</div>
          <a href="#install">Installation</a>
          <a href="#usage">Usage</a>
          <a href="#props">Props</a>
          <a href="#recipes">Recipes</a>
          <a href="#figma">Figma plugin</a>
          <a href="#figma-export">Export from Figma</a>
          <a href="#figma-pull">Pull into React</a>
          <a href="#figma-mapping">Figma → props</a>
          <a href="#support">Browser support</a>
        </aside>

        <main>
          <Reveal>
            <header className="docs-head">
              <div className="docs-kicker">Documentation</div>
              <h1>liquid-glass-cli</h1>
              <p>
                A CLI that copies an Apple iOS 26 style Liquid Glass component into your React
                project. The generated file is yours: no runtime package to install, no version to
                keep in step.
              </p>
            </header>
          </Reveal>

          <Reveal>
            <section id="install" className="docs-section">
              <h2>Installation</h2>
              <p>
                Run the CLI from your project root. It detects your framework, resolves the
                components directory and writes the file.
              </p>
              <div className="install">
                <span className="install-sigil">$</span>
                <code>{INSTALL_COMMAND}</code>
                <CopyButton value={INSTALL_COMMAND} />
              </div>
              <p style={{ fontSize: 12.5, color: "var(--color-neutral-600)", margin: "12px 0 0" }}>
                Writes <code>components/liquid-glass.tsx</code>. Re-running overwrites it, so keep
                local edits in a wrapper.
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section id="usage" className="docs-section">
              <h2>Usage</h2>
              <p>
                Import it and wrap anything. Every prop is optional — the defaults are the iOS 26
                material.
              </p>
              <div className="usage-pre">
                <CodeBlock code={USAGE_SNIPPET} />
              </div>
            </section>
          </Reveal>

          <Reveal>
            <section id="props" className="docs-section">
              <h2>Props</h2>
              <p>
                Eleven props, plus <code>children</code>. Tune them live in the{" "}
                <Link href="/#playground">playground</Link>.
              </p>
              <div className="props-table">
                <div className="props-head">
                  <span>Prop</span>
                  <span>Type</span>
                  <span>Default</span>
                  <span>Description</span>
                </div>
                {PROP_ROWS.map((row) => (
                  <div className="props-row" key={row.name}>
                    <span className="props-name">{row.name}</span>
                    <span className="props-type">{row.type}</span>
                    <span className="props-def">{row.def}</span>
                    <span className="props-desc">{row.desc}</span>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>

          <Reveal>
            <section id="recipes" className="docs-section">
              <h2>Recipes</h2>
              <div className="recipes">
                {RECIPES.map((r) => (
                  <div className="recipe" key={r.title}>
                    <h4>{r.title}</h4>
                    <p>{r.note}</p>
                    <code>{r.code}</code>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>

          <Reveal>
            <section id="figma" className="docs-section">
              <h2>Figma plugin</h2>
              <p>
                <strong>Liquid Glass Export</strong> turns a card that uses Figma&apos;s Glass effect
                into a <code>&lt;LiquidGlass&gt;</code> component. It reads the glass settings,
                geometry and content, so nobody has to retype values from the inspect panel.
              </p>
              <ol className="steps">
                <li>
                  <h4>Install it</h4>
                  <p>
                    Open <a href={FIGMA_PLUGIN_URL}>Liquid Glass Export</a> on Figma Community and
                    press <strong>Open in…</strong> or <strong>Save</strong>.
                  </p>
                </li>
                <li>
                  <h4>Run it</h4>
                  <p>
                    In any file, open <strong>Actions → Plugins → Liquid Glass Export</strong>. It
                    works in Design mode and in Dev Mode&apos;s inspect panel.
                  </p>
                </li>
              </ol>
            </section>
          </Reveal>

          <Reveal>
            <section id="figma-export" className="docs-section">
              <h2>Export from Figma</h2>
              <ol className="steps">
                <li>
                  <h4>Select one or more cards</h4>
                  <p>
                    The plugin lists every selected card with its glass values. Click a name to jump
                    to the layer.
                  </p>
                </li>
                <li>
                  <h4>Press Export</h4>
                  <p>
                    The cards are uploaded and the plugin shows a pull command with a 12-character
                    export ID. Press <strong>Copy command</strong> and send it to whoever builds the
                    UI.
                  </p>
                </li>
              </ol>
              <p>A layer counts as a card when:</p>
              <ul>
                <li>it carries a visible Glass effect itself — its children become the content, or</li>
                <li>
                  it is a frame whose child layer carries the Glass effect. The glass layer supplies
                  tint, corners and shadow. If it covers the frame, the frame supplies size and
                  layout; if it is smaller, the card takes the glass layer&apos;s size and only the
                  layers sitting on it.
                </li>
              </ul>
              <p>
                Auto layout, text and shapes become Tailwind markup, including stacked solid and
                gradient fills, solid strokes, drop and inner shadows, and layer and background
                blurs. Frames without auto layout are rebuilt from where their layers sit. Images
                and vectors are left as placeholders for you to export.
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section id="figma-pull" className="docs-section">
              <h2>Pull into React</h2>
              <p>
                Run the command from the plugin in your project root. It adds{" "}
                <code>liquid-glass</code> if the project doesn&apos;t have it yet, then writes each
                card to <code>components/glass/&lt;layer-name&gt;.tsx</code>.
              </p>
              <div className="install">
                <span className="install-sigil">$</span>
                <code>{PULL_COMMAND}</code>
              </div>
              <p style={{ margin: "16px 0" }}>Options:</p>
              <div className="props-table two">
                <div className="props-head">
                  <span>Option</span>
                  <span>Description</span>
                </div>
                {PULL_OPTIONS.map((row) => (
                  <div className="props-row" key={row.name}>
                    <span className="props-name">{row.name}</span>
                    <span className="props-desc">{row.desc}</span>
                  </div>
                ))}
              </div>
              <ul style={{ marginTop: 18 }}>
                <li>
                  Exports expire after 7 days, and pulling one doesn&apos;t delete it — the same
                  command works for the whole team that week.
                </li>
                <li>
                  Only need the code? <strong>Copy code</strong> next to a card generates the same
                  component inside the plugin, with no upload.
                </li>
                <li>
                  Saved an export spec to disk? <code>figma import &lt;file&gt;</code> generates
                  from it, and <code>-</code> reads stdin.
                </li>
                <li>
                  What an export contains and who can read it is in the{" "}
                  <Link href="/privacy">privacy policy</Link>.
                </li>
              </ul>
            </section>
          </Reveal>

          <Reveal>
            <section id="figma-mapping" className="docs-section">
              <h2>Figma → props</h2>
              <p>How each Glass setting lands on the component.</p>
              <div className="props-table two">
                <div className="props-head">
                  <span>Figma</span>
                  <span>LiquidGlass</span>
                </div>
                {FIGMA_MAPPING.map((row) => (
                  <div className="props-row" key={row.figma}>
                    <span className="props-name">{row.figma}</span>
                    <span className="props-desc">{row.prop}</span>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>

          <Reveal>
            <section id="support" className="docs-section support">
              <h2>Browser support</h2>
              <p>
                The refraction layer relies on an SVG displacement filter inside{" "}
                <code>backdrop-filter</code>. Firefox and Safari drop{" "}
                <code>backdrop-filter: url()</code> as invalid, which leaves that layer inert and
                lets the frost, tint and stroke below carry the effect on their own.
              </p>
              <div className="chips">
                <span className="chip on">Chrome · full</span>
                <span className="chip on">Edge · full</span>
                <span className="chip">Safari · partial</span>
                <span className="chip">Firefox · partial</span>
              </div>
            </section>
          </Reveal>
        </main>
      </div>

      <SiteFooter />
    </>
  );
}
