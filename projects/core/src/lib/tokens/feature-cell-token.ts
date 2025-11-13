import { InjectionToken } from '@angular/core';
import { NgVaultFeatureCell } from '@ngvault/shared';

export function FEATURE_CELL_TOKEN<T>(key: string) {
  return new InjectionToken<NgVaultFeatureCell<T>>(`NGVAULT_FEATURE_CELL:${key}`);
}
