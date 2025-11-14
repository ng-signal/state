import { HttpResourceRef } from '@angular/common/http';
import { DestroyRef, effect, runInInjectionContext } from '@angular/core';
import {
  defineNgVaultBehaviorKey,
  NgVaultBehavior,
  NgVaultBehaviorContext,
  NgVaultBehaviorFactory,
  NgVaultBehaviorFactoryContext,
  NgVaultStateBehavior
} from '@ngvault/shared';
import { ngVaultDebug } from '../../../../../shared/src/lib/utils/ngvault-logger.util';
import { NGVAULT_EXPERIMENTAL_HTTP_RESOURCE } from '../../constants/experimental-flag.constant';
import { devWarnExperimentalHttpResource } from '../../utils/dev-warning.util';
import { isHttpResourceRef } from '../../utils/is-http-resource.util';
import { resourceError } from '../../utils/resource-error.util';

class CoreHttpResourceStateBehavior<T> implements NgVaultStateBehavior<T> {
  readonly type = 'state';
  public readonly critical = true;
  public readonly key = defineNgVaultBehaviorKey('CoreHttpResource', 'State');

  constructor(
    private readonly injector: NgVaultBehaviorFactoryContext['injector'],
    private readonly destroyRef: DestroyRef
  ) {}

  async computeState(ctx: NgVaultBehaviorContext<T>): Promise<T | undefined> {
    ngVaultDebug('http resource state');

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
      ngVaultDebug('http resource state', 'skipped — not an HttpResourceRef');
      return;
    }
  }
}

export const withCoreHttpResourceStateBehavior = ((context: NgVaultBehaviorFactoryContext): NgVaultBehavior => {
  const destroyRef = context.injector.get(DestroyRef);

  return new CoreHttpResourceStateBehavior(context.injector, destroyRef);
}) as NgVaultBehaviorFactory;

// Required metadata for discovery
withCoreHttpResourceStateBehavior.type = 'state';
withCoreHttpResourceStateBehavior.critical = true;
