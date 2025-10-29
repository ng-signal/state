import { Provider, Type, signal } from '@angular/core';
import { FeatureDescriptorModel } from '@ngss/state';
import { FEATURE_REGISTRY } from './constants/feature-registry.constant';
import { FeatureVaultModel } from './model/feature-vault.model';
import { FEATURE_VAULT_TOKEN } from './tokens';

/**
 * Registers a feature state and its associated service with the NG Signal Store.
 *
 * @template Svc The feature service type that manages state, actions, and selectors.
 * @template T The feature’s state model type.
 *
 * The `provideState()` function connects a **feature service** to its own
 * isolated **feature vault** (a signal-based container for state) and adds it
 * to the global feature registry.
 *
 * - The vault is created from the `FeatureDescriptorModel.initial` value.
 * - The service gains write access to the vault through injection.
 * - Other consumers only read from the exposed signals.
 * - The feature is automatically registered for devtools or debugging.
 *
 * Typically used within application bootstrap configuration or route-level
 * providers to register feature-scoped state services.
 *
 * @example
 * ```ts
 * // 1. Define your state model
 * interface UserState {
 *   loading: boolean;
 *   entities: Record<string, User>;
 *   error: string | null;
 * }
 *
 * // 2. Provide the feature
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideState(UserStateService, {
 *       key: 'user',
 *       initial: { loading: false, entities: {}, error: null }
 *     })
 *   ]
 * });
 * ```
 *
 * @param service The feature service class that manages this feature’s state.
 * @param desc The feature descriptor defining the unique key and initial state.
 * @returns An array of Angular providers that set up the feature vault,
 *          the feature service, and register the feature in the global registry.
 */
export function provideState<Svc, T>(service: Type<Svc>, desc: FeatureDescriptorModel<T>): Provider[] {
  /**
   * The feature-specific injection token for the vault.
   */
  const token = FEATURE_VAULT_TOKEN<T>(desc.key);

  /**
   * Provides the feature vault that holds this feature’s state.
   * The vault exposes:
   * - `_set`: replaces the entire state
   * - `_patch`: merges partial state
   * - `state`: a read-only signal for observation
   */
  const vaultProvider: Provider = {
    provide: token,
    useFactory: (): FeatureVaultModel<T> => {
      const s = signal<T>(desc.initial);

      const _set = (next: T) => s.set(next);
      const _patch = (partial: Partial<T>) => {
        const curr = s();
        s.set({ ...curr, ...partial });
      };

      return {
        _set,
        _patch,
        state: s.asReadonly()
      };
    }
  };

  /**
   * Registers this feature service in the global feature registry.
   * Useful for devtools, debugging, or dynamic feature discovery.
   */
  const registryProvider: Provider = {
    provide: FEATURE_REGISTRY,
    multi: true,
    useValue: { key: desc.key, token: service }
  };

  /**
   * Returns all providers required to register and use the feature:
   * - The feature vault provider
   * - The feature service itself
   * - The feature registry entry
   */
  return [vaultProvider, service, registryProvider];
}
