import { InjectionToken } from '@angular/core';
import { ResourceVaultModel } from '../models/resource-vault.model';

export function FEATURE_VAULT_TOKEN<T>(key: string) {
  return new InjectionToken<ResourceVaultModel<T>>(`NGSS_FEATURE_VAULT:${key}`);
}
