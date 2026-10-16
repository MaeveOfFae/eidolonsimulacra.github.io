import { afterEach, describe, expect, it, vi } from 'vitest';
import { createEngine, getDefaultBaseUrl } from './factory';
import { OllamaEngine } from './ollama';
import { setRuntimeLLMStreamingSupported } from './transport';
import type { LLMChatMessage, LLMConfig, StreamChunk } from './types';

const MESSAGES: LLMChatMessage[] = [
  { role: 'system', content: 'be brief' },
  { role: 'user', content: 'hello' },
];

interface CapturedCall {
  url: string;
  init: RequestInit;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Ollama streams newline-delimited JSON objects, not SSE `data:` events. */
function ndjsonResponse(lines: string[]): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const line of lines) {
        controller.enqueue(encoder.encode(line));
      }
      controller.close();
    },
  });

  return new Response(stream, { status: 200, headers: { 'Content-Type': 'application/x-ndjson' } });
}

function stubFetch(source: Response | (() => Response)): CapturedCall[] {
  const calls: CapturedCall[] = [];
  // A Response body can only be read once, so hand each call a fresh one.
  const create = typeof source === 'function' ? source : () => source.clone();

  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      return create();
    }),
  );

  return calls;
}

function bodyOf(call: CapturedCall): Record<string, unknown> {
  return JSON.parse(String(call.init.body)) as Record<string, unknown>;
}

function headersOf(call: CapturedCall): Record<string, string> {
  return call.init.headers as Record<string, string>;
}

function ollamaEngine(overrides: Partial<LLMConfig> = {}): OllamaEngine {
  return new OllamaEngine({ provider: 'ollama', model: 'gemma4', apiKey: 'ollama_test', ...overrides });
}

async function drainStream(engine: OllamaEngine = ollamaEngine()): Promise<StreamChunk[]> {
  const chunks: StreamChunk[] = [];
  for await (const chunk of engine.generateStream(MESSAGES)) {
    chunks.push(chunk);
  }
  return chunks;
}

/** A body that never sends a byte and never closes: what a silent provider looks like. */
function stalledResponse(): Response {
  return new Response(new ReadableStream<Uint8Array>({ start: () => undefined }), {
    status: 200,
    headers: { 'Content-Type': 'application/x-ndjson' },
  });
}

/** The native (non-OpenAI) reply envelope from `POST /api/chat`. */
const REPLY = {
  model: 'gemma4',
  created_at: '2026-10-16T00:00:00Z',
  message: { role: 'assistant', content: 'Hello there' },
  done: true,
  done_reason: 'stop',
  prompt_eval_count: 9,
  eval_count: 4,
};

afterEach(() => {
  vi.unstubAllGlobals();
  setRuntimeLLMStreamingSupported(true);
});

describe('ollama engine request shaping', () => {
  it('posts to native /api/chat with Ollama option names and the OLLAMA_API_KEY', async () => {
    const calls = stubFetch(jsonResponse(REPLY));

    const result = await ollamaEngine().generate(MESSAGES, { temperature: 0.2, maxTokens: 64, topP: 0.9 });

    expect(calls[0]?.url).toBe('https://ollama.com/api/chat');
    expect(calls[0]?.init.method).toBe('POST');
    expect(headersOf(calls[0]!)).toMatchObject({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ollama_test',
    });
    expect(bodyOf(calls[0]!)).toEqual({
      model: 'gemma4',
      messages: [
        { role: 'system', content: 'be brief' },
        { role: 'user', content: 'hello' },
      ],
      stream: false,
      // Native limits ride in `options`: num_predict, not max_tokens.
      options: { temperature: 0.2, num_predict: 64, top_p: 0.9 },
    });
    expect(result).toEqual({
      content: 'Hello there',
      finishReason: 'stop',
      usage: { promptTokens: 9, completionTokens: 4, totalTokens: 13 },
    });
  });

  it('trims message.content and omits usage when the counters are absent', async () => {
    stubFetch(jsonResponse({ message: { content: '  spaced  ' }, done: true }));

    const result = await ollamaEngine().generate(MESSAGES);

    expect(result.content).toBe('spaced');
    expect(result.finishReason).toBeUndefined();
    expect(result.usage).toBeUndefined();
  });

  it('keeps its built-in base URL in sync with the factory default', async () => {
    const calls = stubFetch(jsonResponse(REPLY));

    // No baseUrl in the config: the engine falls back to its own constant, which
    // must be the native /api host (the /v1 host takes OpenAI-shaped bodies).
    await ollamaEngine({ baseUrl: undefined }).generate(MESSAGES);

    expect(getDefaultBaseUrl('ollama')).toBe('https://ollama.com/api');
    expect(calls[0]?.url).toBe(`${getDefaultBaseUrl('ollama')}/chat`);
  });

  it('keeps a local base URL override and trims its trailing slash', async () => {
    const calls = stubFetch(jsonResponse(REPLY));

    await ollamaEngine({ baseUrl: 'http://localhost:11434/api/' }).generate(MESSAGES);

    expect(calls[0]?.url).toBe('http://localhost:11434/api/chat');
  });

  it('explains an empty reply instead of returning blank content', async () => {
    stubFetch(jsonResponse({ message: { content: '   ' }, done: true, done_reason: 'length' }));

    await expect(ollamaEngine().generate(MESSAGES)).rejects.toThrow(/output budget/);
  });

  it('names a tool-call-only reply, which this app cannot render', async () => {
    stubFetch(
      jsonResponse({ message: { role: 'assistant', content: '', tool_calls: [{ id: 'call_1' }] }, done: true }),
    );

    await expect(ollamaEngine().generate(MESSAGES)).rejects.toThrow(/tool calls instead of displayable text/);
  });

  it("surfaces Ollama's plain-string error body", async () => {
    stubFetch(jsonResponse({ error: "model 'gemma4' not found, try pulling it first" }, 404));

    await expect(ollamaEngine().generate(MESSAGES)).rejects.toThrow(/try pulling it first/);
  });

  it('pins an unknown cloud model to the /api/tags catalog names', async () => {
    stubFetch(jsonResponse({ error: "model 'gemma4' not found" }, 404));

    await expect(ollamaEngine().generate(MESSAGES)).rejects.toThrow(
      /must match a name from GET https:\/\/ollama\.com\/api\/tags exactly/,
    );
  });

  it('tells a local server to pull the model instead of naming catalog ids', async () => {
    stubFetch(jsonResponse({ error: "model 'gemma4' not found, try pulling it first" }, 404));

    await expect(ollamaEngine({ baseUrl: 'http://localhost:11434/api' }).generate(MESSAGES)).rejects.toThrow(
      /check `ollama list` or pull it first/,
    );
  });

  it('explains the cloud rate limit and unreachable-model statuses', async () => {
    stubFetch(jsonResponse({ error: 'too many requests' }, 429));
    await expect(ollamaEngine().generate(MESSAGES)).rejects.toThrow(/rate limit or plan quota/);

    stubFetch(jsonResponse({ error: 'the model failed to generate a response' }, 502));
    await expect(ollamaEngine().generate(MESSAGES)).rejects.toThrow(/could not reach the model/);
  });

  it('explains a blocked fetch on generate instead of leaking a bare TypeError', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch');
      }),
    );

    await expect(ollamaEngine().generate(MESSAGES)).rejects.toThrow(/no CORS headers/);
  });

  it('names the key and the remedy when auth is rejected', async () => {
    stubFetch(jsonResponse({ error: 'unauthorized' }, 401));

    await expect(ollamaEngine().generate(MESSAGES)).rejects.toThrow(/OLLAMA_API_KEY was rejected/);
  });
});

