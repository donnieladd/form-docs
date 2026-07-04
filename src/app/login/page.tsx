"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function safeNext(raw: string | null): string {
  if (!raw) return "/library";
  // only allow internal absolute paths
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/library";
  return raw;
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <Login />
    </Suspense>
  );
}

function Login() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));

  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ user, pass }),
      });
      const data = await r.json();
      if (!r.ok) {
        setErr(data.error || "Sign in failed.");
        setBusy(false);
        return;
      }
      router.replace(next);
    } catch {
      setErr("Network error. Try again.");
      setBusy(false);
    }
  }

  return (
    <>
      <div className="ambient" aria-hidden="true">
        <div className="glow" />
        <div className="glow warm" />
        <div className="grid" />
      </div>
      <div className="gate">
        <div className="gate__card">
          <div className="gate__mark">
            form<span className="p">.</span>
          </div>
          <span className="eyebrow gate__eyebrow">
            restricted access <b>//</b> members only
          </span>
          <h2 className="gate__title">sign in</h2>
          <p className="gate__desc">Enter your credentials to reach the form. intelligence system.</p>
          <form onSubmit={submit}>
            <div className="field">
              <label htmlFor="user">username</label>
              <input
                id="user"
                type="text"
                autoComplete="username"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder="your name"
                autoFocus
              />
            </div>
            <div className="field">
              <label htmlFor="pass">password</label>
              <input
                id="pass"
                type="password"
                autoComplete="current-password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="••••••••••"
              />
            </div>
            <div className="gate__error">{err}</div>
            <button className="btn-primary" type="submit" disabled={busy}>
              {busy ? "verifying…" : "enter →"}
            </button>
          </form>
          <div className="gate__foot">private · internal-only · unauthorized access prohibited</div>
        </div>
      </div>
    </>
  );
}
