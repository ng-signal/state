import { InjectionToken } from '@angular/core';

export const FEATURE_CELL_REGISTRY = new InjectionToken<Array<{ key: string; token: unknown }>>(
  'NGVAULT_FEATURE_CELL_REGISTRY',
  {
    providedIn: 'root',
    factory: () => {
      throw new Error('[NgVault] Missing root Vault configuration. Did you forget to call provideVault()?');
    }
  }
);
