import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { NormalizedError } from '@ngss/state';
import { Observable } from 'rxjs';
import { ResourceSignal } from '../models/resource-signal.model';

/**
 * Creates a reactive `ResourceSignal` that mirrors the lifecycle
 * of an `Observable` — loading, data, and error — as `Signal`s.
 *
 * - Subscribes immediately.
 * - Does not alter the source observable.
 * - Updates signals on `next`, `error`, and `complete`.
 */
export function createResourceSignal<T>(source$: Observable<T>): ResourceSignal<T> {
  const loading = signal(false);
  const data = signal<T | null>(null);
  const error = signal<NormalizedError | null>(null);

  loading.set(true);
  error.set(null);

  source$.subscribe({
    next: (value) => {
      data.set(value);
      error.set(null);
    },
    error: (err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        error.set({
          message: err.message || err.statusText || 'HTTP error',
          status: err.status,
          details: err.error
        });
      } else if (err instanceof Error) {
        error.set({
          message: err.message || 'Unexpected error',
          details: err.stack
        });
      } else {
        error.set({
          message: String(err),
          details: err
        });
      }

      data.set(null);
      loading.set(false);
    },
    complete: () => {
      loading.set(false);
    }
  });

  return {
    loading: loading.asReadonly(),
    data: data.asReadonly(),
    error: error.asReadonly()
  };
}
