import { NgVaultBehaviorFactoryContext } from '../contexts/ngvault-behavior-factory.context';
import { NgVaultBehavior, NgVaultBehaviorExtension } from '../interfaces/ngvault-behavior.interface';
import { NgVaultBehaviorType } from './ngvault-behavior.type';

export interface NgVaultBehaviorFactory<
  T = unknown,
  E extends NgVaultBehaviorExtension<T> = NgVaultBehaviorExtension<T>
> {
  (context: NgVaultBehaviorFactoryContext): NgVaultBehavior<T, E>;
  critical: boolean;
  type: NgVaultBehaviorType;
}
