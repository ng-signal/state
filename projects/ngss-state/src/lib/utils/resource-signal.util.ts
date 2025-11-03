import { signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ResourceSignal } from '../models/resource-signal.model';
import { ResourceStateError } from '../models/resource-state-error.model';
import { resourceError } from './resource-error.util';

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
  const error = signal<ResourceStateError | null>(null);

  loading.set(true);
  error.set(null);

  source$.subscribe({
    next: (value) => {
      data.set(value);
      error.set(null);
    },
    error: (err: unknown) => {
      error.set(resourceError(err));
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
