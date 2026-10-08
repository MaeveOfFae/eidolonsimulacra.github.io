import { afterEach, describe, expect, it, vi } from 'vitest';
import { createEngine } from './factory';
import { setRuntimeLLMStreamingSupported } from './transport';
import type { LLMChatMessage, StreamChunk } from './types';

const MESSAGES: LLMChatMessage[] = [{ role: 'user', content: 'hello' }];

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

function sseResponse(chunks: string[]): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });

  return new Response(stream, { status: 200, headers: { 'Content-Type': 'text/event-stream' } });
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

interface EngineOverrides {
  apiKey?: string;
  baseUrl?: string;
  proxyKey?: string;
}

function openAiEngine(overrides: EngineOverrides = {}) {
  return createEngine({
    provider: 'openai',
    model: 'gpt-4o',
    apiKey: 'apiKey' in overrides ? overrides.apiKey : 'sk-test',
    baseUrl: overrides.baseUrl,
    proxyKey: overrides.proxyKey,
  });
}

const COMPLETION = {
  choices: [{ message: { content: '  hi there  ' }, finish_reason: 'stop' }],
  usage: { prompt_tokens: 1, completion_tokens: 2, total_tokens: 3 },
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('openai-compatible engine request shaping', () => {
  it('posts a chat completion with the configured defaults', async () => {
    const calls = stubFetch(jsonResponse(COMPLETION));

    const result = await openAiEngine().generate(MESSAGES);

    expect(calls).toHaveLength(1);
    expect(calls[0]?.url).toBe('https://api.openai.com/v1/chat/completions');
    expect(calls[0]?.init.method).toBe('POST');
    expect(headersOf(calls[0]!)).toMatchObject({
      'Content-Type': 'application/json',
      Authorization: 'Bearer sk-test',
    });
    expect(bodyOf(calls[0]!)).toEqual({
      model: 'gpt-4o',
      messages: MESSAGES,
      temperature: 0.7,
      max_tokens: 4096,
      stream: false,
    });
    expect(result.content).toBe('hi there');
    expect(result.finishReason).toBe('stop');
    expect(result.usage).toEqual({ promptTokens: 1, completionTokens: 2, totalTokens: 3 });
  });

  it('applies per-call options and omits sampling params that were not set', async () => {
    const calls = stubFetch(jsonResponse(COMPLETION));

    await openAiEngine().generate(MESSAGES, {
      temperature: 0.2,
      maxTokens: 100,
      topP: 0.5,
      frequencyPenalty: 0.1,
      presencePenalty: 0.2,
    });

    expect(bodyOf(calls[0]!)).toMatchObject({
      temperature: 0.2,
      max_tokens: 100,
      top_p: 0.5,
      frequency_penalty: 0.1,
      presence_penalty: 0.2,
    });

    await openAiEngine().generate(MESSAGES);

    expect(bodyOf(calls[1]!)).not.toHaveProperty('top_p');
    expect(bodyOf(calls[1]!)).not.toHaveProperty('frequency_penalty');
    expect(bodyOf(calls[1]!)).not.toHaveProperty('presence_penalty');
  });

  it('uses the proxy key as the bearer token when a custom base URL is set', async () => {
    const calls = stubFetch(jsonResponse(COMPLETION));

    await openAiEngine({
      apiKey: 'sk-provider',
      baseUrl: 'https://proxy.example.test/v1',
      proxyKey: 'sk-proxy',
    }).generate(MESSAGES);

    expect(calls[0]?.url).toBe('https://proxy.example.test/v1/chat/completions');
    expect(headersOf(calls[0]!).Authorization).toBe('Bearer sk-proxy');
  });

  it('ignores an orphan proxy key when no custom base URL is set', async () => {
    const calls = stubFetch(jsonResponse(COMPLETION));

    await openAiEngine({ apiKey: 'sk-provider', proxyKey: 'sk-proxy' }).generate(MESSAGES);

    expect(headersOf(calls[0]!).Authorization).toBe('Bearer sk-provider');
  });

  it('sends no auth header for ollama', async () => {
    const calls = stubFetch(jsonResponse(COMPLETION));

    await createEngine({ provider: 'ollama', model: 'llama3.2' }).generate(MESSAGES);

    expect(headersOf(calls[0]!).Authorization).toBeUndefined();
  });

  it('rejects a corrupted key before calling the provider', async () => {
    const calls = stubFetch(jsonResponse(COMPLETION));

    await expect(openAiEngine({ apiKey: 'sk\nbroken' }).generate(MESSAGES)).rejects.toThrow(/invalid or corrupted/i);
    expect(calls).toHaveLength(0);
  });

  it('surfaces the provider error message', async () => {
    stubFetch(jsonResponse({ error: { message: 'bad key' } }, 401));

    await expect(openAiEngine().generate(MESSAGES)).rejects.toThrow('bad key');
  });

  it('streams content deltas until the DONE sentinel', async () => {
    const calls = stubFetch(
      sseResponse([
        'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n',
        'data: {"choices":[{"delta":{"content":" world"},"finish_reason":"stop"}]}\n\n',
        'data: [DONE]\n\n',
      ]),
    );

    const chunks: StreamChunk[] = [];
    for await (const chunk of openAiEngine().generateStream(MESSAGES)) {
      chunks.push(chunk);
    }

    expect(bodyOf(calls[0]!).stream).toBe(true);
    expect(chunks).toEqual([
      { content: 'Hello', done: false },
      { content: ' world', done: false },
      { content: '', done: true },
    ]);
  });

  it('surfaces streaming tool call deltas as JSON content', async () => {
    stubFetch(sseResponse(['data: {"choices":[{"delta":{"tool_calls":[{"id":"call_1"}]}}]}\n\n', 'data: [DONE]\n\n']));

    const chunks: StreamChunk[] = [];
    for await (const chunk of openAiEngine().generateStream(MESSAGES)) {
      chunks.push(chunk);
    }

    expect(chunks[0]).toEqual({ content: JSON.stringify({ tool_calls: [{ id: 'call_1' }] }), done: false });
    expect(chunks.at(-1)).toEqual({ content: '', done: true });
  });
});

describe('openai-compatible engine testConnection', () => {
  it('reports success with latency and model info', async () => {
    const calls = stubFetch(jsonResponse(COMPLETION));

    const result = await openAiEngine().testConnection();

    expect(calls[0]?.url).toBe('https://api.openai.com/v1/chat/completions');
    expect(bodyOf(calls[0]!)).toEqual({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: 'test' }],
      max_tokens: 5,
      stream: false,
    });
    expect(result.success).toBe(true);
    expect(typeof result.latencyMs).toBe('number');
    expect(result.modelInfo).toEqual({ name: 'gpt-4o' });
  });

  it('reports the provider error without throwing', async () => {
    stubFetch(jsonResponse({ error: { message: 'nope' } }, 401));

    const result = await openAiEngine().testConnection();

    expect(result.success).toBe(false);
    expect(result.error).toContain('nope');
  });

  it('names the provider and remedy when a key is rejected', async () => {
    stubFetch(jsonResponse({ error: { message: 'User not found.' } }, 401));

    const result = await createEngine({
      provider: 'openrouter',
      model: 'openai/gpt-4o',
      apiKey: 'sk-or-revoked',
    }).testConnection();

    expect(result.success).toBe(false);
    expect(result.error).toContain('User not found.');
    expect(result.error).toContain('provider "openrouter"');
    expect(result.error).toContain('was rejected');
  });

  it('leaves non-auth provider errors untouched', async () => {
    stubFetch(jsonResponse({ error: { message: 'boom' } }, 500));

    const result = await openAiEngine().testConnection();

    expect(result.error).toBe('boom');
  });
});

