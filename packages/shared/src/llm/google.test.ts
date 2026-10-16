import { afterEach, describe, expect, it, vi } from 'vitest';
import { GoogleEngine } from './google';
import { setRuntimeLLMFetch, setRuntimeLLMStreamingSupported } from './transport';
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

function googleEngine() {
  return new GoogleEngine({ provider: 'google', model: 'gemini-2.0-flash', apiKey: 'g-test' });
}

/** A body that never sends a byte and never closes: what a silent provider looks like. */
function stalledSseResponse(): Response {
  return new Response(new ReadableStream<Uint8Array>({ start: () => undefined }), {
    status: 200,
    headers: { 'Content-Type': 'text/event-stream' },
  });
}

/** A transport that accepts the request and never settles, ignoring the abort signal. */
function stubAbortIgnoringTransport(): void {
  setRuntimeLLMFetch(() => new Promise<Response>(() => undefined));
}

async function drainStream(engine: GoogleEngine): Promise<StreamChunk[]> {
  const chunks: StreamChunk[] = [];
  for await (const chunk of engine.generateStream(MESSAGES)) {
    chunks.push(chunk);
  }
  return chunks;
}

const RESPONSE = {
  candidates: [{ content: { parts: [{ text: 'Hello' }] }, finishReason: 'STOP' }],
  usageMetadata: { promptTokenCount: 9, candidatesTokenCount: 4, totalTokenCount: 13 },
};

afterEach(() => {
  vi.unstubAllGlobals();
  setRuntimeLLMFetch(undefined);
  setRuntimeLLMStreamingSupported(true);
});

describe('google engine request shaping', () => {
  it('posts to generateContent with the system prompt folded into the first turn', async () => {
    const calls = stubFetch(jsonResponse(RESPONSE));

    const result = await googleEngine().generate(MESSAGES);

    expect(calls[0]?.url).toBe(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    );
    expect(calls[0]?.init.method).toBe('POST');
    expect(calls[0]?.init.headers).toMatchObject({
      'Content-Type': 'application/json',
      'x-goog-api-key': 'g-test',
    });
    expect(bodyOf(calls[0]!)).toEqual({
      contents: [{ role: 'user', parts: [{ text: 'be brief\n\nhello' }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
    });
    expect(result.content).toBe('Hello');
    expect(result.finishReason).toBe('STOP');
  });

  it('maps non-streaming usageMetadata onto the normalised shape', async () => {
    stubFetch(jsonResponse(RESPONSE));

    const result = await googleEngine().generate(MESSAGES);

    expect(result.usage).toEqual({ promptTokens: 9, completionTokens: 4, totalTokens: 13 });
  });
});

describe('google engine streaming', () => {
  it('captures cumulative usageMetadata on the finish chunk', async () => {
    stubFetch(
      sseResponse([
        'data: {"usageMetadata":{"promptTokenCount":9,"candidatesTokenCount":1,"totalTokenCount":10}}\n\n',
        'data: {"candidates":[{"content":{"parts":[{"text":"Hel"}]}}],"usageMetadata":{"promptTokenCount":9,"candidatesTokenCount":2,"totalTokenCount":11}}\n\n',
        'data: {"candidates":[{"content":{"parts":[{"text":"lo"}]},"finishReason":"STOP"}],"usageMetadata":{"promptTokenCount":9,"candidatesTokenCount":4,"totalTokenCount":13}}\n\n',
      ]),
    );

    const chunks: StreamChunk[] = [];
    for await (const chunk of googleEngine().generateStream(MESSAGES)) {
      chunks.push(chunk);
    }

    expect(chunks).toEqual([
      { content: 'Hel', done: false },
      { content: 'lo', done: false },
      {
        content: '',
        done: true,
        finishReason: 'STOP',
        usage: { promptTokens: 9, completionTokens: 4, totalTokens: 13 },
      },
    ]);
  });
});

describe('google engine deadline guards', () => {
  function engineWithShortDeadline() {
    return new GoogleEngine({
      provider: 'google',
      model: 'gemini-2.0-flash',
      apiKey: 'g-test',
      timeout: 1000,
    });
  }

  it('rejects at the deadline when the transport ignores the abort signal', async () => {
    stubAbortIgnoringTransport();

    await expect(engineWithShortDeadline().generate(MESSAGES)).rejects.toThrow(/timed out after 1s/i);
  }, 4000);

  it('rejects instead of stalling when the stream stops delivering bytes', async () => {
    stubFetch(() => stalledSseResponse());

    await expect(drainStream(engineWithShortDeadline())).rejects.toThrow(/no streamed output/i);
  }, 4000);
});
