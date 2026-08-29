import Link from "next/link";

const GITHUB = "https://github.com/aryankholqi/liquid-glass-cli.git";
const NPM = "https://www.npmjs.com/package/liquid-glass-cli";

export function SiteNav({ current }: { current?: "home" | "docs" }) {
  return (
    <nav className="nav pad">
      <div className="nav-brand">
        <span className="nav-mark" />
        {current === "docs" ? (
          <>
            <Link href="/" className="nav-name">
              liquid-glass-cli
            </Link>
            <span style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>/</span>
            <span style={{ fontSize: 13, color: "var(--color-neutral-400)" }}>Docs</span>
          </>
        ) : (
          <>
            <span className="nav-name">liquid-glass-cli</span>
            <span className="nav-ver">v1.0</span>
          </>
        )}
      </div>
      <div className="nav-links">
        <Link className="nav-hide" href="/#playground">
          Playground
        </Link>
        {current === "docs" ? null : <Link href="/docs">Docs</Link>}
        <a className="nav-hide" href={GITHUB}>
          GitHub
        </a>
        <a className="nav-cta" href={NPM}>
          npm
        </a>
      </div>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="footer pad">
      <div className="footer-inner wrap">
        <div className="footer-brand">
          <i />
          liquid-glass-cli · MIT
        </div>
        <div className="footer-links">
          <Link href="/docs">Docs</Link>
          <a href={GITHUB}>GitHub</a>
          <a href={NPM}>npm</a>
        </div>
      </div>
    </footer>
  );
}
