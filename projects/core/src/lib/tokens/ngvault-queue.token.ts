// projects/shared-models/src/lib/tokens/ngvault-queue.token.ts
import { InjectionToken } from '@angular/core';
import { NgVaultAsyncQueue } from '../services/ngvault-async-queue';

export const NGVAULT_QUEUE = new InjectionToken<NgVaultAsyncQueue>('NGVAULT_QUEUE', {
  providedIn: 'root',
  factory: () => {
    throw new Error('[NgVault] Missing root Vault configuration. Did you forget to call provideVault()?');
  }
});
