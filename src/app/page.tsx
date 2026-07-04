// Public landing — the branded front door. Reveals nothing about the contents.
import Link from "next/link";

export default function Landing() {
  return (
    <>
      <div className="ambient" aria-hidden="true">
        <div className="glow" />
        <div className="glow warm" />
        <div className="grid" />
      </div>

      <div className="app">
        <header className="site-header">
          <span className="wm">
            form<span className="p">.</span>
            <span className="sub-wm">intel</span>
          </span>
          <div className="right">
            <span className="status">
              <span className="status__dot" aria-hidden="true" /> docs.formintel.co
            </span>
            <Link href="/login" className="pill solid">
              sign in
            </Link>
          </div>
        </header>

        <main className="wrap">
          <section className="hero">
            <span className="eyebrow">
              operating intelligence <b>//</b> internal system
            </span>
            <h1>
              <span className="lo">the operating</span>
              <br />
              system of form<span className="p">.</span>
            </h1>
            <p>
              Everything form. knows — its standards, its philosophy, and the intelligence that helps
              build what&apos;s next. One private system. Under lock and key.
            </p>
            <div className="cta-row">
              <Link href="/login" className="cta">
                enter <span className="aw">→</span>
              </Link>
            </div>
            <div className="hero-meta">
              <div>
                <span className="k">owner</span>
                <span className="v">form.</span>
              </div>
              <div>
                <span className="k">access</span>
                <span className="v">private · members only</span>
              </div>
              <div>
                <span className="k">system</span>
                <span className="v">brand system v01</span>
              </div>
              <div>
                <span className="k">intelligence</span>
                <span className="v">form. ai — live</span>
              </div>
            </div>
          </section>
        </main>

        <footer className="foot">
          <div className="wrap">
            <div className="cols">
              <div style={{ maxWidth: "32ch" }}>
                <div className="wm">
                  form<span className="p">.</span>
                </div>
                <div className="tag">
                  vision needs structure.
                  <br />
                  the future needs form.
                </div>
              </div>
              <div className="col">
                <h5>system</h5>
                <span>brand identity</span>
                <span>operational philosophy</span>
                <span>doctrine</span>
                <span>form. ai</span>
              </div>
              <div className="col">
                <h5>access</h5>
                <span>private · internal-only</span>
                <span>password protected</span>
                <span>access is logged</span>
              </div>
            </div>
            <div className="bottom">
              <span>© 2026 form. all rights reserved</span>
              <span>GVL · ATL · LA · MIA</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
