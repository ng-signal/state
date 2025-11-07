// projects/core/src/lib/behaviors/with-core-set.behavior.ts
import { HttpResourceRef } from '@angular/common/http';
import { effect, runInInjectionContext } from '@angular/core';
import {
  defineNgVaultBehaviorKey,
  VaultBehavior,
  VaultBehaviorContext,
  VaultBehaviorFactory,
  VaultBehaviorFactoryContext,
  VaultBehaviorType
} from '@ngvault/shared-models';
import { NGVAULT_EXPERIMENTAL_HTTP_RESOURCE } from '../constants/experimental-flag.constant';
import { devWarnExperimentalHttpResource } from '../utils/dev-warning.util';
import { isHttpResourceRef } from '../utils/is-http-resource.util';
import { resourceError } from '../utils/resource-error.util';

/**
 * Core behavior responsible for replacing state values.
 * No HTTP logic, no devtools hooks — pure synchronous state mutation.
 */
class CoreHttpResourceStateBehavior<T> implements VaultBehavior<T> {
  public readonly critical = true;
  public readonly key = defineNgVaultBehaviorKey('CoreHttpResource', 'State');

  constructor(
    readonly behaviorId: string,
    readonly type: VaultBehaviorType,
    private readonly injector: VaultBehaviorFactoryContext['injector']
  ) {}

  onInit(key: string, service: string, ctx: VaultBehaviorContext<T>): void {
    ctx.behaviorRunner?.onInit?.(this.behaviorId, this.key, service, ctx);
  }

  onSet(key: string, ctx: VaultBehaviorContext<T>): void {
    if (NGVAULT_EXPERIMENTAL_HTTP_RESOURCE && isHttpResourceRef<T>(ctx.next)) {
      const resource = ctx.next as HttpResourceRef<T>;
      const { isLoading, error, value } = ctx;

      runInInjectionContext(this.injector, () => {
        effect(() => {
          isLoading?.set(resource.isLoading());
          try {
            if (resource.value() !== undefined) {
              value?.set(resource.value());
              error?.set(null);
              ctx.behaviorRunner?.onSet(this.behaviorId, this.key, ctx);
            }
          } catch {
            error?.set(resourceError(resource.error()));
            ctx.behaviorRunner?.onError(this.behaviorId, this.key, ctx);
          }
        });
      });

      devWarnExperimentalHttpResource();
    }
  }

  /*
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
    */
}

export const withCoreHttpResourceStateBehavior = ((context: VaultBehaviorFactoryContext): VaultBehavior => {
  return new CoreHttpResourceStateBehavior(context.behaviorId, 'state', context.injector);
}) as VaultBehaviorFactory;

withCoreHttpResourceStateBehavior.type = 'state';
withCoreHttpResourceStateBehavior.critical = true;
