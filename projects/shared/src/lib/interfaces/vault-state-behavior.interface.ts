// projects/shared/src/lib/interfaces/vault-behavior.interface.ts
import { VaultBehaviorContext } from '../contexts/vault-behavior.context';
import { VaultBehavior } from './vault-behavior.interface';

export interface VaultStateBehavior<T> extends VaultBehavior<T> {
  type: 'state';
  computeState(ctx: VaultBehaviorContext<T>): Promise<T | undefined> | T | undefined;
}
