import { describe, expect, it } from 'vitest';
import { toAppConnectionTestResult } from './connection-result';

describe('toAppConnectionTestResult', () => {
  it('maps camelCase engine fields onto the snake_case app contract', () => {
    expect(
      toAppConnectionTestResult({
        success: true,
        latencyMs: 42,
        modelInfo: { name: 'gpt-4o', contextLength: 128000 },
      }),
    ).toEqual({
      success: true,
      latency_ms: 42,
      error: undefined,
      model_info: { name: 'gpt-4o', context_length: 128000 },
    });
  });

  it('drops model_info when the engine did not report one', () => {
    expect(toAppConnectionTestResult({ success: false, error: 'bad key' })).toEqual({
      success: false,
      latency_ms: undefined,
      error: 'bad key',
      model_info: undefined,
    });
  });

  it('omits context_length when the engine leaves it undefined', () => {
    expect(toAppConnectionTestResult({ success: true, modelInfo: { name: 'llama3.2' } }).model_info).toEqual({
      name: 'llama3.2',
      context_length: undefined,
    });
  });
});
