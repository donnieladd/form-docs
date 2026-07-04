"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import LogoutButton from "../logout-button";

type Model = { id: string; label: string };
type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTS = [
  "Summarize form's operating philosophy in five lines.",
  "What are the rules for using signal green vs. infrastructure blue?",
  "Draft a product one-pager in form's voice for a new labs tool.",
  "How should form. talk about AI and humanity?",
];

// Minimal SpeechRecognition typing
type SR = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

export default function Chat({ models }: { models: Model[] }) {
  const [model, setModel] = useState(models[0]?.id || "");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [attachName, setAttachName] = useState("");
  const [attachText, setAttachText] = useState("");
  const [listening, setListening] = useState(false);
  const [speak, setSpeak] = useState(false);

  const threadRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const recRef = useRef<SR | null>(null);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  function autosize() {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 180) + "px";
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setError("");
    try {
      const text = await f.text();
      setAttachName(f.name);
      setAttachText(text.slice(0, 60000));
    } catch {
      setError("Could not read that file. Text files (.txt, .md, .csv, code) work best right now.");
    }
    e.target.value = "";
  }

  function toggleVoice() {
    const W = window as unknown as { webkitSpeechRecognition?: new () => SR; SpeechRecognition?: new () => SR };
    const Ctor = W.SpeechRecognition || W.webkitSpeechRecognition;
    if (!Ctor) {
      setError("Voice input isn't supported in this browser. Try Chrome.");
      return;
    }
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (ev) => {
      const t = ev.results?.[0]?.[0]?.transcript || "";
      setInput((prev) => (prev ? prev + " " : "") + t);
      setTimeout(autosize, 0);
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    rec.start();
  }

  function sayIt(text: string) {
    if (!speak || typeof window === "undefined" || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.02;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || busy) return;
    if (!model) {
      setError("No model is configured yet. Add a provider key (Claude, Grok, or OpenAI) in the environment.");
      return;
    }
    setError("");
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setTimeout(autosize, 0);
    setBusy(true);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ model, messages: next, context: attachText || undefined }),
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data.error || "Request failed.");
        setBusy(false);
        return;
      }
      setMessages((m) => [...m, { role: "assistant", content: data.text }]);
      sayIt(data.text);
    } catch {
      setError("Network error.");
    }
    setBusy(false);
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const started = messages.length > 0;

  return (
    <div className="ai-shell">
      <div className="ambient" aria-hidden="true">
        <div className="glow" />
        <div className="glow warm" />
        <div className="grid" />
      </div>

      <header className="site-header">
        <Link href="/library" className="wm">
          form<span className="p">.</span>
          <span className="sub-wm">ai</span>
        </Link>
        <div className="right">
          <Link href="/library" className="pill">
            ← library
          </Link>
          <LogoutButton />
        </div>
      </header>

      <div className="ai-main" ref={threadRef}>
        <div className="ai-thread">
          {!started && (
            <div className="ai-welcome">
              <h1>
                ask form<span className="p">.</span>
              </h1>
              <p>
                The intelligence that knows the whole system. Query the docs, think through what&apos;s next,
                or draft in form&apos;s voice — grounded in form&apos;s own doctrine, every time.
              </p>
              <div className="suggests">
                {SUGGESTS.map((s) => (
                  <button key={s} onClick={() => send(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>
              <div className="who">{m.role === "user" ? "you" : "form."}</div>
              <div className="body">{m.content}</div>
            </div>
          ))}

          {busy && (
            <div className="msg assistant">
              <div className="who">form.</div>
              <div className="body">
                <div className="typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="composer-wrap">
        <div className="composer">
          {attachName && (
            <div style={{ padding: "2px 4px 4px" }}>
              <span className="attach-chip">
                ✦ {attachName}
                <button
                  onClick={() => {
                    setAttachName("");
                    setAttachText("");
                  }}
                  style={{ background: "none", border: "none", color: "inherit", cursor: "pointer" }}
                  aria-label="remove attachment"
                >
                  ×
                </button>
              </span>
            </div>
          )}
          <textarea
            ref={taRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              autosize();
            }}
            onKeyDown={onKey}
            placeholder="Ask form. anything — or think out loud about what's next…"
            rows={1}
          />
          <div className="composer-bar">
            <label className="icon-btn" title="Attach a file" aria-label="Attach a file">
              +
              <input type="file" onChange={onFile} style={{ display: "none" }} />
            </label>
            <button
              className={`icon-btn ${listening ? "on" : ""}`}
              onClick={toggleVoice}
              title="Speak your question"
              aria-label="Speak your question"
              type="button"
            >
              {listening ? "●" : "🎙"}
            </button>
            <button
              className={`icon-btn ${speak ? "on" : ""}`}
              onClick={() => setSpeak((s) => !s)}
              title="Speak answers aloud"
              aria-label="Speak answers aloud"
              type="button"
            >
              🔊
            </button>
            <select
              className="model-select"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              aria-label="Choose model"
            >
              {models.length === 0 && <option value="">no model configured</option>}
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
            <button className="send" onClick={() => send()} disabled={busy || !input.trim()} aria-label="Send">
              ↑
            </button>
          </div>
        </div>
        {error && <div className="composer-note warn">{error}</div>}
        {!error && (
          <div className="composer-note">
            form. ai reasons from form&apos;s doctrine · answers can be imperfect · unauthorized access prohibited
          </div>
        )}
      </div>
    </div>
  );
}
