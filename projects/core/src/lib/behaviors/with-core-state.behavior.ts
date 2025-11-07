// projects/core/src/lib/behaviors/with-core-set.behavior.ts
import {
  defineNgVaultBehaviorKey,
  VaultBehavior,
  VaultBehaviorContext,
  VaultBehaviorFactory,
  VaultBehaviorFactoryContext,
  VaultBehaviorType,
  VaultDataType,
  VaultStateType
} from '@ngvault/shared-models';
import { applyNgVaultValueMerge } from '../utils/apply-vault-merge.util';
import { isHttpResourceRef } from '../utils/is-http-resource.util';

/**
 * Core behavior responsible for replacing state values.
 * No HTTP logic, no devtools hooks — pure synchronous state mutation.
 */
class CoreStateBehavior<T> implements VaultBehavior<T> {
  public readonly critical = true;
  public readonly key = defineNgVaultBehaviorKey('Core', 'State');

  constructor(
    readonly behaviorId: string,
    readonly type: VaultBehaviorType,
    private readonly _injector: VaultBehaviorFactoryContext['injector']
  ) {}

  onInit(key: string, service: string, ctx: VaultBehaviorContext<T>): void {
    ctx.behaviorRunner?.onInit?.(this.behaviorId, this.key, service, ctx);
  }

  onSet(key: string, ctx: VaultBehaviorContext<T>): void {
    if (ctx.next && typeof ctx.next === 'object' && !isHttpResourceRef<T>(ctx.next)) {
      const { isLoading, error, value, next } = ctx;

      // Update basic flags if provided
      if (next.loading !== undefined) isLoading?.set(next.loading);
      if (next.error !== undefined) error?.set(next.error);

      if (next.value !== undefined) {
        const val = next.value;

        if (Array.isArray(val)) {
          value?.set([...val] as VaultDataType<T>);
        } else if (val && typeof val === 'object') {
          value?.set({ ...val } as VaultDataType<T>);
        } else {
          value?.set(val as VaultDataType<T>);
        }

        error?.set(null);

        ctx.behaviorRunner?.onSet?.(this.behaviorId, this.key, ctx);
      }
    }
  }

  onPatch(key: string, ctx: VaultBehaviorContext<T>): void {
    if (ctx.next && typeof ctx.next === 'object' && !isHttpResourceRef<T>(ctx.next)) {
      const patch = ctx.next as VaultStateType<T>;
      const { isLoading, error, value } = ctx;

      if (patch.loading !== undefined) isLoading?.set(patch.loading);
      if (patch.error !== undefined) error?.set(patch.error);

      if (patch.value !== undefined) {
        const curr = value?.();
        const next = patch.value;
        applyNgVaultValueMerge(ctx, curr, next);

        error?.set(null);

        ctx.behaviorRunner?.onPatch(this.behaviorId, this.key, ctx);
      }
    }
  }
}

export const withCoreStateBehavior = ((context: VaultBehaviorFactoryContext): VaultBehavior => {
  return new CoreStateBehavior(context.behaviorId, 'state', context.injector);
}) as VaultBehaviorFactory;

withCoreStateBehavior.type = 'state';
withCoreStateBehavior.critical = true;
