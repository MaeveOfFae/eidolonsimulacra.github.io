import { describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { validateBody, validateQuery } from './validation.js';

const bodySchema = z.object({ name: z.string().min(1) });

interface FakeResponse {
  statusCode: number;
  body: unknown;
  status: (code: number) => FakeResponse;
  json: (payload: unknown) => FakeResponse;
}

function createResponse(): FakeResponse {
  const res: FakeResponse = {
    statusCode: 0,
    body: undefined,
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(payload: unknown) {
      res.body = payload;
      return res;
    },
  };

  return res;
}

function asResponse(res: FakeResponse): Response {
  return res as unknown as Response;
}

function asNext(next: ReturnType<typeof vi.fn>): NextFunction {
  return next as unknown as NextFunction;
}

describe('validation middleware', () => {
  it('passes a valid body through to next', async () => {
    const req = { body: { name: 'ok' } } as unknown as Request;
    const res = createResponse();
    const next = vi.fn();

    await validateBody(bodySchema)(req, asResponse(res), asNext(next));

    expect(req.body).toEqual({ name: 'ok' });
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(0);
  });

  it('responds with 400 and skips next for an invalid body', async () => {
    const req = { body: { name: '' } } as unknown as Request;
    const res = createResponse();
    const next = vi.fn();

    await validateBody(bodySchema)(req, asResponse(res), asNext(next));

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(400);
    expect(res.body).toMatchObject({ error: 'Validation failed' });
  });

  it('applies schema defaults to a query object', async () => {
    const querySchema = z.object({ limit: z.coerce.number().default(20) });
    const req = { query: {} } as unknown as Request;
    const res = createResponse();
    const next = vi.fn();

    await validateQuery(querySchema)(req, asResponse(res), asNext(next));

    expect(req.query).toEqual({ limit: 20 });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('forwards unexpected errors to next', async () => {
    const explodingSchema = {
      parseAsync: async () => {
        throw new Error('boom');
      },
    } as unknown as z.AnyZodObject;
    const req = { body: {} } as unknown as Request;
    const res = createResponse();
    const next = vi.fn();

    await validateBody(explodingSchema)(req, asResponse(res), asNext(next));

    expect(res.statusCode).toBe(0);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
