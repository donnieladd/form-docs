import Link from "next/link";
import LogoutButton from "../logout-button";

const DOCS = [
  {
    code: "01 · identity",
    title: "brand identity system",
    href: "/brand-identity-system",
    desc: "The canonical visual and verbal identity — logo, color, type, ecosystem, voice, governance.",
  },
  {
    code: "02 · doctrine",
    title: "operational philosophy",
    href: "/operational-philosophy",
    desc: "How form. thinks. The worldview and operating logic that trains every human and AI collaborator.",
  },
  {
    code: "03 · standards",
    title: "doctrine set",
    href: "/doctrine",
    desc: "The standing standards beneath the system — logo, typography, lighting, and intelligence.",
  },
];

export default function Library() {
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
              <span className="status__dot" aria-hidden="true" /> restricted
            </span>
            <Link href="/ai" className="pill solid">
              form. ai
            </Link>
            <LogoutButton />
          </div>
        </header>

        <main className="wrap">
          <div className="section-head">
            <span className="eyebrow">
              the library <b>//</b> index
            </span>
            <h2>how we build, and why.</h2>
          </div>
          <div className="docs">
            {DOCS.map((d) => (
              <article className="doc-card" key={d.href}>
                <span className="code">{d.code}</span>
                <h3>{d.title}</h3>
                <p>{d.desc}</p>
                <span className="open">open record →</span>
                <a className="cover" href={d.href} aria-label={`Open ${d.title}`} />
              </article>
            ))}
            <article className="doc-card ai-card">
              <span className="code" style={{ color: "var(--gold)" }}>
                ✦ intelligence
              </span>
              <h3>form. ai</h3>
              <p>
                Ask anything across the form. system. Query the docs, work through what&apos;s next, upload
                files, speak your question — with Claude, Grok, or OpenAI.
              </p>
              <span className="open" style={{ color: "var(--gold)" }}>
                open form. ai →
              </span>
              <a className="cover" href="/ai" aria-label="Open form. ai" />
            </article>
          </div>
        </main>

        <footer className="foot">
          <div className="wrap">
            <div className="bottom">
              <span>© 2026 form. · formintel.co</span>
              <span>vision needs structure. the future needs form.</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
