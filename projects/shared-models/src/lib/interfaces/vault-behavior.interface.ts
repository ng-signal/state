import { VaultBehaviorFactoryContext } from '@ngvault/shared-models';
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
  readonly key?: string;
  readonly behaviorId: string;

  onInit?(key: string, service: string, ctx: VaultBehaviorContext<T>): void;
  onLoad?(key: string, ctx: VaultBehaviorContext<T>): void;
  onSet?(key: string, ctx: VaultBehaviorContext<T>): void;
  onPatch?(key: string, ctx: VaultBehaviorContext<T>): void;
  onReset?(key: string, ctx: VaultBehaviorContext<T>): void;
  onError?(key: string, ctx: VaultBehaviorContext<T>): void;
  onDestroy?(key: string, ctx: VaultBehaviorContext<T>): void;
  onDispose?(key: string, ctx: VaultBehaviorContext<T>): void;

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
