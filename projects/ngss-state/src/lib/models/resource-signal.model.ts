import { Signal } from '@angular/core';
import { NormalizedError } from './resource-signal.normalized-error.model';

/**
 * Reactive model representing the state of an HTTP resource.
 *
 * Each property is a Signal that automatically updates in response to the
 * associated observable stream.
 */
export interface ResourceSignal<T> {
  /** Indicates whether the HTTP request is currently in progress. */
  loading: Signal<boolean>;

  /** Emits the latest successfully received data (or null if none). */
  data: Signal<T | null>;

  /** Emits the latest HttpErrorResponse if a request fails. */
  error: Signal<NormalizedError | null>;
}
