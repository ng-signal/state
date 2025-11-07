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
import { isHttpResourceRef } from '../utils/is-http-resource.util';

/**
 * Core behavior responsible for replacing state values.
 * No HTTP logic, no devtools hooks — pure synchronous state mutation.
 */
class CorePatchBehavior<T> implements VaultBehavior<T> {
  public readonly critical = true;
  public readonly key = defineNgVaultBehaviorKey('Core', 'Patch');

  constructor(
    readonly behaviorId: string,
    readonly type: VaultBehaviorType,
    private readonly _injector: VaultBehaviorFactoryContext['injector']
  ) {}

  onInit(key: string, service: string, ctx: VaultBehaviorContext<T>): void {
    ctx.behaviorRunner?.onInit?.(this.behaviorId, this.key, service, ctx);
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

        if (Array.isArray(curr) && Array.isArray(next)) {
          value?.set([...curr, ...next] as VaultDataType<T>);
        } else if (
          curr &&
          next &&
          typeof curr === 'object' &&
          typeof next === 'object' &&
          !Array.isArray(curr) &&
          !Array.isArray(next)
        ) {
          value?.set({ ...curr, ...next } as VaultDataType<T>);
        } else {
          value?.set(next as VaultDataType<T>);
        }

        ctx.behaviorRunner?.onPatch(this.behaviorId, this.key, ctx);
      }
    }
  }
}

export const withCorePatchBehavior = ((context: VaultBehaviorFactoryContext): VaultBehavior => {
  return new CorePatchBehavior(context.behaviorId, 'state', context.injector);
}) as VaultBehaviorFactory;

withCorePatchBehavior.type = 'state';
withCorePatchBehavior.critical = true;
