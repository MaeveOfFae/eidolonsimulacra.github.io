import { describe, expect, it } from 'vitest';
import { isInvalidApiKeyValue, normalizeApiKeyValue } from './api-key';
import { AnthropicEngine } from './anthropic';
import {
  MODEL_SUGGESTIONS,
  buildProviderHeaders,
  createEngine,
  getDefaultBaseUrl,
  getProviderAuthType,
} from './factory';
import { GoogleEngine } from './google';
import { OpenAICompatEngine } from './openai-compat';

const ALL_PROVIDERS = ['openai', 'google', 'openrouter', 'anthropic', 'deepseek', 'zai', 'moonshot', 'ollama'] as const;

describe('llm engine factory', () => {
  it('selects the engine class from the provider', () => {
    expect(createEngine({ provider: 'openai', model: 'gpt-4o' })).toBeInstanceOf(OpenAICompatEngine);
    expect(createEngine({ provider: 'openrouter', model: 'anthropic/claude-3.5-sonnet' })).toBeInstanceOf(
      OpenAICompatEngine,
    );
    expect(createEngine({ provider: 'deepseek', model: 'deepseek-chat' })).toBeInstanceOf(OpenAICompatEngine);
    expect(createEngine({ provider: 'zai', model: 'glm-4' })).toBeInstanceOf(OpenAICompatEngine);
    expect(createEngine({ provider: 'moonshot', model: 'moonshot-v1-8k' })).toBeInstanceOf(OpenAICompatEngine);
    expect(createEngine({ provider: 'ollama', model: 'llama3.2' })).toBeInstanceOf(OpenAICompatEngine);
    expect(createEngine({ provider: 'google', model: 'gemini-1.5-pro' })).toBeInstanceOf(GoogleEngine);
    expect(createEngine({ provider: 'anthropic', model: 'claude-3.5-sonnet' })).toBeInstanceOf(AnthropicEngine);
  });

  it('detects the provider from the model when none is supplied', () => {
    expect(createEngine({ model: 'gemini-1.5-pro' })).toBeInstanceOf(GoogleEngine);
    expect(createEngine({ model: 'claude-3.5-sonnet' })).toBeInstanceOf(AnthropicEngine);
    expect(createEngine({ model: 'deepseek-chat' })).toBeInstanceOf(OpenAICompatEngine);
  });

  it('defaults base URLs per provider', () => {
    expect(getDefaultBaseUrl('openai')).toBe('https://api.openai.com/v1');
    expect(getDefaultBaseUrl('google')).toBe('https://generativelanguage.googleapis.com/v1beta');
    expect(getDefaultBaseUrl('openrouter')).toBe('https://openrouter.ai/api/v1');
    expect(getDefaultBaseUrl('deepseek')).toBe('https://api.deepseek.com');
    expect(getDefaultBaseUrl('zai')).toBe('https://open.bigmodel.cn/api/paas/v4');
    expect(getDefaultBaseUrl('moonshot')).toBe('https://api.moonshot.cn/v1');
    expect(getDefaultBaseUrl('ollama')).toBe('http://localhost:11434/v1');
  });

  it('strips the legacy openrouter/ prefix only when the base URL is OpenRouter', () => {
    expect(createEngine({ provider: 'openrouter', model: 'openrouter/anthropic/claude-3.5-sonnet' }).getModel()).toBe(
      'anthropic/claude-3.5-sonnet',
    );
    expect(createEngine({ provider: 'openai', model: 'openrouter/anything' }).getModel()).toBe('openrouter/anything');
  });

  it('reports the auth style per provider', () => {
    expect(getProviderAuthType('anthropic')).toBe('raw');
    expect(getProviderAuthType('google')).toBe('raw');
    expect(getProviderAuthType('openai')).toBe('bearer');
    expect(getProviderAuthType('openrouter')).toBe('bearer');
    expect(getProviderAuthType('ollama')).toBe('bearer');
  });

  it('suggests models for every provider', () => {
    expect(Object.keys(MODEL_SUGGESTIONS).sort()).toEqual([...ALL_PROVIDERS].sort());

    for (const provider of ALL_PROVIDERS) {
      expect(MODEL_SUGGESTIONS[provider].length).toBeGreaterThan(0);
    }
  });
});

describe('provider headers', () => {
  it('uses bearer auth for OpenAI-compatible providers', () => {
    expect(buildProviderHeaders('openai', 'sk-test', { contentType: 'application/json' })).toEqual({
      'Content-Type': 'application/json',
      Authorization: 'Bearer sk-test',
    });
  });

  it('uses x-api-key plus the version header for Anthropic', () => {
    const headers = buildProviderHeaders('anthropic', 'sk-ant-test');

    expect(headers['x-api-key']).toBe('sk-ant-test');
    expect(headers['anthropic-version']).toBe('2023-06-01');
    expect(headers.Authorization).toBeUndefined();
  });

  it('uses x-goog-api-key for Google', () => {
    const headers = buildProviderHeaders('google', 'goog-test');

    expect(headers['x-goog-api-key']).toBe('goog-test');
    expect(headers.Authorization).toBeUndefined();
  });

  it('adds OpenRouter attribution headers', () => {
    const headers = buildProviderHeaders('openrouter', 'sk-or-test');

    expect(headers['X-OpenRouter-Title']).toBe('Eidolon Simulacra');
    expect(headers['HTTP-Referer']).toBeTruthy();
  });

  it('omits auth headers when no key is supplied', () => {
    expect(buildProviderHeaders('openai')).toEqual({});
  });

  it('throws instead of sending a corrupted key', () => {
    expect(() => buildProviderHeaders('openai', 'sk-\nbroken')).toThrow(/invalid or corrupted/i);
    expect(() => buildProviderHeaders('openai', 'window.fetch:boom')).toThrow(/invalid or corrupted/i);
  });
});

describe('api key hygiene', () => {
  it('strips smart quotes, zero-width characters, whitespace and wrapping quotes', () => {
    expect(normalizeApiKeyValue('  "sk-abc"  ')).toBe('sk-abc');
    expect(normalizeApiKeyValue('\u2018sk\u2019')).toBe('sk');
    expect(normalizeApiKeyValue('sk\u200Babc')).toBe('skabc');
  });

  it('flags empty, multi-line, non-ASCII and corrupted-storage values', () => {
    expect(isInvalidApiKeyValue('')).toBe(true);
    expect(isInvalidApiKeyValue('sk\nabc')).toBe(true);
    expect(isInvalidApiKeyValue('sk\u00e9abc')).toBe(true);
    expect(isInvalidApiKeyValue('window.fetch:boom')).toBe(true);
    expect(isInvalidApiKeyValue('sk-valid-key-123')).toBe(false);
  });
});
