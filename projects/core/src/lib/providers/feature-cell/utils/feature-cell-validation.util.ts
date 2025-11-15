import { NgVaultBehaviorFactory, NgVaultBehaviorTypes } from '@ngvault/shared';
import { FeatureCellDescriptorModel } from '../../../models/feature-cell-descriptor.model';

export function featureCellValidation<T>(
  descriptor: FeatureCellDescriptorModel<T>,
  behaviors: NgVaultBehaviorFactory<T>[] = []
): void {
  // Prevent incorrect initialization (e.g., passing a resource object)
  if (
    typeof descriptor.initial === 'object' &&
    descriptor.initial !== null &&
    // eslint-disable-next-line
    'data' in (descriptor.initial as any)
  ) {
    throw new Error(
      `[NgVault] Invalid FeatureCellDescriptorModel.initial for feature "${descriptor.key}". ` +
        `Expected raw data (e.g., [] or {}), but received an object with resource fields { loading, data, error }. ` +
        `Pass plain data to avoid double-wrapping.`
    );
  }

  // eslint-disable-next-line
  const encryptBehaviors = behaviors.filter((behavior) => (behavior as any).type === NgVaultBehaviorTypes.Encrypt);

  if (encryptBehaviors.length > 1) {
    throw new Error(`[NgVault] FeatureCell cannot register multiple encryption behaviors.`);
  }
}
