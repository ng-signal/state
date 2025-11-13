import { HttpResourceRef } from '@angular/common/http';
import { DestroyRef, effect, runInInjectionContext } from '@angular/core';
import {
  defineNgVaultBehaviorKey,
  VaultBehavior,
  VaultBehaviorContext,
  VaultBehaviorFactory,
  VaultBehaviorFactoryContext,
  VaultStateBehavior
} from '@ngvault/shared';
import { NGVAULT_EXPERIMENTAL_HTTP_RESOURCE } from '../../constants/experimental-flag.constant';
import { devWarnExperimentalHttpResource } from '../../utils/dev-warning.util';
import { isHttpResourceRef } from '../../utils/is-http-resource.util';
import { ngVaultDebug } from '../../utils/ngvault-logger.util';
import { resourceError } from '../../utils/resource-error.util';

class CoreHttpResourceStateBehavior<T> implements VaultStateBehavior<T> {
  readonly type = 'state';
  public readonly critical = true;
  public readonly key = defineNgVaultBehaviorKey('CoreHttpResource', 'StateV2');

  constructor(
    private readonly injector: VaultBehaviorFactoryContext['injector'],
    private readonly destroyRef: DestroyRef
  ) {}

  async computeState(ctx: VaultBehaviorContext<T>): Promise<T | undefined> {
    ngVaultDebug('http resource state v2');

    if (NGVAULT_EXPERIMENTAL_HTTP_RESOURCE && ctx.incoming && isHttpResourceRef<T>(ctx.incoming)) {
      const resource = ctx.incoming as HttpResourceRef<T>;

      devWarnExperimentalHttpResource();

      return await new Promise<T>((resolve, reject) => {
        runInInjectionContext(this.injector, () => {
          const stop = effect(
            () => {
              ctx.isLoading?.set(resource.isLoading());

              try {
                const val = resource.value?.();

                if (val !== undefined) {
                  stop.destroy();
                  resolve(val as T);
                  return;
                }
              } catch (e) {
                stop.destroy();
                reject(resourceError(e));
              }
            },
            { injector: this.injector }
          );

          this.destroyRef.onDestroy(() => stop.destroy());
        });
      });
    } else {
      ngVaultDebug('http resource state v2', 'skipped — not an HttpResourceRef');
      return;
    }
  }
}

export const withCoreHttpResourceStateBehavior = ((context: VaultBehaviorFactoryContext): VaultBehavior => {
  const destroyRef = context.injector.get(DestroyRef);

  return new CoreHttpResourceStateBehavior(context.injector, destroyRef);
}) as VaultBehaviorFactory;

// Required metadata for discovery
withCoreHttpResourceStateBehavior.type = 'state';
withCoreHttpResourceStateBehavior.critical = true;
