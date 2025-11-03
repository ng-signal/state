import { Provider } from '@angular/core';
import { setNgVaultConfig } from './config/ng-vault.config';
import { FEATURE_CELL_REGISTRY } from './constants/feature-cell-registry.constant';
import { VAULT_ROOT } from './constants/vault-root.constant';
import { isTestEnv } from './helpers/testing-environment.helper';
import { NgVaultConfigModel } from './models/ng-vault-config.model';

export function provideVault(config: Partial<NgVaultConfigModel> = {}): Provider[] {
  setNgVaultConfig({
    strict: config.strict ?? !isTestEnv()
  });

  return [
    { provide: VAULT_ROOT, useValue: true },
    { provide: FEATURE_CELL_REGISTRY, multi: true, useValue: [] }
  ];
}
