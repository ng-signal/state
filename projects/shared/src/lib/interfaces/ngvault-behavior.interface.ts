import { NgVaultBehaviorFactoryContext } from '@ngvault/shared';
import { NgVaultBehaviorContext } from '../contexts/ngvault-behavior.context';
import { NgVaultBehaviorTypes } from '../types/ngvault-behavior.type';

// Reusable function type each extension provides
// eslint-disable-next-line
export type BehaviorExtFn<T = unknown> = (ctx: NgVaultBehaviorContext<T>, ...args: any[]) => unknown;
// The extension object a behavior may return
export type NgVaultBehaviorExtension<T = unknown> = Partial<Record<string, BehaviorExtFn<T>>>;

// Behavior interface
export interface NgVaultBehavior<T = unknown, E extends NgVaultBehaviorExtension<T> = NgVaultBehaviorExtension<T>> {
  readonly type: NgVaultBehaviorTypes;
  readonly key: string;

  // Optional override policy for colliding keys
  allowOverride?: string[];

  // Return an object whose values are extension functions (or nothing)
  extendCellAPI?(): E | void;
}

// Factory interface — note: same E constraint as behavior
export interface NgVaultBehaviorFactory<
  T = unknown,
  E extends NgVaultBehaviorExtension<T> = NgVaultBehaviorExtension<T>
> {
  (context: NgVaultBehaviorFactoryContext): NgVaultBehavior<T, E>;
  critical: boolean;
  type: NgVaultBehaviorTypes;
}

export type BehaviorExtensionOf<B> =
  // eslint-disable-next-line
  B extends NgVaultBehaviorFactory<any, infer E> ? E : B extends NgVaultBehavior<any, infer E> ? E : {};

// eslint-disable-next-line
export type MergeBehaviorExtensions<B extends readonly any[]> = B extends readonly [infer H, ...infer R]
  ? BehaviorExtensionOf<H> & MergeBehaviorExtensions<R>
  : // eslint-disable-next-line
    {};
