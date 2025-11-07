import { signal } from '@angular/core';
import {
  defineNgVaultBehaviorKey,
  ResourceStateError,
  VaultBehavior,
  VaultBehaviorFactory,
  VaultBehaviorFactoryContext,
  VaultBehaviorType,
  VaultDataType,
  VaultSignalRef
} from '@ngvault/shared-models';
import { Observable, take } from 'rxjs';
import { resourceError } from '../..//utils/resource-error.util';
import { ObservableBehaviorExtension } from './interface/observable-behavior.interface';

class CoreObservableBehavior<T> implements VaultBehavior<T, ObservableBehaviorExtension<T>> {
  public readonly key = defineNgVaultBehaviorKey('Core', 'FromObservable');
  public readonly critical = false;

  constructor(
    public readonly behaviorId: string,
    readonly type: VaultBehaviorType,
    private readonly injector: VaultBehaviorFactoryContext['injector']
  ) {}

  extendCellAPI(): ObservableBehaviorExtension<T> {
    return {
      fromObservable: (key, ctx, source$) =>
        new Observable<VaultSignalRef<T>>((observer) => {
          const _loadingSignal = signal(true);
          const _errorSignal = signal<ResourceStateError | null>(null);
          const _valueSignal = signal<VaultDataType<T>>(undefined);
          const _hasValue = signal(false);

          ctx.behaviorRunner?.onLoad?.(this.behaviorId, key, ctx);

          source$.pipe(take(1)).subscribe({
            next: (value) => {
              _valueSignal.set(value);
              _loadingSignal.set(false);
              _hasValue.set(true);
              ctx.behaviorRunner?.onSet?.(this.behaviorId, key, ctx);

              observer.next({
                isLoading: _loadingSignal.asReadonly(),
                value: _valueSignal.asReadonly(),
                error: _errorSignal.asReadonly(),
                hasValue: _hasValue.asReadonly()
              });
              observer.complete();
            },
            error: (err) => {
              observer.error(resourceError(err));
              ctx.behaviorRunner?.onError?.(this.behaviorId, key, ctx);
            },
            complete: () => {
              _loadingSignal.set(false);
              ctx.behaviorRunner?.onDispose?.(this.behaviorId, key, ctx);
              observer.complete();
            }
          });
        })
    };
  }
}

export const withCoreObservableBehavior: VaultBehaviorFactory<unknown, ObservableBehaviorExtension<unknown>> = (
  context: VaultBehaviorFactoryContext
) => {
  return new CoreObservableBehavior(context.behaviorId, 'state', context.injector);
};

withCoreObservableBehavior.type = 'state';
withCoreObservableBehavior.critical = false;
