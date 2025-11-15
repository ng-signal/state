import { signal } from '@angular/core';
import {
  defineNgVaultBehaviorKey,
  NgVaultBehavior,
  NgVaultBehaviorContext,
  NgVaultBehaviorFactory,
  NgVaultBehaviorFactoryContext,
  NgVaultBehaviorTypes,
  NgVaultDataType,
  NgVaultResourceStateError,
  VaultSignalRef
} from '@ngvault/shared';
import { EMPTY, Observable, take, takeUntil } from 'rxjs';
import {
  ngVaultDebug,
  ngVaultError,
  ngVaultLog,
  ngVaultWarn
} from '../../../../../shared/src/lib/utils/ngvault-logger.util';
import { resourceError } from '../../utils/resource-error.util';
import { ObservableBehaviorExtension } from './interface/observable-behavior.interface';

class CoreObservableBehavior<T> implements NgVaultBehavior<T, ObservableBehaviorExtension<T>> {
  public readonly key = defineNgVaultBehaviorKey('Core', 'FromObservable');
  public readonly critical = false;

  constructor(
    readonly type: NgVaultBehaviorTypes,
    private readonly injector: NgVaultBehaviorFactoryContext['injector']
  ) {}

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
      fromObservable: (ctx: NgVaultBehaviorContext<T>, source$: Observable<T>) =>
        new Observable<VaultSignalRef<T>>((observer) => {
          ngVaultDebug('fromObservable → start');

          // tie to lifecycle signals for reset & destroy
          const destroy$ = ctx.destroyed$ ?? EMPTY;
          const reset$ = ctx.reset$ ?? EMPTY;

          // reactive signals for Vault state reflection
          const _loadingSignal = signal(true);
          const _errorSignal = signal<NgVaultResourceStateError | null>(null);
          const _valueSignal = signal<NgVaultDataType<T>>(undefined);
          const _hasValue = signal(false);

          ngVaultDebug('fromObservable → creating signals');
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
            },

            error: (err) => {
              ngVaultError('fromObservable → error()');
              observer.error(resourceError(err));
              ctx.message = err.message;
            },

            complete: () => {
              ngVaultLog('fromObservable → complete()');
              _loadingSignal.set(false);
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

export const withCoreObservableBehavior: NgVaultBehaviorFactory<unknown, ObservableBehaviorExtension<unknown>> = (
  context: NgVaultBehaviorFactoryContext
) => {
  return new CoreObservableBehavior(context.type, context.injector);
};

withCoreObservableBehavior.type = 'state';
withCoreObservableBehavior.critical = false;
