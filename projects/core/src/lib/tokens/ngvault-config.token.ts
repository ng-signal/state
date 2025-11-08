// projects/shared-models/src/lib/tokens/ngvault-queue.token.ts
import { InjectionToken } from '@angular/core';
import { NgVaultConfigModel } from '../models/ng-vault-config.model';

export const NGVAULT_CONFIG = new InjectionToken<NgVaultConfigModel>('NGVAULT_CONFIG', {
  providedIn: 'root',
  factory: () => {
    throw new Error('[NgVault] Missing root Vault configuration. Did you forget to call provideVault()?');
  }
});
