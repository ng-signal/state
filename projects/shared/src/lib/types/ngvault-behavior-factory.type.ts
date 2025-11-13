import { VaultBehaviorFactoryContext } from '../contexts/vault-behavior-factory.context';
import { VaultBehavior, VaultBehaviorExtension } from '../interfaces/vault-behavior.interface';
import { NgVaultBehaviorType } from './ngvault-behavior.type';

export interface NgVaultBehaviorFactory<T = unknown, E extends VaultBehaviorExtension<T> = VaultBehaviorExtension<T>> {
  (context: VaultBehaviorFactoryContext): VaultBehavior<T, E>;
  critical: boolean;
  type: NgVaultBehaviorType;
}
