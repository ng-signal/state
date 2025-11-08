import { NgVaultAsyncQueue } from '../services/ngvault-async-queue';

// store-config.ts
export interface NgVaultConfigModel {
  queue?: new () => NgVaultAsyncQueue;
  devMode?: boolean;
  strict?: boolean;
}
