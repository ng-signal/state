import { InjectionToken } from '@angular/core';
import { FeatureVaultModel } from '../models/feature-vault.model';

/**
 * Factory function that creates a **unique injection token** for a feature’s
 * internal state vault.
 *
 * The `FEATURE_VAULT_TOKEN<T>(key)` function generates an
 * `InjectionToken<FeatureVaultModel<T>>` tied to a specific feature key.
 * Each feature registered through {@link provideState} receives its own
 * dedicated vault token that stores and manages the feature’s signal state.
 *
 * The token is used internally by the NG Signal Store to:
 * - Inject the correct `FeatureVaultModel<T>` into the feature’s service.
 * - Isolate state between features (no cross-feature collisions).
 * - Support multiple feature instances in separate injector scopes.
 *
 * @template T The shape of the feature’s state model.
 *
 * @param key A unique string identifier for the feature (matches {@link FeatureDescriptorModel.key}).
 * @returns A strongly typed `InjectionToken<FeatureVaultModel<T>>`
 *          that references the feature’s private state vault.
 *
 * @example
 * ```ts
 * import { inject } from '@angular/core';
 * import { FEATURE_VAULT_TOKEN } from '@ngss/state';
 * import { FeatureVaultModel } from '@ngss/state';
 *
 * interface UserState {
 *   loading: boolean;
 *   entities: Record<string, User>;
 *   error: string | null;
 * }
 *
 * // Inject the vault for the 'user' feature
 * const vault = inject(FEATURE_VAULT_TOKEN<UserState>('user'));
 *
 * vault._patch({ loading: true });
 * console.log(vault.state()); // { loading: true, entities: {}, error: null }
 * ```
 *
 * @remarks
 * - The vault token is **feature-scoped** and created dynamically per feature.
 * - It should never be exported or injected outside the feature’s service.
 *
 * @see {@link FeatureVaultModel}
 * @see {@link provideState}
 */
export function FEATURE_VAULT_TOKEN<T>(key: string) {
  return new InjectionToken<FeatureVaultModel<T>>(`NGSS_FEATURE_VAULT:${key}`);
}
