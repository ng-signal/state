// projects/shared/src/lib/interfaces/vault-behavior.interface.ts
import { VaultBehaviorContext } from '../contexts/vault-behavior.context';
import { VaultBehavior } from './vault-behavior.interface';

export interface VaultReducerBehavior<T> extends VaultBehavior<T> {
  type: 'reduce';
  applyReducers(ctx: VaultBehaviorContext<T>, current: T): Promise<T | undefined> | T | undefined;
}
