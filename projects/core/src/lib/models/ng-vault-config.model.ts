import { NgVaultInspectableQueue, NgVaultQueue } from '@ngvault/shared';
import { NgVaultLogLevel } from '../types/ngvault-log-level.type';

// store-config.ts
export interface NgVaultConfigModel {
  queue?: new () => NgVaultInspectableQueue | NgVaultQueue;
  devMode?: boolean;
  strict?: boolean;
  logLevel?: NgVaultLogLevel;
}
