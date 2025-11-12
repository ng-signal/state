// projects/shared/src/lib/interfaces/vault-behavior.interface.ts
import { VaultBehaviorContext } from '../contexts/vault-behavior.context';
import { VaultBehavior } from './vault-behavior.interface';

export interface VaultEncryptionBehavior<T> extends VaultBehavior<T> {
  type: 'encryption';
  encryptState(ctx: VaultBehaviorContext<T>, current: T): Promise<T | undefined> | T | undefined;
}
