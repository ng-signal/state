// projects/shared/src/lib/interfaces/vault-behavior.interface.ts
import { NgVaultReducerFunction } from '@ngvault/shared';
import { NgVaultBehavior } from './ngvault-behavior.interface';

export interface NgVaultReduceBehavior<T> extends NgVaultBehavior<T> {
  type: 'reduce';
  applyReducer(current: T, reducer: NgVaultReducerFunction<T>): T;
}
