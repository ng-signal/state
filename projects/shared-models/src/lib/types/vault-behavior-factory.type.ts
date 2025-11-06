import { VaultBehaviorFactoryContext } from '../contexts/vault-behavior-factory.context';
import { VaultBehavior } from '../interfaces/vault-behavior.interface';
import { VaultBehaviorType } from './vault-behavior.type';

export interface VaultBehaviorFactory<T = unknown> {
  (context: VaultBehaviorFactoryContext): VaultBehavior<T>;
  critical: boolean;
  type: VaultBehaviorType;
}