describe('openai-compatible engine streaming usage', () => {
  it('requests usage for supported providers and surfaces it on the done chunk', async () => {
    const calls = stubFetch(
      sseResponse([
        'data: {"choices":[{"delta":{"content":"Hi"}}]}\n\n',
        'data: {"choices":[],"usage":{"prompt_tokens":5,"completion_tokens":6,"total_tokens":11}}\n\n',
        'data: [DONE]\n\n',
      ]),
    );

    const chunks: StreamChunk[] = [];
    for await (const chunk of openAiEngine().generateStream(MESSAGES)) {
      chunks.push(chunk);
    }

    expect(bodyOf(calls[0]!).stream_options).toEqual({ include_usage: true });
    expect(chunks).toEqual([
      { content: 'Hi', done: false },
      { content: '', done: true, usage: { promptTokens: 5, completionTokens: 6, totalTokens: 11 } },
    ]);
  });

  describe('endpoint failure hints', () => {
    const localEndpoint = {
      provider: 'custom' as const,
      model: 'local-model',
      baseUrl: 'http://localhost:11434/v1',
    };

    it('explains a local origin refusal (HTTP 403) with the OLLAMA_ORIGINS fix', async () => {
      stubFetch(new Response('Forbidden', { status: 403 }));

      const result = await createEngine(localEndpoint).testConnection();

      expect(result.success).toBe(false);
      expect(result.error).toContain('OLLAMA_ORIGINS');
    });

    it('explains an unreachable local server with the serve/origins checklist', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => {
          throw new TypeError('Failed to fetch');
        }),
      );

      const result = await createEngine(localEndpoint).testConnection();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Could not reach the local model server at http://localhost:11434/v1');
      expect(result.error).toContain('OLLAMA_ORIGINS');
    });

    it('points at the endpoint when Ollama Cloud is unreachable', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => {
          throw new TypeError('Failed to fetch');
        }),
      );

      const result = await createEngine({ provider: 'ollama', model: 'gemma4' }).testConnection();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Could not reach https://ollama.com/v1');
    });

    it('passes a missing model through with the provider message', async () => {
      stubFetch(jsonResponse({ error: { message: "model 'gemma4' not found, try pulling it first" } }, 404));

      const result = await createEngine({ provider: 'ollama', model: 'gemma4' }).testConnection();

      expect(result.success).toBe(false);
      expect(result.error).toContain('try pulling it first');
    });
  });

  it('omits stream_options for providers without confirmed support but still parses usage', async () => {
    const calls = stubFetch(
      sseResponse([
        'data: {"choices":[{"delta":{"content":"Hi"}}]}\n\n',
        'data: {"choices":[],"usage":{"prompt_tokens":2,"completion_tokens":3,"total_tokens":5}}\n\n',
        'data: [DONE]\n\n',
      ]),
    );

    const chunks: StreamChunk[] = [];
    for await (const chunk of createEngine({ provider: 'zai', model: 'glm-4-plus', apiKey: 'zk-test' }).generateStream(
      MESSAGES,
    )) {
      chunks.push(chunk);
    }

    expect(bodyOf(calls[0]!).stream_options).toBeUndefined();
    expect(chunks.at(-1)).toEqual({
      content: '',
      done: true,
      usage: { promptTokens: 2, completionTokens: 3, totalTokens: 5 },
    });
  });

  it('retries once without stream_options when the provider rejects the parameter', async () => {
    let callIndex = 0;
    const calls = stubFetch(() => {
      callIndex += 1;
      return callIndex === 1
        ? jsonResponse({ error: { message: 'stream_options is not supported' } }, 400)
        : sseResponse(['data: {"choices":[{"delta":{"content":"Hi"}}]}\n\n', 'data: [DONE]\n\n']);
    });

    const chunks: StreamChunk[] = [];
    for await (const chunk of openAiEngine().generateStream(MESSAGES)) {
      chunks.push(chunk);
    }

    expect(calls).toHaveLength(2);
    expect(bodyOf(calls[0]!).stream_options).toEqual({ include_usage: true });
    expect(bodyOf(calls[1]!).stream_options).toBeUndefined();
    expect(chunks.at(-1)).toEqual({ content: '', done: true });
  });

  it('does not retry when the failure is unrelated to stream_options', async () => {
    const calls = stubFetch(jsonResponse({ error: { message: 'invalid model' } }, 400));

    const chunks: StreamChunk[] = [];
    await expect(
      (async () => {
        for await (const chunk of openAiEngine().generateStream(MESSAGES)) {
          chunks.push(chunk);
        }
      })(),
    ).rejects.toThrow('invalid model');

    expect(chunks).toEqual([]);
    expect(calls).toHaveLength(1);
  });
});

