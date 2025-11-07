import { DestroyRef, Injector, Provider, Type, computed, inject, signal } from '@angular/core';
import {
  NgVaultBehaviorLifecycleService,
  ResourceStateError,
  ResourceVaultModel,
  VaultBehaviorContext,
  VaultBehaviorFactory,
  VaultSignalRef,
  VaultStateSnapshot
} from '@ngvault/shared-models';
import { VaultDataType } from '@ngvault/shared-models/types/vault-data.type';
import { VaultStateInputType } from '@ngvault/shared-models/types/vault-state-input.type';
import { VaultStateType } from '@ngvault/shared-models/types/vault-state.type';
import { Observable, Subject, take } from 'rxjs';
import { withCoreHttpResourceStateBehavior } from './behaviors/core-http-resource-state/with-core-http-resource-state.behavior';
import { withCoreStateBehavior } from './behaviors/core-state/with-core-state.behavior';
import { FEATURE_CELL_REGISTRY } from './constants/feature-cell-registry.constant';
import { FeatureCellDescriptorModel } from './models/feature-cell-descriptor.model';
import { getOrCreateFeatureCellToken } from './tokens/feature-cell-token-registry';
import { resourceError } from './utils/resource-error.util';

export function provideFeatureCell<Service, T>(
  service: Type<Service>,
  featureCellDescriptor: FeatureCellDescriptorModel<T>,
  behaviors: VaultBehaviorFactory<T>[] = []
): Provider[] {
  const token = getOrCreateFeatureCellToken<T>(featureCellDescriptor.key, false);

  const featureCellProvider: Provider = {
    provide: token,
    useFactory: (): ResourceVaultModel<T> => {
      const _isLoading = signal(false);
      const _error = signal<ResourceStateError | null>(null);
      const _behaviorRunner = NgVaultBehaviorLifecycleService();
      const _injector = inject(Injector);
      const _destroyRef = inject(DestroyRef);
      const _destroyed$ = new Subject<void>();

      // Prevent incorrect initialization (e.g., passing a resource object)
      if (
        typeof featureCellDescriptor.initial === 'object' &&
        featureCellDescriptor.initial !== null &&
        // eslint-disable-next-line
        'data' in (featureCellDescriptor.initial as any)
      ) {
        throw new Error(
          `[NgVault] Invalid FeatureCellDescriptorModel.initial for feature "${featureCellDescriptor.key}". ` +
            `Expected raw data (e.g., [] or {}), but received an object with resource fields { loading, data, error }. ` +
            `Pass plain data to avoid double-wrapping.`
        );
      }

      const defaultBehaviors: VaultBehaviorFactory<T>[] = [withCoreStateBehavior, withCoreHttpResourceStateBehavior];
      const allBehaviors: VaultBehaviorFactory<T>[] = [...defaultBehaviors, ...behaviors];
      const coreId = _behaviorRunner.initialize();
      _behaviorRunner.initializeBehaviors(_injector, allBehaviors);

      const _value = signal<VaultDataType<T>>(
        featureCellDescriptor.initial === null || featureCellDescriptor.initial === undefined
          ? undefined
          : (featureCellDescriptor.initial as T)
      );

      const _hasValue = computed(() => {
        const val = _value();
        return val !== null && val !== undefined;
      });

      const ctx = {
        isLoading: _isLoading,
        error: _error,
        value: _value,
        behaviorRunner: _behaviorRunner,

        get state(): Readonly<VaultStateSnapshot<T>> {
          return {
            isLoading: _isLoading(),
            value: _value(),
            error: _error(),
            hasValue: _hasValue()
          };
        }
      } as VaultBehaviorContext<T>;

      _behaviorRunner.onInit(coreId, featureCellDescriptor.key, service.name, ctx);

      const _reset = (): void => {
        _isLoading.set(false);
        _error.set(null);
        _value.set(undefined);
        _behaviorRunner.onReset(coreId, featureCellDescriptor.key, ctx);
      };

      const _destroy = (): void => {
        _destroyed$.next();
        _destroyed$.complete();

        _reset();

        _behaviorRunner.onDestroy(coreId, featureCellDescriptor.key, ctx);
      };

      // Angular DI teardown
      _destroyRef.onDestroy(() => _destroy());

      const _set = (next: VaultStateInputType<T>): void => {
        ctx.patch = null;
        if (next == null) {
          _reset();
          return;
        }

        ctx.next = next as VaultStateType<T>;
        _behaviorRunner.onSet(coreId, featureCellDescriptor.key, ctx);
      };

      const _patch = (patch: VaultStateInputType<T>): void => {
        ctx.next = null;
        if (patch == null) {
          _reset();
          return;
        }

        ctx.patch = patch as VaultStateType<T>;
        _behaviorRunner.onPatch(coreId, featureCellDescriptor.key, ctx);
      };

      const _fromObservable = (source$: Observable<T>): Observable<VaultSignalRef<T>> => {
        return new Observable<VaultSignalRef<T>>((observer) => {
          const _loadingSignal = signal(true);
          const _errorSignal = signal<ResourceStateError | null>(null);
          const _valueSignal = signal<VaultDataType<T>>(undefined);

          _behaviorRunner.onLoad(coreId, featureCellDescriptor.key, ctx);

          source$.pipe(take(1)).subscribe({
            next: (value) => {
              _valueSignal.set(value);
              _loadingSignal.set(false);

              _behaviorRunner.onSet(coreId, featureCellDescriptor.key, ctx);

              observer.next({
                isLoading: _loadingSignal.asReadonly(),
                value: _valueSignal.asReadonly(),
                error: _errorSignal.asReadonly(),
                hasValue: _hasValue
              });
              observer.complete();
            },
            error: (err) => {
              observer.error(resourceError(err));
              _behaviorRunner.onError(coreId, featureCellDescriptor.key, ctx);
            },
            complete: () => {
              _loadingSignal.set(false);
              _behaviorRunner.onDispose(coreId, featureCellDescriptor.key, ctx);
              observer.complete();
            }
          });
        });
      };

      // Create vault first so we can reference it inside loadListFrom
      const vault: ResourceVaultModel<T> = {
        state: {
          isLoading: _isLoading.asReadonly(),
          value: _value.asReadonly(),
          error: _error.asReadonly(),
          hasValue: _hasValue
        },
        setState: _set,
        patchState: _patch,
        fromObservable: _fromObservable,
        reset: _reset,
        destroy: _destroy,
        destroyed$: _destroyed$.asObservable()
      };

      return vault;
    }
  };

  const registryProvider: Provider = {
    provide: FEATURE_CELL_REGISTRY,
    multi: true,
    useValue: { key: featureCellDescriptor.key, token: service }
  };

  return [featureCellProvider, service, registryProvider];
}
