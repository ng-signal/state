import 'reflect-metadata';
import { NGSS_METADATA_KEYS } from '../constants/metadata-keys.constant';

/**
 * Marks a class as an NGSS Feature Store.
 * Stores the feature key as metadata for DI and devtools.
 */
export function FeatureStore<_TState extends object>(key: string) {
  return function (target: abstract new (...args: unknown[]) => object): void {
    Reflect.defineMetadata(NGSS_METADATA_KEYS.FEATURE_KEY, key, target);
  };
}
