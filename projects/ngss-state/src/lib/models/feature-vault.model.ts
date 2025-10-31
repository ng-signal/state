import { Signal } from '@angular/core';
import { Observable } from 'rxjs';
import { NormalizedError } from './resource-signal.normalized-error.model';

/**
 * Represents the internal vault for a feature's reactive state
 * managed by **@ngss/state**.
 *
 * @template T The shape of the feature’s state model.
 *
 * A `FeatureVaultModel<T>` provides a structured reactive container
 * with three readonly signals — `loading`, `data`, and `error`.
 *
 * It also exposes `_set` and `_patch` helpers for controlled mutation,
 * and optionally `fromResource` for synchronizing Observables.
 */
export interface FeatureVaultModel<T> {
  /**
   * Reactive state object — all signals are readonly.
   */
  readonly state: {
    loading: Signal<boolean>;
    data: Signal<T | null>;
    error: Signal<NormalizedError | null>;
  };

  /**
   * Connects an observable resource stream to this vault’s lifecycle.
   * Automatically updates the vault as new values, errors, or completions occur.
   */
  fromResource?(source$: Observable<T>): void;
}