describe('openai-compatible streaming robustness', () => {
  it('cancels a stalled stream and reports a timeout instead of hanging', async () => {
    const encoder = new TextEncoder();
    // The provider accepts the connection, sends one token, then goes silent and
    // never closes the stream — the "infinite generating" stall.
    const stalledStream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode('data: {"choices":[{"delta":{"content":"Hi"}}]}\n\n'));
      },
    });

    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(stalledStream, { status: 200, headers: { 'Content-Type': 'text/event-stream' } }),
      ),
    );

    const engine = createEngine({ provider: 'openai', model: 'gpt-4o', apiKey: 'sk-test', timeout: 20 });
    const chunks: StreamChunk[] = [];

    await expect(
      (async () => {
        for await (const chunk of engine.generateStream(MESSAGES)) {
          chunks.push(chunk);
        }
      })(),
    ).rejects.toThrow(/timed out/i);

    expect(chunks).toEqual([{ content: 'Hi', done: false }]);
  });

  it('still times out when only provider keepalive comments arrive', async () => {
    const encoder = new TextEncoder();
    // A provider that keeps the socket warm (e.g. ": OPENROUTER PROCESSING")
    // while the model is queued, without ever emitting a token.
    let keepaliveTimer: ReturnType<typeof setInterval> | null = null;
    const keepaliveStream = new ReadableStream<Uint8Array>({
      start(controller) {
        keepaliveTimer = setInterval(() => controller.enqueue(encoder.encode(': OPENROUTER PROCESSING\n\n')), 5);
      },
      cancel() {
        if (keepaliveTimer !== null) {
          clearInterval(keepaliveTimer);
          keepaliveTimer = null;
        }
      },
    });

    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(keepaliveStream, { status: 200, headers: { 'Content-Type': 'text/event-stream' } }),
      ),
    );

    const engine = createEngine({ provider: 'openai', model: 'gpt-4o', apiKey: 'sk-test', timeout: 20 });
    const chunks: StreamChunk[] = [];

    await expect(
      (async () => {
        for await (const chunk of engine.generateStream(MESSAGES)) {
          chunks.push(chunk);
        }
      })(),
    ).rejects.toThrow(/timed out/i);

    expect(chunks).toEqual([]);
  });

  it('still times out when data events carry no displayable content', async () => {
    const encoder = new TextEncoder();
    // Heartbeat data frames with empty deltas (some gateways) or reasoning-only
    // events the parser ignores — the stream is alive but produces no output.
    let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
    const heartbeatStream = new ReadableStream<Uint8Array>({
      start(controller) {
        heartbeatTimer = setInterval(
          () => controller.enqueue(encoder.encode('data: {"choices":[{"delta":{}}]}\n\n')),
          5,
        );
      },
      cancel() {
        if (heartbeatTimer !== null) {
          clearInterval(heartbeatTimer);
          heartbeatTimer = null;
        }
      },
    });

    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(heartbeatStream, { status: 200, headers: { 'Content-Type': 'text/event-stream' } }),
      ),
    );

    const engine = createEngine({ provider: 'openai', model: 'gpt-4o', apiKey: 'sk-test', timeout: 20 });
    const chunks: StreamChunk[] = [];

    await expect(
      (async () => {
        for await (const chunk of engine.generateStream(MESSAGES)) {
          chunks.push(chunk);
        }
      })(),
    ).rejects.toThrow(/timed out/i);

    expect(chunks).toEqual([]);
  });
  it('reports a reasoning-only stall with an actionable hint', async () => {
    const encoder = new TextEncoder();
    let reasonTimer: ReturnType<typeof setInterval> | null = null;
    const reasoningStream = new ReadableStream<Uint8Array>({
      start(controller) {
        reasonTimer = setInterval(
          () => controller.enqueue(encoder.encode('data: {"choices":[{"delta":{"reasoning":"thinking"}}]}\n\n')),
          5,
        );
      },
      cancel() {
        if (reasonTimer !== null) {
          clearInterval(reasonTimer);
          reasonTimer = null;
        }
      },
    });

    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(reasoningStream, { status: 200, headers: { 'Content-Type': 'text/event-stream' } }),
      ),
    );

    const engine = createEngine({ provider: 'openai', model: 'gpt-4o', apiKey: 'sk-test', timeout: 20 });
    const chunks: StreamChunk[] = [];

    await expect(
      (async () => {
        for await (const chunk of engine.generateStream(MESSAGES)) {
          chunks.push(chunk);
        }
      })(),
    ).rejects.toThrow(/reasoning tokens/);

    expect(chunks).toEqual([]);
  });

  it('accepts SSE data events that omit the space after the colon', async () => {
    stubFetch(sseResponse(['data:{"choices":[{"delta":{"content":"Hi"}}]}\n\n', 'data:[DONE]\n\n']));

    const chunks: StreamChunk[] = [];
    for await (const chunk of openAiEngine().generateStream(MESSAGES)) {
      chunks.push(chunk);
    }

    expect(chunks).toEqual([
      { content: 'Hi', done: false },
      { content: '', done: true },
    ]);
  });

  it('falls back to a non-streaming request when the transport streams nothing', async () => {
    let call = 0;
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        call += 1;
        if (call === 1) {
          // Headers arrive, then the body stream never yields a byte (buffering bridge).
          return new Response(new ReadableStream<Uint8Array>({}), {
            status: 200,
            headers: { 'Content-Type': 'text/event-stream' },
          });
        }
        return new Response(JSON.stringify(COMPLETION), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }),
    );

    const engine = createEngine({ provider: 'openai', model: 'gpt-4o', apiKey: 'sk-test', timeout: 20 });
    const chunks: StreamChunk[] = [];
    for await (const chunk of engine.generateStream(MESSAGES)) {
      chunks.push(chunk);
    }

    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toMatchObject({ content: 'hi there', done: true });
  });
  it('uses a single non-streaming completion when the transport cannot stream', async () => {
    const calls = stubFetch(jsonResponse(COMPLETION));
    setRuntimeLLMStreamingSupported(false);

    try {
      const chunks: StreamChunk[] = [];
      for await (const chunk of openAiEngine().generateStream(MESSAGES)) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual([
        {
          content: 'hi there',
          done: true,
          finishReason: 'stop',
          usage: { promptTokens: 1, completionTokens: 2, totalTokens: 3 },
        },
      ]);
      expect(bodyOf(calls[0]!).stream).toBe(false);
    } finally {
      setRuntimeLLMStreamingSupported(true);
    }
  });


});

describe('openai-compatible request timeout', () => {
  it('rejects when the transport never settles and ignores the abort signal', async () => {
    // Some native bridges neither settle nor honour AbortSignal; the request must
    // still reject on the deadline instead of hanging forever.
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise<Response>(() => {})),
    );

    const engine = createEngine({ provider: 'openai', model: 'gpt-4o', apiKey: 'sk-test', timeout: 20 });

    await expect(engine.generate(MESSAGES)).rejects.toThrow(/timed out/i);
  });
});

