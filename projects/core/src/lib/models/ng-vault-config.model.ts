import { NgVaultAsyncDiagnosticQueue } from '../services/ngvault-async-diagnostic-queue';
import { NgVaultAsyncQueue } from '../services/ngvault-async-queue';
import { NgVaultSyncQueue } from '../services/ngvault-sync-queue';

// store-config.ts
export interface NgVaultConfigModel {
  queue?: new () => NgVaultAsyncQueue | NgVaultAsyncDiagnosticQueue | NgVaultSyncQueue;
  devMode?: boolean;
  strict?: boolean;
}
