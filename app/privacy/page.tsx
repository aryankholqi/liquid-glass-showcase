import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";
import { SiteFooter, SiteNav } from "@/components/site-chrome";

export const metadata: Metadata = {
  title: "Privacy — liquid-glass-cli",
  description:
    "What the Liquid Glass Export Figma plugin sends, how long it is kept and who can read it.",
};

const CONTACT_EMAIL = "aryankholqi@gmail.com";
const ISSUES = "https://github.com/aryankholqi/liquid-glass-cli/issues";

export default function PrivacyPage() {
  return (
    <>
      <SiteNav current="privacy" />

      <div className="docs-shell wrap-narrow pad">
        <aside className="toc">
          <div className="toc-title">On this page</div>
          <a href="#summary">Summary</a>
          <a href="#sent">What is sent</a>
          <a href="#not-sent">What is not sent</a>
          <a href="#retention">How long it is kept</a>
          <a href="#access">Who can read it</a>
          <a href="#services">Services</a>
          <a href="#website">This website</a>
          <a href="#contact">Contact</a>
        </aside>

        <main>
          <Reveal>
            <header className="docs-head">
              <div className="docs-kicker">Privacy policy</div>
              <h1>Liquid Glass Export</h1>
              <p>
                How the Liquid Glass Export Figma plugin, the liquid-glass-cli command line tool and
                this website handle your data. Last updated September 13, 2026.
              </p>
            </header>
          </Reveal>

          <Reveal>
            <section id="summary" className="docs-section">
              <h2>Summary</h2>
              <ul>
                <li>
                  Data leaves Figma only when you press <strong>Export</strong>, and only for the
                  layers you selected.
                </li>
                <li>It is used for one thing: generating a React component from your design.</li>
                <li>It is deleted automatically after 7 days.</li>
                <li>There are no accounts, no cookies, no analytics, and nothing is sold or shared.</li>
              </ul>
            </section>
          </Reveal>

          <Reveal>
            <section id="sent" className="docs-section">
              <h2>What is sent</h2>
              <p>
                When you press <strong>Export</strong>, the plugin sends a description of each
                selected card that carries a Glass effect to <code>liquid-glass-showcase-red.vercel.app</code>:
              </p>
              <ul>
                <li>Layer names and their Figma layer IDs</li>
                <li>The text inside those layers</li>
                <li>
                  Sizes, auto layout settings, corner radius and smoothing, solid fill colours and
                  drop shadows
                </li>
                <li>
                  The Glass effect settings: refraction, depth, dispersion, frost, splay and light
                </li>
              </ul>
              <p>
                The server stores this description and returns a short export ID, which the plugin
                shows as a <code>npx liquid-glass-cli figma pull</code> command.
              </p>
              <p>
                Like any web request, the export also carries your IP address. It is used only to
                rate limit exports and downloads, and the counter it is kept with expires within an
                hour.
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section id="not-sent" className="docs-section">
              <h2>What is not sent</h2>
              <ul>
                <li>Your Figma account name or email, or the name or link of your file</li>
                <li>Layers you did not select</li>
                <li>Images, vector shapes and font files — they appear as placeholders only</li>
                <li>
                  Anything at all when you use <strong>Copy code</strong>: that code is generated
                  inside the plugin, on your computer
                </li>
              </ul>
            </section>
          </Reveal>

          <Reveal>
            <section id="retention" className="docs-section">
              <h2>How long it is kept</h2>
              <p>
                Every export is deleted automatically 7 days after it is created. Pulling an export
                does not delete it early, so it can be pulled more than once during that week. If you
                need an export removed sooner, email the export ID to the address below.
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section id="access" className="docs-section">
              <h2>Who can read it</h2>
              <p>
                Anyone who has the export ID can download that export until it expires. IDs are 12
                random characters, are never listed or searchable, and cannot be guessed in practice
                — but treat the command like a private link and share it only with the people who
                should build the component.
              </p>
              <p>
                Exports are not reviewed, used to train AI models, sold, or shared with anyone
                beyond the services below.
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section id="services" className="docs-section">
              <h2>Services</h2>
              <ul>
                <li>
                  <strong>Vercel</strong> hosts this website and the export API, and keeps standard
                  request logs.
                </li>
                <li>
                  <strong>Upstash</strong> provides the Redis database that holds exports until they
                  expire.
                </li>
                <li>
                  <strong>npm</strong> delivers the CLI when you run <code>npx liquid-glass-cli</code>,
                  under npm&apos;s own privacy policy.
                </li>
              </ul>
            </section>
          </Reveal>

          <Reveal>
            <section id="website" className="docs-section">
              <h2>This website</h2>
              <p>
                This site sets no cookies and runs no analytics or tracking scripts. Fonts are served
                from this site rather than loaded from a third party.
              </p>
            </section>
          </Reveal>

          <Reveal>
            <section id="contact" className="docs-section">
              <h2>Contact</h2>
              <p>
                Questions or deletion requests: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>,
                or open an issue on <a href={ISSUES}>GitHub</a>. If this policy changes, the date at
                the top of the page changes with it.
              </p>
            </section>
          </Reveal>
        </main>
      </div>

      <SiteFooter />
    </>
  );
}
