import { Signal } from '@angular/core';

/**
 * Represents the internal vault for a feature's reactive state
 * managed by **@ngss/state**.
 *
 * @template T The shape of the feature’s state model.
 *
 * A `FeatureVaultModel<T>` provides the low-level, signal-based
 * state container used by a feature service. It exposes internal
 * mutation helpers (`_set`, `_patch`) for the service to update state,
 * and a read-only `Signal<T>` that consumers can observe.
 *
 * Typically, an instance of this vault is injected into the feature
 * service via `FEATURE_VAULT_TOKEN<T>` and never exposed directly.
 */
export interface FeatureVaultModel<T> {
  /**
   * Replace the current state with a new snapshot.
   *
   * This method completely overwrites the existing state.
   * It should be used for full state resets or when applying
   * an immutable update derived from the current value.
   *
   * @param next The next complete state object.
   *
   * @example
   * ```ts
   * vault._set({ loading: true, entities: {}, error: null });
   * ```
   */
  _set(next: T): void;

  /**
   * Merge a partial state object into the current state.
   *
   * Performs a shallow immutable merge of the provided keys.
   * This is a convenience method for incremental updates.
   *
   * @param partial A partial subset of the state to update.
   *
   * @example
   * ```ts
   * vault._patch({ loading: false });
   * vault._patch({ entities: { ...curr.entities, [id]: user } });
   * ```
   */
  _patch(partial: Partial<T>): void;

  /**
   * The read-only signal representing the current state snapshot.
   *
   * Consumers should read from `state()` or derive computed signals
   * from it, but never mutate it directly. The feature service uses
   * `_set` and `_patch` to modify the underlying value.
   *
   * @example
   * ```ts
   * const loading = computed(() => vault.state().loading);
   * ```
   */
  readonly state: Signal<T>;
}
