import { InjectionToken } from '@angular/core';
import { ResourceVaultModel } from '@ngvault/shared-models';

export function FEATURE_CELL_TOKEN<T>(key: string) {
  return new InjectionToken<ResourceVaultModel<T>>(`NGVAULT_FEATURE_CELL:${key}`);
}
