import { afterEach, describe, expect, it, vi } from 'vitest';
import { AnthropicEngine } from './anthropic';
import type { LLMChatMessage, StreamChunk } from './types';

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

function sseResponse(events: string[]): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const event of events) {
        controller.enqueue(encoder.encode(event));
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

function anthropicEngine() {
  return new AnthropicEngine({ provider: 'anthropic', model: 'claude-3-5-sonnet-latest', apiKey: 'sk-ant-test' });
}

const MESSAGE = {
  content: [{ type: 'text', text: 'Hello' }],
  stop_reason: 'end_turn',
  usage: { input_tokens: 11, output_tokens: 7 },
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('anthropic engine request shaping', () => {
  it('posts messages with the system prompt separated', async () => {
    const calls = stubFetch(jsonResponse(MESSAGE));

    const result = await anthropicEngine().generate(MESSAGES);

    expect(calls[0]?.url).toBe('https://api.anthropic.com/v1/messages');
    expect(calls[0]?.init.method).toBe('POST');
    expect(calls[0]?.init.headers).toMatchObject({
      'Content-Type': 'application/json',
      'x-api-key': 'sk-ant-test',
      'anthropic-version': '2023-06-01',
    });
    expect(bodyOf(calls[0]!)).toEqual({
      model: 'claude-3-5-sonnet-latest',
      messages: [{ role: 'user', content: 'hello' }],
      max_tokens: 4096,
      temperature: 0.7,
      system: 'be brief',
    });
    expect(result.content).toBe('Hello');
    expect(result.finishReason).toBe('end_turn');
  });

  it('maps non-streaming usage onto the normalised shape', async () => {
    stubFetch(jsonResponse(MESSAGE));

    const result = await anthropicEngine().generate(MESSAGES);

    expect(result.usage).toEqual({ promptTokens: 11, completionTokens: 7, totalTokens: 18 });
  });
});

describe('anthropic engine streaming', () => {
  it('captures usage from message_start and message_delta on the done chunks', async () => {
    const calls = stubFetch(
      sseResponse([
        'data: {"type":"message_start","message":{"usage":{"input_tokens":12,"output_tokens":1}}}\n\n',
        'data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Hi"}}\n\n',
        'data: {"type":"message_delta","delta":{"stop_reason":"end_turn"},"usage":{"output_tokens":6}}\n\n',
        'data: {"type":"message_stop"}\n\n',
      ]),
    );

    const chunks: StreamChunk[] = [];
    for await (const chunk of anthropicEngine().generateStream(MESSAGES)) {
      chunks.push(chunk);
    }

    expect(bodyOf(calls[0]!).stream).toBe(true);
    expect(chunks).toEqual([
      { content: 'Hi', done: false },
      {
        content: '',
        done: true,
        finishReason: 'end_turn',
        usage: { promptTokens: 12, completionTokens: 6, totalTokens: 18 },
      },
      { content: '', done: true, usage: { promptTokens: 12, completionTokens: 6, totalTokens: 18 } },
    ]);
  });

  it('emits no usage when the stream reports none', async () => {
    stubFetch(
      sseResponse([
        'data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Hi"}}\n\n',
        'data: {"type":"message_stop"}\n\n',
      ]),
    );

    const chunks: StreamChunk[] = [];
    for await (const chunk of anthropicEngine().generateStream(MESSAGES)) {
      chunks.push(chunk);
    }

    expect(chunks).toEqual([
      { content: 'Hi', done: false },
      { content: '', done: true },
    ]);
  });
});

describe('anthropic engine testConnection', () => {
  it('reports success with latency and model info', async () => {
    stubFetch(jsonResponse(MESSAGE));

    const result = await anthropicEngine().testConnection();

    expect(result.success).toBe(true);
    expect(typeof result.latencyMs).toBe('number');
    expect(result.modelInfo).toEqual({ name: 'claude-3-5-sonnet-latest' });
  });

  it('reports the provider error without throwing', async () => {
    stubFetch(jsonResponse({ error: { message: 'bad key' } }, 401));

    const result = await anthropicEngine().testConnection();

    expect(result).toMatchObject({ success: false, error: 'bad key' });
  });
});
