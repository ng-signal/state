// projects/shared/src/lib/interfaces/vault-behavior.interface.ts
import { NgVaultBehaviorContext } from '../contexts/ngvault-behavior.context';
import { NgVaultBehavior } from './ngvault-behavior.interface';

export interface NgVaultStateBehavior<T> extends NgVaultBehavior<T> {
  type: 'state';
  computeState(ctx: NgVaultBehaviorContext<T>): Promise<T | undefined> | T | undefined;
}
