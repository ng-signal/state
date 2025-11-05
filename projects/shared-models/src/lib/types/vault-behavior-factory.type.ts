import { VaultBehaviorFactoryContext } from '../contexts/vault-behavior-factory.context';
import { VaultBehavior } from '../interfaces/vault-behavior.interface';

export interface VaultBehaviorFactory<T = unknown> {
  (context: VaultBehaviorFactoryContext): VaultBehavior<T>;
  critical?: boolean;
}
