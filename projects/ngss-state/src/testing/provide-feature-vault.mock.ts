import { Provider } from '@angular/core';
import { FeatureVaultModel } from '../lib/models/feature-vault.model';
import { getOrCreateFeatureVaultToken } from '../lib/tokens/feature-token-registry';

/**
 * Provides a mock feature vault for unit tests.
 *
 * Simplifies DI setup when testing feature services without exposing
 * internal vault tokens publicly.
 *
 * @param key The feature key (e.g., `'user'`).
 * @param mockVault The mock vault object implementing {@link FeatureVaultModel}.
 * @returns An Angular Provider that binds the mock vault to the correct token.
 *
 * @example
 * ```ts
 * TestBed.configureTestingModule({
 *   providers: [
 *     provideMockFeatureVault('user', {
 *       _set: jasmine.createSpy(),
 *       _patch: jasmine.createSpy(),
 *       state: signal({ loading: false, entities: {}, error: null }).asReadonly()
 *     })
 *   ]
 * });
 * ```
 */
export function provideMockFeatureVault<T>(key: string, mockVault: FeatureVaultModel<T>): Provider {
  const token = getOrCreateFeatureVaultToken<T>(key);
  return { provide: token, useValue: mockVault };
}
