import Link from "next/link";
import { HeroDemo, Typewriter } from "@/components/hero-demo";
import { Playground } from "@/components/playground";
import { Reveal } from "@/components/reveal";
import { CopyButton } from "@/components/copy-button";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import { INSTALL_COMMAND } from "@/lib/props";

const FEATURES = [
  {
    n: "01",
    title: "You own the source",
    body: "The CLI writes the component into your components folder. Nothing to import from node_modules, nothing to wait on for a fix.",
  },
  {
    n: "02",
    title: "Real refraction",
    body: "A generated displacement map bends the backdrop in a band around the edges, so the glass distorts the page instead of merely blurring it.",
  },
  {
    n: "03",
    title: "Channels split at the edge",
    body: "Red, green and blue are displaced by slightly different amounts and screened back together. That split is the dispersion prop.",
  },
  {
    n: "04",
    title: "Masks belong on the layers",
    body: "A mask on the container would form a backdrop root and blank the effect out, so layerClassName reaches each effect layer instead.",
  },
];

export default function Home() {
  return (
    <>
      <SiteNav current="home" />

      <header className="hero-section pad">
        <div className="hero-bg">
          <span className="b1" />
          <span className="b2" />
        </div>
        <div className="hero wrap">
          <div>
            <Reveal>
              <div className="badge">
                <i />
                Apple iOS 26 glass, in your own codebase
              </div>
            </Reveal>
            <Reveal index={1}>
              <h1>Liquid Glass, copied into your project.</h1>
            </Reveal>
            <Reveal index={2}>
              <p className="hero-lede">
                One command drops the component source into your repo — no runtime dependency, no
                wrapper, no lock-in. Own the file, edit the file. Eleven props cover refraction,
                depth, dispersion and light.
              </p>
            </Reveal>
            <Reveal index={3}>
              <div className="hero-install">
                <div className="install">
                  <span className="install-sigil">$</span>
                  <Typewriter />
                  <CopyButton value={INSTALL_COMMAND} />
                </div>
                <div className="hero-facts">
                  <span>0 runtime deps</span>
                  <span>·</span>
                  <span>React 18+</span>
                  <span>·</span>
                  <span>MIT</span>
                </div>
              </div>
            </Reveal>
            <Reveal index={2}>
              <div className="cta-row">
                <Link className="btn-outline" href="#playground">
                  Open the playground
                </Link>
                <Link className="btn-quiet" href="/docs">
                  Read the docs
                </Link>
              </div>
            </Reveal>
          </div>

          <Reveal index={1}>
            <HeroDemo />
          </Reveal>
        </div>
      </header>

      <section className="features-section pad">
        <div className="features wrap">
          {FEATURES.map((f, i) => (
            <Reveal key={f.n} index={i} className="feature">
              <div className="feature-n">{f.n}</div>
              <h4>{f.title}</h4>
              <p>{f.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="playground" className="pg-section pad">
        <div className="wrap">
          <Playground />
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
