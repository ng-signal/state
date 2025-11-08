import { VaultBehaviorFactoryContext } from '../contexts/vault-behavior-factory.context';
import { VaultBehavior, VaultBehaviorExtension } from '../interfaces/vault-behavior.interface';
import { VaultBehaviorType } from './vault-behavior.type';

export interface VaultBehaviorFactory<T = unknown, E extends VaultBehaviorExtension<T> = VaultBehaviorExtension<T>> {
  (context: VaultBehaviorFactoryContext): VaultBehavior<T, E>;
  critical: boolean;
  type: VaultBehaviorType;
}
