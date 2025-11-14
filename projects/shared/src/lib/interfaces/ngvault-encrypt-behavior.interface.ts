// projects/shared/src/lib/interfaces/vault-behavior.interface.ts
import { NgVaultBehaviorContext } from '../contexts/ngvault-behavior.context';
import { NgVaultBehavior } from './ngvault-behavior.interface';

export interface NgVaultEncryptBehavior<T> extends NgVaultBehavior<T> {
  type: 'encrypt';
  encryptState(ctx: NgVaultBehaviorContext<T>, current: T): Promise<T | undefined> | T | undefined;
}
