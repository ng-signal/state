// projects/shared/src/lib/interfaces/vault-behavior.interface.ts
import { NgVaultBehavior } from './ngvault-behavior.interface';

export interface NgVaultPersistBehavior<T> extends NgVaultBehavior<T> {
  type: 'persist';
  persistState(current: T): Promise<void> | void;
  removeState(): void;
  loadState(): T | undefined;
}
