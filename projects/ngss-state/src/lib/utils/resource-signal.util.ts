import { computed, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ResourceStateError } from '../models/resource-state-error.model';
import { VaultSignalRef } from '../models/vault-signal.ref';
import { resourceError } from './resource-error.util';

/**
 * Creates a reactive `ResourceSignal` that mirrors the lifecycle
 * of an `Observable` — loading, data, and error — as `Signal`s.
 *
 * - Subscribes immediately.
 * - Does not alter the source observable.
 * - Updates signals on `next`, `error`, and `complete`.
 */
export function createResourceSignal<T>(source$: Observable<T>): VaultSignalRef<T> {
  const _loading = signal(false);
  const _value = signal<T | undefined>(undefined);
  const _error = signal<ResourceStateError | null>(null);
  const _hasValue = computed(() => _value() !== null && _value() !== undefined);

  _loading.set(true);
  _error.set(null);

  source$.subscribe({
    next: (value) => {
      _value.set(value);
      _error.set(null);
    },
    error: (err: unknown) => {
      _error.set(resourceError(err));
      _value.set(undefined);
      _loading.set(false);
    },
    complete: () => {
      _loading.set(false);
    }
  });

  return {
    isLoading: _loading.asReadonly(),
    value: _value.asReadonly(),
    error: _error.asReadonly(),
    hasValue: _hasValue
  };
}
