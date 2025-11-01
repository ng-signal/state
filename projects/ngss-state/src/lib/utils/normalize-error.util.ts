import { HttpErrorResponse } from '@angular/common/http';
import { ResourceStateError } from '../models/resource-state-error.model';

/**
 * Converts any kind of error (HTTP, Error, string, or object)
 * into a structured {@link ResourceStateError} format.
 *
 * This function is used internally by the vault and resource utilities
 * to unify error handling across all reactive state operations.
 *
 * @param err The raw error to normalize.
 * @returns A normalized error object containing consistent fields.
 *
 * @example
 * ```ts
 * const normalized = normalizeError(new HttpErrorResponse({ status: 404 }));
 * console.log(normalized.message); // 'HTTP error'
 * ```
 */
export function normalizeError(err: unknown): ResourceStateError {
  if (err instanceof HttpErrorResponse) {
    return {
      message: err.message || err.statusText || 'HTTP error',
      status: err.status,
      statusText: err.statusText,
      details: err.error
    };
  }

  if (err instanceof Error) {
    return {
      message: err.message || 'Unexpected error',
      details: err.stack
    };
  }

  if (typeof err === 'string') {
    return { message: err, details: err };
  }

  return {
    message: 'Unexpected error',
    details: err
  };
}
