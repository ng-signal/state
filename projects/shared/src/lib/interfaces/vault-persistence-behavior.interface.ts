// projects/shared/src/lib/interfaces/vault-behavior.interface.ts
import { VaultBehaviorContext } from '../contexts/vault-behavior.context';
import { VaultBehavior } from './vault-behavior.interface';

export interface VaultPersistenceBehavior<T> extends VaultBehavior<T> {
  type: 'persistence';
  persistState(ctx: VaultBehaviorContext<T>, current: T): Promise<void> | void;
}
