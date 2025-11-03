import { getNgVaultConfig } from '../config/ng-vault.config';
import { FEATURE_CELL_TOKEN } from './feature-cell-token';

const _featureCellTokens = new Map<string, ReturnType<typeof FEATURE_CELL_TOKEN>>();

export function getOrCreateFeatureCellToken<T>(key: string, allowExisting: boolean) {
  const { strict } = getNgVaultConfig();

  if (_featureCellTokens.has(key)) {
    // istanbul ignore next
    if (strict && !allowExisting) {
      const existing = _featureCellTokens.get(key);
      throw new Error(
        `[NgVault] Duplicate FeatureCell key detected: "${key}".\n` +
          `Each @FeatureCell() must have a unique feature cell key.\n` +
          `Existing token: ${existing}`
      );
    }
  } else {
    _featureCellTokens.set(key, FEATURE_CELL_TOKEN<T>(key));
  }

  return _featureCellTokens.get(key)!;
}
