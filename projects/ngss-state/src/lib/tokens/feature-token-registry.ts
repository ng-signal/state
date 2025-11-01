import { getNgssStoreConfig } from '../config/ngss-store.config';
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
  const { strict } = getNgssStoreConfig();

  if (_featureVaultTokens.has(key)) {
    // istanbul ignore next
    if (strict) {
      const existing = _featureVaultTokens.get(key);
      throw new Error(
        `[NGSS] Duplicate FeatureStore key detected: "${key}".\n` +
          `Each @FeatureStore() must have a unique feature key.\n` +
          `Existing token: ${existing}`
      );
    }
  } else {
    _featureVaultTokens.set(key, FEATURE_VAULT_TOKEN<T>(key));
  }

  return _featureVaultTokens.get(key)!;
}
