import { VaultBehaviorFactoryContext } from '@ngvault/shared';
import { VaultBehaviorContext } from '../contexts/vault-behavior.context';
import { VaultBehaviorType } from '../types/vault-behavior.type';

// Reusable function type each extension provides
// eslint-disable-next-line
type BehaviorExtFn<T = unknown> = (key: string, ctx: VaultBehaviorContext<T>, ...args: any[]) => unknown;

// The extension object a behavior may return
export type VaultBehaviorExtension<T = unknown> = Partial<Record<string, BehaviorExtFn<T>>>;

// Behavior interface
export interface VaultBehavior<T = unknown, E extends VaultBehaviorExtension<T> = VaultBehaviorExtension<T>> {
  readonly type: VaultBehaviorType;
  readonly key: string;

  // Optional override policy for colliding keys
  allowOverride?: string[];

  // Return an object whose values are extension functions (or nothing)
  extendCellAPI?(): E | void;
}

// Factory interface — note: same E constraint as behavior
export interface VaultBehaviorFactory<T = unknown, E extends VaultBehaviorExtension<T> = VaultBehaviorExtension<T>> {
  (context: VaultBehaviorFactoryContext): VaultBehavior<T, E>;
  critical: boolean;
  type: VaultBehaviorType;
}
