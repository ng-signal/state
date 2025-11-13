// projects/shared/src/lib/interfaces/vault-behavior.interface.ts
import { NgVaultReducerFunction } from '@ngvault/shared';
import { VaultBehavior } from './vault-behavior.interface';

export interface VaultReducerBehavior<T> extends VaultBehavior<T> {
  type: 'reduce';
  applyReducer(current: T, reducer: NgVaultReducerFunction<T>): T;
}
