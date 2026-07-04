import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";
import { getModel } from "@/lib/models";
import { buildSystemPrompt } from "@/lib/spine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Msg = { role: "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  // Auth gate.
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const who = await verifySession(token);
  if (!who) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { model?: string; messages?: Msg[]; context?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const model = getModel(body.model || "");
  if (!model) return NextResponse.json({ error: "unknown model" }, { status: 400 });

  const apiKey = process.env[model.envKey];
  if (!apiKey) {
    return NextResponse.json(
      { error: `${model.label} is not configured. Add ${model.envKey} in the environment.` },
      { status: 400 }
    );
  }

  const messages = (body.messages || []).filter(
    (m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string"
  );
  if (messages.length === 0) return NextResponse.json({ error: "no messages" }, { status: 400 });

  const system = buildSystemPrompt(body.context);
  const modelName = process.env[model.modelEnv] || model.defaultModel;

  try {
    let text = "";

    if (model.provider === "anthropic") {
      const r = await fetch(model.baseURL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: modelName,
          max_tokens: 2048,
          system,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error?.message || `Anthropic ${r.status}`);
      text = (data.content || []).map((c: { text?: string }) => c.text || "").join("");
    } else {
      // OpenAI-compatible (OpenAI + xAI Grok)
      const r = await fetch(model.baseURL, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: modelName,
          max_tokens: 2048,
          messages: [{ role: "system", content: system }, ...messages],
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error?.message || `${model.label} ${r.status}`);
      text = data.choices?.[0]?.message?.content || "";
    }

    return NextResponse.json({ text: text.trim() || "(empty response)" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "request failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
