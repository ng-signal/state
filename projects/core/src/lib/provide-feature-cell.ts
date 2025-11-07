import { HttpResourceRef } from '@angular/common/http';
import {
  DestroyRef,
  Injector,
  Provider,
  Type,
  computed,
  effect,
  inject,
  runInInjectionContext,
  signal
} from '@angular/core';
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
import { withCorePatchBehavior } from './behaviors/with-core-patch.behavior';
import { withCoreSetBehavior } from './behaviors/with-core-set.behavior';
import { NGVAULT_EXPERIMENTAL_HTTP_RESOURCE } from './constants/experimental-flag.constant';
import { FEATURE_CELL_REGISTRY } from './constants/feature-cell-registry.constant';
import { FeatureCellDescriptorModel } from './models/feature-cell-descriptor.model';
import { getOrCreateFeatureCellToken } from './tokens/feature-cell-token-registry';
import { devWarnExperimentalHttpResource } from './utils/dev-warning.util';
import { isHttpResourceRef } from './utils/is-http-resource.util';
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
      const _behaviorLifeCycle = NgVaultBehaviorLifecycleService();
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

      const defaultBehaviors: VaultBehaviorFactory<T>[] = [withCoreSetBehavior, withCorePatchBehavior];
      const allBehaviors: VaultBehaviorFactory<T>[] = [...defaultBehaviors, ...behaviors];
      const coreId = _behaviorLifeCycle.initialize();
      _behaviorLifeCycle.initializeBehaviors(_injector, allBehaviors);

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
        behaviorRunner: _behaviorLifeCycle,

        get state(): Readonly<VaultStateSnapshot<T>> {
          return {
            isLoading: _isLoading(),
            value: _value(),
            error: _error(),
            hasValue: _hasValue()
          };
        }
      } as VaultBehaviorContext<T>;

      _behaviorLifeCycle.onInit(coreId, featureCellDescriptor.key, service.name, ctx);

      const _reset = (): void => {
        _isLoading.set(false);
        _error.set(null);
        _value.set(undefined);
        _behaviorLifeCycle.onReset(coreId, featureCellDescriptor.key, ctx);
      };

      const _destroy = (): void => {
        _destroyed$.next();
        _destroyed$.complete();

        _reset();

        _behaviorLifeCycle.onDestroy(coreId, featureCellDescriptor.key, ctx);
      };

      // Angular DI teardown
      _destroyRef.onDestroy(() => _destroy());

      /**
       * Updates the vault’s state reactively.
       * Supports partial updates, full resets, or Angular HttpResourceRef<T>.
       */
      const _set = (next: VaultStateInputType<T>): void => {
        if (next == null) {
          _reset();
          return;
        }

        // 🧪 Experimental Angular HttpResourceRef<T> integration
        if (NGVAULT_EXPERIMENTAL_HTTP_RESOURCE && isHttpResourceRef<T>(next)) {
          // eslint-disable-next-line
          ctx.next = next as any;
          const resource = next as HttpResourceRef<T>;

          runInInjectionContext(_injector, () => {
            effect(() => {
              _isLoading.set(resource.isLoading());
              try {
                _value.set(resource.value());

                _behaviorLifeCycle.onSet(coreId, featureCellDescriptor.key, ctx);
              } catch {
                _error.set(resourceError(resource.error()));
                _behaviorLifeCycle.onError(coreId, featureCellDescriptor.key, ctx);
              }
            });
          });

          devWarnExperimentalHttpResource();
          return;
        }

        ctx.next = Object.freeze(next as VaultStateType<T>);
        _behaviorLifeCycle.onSet(coreId, featureCellDescriptor.key, ctx);
      };

      const _patch = (partial: VaultStateInputType<T>): void => {
        if (partial == null) {
          _reset();
          return;
        }

        // 🧪 Experimental Angular HttpResourceRef<T> integration
        if (NGVAULT_EXPERIMENTAL_HTTP_RESOURCE && isHttpResourceRef<T>(partial)) {
          const resource = partial as HttpResourceRef<T>;

          runInInjectionContext(_injector, () => {
            effect(() => {
              _isLoading.set(resource.isLoading());

              // Use queueMicrotask to avoid signal reentrancy
              queueMicrotask(() => {
                try {
                  const next = resource.value();
                  const curr = _value();

                  if (next == null) return;

                  if (Array.isArray(curr) && Array.isArray(next)) {
                    _value.set([...curr, ...next] as VaultDataType<T>);
                  } else if (
                    curr &&
                    next &&
                    typeof curr === 'object' &&
                    typeof next === 'object' &&
                    !Array.isArray(curr) &&
                    !Array.isArray(next)
                  ) {
                    _value.set({ ...curr, ...next } as VaultDataType<T>);
                  } else {
                    _value.set(next as VaultDataType<T>);
                  }

                  _error.set(null);
                  // _behaviorLifeCycle.onPatch(coreId, featureCellDescriptor.key, ctx);
                } catch {
                  _error.set(resourceError(resource.error()));
                  _behaviorLifeCycle.onError(coreId, featureCellDescriptor.key, ctx);
                }
              });
            });
          });

          devWarnExperimentalHttpResource();
          return;
        }

        ctx.next = Object.freeze(partial as VaultStateType<T>);
        _behaviorLifeCycle.onPatch(coreId, featureCellDescriptor.key, ctx);
      };

      const _fromObservable = (source$: Observable<T>): Observable<VaultSignalRef<T>> => {
        return new Observable<VaultSignalRef<T>>((observer) => {
          const _loadingSignal = signal(true);
          const _errorSignal = signal<ResourceStateError | null>(null);
          const _valueSignal = signal<VaultDataType<T>>(undefined);

          _behaviorLifeCycle.onLoad(coreId, featureCellDescriptor.key, ctx);

          source$.pipe(take(1)).subscribe({
            next: (value) => {
              _valueSignal.set(value);
              _loadingSignal.set(false);

              _behaviorLifeCycle.onSet(coreId, featureCellDescriptor.key, ctx);

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
              _behaviorLifeCycle.onError(coreId, featureCellDescriptor.key, ctx);
            },
            complete: () => {
              _loadingSignal.set(false);
              _behaviorLifeCycle.onDispose(coreId, featureCellDescriptor.key, ctx);
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
