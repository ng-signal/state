import { inject } from '@angular/core';
import { ResourceVaultModel } from '@ngvault/shared-models';
import { NGVAULT_METADATA_KEYS } from '../constants/metadata-keys.constant';
import { getOrCreateFeatureCellToken } from '../tokens/feature-cell-token-registry';

export function injectVault<T>(featureCellClass?: abstract new (...args: unknown[]) => object): ResourceVaultModel<T> {
  const key = featureCellClass
    ? Reflect.getMetadata(NGVAULT_METADATA_KEYS.FEATURE_CELL_KEY, featureCellClass)
    : undefined;

  if (!key) {
    throw new Error(`injectVault() must be called inside a @FeatureCell()-decorated service.`);
  }

  const token = getOrCreateFeatureCellToken<T>(key, true);
  return inject(token) as ResourceVaultModel<T>;
}