describe('ollama engine streaming', () => {
  it('reads NDJSON lines and keeps usage for the done chunk', async () => {
    const calls = stubFetch(
      ndjsonResponse([
        '{"model":"gemma4","message":{"role":"assistant","content":"Hel"},"done":false}\n',
        // An empty-content heartbeat must not surface as a chunk.
        '{"model":"gemma4","message":{"role":"assistant","content":""},"done":false}\n',
        '{"model":"gemma4","message":{"role":"assistant","content":"lo"},"done":false}\n',
        '{"model":"gemma4","message":{"role":"assistant","content":""},"done":true,' +
          '"done_reason":"stop","prompt_eval_count":9,"eval_count":2}\n',
      ]),
    );

    const chunks = await drainStream();

    expect(bodyOf(calls[0]!).stream).toBe(true);
    expect(chunks).toEqual([
      { content: 'Hel', done: false },
      { content: 'lo', done: false },
      {
        content: '',
        done: true,
        finishReason: 'stop',
        usage: { promptTokens: 9, completionTokens: 2, totalTokens: 11 },
      },
    ]);
  });

  it('throws the error line Ollama sends mid-stream', async () => {
    stubFetch(ndjsonResponse(['{"error":"model requires more system memory"}\n']));

    await expect(drainStream()).rejects.toThrow(/more system memory/);
  });

  it('falls back to one chunk when the host transport cannot stream', async () => {
    setRuntimeLLMStreamingSupported(false);
    stubFetch(jsonResponse(REPLY));

    expect(await drainStream()).toEqual([
      {
        content: 'Hello there',
        done: true,
        finishReason: 'stop',
        usage: { promptTokens: 9, completionTokens: 4, totalTokens: 13 },
      },
    ]);
  });

  it('rejects instead of stalling when the stream stops delivering bytes', async () => {
    stubFetch(() => stalledResponse());

    await expect(drainStream(ollamaEngine({ timeout: 1000 }))).rejects.toThrow(/no streamed output/i);
  }, 4000);
});

describe('ollama engine connection checks', () => {
  it('probes a token-limited completion and reports the latency', async () => {
    const calls = stubFetch(jsonResponse(REPLY));

    const result = await ollamaEngine().testConnection();

    expect(result.success).toBe(true);
    expect(result.modelInfo).toEqual({ name: 'gemma4' });
    expect(calls[0]?.url).toBe('https://ollama.com/api/chat');
    expect(bodyOf(calls[0]!).options).toEqual({ num_predict: 1 });
  });

  it('points at the cloud endpoint when the request never leaves the machine', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch');
      }),
    );

    const result = await createEngine({ provider: 'ollama', model: 'gemma4' }).testConnection();

    expect(result.success).toBe(false);
    expect(result.error).toContain('Could not reach https://ollama.com/api');
    expect(result.error).toContain('no CORS headers');
  });

  it('gives the serve/origins checklist for an unreachable local server', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch');
      }),
    );

    const result = await ollamaEngine({ baseUrl: 'http://localhost:11434/api' }).testConnection();

    expect(result.success).toBe(false);
    expect(result.error).toContain('Could not reach the local model server at http://localhost:11434/api');
    expect(result.error).toContain('OLLAMA_ORIGINS');
  });

  it('explains a local origin refusal (HTTP 403) with the OLLAMA_ORIGINS fix', async () => {
    stubFetch(new Response('Forbidden', { status: 403 }));

    const result = await ollamaEngine({ baseUrl: 'http://localhost:11434/api' }).testConnection();

    expect(result.success).toBe(false);
    expect(result.error).toContain('OLLAMA_ORIGINS');
  });
});
