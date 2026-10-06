/**
 * Provider identity and presentation constants for the web settings surfaces.
 *
 * These were module-local in `Settings.tsx` but are read by the parent's header
 * and pills, the `setup` tab, and the provider editor, so they live here now that
 * the screen is being decomposed. They are deliberately **web-app** constants, not
 * shared ones: this list includes the local `ollama` provider and the Tailwind
 * gradient classes, neither of which belongs in the engine layer owned by
 * `@char-gen/shared`.
 */

export const ALL_PROVIDERS = [
  'openai',
  'google',
  'openrouter',
  'anthropic',
  'deepseek',
  'zai',
  'moonshot',
  'ollama',
] as const;

export type Provider = (typeof ALL_PROVIDERS)[number];

/** Provider colors for badges and panel headers. */
export const PROVIDER_COLORS: Record<Provider, string> = {
  openai: 'from-emerald-500 to-green-500',
  google: 'from-blue-500 to-cyan-500',
  openrouter: 'from-violet-500 to-purple-500',
  anthropic: 'from-orange-500 to-red-500',
  deepseek: 'from-cyan-500 to-teal-500',
  zai: 'from-pink-500 to-rose-500',
  moonshot: 'from-orange-500 to-amber-500',
  ollama: 'from-slate-500 to-gray-600',
};

export const PROVIDER_LABELS: Record<Provider, string> = {
  openai: 'OpenAI',
  google: 'Google',
  openrouter: 'OpenRouter',
  anthropic: 'Anthropic',
  deepseek: 'DeepSeek',
  zai: 'Z.AI',
  moonshot: 'Kimi (Moonshot)',
  ollama: 'Ollama',
};

/**
 * Official API documentation for each provider, surfaced next to the provider
 * picker and the key editor so the base URL, model names, and auth model are one
 * click away.
 */
export const PROVIDER_DOCS: Record<Provider, string> = {
  openai: 'https://openai.com/api/',
  zai: 'https://docs.z.ai/api-reference/introduction',
  openrouter: 'https://openrouter.ai/docs/api_reference/overview',
  google: 'https://ai.google.dev/gemini-api/docs',
  anthropic: 'https://platform.claude.com/docs/en/api/overview',
  ollama: 'https://docs.ollama.com/api/introduction',
  moonshot: 'https://platform.kimi.ai/docs/overview',
  deepseek: 'https://api-docs.deepseek.com/',
};
