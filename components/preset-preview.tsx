import type { PresetId } from "@/lib/props";

/* The preview sits in a pointer-transparent overlay, so none of this is
   interactive — controls are drawn with <i> and <span>, not buttons and links. */

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h9.5M8.5 3.5 13 8l-4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BubbleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M10 3.5c-4.14 0-7.5 2.74-7.5 6.12 0 1.9 1.06 3.6 2.72 4.72-.12 1-.6 1.94-1.34 2.66 1.72-.08 3.12-.66 4.1-1.46.66.14 1.34.2 2.02.2 4.14 0 7.5-2.74 7.5-6.12S14.14 3.5 10 3.5Z"
        fill="#fff"
      />
    </svg>
  );
}

function TransportIcon({ kind }: { kind: "prev" | "pause" | "next" }) {
  return (
    <svg width={kind === "pause" ? 22 : 20} height={kind === "pause" ? 22 : 20} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      {kind === "pause" ? (
        <>
          <rect x="5" y="3.5" width="3.4" height="13" rx="1.1" />
          <rect x="11.6" y="3.5" width="3.4" height="13" rx="1.1" />
        </>
      ) : (
        <g transform={kind === "prev" ? "matrix(-1 0 0 1 20 0)" : undefined}>
          <path d="M3 5.1c0-.8.87-1.3 1.56-.9l6.1 3.9c.62.4.62 1.4 0 1.8l-6.1 3.9C3.87 14.2 3 13.7 3 12.9V5.1Z" transform="translate(0 1)" />
          <rect x="13.4" y="4.5" width="2.6" height="11" rx="1" />
        </g>
      )}
    </svg>
  );
}

/** The element under the glass for each playground preset. */
export function PresetPreview({ id }: { id: PresetId }) {
  switch (id) {
    case "button":
      return (
        <span className="pv-button">
          Get started
          <ArrowIcon />
        </span>
      );

    case "navbar":
      return (
        <div className="pv-nav">
          <span className="pv-nav-brand">
            <i className="pv-nav-logo" />
            Glass
          </span>
          <span className="pv-nav-links">
            <i data-on="true">Home</i>
            <i>Docs</i>
            <i>Pricing</i>
          </span>
          <i className="pv-nav-cta">Sign in</i>
        </div>
      );

    case "notification":
      return (
        <div className="pv-note">
          <span className="pv-note-icon">
            <BubbleIcon />
          </span>
          <div className="pv-note-body">
            <div className="pv-note-head">
              <b>Messages</b>
              <span>now</span>
            </div>
            <p>Sam: The glass build is live — take a look?</p>
          </div>
        </div>
      );

    case "player":
      return (
        <div className="pv-player">
          <div className="pv-player-track">
            <span className="pv-player-art" />
            <div className="pv-player-meta">
              <b>Refraction</b>
              <span>Glass Arcade</span>
            </div>
          </div>
          <div className="pv-player-progress">
            <span />
          </div>
          <div className="pv-player-controls">
            <TransportIcon kind="prev" />
            <TransportIcon kind="pause" />
            <TransportIcon kind="next" />
          </div>
        </div>
      );

    default:
      return (
        <div className="pg-card-inner">
          <div className="card-row" style={{ marginBottom: 14 }}>
            <h3>Liquid Glass</h3>
            <span className="pg-live">live</span>
          </div>
          <p>
            Drag the backdrop under the panel and the rim answers — the displacement map is
            rebuilt from the component&apos;s measured size.
          </p>
          <div className="pg-actions">
            <i className="primary">Continue</i>
            <i className="ghost">Later</i>
          </div>
        </div>
      );
  }
}
