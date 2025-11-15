import { inject } from '@angular/core';
import { NgVaultFeatureCell } from '@ngvault/shared';
import { NGVAULT_METADATA_KEYS } from '../constants/metadata-keys.constant';
import { getOrCreateFeatureCellToken } from '../tokens/feature-cell-token-registry';

import { MergeBehaviorExtensions, NgVaultBehaviorFactory } from '@ngvault/shared';

// eslint-disable-next-line
export function injectVault<T, B extends readonly NgVaultBehaviorFactory<any, any>[] = []>(
  // eslint-disable-next-line
  featureCellClass?: abstract new (...args: any[]) => object
): NgVaultFeatureCell<T> & MergeBehaviorExtensions<B> {
  const key = featureCellClass
    ? Reflect.getMetadata(NGVAULT_METADATA_KEYS.FEATURE_CELL_KEY, featureCellClass)
    : undefined;

  if (!key) {
    throw new Error(`injectVault() must be called inside a @FeatureCell()-decorated service.`);
  }

  const token = getOrCreateFeatureCellToken<T>(key, true);

  return inject(token) as NgVaultFeatureCell<T> & MergeBehaviorExtensions<B>;
}
