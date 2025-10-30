import { FEATURE_VAULT_TOKEN } from './feature-vault-token';

/**
 * Internal cache ensuring each feature key maps to exactly one InjectionToken.
 * This mirrors how NgRx caches feature tokens in `StoreModule.forFeature()`.
 */
const _featureVaultTokens = new Map<string, ReturnType<typeof FEATURE_VAULT_TOKEN>>();

/**
 * Retrieves an existing token for the given feature key, or creates one if missing.
 *
 * @param key The unique feature identifier (matches FeatureDescriptorModel.key)
 */
export function getOrCreateFeatureVaultToken<T>(key: string) {
  if (!_featureVaultTokens.has(key)) {
    _featureVaultTokens.set(key, FEATURE_VAULT_TOKEN<T>(key));
  }
  return _featureVaultTokens.get(key)!;
}
