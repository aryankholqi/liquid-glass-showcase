import { PULL_EXAMPLE } from "@/lib/figma-plugin";

const VALUES = [
  ["Refraction", "0.80"],
  ["Depth", "62"],
  ["Dispersion", "0.50"],
  ["Frost", "12"],
  ["Light", "−45°"],
  ["Intensity", "0.40"],
];

/** A static picture of the plugin window, drawn in markup so it stays crisp at any size. */
export function FigmaPluginMock() {
  return (
    <div className="stage fp-stage" role="img" aria-label="The Liquid Glass Export plugin window in Figma, showing a selected glass card and the pull command it produced">
      <div className="stage-bg" />
      <span className="g1" />
      <span className="g2" />
      <div className="fp-window" aria-hidden="true">
        <div className="fp-titlebar">
          <span className="fp-logo" />
          Liquid Glass Export
          <span className="fp-close">×</span>
        </div>

        <div className="fp-section">
          <div className="fp-h">Glass layers</div>
          <div className="fp-card">
            <div className="fp-card-head">
              <b>Now Playing</b>
              <span className="fp-btn">Copy code</span>
            </div>
            <div className="fp-values">
              {VALUES.map(([label, value]) => (
                <div key={label}>
                  <span>{label}</span>
                  {value}
                </div>
              ))}
            </div>
          </div>
          <span className="fp-btn primary fp-export">Export</span>
        </div>

        <div className="fp-section">
          <div className="fp-h">Send this to your developer</div>
          <pre className="fp-command">{PULL_EXAMPLE}</pre>
          <div className="fp-foot">
            <span>Expires in 7 days</span>
            <span className="fp-btn primary">Copy command</span>
          </div>
        </div>
      </div>
    </div>
  );
}
