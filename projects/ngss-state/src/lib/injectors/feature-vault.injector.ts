import { inject } from '@angular/core';
import { NGSS_METADATA_KEYS } from '../constants/metadata-keys.constant';
import { FeatureVaultModel } from '../models/feature-vault.model';
import { getOrCreateFeatureVaultToken } from '../tokens/feature-token-registry';

/**
 * Injects the feature-specific vault (`FeatureVaultModel<T>`)
 * for a service decorated with `@FeatureStore()`.
 *
 * @param featureClass The decorated feature store class.
 * @returns The vault instance associated with the feature key.
 */
export function injectFeatureVault<T>(
  featureClass?: abstract new (...args: unknown[]) => object
): FeatureVaultModel<T> {
  const key = featureClass ? Reflect.getMetadata(NGSS_METADATA_KEYS.FEATURE_KEY, featureClass) : undefined;

  if (!key) {
    throw new Error(`injectFeatureVault() must be called inside a @FeatureStore()-decorated service.`);
  }

  const token = getOrCreateFeatureVaultToken<T>(key);
  return inject(token) as FeatureVaultModel<T>;
}
