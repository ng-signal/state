import { signal } from '@angular/core';
import {
  defineNgVaultBehaviorKey,
  ResourceStateError,
  VaultBehavior,
  VaultBehaviorContext,
  VaultBehaviorFactory,
  VaultBehaviorFactoryContext,
  VaultBehaviorType,
  VaultDataType,
  VaultSignalRef
} from '@ngvault/shared';
import { EMPTY, Observable, take, takeUntil } from 'rxjs';
import { ngVaultDebug, ngVaultError, ngVaultLog, ngVaultWarn } from '../../utils/ngvault-logger.util';
import { resourceError } from '../../utils/resource-error.util';
import { ObservableBehaviorExtension } from './interface/observable-behavior.interface';

class CoreObservableBehavior<T> implements VaultBehavior<T, ObservableBehaviorExtension<T>> {
  public readonly key = defineNgVaultBehaviorKey('Core', 'FromObservable');
  public readonly critical = false;

  constructor(
    public readonly behaviorId: string,
    readonly type: VaultBehaviorType,
    private readonly injector: VaultBehaviorFactoryContext['injector']
  ) {}

  onInit(key: string, service: string, ctx: VaultBehaviorContext<T>): void {
    ctx.behaviorRunner?.onInit?.(this.behaviorId, this.key, service, ctx);
  }

  extendCellAPI(): ObservableBehaviorExtension<T> {
    // eslint-disable-next-line
    const self = this;

    /*
    if (getNgVaultConfig().devMode) {
  this._callCount ??= 0;
  this._callCount++;
  if (this._callCount > 5) {
    ngVaultWarn(`fromObservable runaway detected — cell ${key}`);
    observer.complete();
    return;
  }
}
  */

    return {
      fromObservable: (key, ctx, source$) =>
        new Observable<VaultSignalRef<T>>((observer) => {
          ngVaultDebug('fromObservable → start');

          // tie to lifecycle signals for reset & destroy
          const destroy$ = ctx.destroyed$ ?? EMPTY;
          const reset$ = ctx.reset$ ?? EMPTY;

          // reactive signals for Vault state reflection
          const _loadingSignal = signal(true);
          const _errorSignal = signal<ResourceStateError | null>(null);
          const _valueSignal = signal<VaultDataType<T>>(undefined);
          const _hasValue = signal(false);

          ngVaultDebug('fromObservable → creating signals');
          ctx.behaviorRunner?.onLoad?.(self.behaviorId, self.key, ctx);
          ngVaultDebug('fromObservable → onLoad called');

          const subscription = source$.pipe(takeUntil(reset$), takeUntil(destroy$), take(1)).subscribe({
            next: (value) => {
              ngVaultLog('fromObservable → next()');
              _valueSignal.set(value);
              _loadingSignal.set(false);
              _hasValue.set(true);

              observer.next({
                isLoading: _loadingSignal.asReadonly(),
                value: _valueSignal.asReadonly(),
                error: _errorSignal.asReadonly(),
                hasValue: _hasValue.asReadonly()
              });

              ctx.behaviorRunner?.onSet?.(self.behaviorId, self.key, ctx);
            },

            error: (err) => {
              ngVaultError('fromObservable → error()');
              observer.error(resourceError(err));
              ctx.message = err.message;
              ctx.behaviorRunner?.onError?.(self.behaviorId, self.key, ctx);
            },

            complete: () => {
              ngVaultLog('fromObservable → complete()');
              _loadingSignal.set(false);
              ctx.behaviorRunner?.onDispose?.(self.behaviorId, self.key, ctx);
              observer.complete();
            }
          });

          return () => {
            ngVaultWarn('fromObservable → cleanup()');
            subscription.unsubscribe();
          };
        })
    };
  }
}

export const withCoreObservableBehavior: VaultBehaviorFactory<unknown, ObservableBehaviorExtension<unknown>> = (
  context: VaultBehaviorFactoryContext
) => {
  return new CoreObservableBehavior(context.behaviorId, context.type, context.injector);
};

withCoreObservableBehavior.type = 'state';
withCoreObservableBehavior.critical = false;
