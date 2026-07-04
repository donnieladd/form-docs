# form. intel

The private operating system of form. — a branded landing, a members-only library of the
signed-off form. documents, and **form. ai**: an assistant that reasons from form's own doctrine,
with a model picker (Claude · Grok · OpenAI), file upload, and voice.

Next.js 16 (App Router) · TypeScript · deploy on Vercel. No database required for v1 — form's
entire corpus is small enough to load into every model call, so answers stay grounded.

## Routes
- `/` — public landing (reveals nothing about the contents)
- `/login` — username + password (named users)
- `/library` — the document index (protected)
- `/brand-identity-system`, `/operational-philosophy`, `/doctrine` — the signed-off docs (protected)
- `/ai` — form. ai chat (protected)

## Run locally
```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

## Environment variables
Set these in **Vercel → Settings → Environment Variables** (and `.env.local` for local dev).
Never commit real values — `.env*` is gitignored.

| Key | What it is |
|-----|------------|
| `AUTH_SECRET` | Session-signing secret. Generate: `openssl rand -hex 32` |
| `SITE_USERS` | JSON list of logins: `[{"user":"name","pass":"secret"}]` |
| `ANTHROPIC_API_KEY` + `CLAUDE_MODEL` | Enables Claude |
| `XAI_API_KEY` + `GROK_MODEL` | Enables Grok |
| `OPENAI_API_KEY` + `OPENAI_MODEL` | Enables OpenAI |

A model only appears in the picker if its API key is set. Add as many or as few as you want.

### Adding / removing users
Edit `SITE_USERS` in Vercel and redeploy. Nothing touches code. Rotate `AUTH_SECRET` to force
everyone to log in again.

## Deploy
1. Push this folder to a **private** GitHub repo.
2. Vercel → New Project → import it (auto-detects Next.js).
3. Add the environment variables above (Production + Preview).
4. Deploy. Visit the URL → you'll hit the landing; `sign in` → `/login`.

## Notes for v1
- Chat responses are non-streaming (returned whole) for reliability. Streaming is a later upgrade.
- File upload reads text-like files (`.txt`, `.md`, `.csv`, code) into the conversation context.
  Rich formats (`.pdf`, `.docx`) can be added with a server-side parser later.
- Voice uses the browser's built-in speech APIs (best in Chrome) — no extra keys or cost.
- Cinematic brand renders go in `/public` and get wired into the landing/hero when ready.
