import { NgVaultInspectableQueue, NgVaultQueue } from '@ngvault/shared-models';
import { NgVaultLogLevel } from '../types/ngvault-log-level.type';

// store-config.ts
export interface NgVaultConfigModel {
  queue?: new () => NgVaultInspectableQueue | NgVaultQueue;
  devMode?: boolean;
  strict?: boolean;
  logLevel?: NgVaultLogLevel;
}
