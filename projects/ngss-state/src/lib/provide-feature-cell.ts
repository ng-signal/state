import { HttpResourceRef } from '@angular/common/http';
import { Injector, Provider, Type, computed, effect, inject, runInInjectionContext, signal } from '@angular/core';
import { Observable, take } from 'rxjs';
import { NGVAULT_EXPERIMENTAL_HTTP_RESOURCE } from './constants/experimental-flag.constant';
import { FEATURE_CELL_REGISTRY } from './constants/feature-cell-registry.constant';
import { FeatureCellDescriptorModel } from './models/feature-cell-descriptor.model';
import { ResourceStateError } from './models/resource-state-error.model';
import { ResourceVaultModel } from './models/resource-vault.model';
import { VaultSignalRef } from './models/vault-signal.ref';
import { getOrCreateFeatureCellToken } from './tokens/feature-cell-token-registry';
import { VaultDataType } from './types/vault-data.type';
import { VaultStateInput } from './types/vault-state-input.type';
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
      const _isLoading = signal(false);
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

      const _value = signal<VaultDataType<T>>(
        featureCellDescriptorModel.initial === null || featureCellDescriptorModel.initial === undefined
          ? undefined
          : (featureCellDescriptorModel.initial as T)
      );

      const _hasValue = computed(() => {
        const val = _value();
        return val !== null && val !== undefined;
      });

      /**
       * Updates the vault’s state reactively.
       * Supports partial updates, full resets, or Angular HttpResourceRef<T>.
       */
      const _set = (next: VaultStateInput<T>): void => {
        if (next == null) {
          _isLoading.set(false);
          _error.set(null);
          _value.set(undefined);
          return;
        }

        // 🧪 Experimental Angular HttpResourceRef<T> integration
        if (NGVAULT_EXPERIMENTAL_HTTP_RESOURCE && isHttpResource<T>(next)) {
          const resource = next as HttpResourceRef<T>;

          runInInjectionContext(_injector, () => {
            effect(() => {
              _isLoading.set(resource.isLoading());
              try {
                _value.set(resource.value());
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

          if (patch.loading !== undefined) _isLoading.set(patch.loading);
          if (patch.error !== undefined) _error.set(patch.error);

          if (patch.value !== undefined) {
            const val = patch.value;

            // Handle arrays, objects, and primitives generically
            if (Array.isArray(val)) {
              _value.set([...val] as VaultDataType<T>);
            } else if (val && typeof val === 'object') {
              _value.set({ ...val } as VaultDataType<T>);
            } else {
              _value.set(val as VaultDataType<T>);
            }
          }
        }
      };

      const _patch = (partial: VaultStateInput<T>): void => {
        if (partial == null) {
          _isLoading.set(false);
          _error.set(null);
          _value.set(undefined);
          return;
        }

        // 🧪 Experimental Angular HttpResourceRef<T> integration
        if (NGVAULT_EXPERIMENTAL_HTTP_RESOURCE && isHttpResource<T>(partial)) {
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

          if (patch.loading !== undefined) _isLoading.set(patch.loading);
          if (patch.error !== undefined) _error.set(patch.error);

          if (patch.value !== undefined) {
            const curr = _value();
            const next = patch.value;

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
          }
        }
      };

      const _fromObservable = (source$: Observable<T>): Observable<VaultSignalRef<T>> => {
        return new Observable<VaultSignalRef<T>>((observer) => {
          const _loadingSignal = signal(true);
          const _errorSignal = signal<ResourceStateError | null>(null);
          const _valueSignal = signal<VaultDataType<T>>(undefined);

          source$.pipe(take(1)).subscribe({
            next: (value) => {
              _valueSignal.set(value);
              _loadingSignal.set(false);
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
          isLoading: _isLoading.asReadonly(),
          value: _value.asReadonly(),
          error: _error.asReadonly(),
          hasValue: _hasValue
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
