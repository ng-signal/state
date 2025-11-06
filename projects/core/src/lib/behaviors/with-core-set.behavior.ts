// projects/core/src/lib/behaviors/with-core-set.behavior.ts
import {
  defineNgVaultBehaviorKey,
  VaultBehavior,
  VaultBehaviorContext,
  VaultBehaviorFactory,
  VaultBehaviorFactoryContext,
  VaultBehaviorType,
  VaultDataType
} from '@ngvault/shared-models';
import { isHttpResource } from '../utils/is-http-resource.util';

/**
 * Core behavior responsible for replacing state values.
 * No HTTP logic, no devtools hooks — pure synchronous state mutation.
 */
class CoreSetBehavior<T> implements VaultBehavior<T> {
  public readonly critical = true;
  public readonly key = defineNgVaultBehaviorKey('Core', 'Set');

  constructor(
    readonly behaviorId: string,
    readonly type: VaultBehaviorType,
    private readonly _injector: VaultBehaviorFactoryContext['injector']
  ) {}

  onInit(key: string, service: string, ctx: VaultBehaviorContext<T>): void {
    ctx.behaviorRunner?.onInit?.(this.behaviorId, this.key, service, ctx);
  }

  onSet(key: string, ctx: VaultBehaviorContext<T>): void {
    if (ctx.next && typeof ctx.next === 'object' && !isHttpResource<T>(ctx.next)) {
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

        ctx.behaviorRunner?.onSet?.(this.behaviorId, this.key, ctx);
      }
    }
  }
}

export const withCoreSetBehavior = ((context: VaultBehaviorFactoryContext): VaultBehavior => {
  return new CoreSetBehavior(context.behaviorId, 'state', context.injector);
}) as VaultBehaviorFactory;

withCoreSetBehavior.type = 'state';
withCoreSetBehavior.critical = true;
