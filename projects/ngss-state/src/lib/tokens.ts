import { InjectionToken, Signal } from '@angular/core';

export interface FeatureVault<T> {
  _set(next: T): void;
  _patch(partial: Partial<T>): void;
  readonly state: Signal<T>;
}

export const STORE_ROOT = new InjectionToken<true>('NGSS_STORE_ROOT');
export const FEATURE_REGISTRY = new InjectionToken<Array<{ key: string; token: unknown }>>('NGSS_FEATURE_REGISTRY');

export function FEATURE_VAULT_TOKEN<T>(key: string) {
  return new InjectionToken<FeatureVault<T>>(`NGSS_FEATURE_VAULT:${key}`);
}
