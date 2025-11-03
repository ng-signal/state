import 'reflect-metadata';
import { NGVAULT_METADATA_KEYS } from '../constants/metadata-keys.constant';

export function FeatureCell<_TState extends object>(key: string) {
  return function (target: abstract new (...args: unknown[]) => object): void {
    Reflect.defineMetadata(NGVAULT_METADATA_KEYS.FEATURE_CELL_KEY, key, target);
  };
}
