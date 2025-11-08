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
} from '@ngvault/shared-models';
import { Observable, take } from 'rxjs';
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
    return {
      fromObservable: (key, ctx, source$) =>
        new Observable<VaultSignalRef<T>>((observer) => {
          const _loadingSignal = signal(true);
          const _errorSignal = signal<ResourceStateError | null>(null);
          const _valueSignal = signal<VaultDataType<T>>(undefined);
          const _hasValue = signal(false);

          ctx.behaviorRunner?.onLoad?.(self.behaviorId, self.key, ctx);

          source$.pipe(take(1)).subscribe({
            next: (value) => {
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
              observer.error(resourceError(err));
              ctx.behaviorRunner?.onError?.(self.behaviorId, self.key, ctx);
            },
            complete: () => {
              _loadingSignal.set(false);
              ctx.behaviorRunner?.onDispose?.(self.behaviorId, self.key, ctx);
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
