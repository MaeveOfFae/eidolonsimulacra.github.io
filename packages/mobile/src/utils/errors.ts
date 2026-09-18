import { APIError } from '@char-gen/shared';

type ErrorLike = {
  detail?: string;
  error?: string;
  message?: string;
};

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof APIError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null) {
    const errorLike = error as ErrorLike;
    if (typeof errorLike.detail === 'string' && errorLike.detail.trim()) {
      return errorLike.detail;
    }
    if (typeof errorLike.error === 'string' && errorLike.error.trim()) {
      return errorLike.error;
    }
    if (typeof errorLike.message === 'string' && errorLike.message.trim()) {
      return errorLike.message;
    }
  }

  return fallback;
}