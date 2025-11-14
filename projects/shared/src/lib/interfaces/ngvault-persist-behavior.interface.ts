// projects/shared/src/lib/interfaces/vault-behavior.interface.ts
import { NgVaultBehaviorContext } from '../contexts/ngvault-behavior.context';
import { NgVaultBehavior } from './ngvault-behavior.interface';

export interface NgVaultPersistBehavior<T> extends NgVaultBehavior<T> {
  type: 'persistence';
  persistState(ctx: NgVaultBehaviorContext<T>, current: T): Promise<void> | void;
}
