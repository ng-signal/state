import { HttpResourceRef } from '@angular/common/http';
import { Injector, Provider, Type, effect, inject, runInInjectionContext, signal } from '@angular/core';
import { Observable, take } from 'rxjs';
import { NGVAULT_EXPERIMENTAL_HTTP_RESOURCE } from './constants/experimental-flag.constant';
import { FEATURE_CELL_REGISTRY } from './constants/feature-cell-registry.constant';
import { FeatureCellDescriptorModel } from './models/feature-cell-descriptor.model';
import { ResourceSignal } from './models/resource-signal.model';
import { ResourceStateError } from './models/resource-state-error.model';
import { ResourceVaultModel } from './models/resource-vault.model';
import { getOrCreateFeatureCellToken } from './tokens/feature-cell-token-registry';
import { VaultDataType } from './types/vault-data.type';
import { VaultStateType } from './types/vault-state.type';
import { devWarnExperimentalHttpResource } from './utils/dev-warning.util';
import { isHttpResource } from './utils/is-http-resource.util';
import { resourceError } from './utils/resource-error.util';

export function provideFeatureCell<Svc, T>(
  service: Type<Svc>,
  featureCellDescriptorModel: FeatureCellDescriptorModel<T>
): Provider[] {
  const token = getOrCreateFeatureCellToken<T>(featureCellDescriptorModel.key, false);

  const featureCellProvider: Provider = {
    provide: token,
    useFactory: (): ResourceVaultModel<T> => {
      const _loading = signal(false);
      const _error = signal<ResourceStateError | null>(null);
      const _injector = inject(Injector);

      // Prevent incorrect initialization (e.g., passing a resource object)

      if (
        typeof featureCellDescriptorModel.initial === 'object' &&
        featureCellDescriptorModel.initial !== null &&
        // eslint-disable-next-line
        'data' in (featureCellDescriptorModel.initial as any)
      ) {
        throw new Error(
          `[NgVault] Invalid FeatureCellDescriptorModel.initial for feature "${featureCellDescriptorModel.key}". ` +
            `Expected raw data (e.g., [] or {}), but received an object with resource fields { loading, data, error }. ` +
            `Pass plain data to avoid double-wrapping.`
        );
      }

      const _data = signal<VaultDataType<T>>(
        featureCellDescriptorModel.initial === null || featureCellDescriptorModel.initial === undefined
          ? null
          : (featureCellDescriptorModel.initial as T)
      );

      /**
       * Updates the vault’s state reactively.
       * Supports partial updates, full resets, or Angular HttpResourceRef<T>.
       */
      const _set = (next: VaultStateType<T> | HttpResourceRef<T> | null): void => {
        if (next === null) {
          _loading.set(false);
          _error.set(null);
          _data.set(null);
          return;
        }

        // 🧪 Experimental Angular HttpResourceRef<T> integration
        if (NGVAULT_EXPERIMENTAL_HTTP_RESOURCE && isHttpResource<T>(next)) {
          const resource = next as HttpResourceRef<T>;

          runInInjectionContext(_injector, () => {
            effect(() => {
              _loading.set(resource.isLoading());
              try {
                _data.set(resource.value());
              } catch {
                _error.set(resourceError(resource.error()));
              }
            });
          });

          devWarnExperimentalHttpResource();
          return;
        }

        if (next && typeof next === 'object' && !isHttpResource<T>(next)) {
          const patch = next as VaultStateType<T>;

          if (patch.loading !== undefined) _loading.set(patch.loading);
          if (patch.error !== undefined) _error.set(patch.error);

          if (patch.data !== undefined) {
            const val = patch.data;

            // Handle arrays, objects, and primitives generically
            if (Array.isArray(val)) {
              _data.set([...val] as VaultDataType<T>);
            } else if (val && typeof val === 'object') {
              _data.set({ ...val } as VaultDataType<T>);
            } else {
              _data.set(val as VaultDataType<T>);
            }
          }
        }
      };

      const _patch = (partial: VaultStateType<T> | HttpResourceRef<T> | null): void => {
        if (partial === null) {
          _loading.set(false);
          _error.set(null);
          _data.set(null);
          return;
        }

        // 🧪 Experimental Angular HttpResourceRef<T> integration
        if (NGVAULT_EXPERIMENTAL_HTTP_RESOURCE && isHttpResource<T>(partial)) {
          const resource = partial as HttpResourceRef<T>;

          runInInjectionContext(_injector, () => {
            effect(() => {
              _loading.set(resource.isLoading());

              // Use queueMicrotask to avoid signal reentrancy
              queueMicrotask(() => {
                try {
                  const next = resource.value();
                  const curr = _data();

                  if (next == null) return;

                  if (Array.isArray(curr) && Array.isArray(next)) {
                    _data.set([...curr, ...next] as VaultDataType<T>);
                  } else if (
                    curr &&
                    next &&
                    typeof curr === 'object' &&
                    typeof next === 'object' &&
                    !Array.isArray(curr) &&
                    !Array.isArray(next)
                  ) {
                    _data.set({ ...curr, ...next } as VaultDataType<T>);
                  } else {
                    _data.set(next as VaultDataType<T>);
                  }

                  _error.set(null);
                } catch {
                  _error.set(resourceError(resource.error()));
                }
              });
            });
          });

          devWarnExperimentalHttpResource();
          return;
        }

        if (partial && typeof partial === 'object' && !isHttpResource<T>(partial)) {
          const patch = partial as VaultStateType<T>;

          if (patch.loading !== undefined) _loading.set(patch.loading);
          if (patch.error !== undefined) _error.set(patch.error);

          if (patch.data !== undefined) {
            const curr = _data();
            const next = patch.data;

            if (Array.isArray(curr) && Array.isArray(next)) {
              _data.set([...curr, ...next] as VaultDataType<T>);
            } else if (
              curr &&
              next &&
              typeof curr === 'object' &&
              typeof next === 'object' &&
              !Array.isArray(curr) &&
              !Array.isArray(next)
            ) {
              _data.set({ ...curr, ...next } as VaultDataType<T>);
            } else {
              _data.set(next as VaultDataType<T>);
            }
          }
        }
      };

      const _fromObservable = (source$: Observable<T>): Observable<ResourceSignal<T>> => {
        return new Observable<ResourceSignal<T>>((observer) => {
          const _loadingSignal = signal(true);
          const _errorSignal = signal<ResourceStateError | null>(null);
          const _dataSignal = signal<VaultDataType<T>>(null);

          source$.pipe(take(1)).subscribe({
            next: (value) => {
              _dataSignal.set(value);
              _loadingSignal.set(false);
              observer.next({
                loading: _loadingSignal.asReadonly(),
                data: _dataSignal.asReadonly(),
                error: _errorSignal.asReadonly()
              });
              observer.complete();
            },
            error: (err) => {
              observer.error(resourceError(err));
            },
            complete: () => {
              _loadingSignal.set(false);
              observer.complete();
            }
          });
        });
      };

      // Create vault first so we can reference it inside loadListFrom
      const vault: ResourceVaultModel<T> = {
        state: {
          loading: _loading.asReadonly(),
          data: _data.asReadonly(),
          error: _error.asReadonly()
        },
        setState: _set,
        patchState: _patch,
        fromObservable: _fromObservable
      };

      return vault;
    }
  };

  const registryProvider: Provider = {
    provide: FEATURE_CELL_REGISTRY,
    multi: true,
    useValue: { key: featureCellDescriptorModel.key, token: service }
  };

  return [featureCellProvider, service, registryProvider];
}
