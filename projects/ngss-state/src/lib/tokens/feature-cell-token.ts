import { InjectionToken } from '@angular/core';
import { ResourceVaultModel } from '../models/resource-vault.model';

export function FEATURE_CELL_TOKEN<T>(key: string) {
  return new InjectionToken<ResourceVaultModel<T>>(`NGVAULT_FEATURE_CELL:${key}`);
}
