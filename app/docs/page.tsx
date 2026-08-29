import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { CopyButton } from "@/components/copy-button";
import { Reveal } from "@/components/reveal";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import { INSTALL_COMMAND, PROP_ROWS, RECIPES, USAGE_SNIPPET } from "@/lib/props";

export const metadata: Metadata = {
  title: "Docs — liquid-glass-cli",
  description: "Installation, usage, props and browser support for the Liquid Glass component.",
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
