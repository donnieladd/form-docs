// Model router config. Grok, Claude, OpenAI. No image/video models.
// A model is "available" only if its API key is present in the environment.

export type Provider = "anthropic" | "xai" | "openai";

export type ModelDef = {
  id: string; // stable id used by the UI + API
  label: string; // shown to the user
  provider: Provider;
  envKey: string; // which env var holds the API key
  modelEnv: string; // env var to override the model string
  defaultModel: string;
  baseURL: string;
};

export const MODELS: ModelDef[] = [
  {
    id: "claude",
    label: "Claude",
    provider: "anthropic",
    envKey: "ANTHROPIC_API_KEY",
    modelEnv: "CLAUDE_MODEL",
    defaultModel: "claude-3-5-sonnet-latest",
    baseURL: "https://api.anthropic.com/v1/messages",
  },
  {
    id: "grok",
    label: "Grok",
    provider: "xai",
    envKey: "XAI_API_KEY",
    modelEnv: "GROK_MODEL",
    defaultModel: "grok-2-latest",
    baseURL: "https://api.x.ai/v1/chat/completions",
  },
  {
    id: "openai",
    label: "OpenAI",
    provider: "openai",
    envKey: "OPENAI_API_KEY",
    modelEnv: "OPENAI_MODEL",
    defaultModel: "gpt-4o",
    baseURL: "https://api.openai.com/v1/chat/completions",
  },
];

export function getModel(id: string): ModelDef | undefined {
  return MODELS.find((m) => m.id === id);
}

/** Which models can actually be used right now (key present). */
export function availableModels(): { id: string; label: string }[] {
  return MODELS.filter((m) => !!process.env[m.envKey]).map((m) => ({ id: m.id, label: m.label }));
}
