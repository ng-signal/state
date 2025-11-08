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
} from '@ngvault/shared';
import { NGVAULT_EXPERIMENTAL_HTTP_RESOURCE } from '../../constants/experimental-flag.constant';
import { applyNgVaultValueMerge } from '../../utils/apply-vault-merge.util';
import { devWarnExperimentalHttpResource } from '../../utils/dev-warning.util';
import { isHttpResourceRef } from '../../utils/is-http-resource.util';
import { resourceError } from '../../utils/resource-error.util';

/**
 * Core behavior responsible for replacing state values.
 * No HTTP logic, no devtools hooks — pure synchronous state mutation.
 */
class CoreHttpResourceStateBehavior<T> implements VaultBehavior<T> {
  public readonly critical = true;
  public readonly key = defineNgVaultBehaviorKey('CoreHttpResource', 'State');
  #destroyed = false;

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
          if (this.#destroyed) {
            this.#destroyed = false;
            return;
          }
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

  onPatch(key: string, ctx: VaultBehaviorContext<T>): void {
    if (NGVAULT_EXPERIMENTAL_HTTP_RESOURCE && isHttpResourceRef<T>(ctx.patch)) {
      const resource = ctx.patch as HttpResourceRef<T>;
      const { isLoading, error, value } = ctx;

      runInInjectionContext(this.injector, () => {
        effect(() => {
          if (this.#destroyed) {
            this.#destroyed = false;
            return;
          }

          isLoading?.set(resource.isLoading());

          // Use queueMicrotask to avoid signal reentrancy
          queueMicrotask(() => {
            try {
              const next = resource.value();
              const curr = value?.();
              if (next !== undefined) {
                applyNgVaultValueMerge(ctx, curr, next);
                error?.set(null);
                ctx.behaviorRunner?.onPatch(this.behaviorId, this.key, ctx);
              }
            } catch {
              error?.set(resourceError(resource.error()));
              ctx.behaviorRunner?.onError(this.behaviorId, this.key, ctx);
            }
          });
        });
      });

      devWarnExperimentalHttpResource();
    }
  }

  /**
   * Cleans up any active effects or async subscriptions when the cell is destroyed.
   */
  onReset(key: string, ctx: VaultBehaviorContext<T>): void {
    this.#destroyed = true;
    ctx.behaviorRunner?.onReset(this.behaviorId, key, ctx);
  }

  /**
   * Cleans up any active effects or async subscriptions when the cell is destroyed.
   */
  onDestroy(key: string, ctx: VaultBehaviorContext<T>): void {
    this.#destroyed = true;
    ctx.behaviorRunner?.onDestroy(this.behaviorId, key, ctx);
  }
}

export const withCoreHttpResourceStateBehavior = ((context: VaultBehaviorFactoryContext): VaultBehavior => {
  return new CoreHttpResourceStateBehavior(context.behaviorId, 'state', context.injector);
}) as VaultBehaviorFactory;

withCoreHttpResourceStateBehavior.type = 'state';
withCoreHttpResourceStateBehavior.critical = true;
