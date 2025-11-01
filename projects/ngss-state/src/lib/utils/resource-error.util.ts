import { HttpErrorResponse } from '@angular/common/http';
import { ResourceStateError } from '../models/resource-state-error.model';

export function resourceError(err: unknown): ResourceStateError {
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
