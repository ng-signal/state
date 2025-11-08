import { InjectionToken } from '@angular/core';
import { FeatureCell } from '@ngvault/shared';

export function FEATURE_CELL_TOKEN<T>(key: string) {
  return new InjectionToken<FeatureCell<T>>(`NGVAULT_FEATURE_CELL:${key}`);
}
