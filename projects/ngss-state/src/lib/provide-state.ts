import { Provider, Type, signal } from '@angular/core';
import { FeatureDescriptorModel, NormalizedError, ResourceSignal } from '@ngss/state';
import { Observable, take } from 'rxjs';
import { FEATURE_REGISTRY } from './constants/feature-registry.constant';
import { CacheConfigModel } from './models/cache-policy.model';
import { ResourceVaultModel } from './models/resource-vault.model';
import { getOrCreateFeatureVaultToken } from './tokens/feature-token-registry';
import { VaultDataType } from './types/vault-data.type';
import { normalizeError } from './utils/normalize-error.util';

export function provideState<Svc, T>(
  service: Type<Svc>,
  desc: FeatureDescriptorModel<T>,
  cacheConfig: CacheConfigModel = { strategy: 'none' }
): Provider[] {
  const token = getOrCreateFeatureVaultToken<T>(desc.key);

  const vaultProvider: Provider = {
    provide: token,
    useFactory: (): ResourceVaultModel<T> => {
      const _loading = signal(false);
      const _error = signal<NormalizedError | null>(null);

      // Prevent incorrect initialization (e.g., passing a resource object)
      // eslint-disable-next-line
      if (typeof desc.initial === 'object' && desc.initial !== null && 'data' in (desc.initial as any)) {
        throw new Error(
          `[NGSS] Invalid FeatureDescriptorModel.initial for feature "${desc.key}". ` +
            `Expected raw data (e.g., [] or {}), but received an object with resource fields { loading, data, error }. ` +
            `Pass plain data to avoid double-wrapping.`
        );
      }

      // eslint-disable-next-line
      const cache: Map<string, any> | null = cacheConfig.strategy === 'memory' ? new Map<string, any>() : null;

      const _data = signal<VaultDataType<T>>(
        desc.initial === null || desc.initial === undefined ? null : (desc.initial as T)
      );

      // State manipulation helpers
      const _set = (next: Partial<{ loading: boolean; data: VaultDataType<T>; error: NormalizedError | null }>) => {
        if (next.loading !== undefined && _loading() !== next.loading) _loading.set(next.loading);
        if (next.error !== undefined && _error() !== next.error) _error.set(next.error);
        if (next.data !== undefined) {
          if (cache) {
            // eslint-disable-next-line
            const value: any = next.data;
            if (Array.isArray(value)) {
              cache.clear();
              // eslint-disable-next-line
              value.forEach((item: any) => cache.set(item.id, item));
              /*
            } else if (value && typeof value === 'object' && 'id' in value) {
              cache.set(value.id, value);
              */
            }
          }
          _data.set(next.data);
        }
      };

      const _patch = (
        partial: Partial<{ loading: boolean; data: VaultDataType<T>; error: NormalizedError | null }>
      ): void => {
        if (partial.loading !== undefined) {
          _loading.set(partial.loading);
        }

        if (partial.data !== undefined) {
          const curr = _data();
          const next = partial.data;

          if (Array.isArray(curr) && Array.isArray(next)) {
            // Merge arrays (append, unique merge can come later)
            _data.set([...curr, ...next] as VaultDataType<T>);
          } else if (
            curr &&
            next &&
            typeof curr === 'object' &&
            typeof next === 'object' &&
            !Array.isArray(curr) &&
            !Array.isArray(next)
          ) {
            // Merge objects shallowly
            _data.set({ ...curr, ...next } as VaultDataType<T>);
          } else {
            // Replace completely (covers nulls and mismatched types)
            _data.set(next);
          }
        }

        if (partial.error !== undefined) {
          _error.set(partial.error);
        }
      };

      const _fromResource = (source$: Observable<T>): ResourceSignal<T> => {
        const _loading = signal(true);
        const _error = signal<NormalizedError | null>(null);
        const _data = signal<VaultDataType<T>>(null);

        source$.pipe(take(1)).subscribe({
          next: (value) => {
            _data.set(value);
            _loading.set(false);
          },
          error: (err: unknown) => {
            _error.set(normalizeError(err));
            _loading.set(false);
            _data.set(null);
          },
          complete: () => _loading.set(false)
        });

        return {
          loading: _loading.asReadonly(),
          data: _data.asReadonly(),
          error: _error.asReadonly()
        };
      };

      const _loadListFrom = (source$: Observable<T>): void => {
        if (cache?.size) return;

        _set({ loading: true, error: null });

        source$.pipe(take(1)).subscribe({
          next: (value) => {
            _set({ loading: false, data: value });
          },
          error: (err: unknown) => {
            _set({ loading: false, data: null, error: normalizeError(err) });
          },
          complete: () => _set({ loading: false })
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
        loadListFrom: _loadListFrom,
        fromResource: _fromResource
      };

      return vault;
    }
  };

  const registryProvider: Provider = {
    provide: FEATURE_REGISTRY,
    multi: true,
    useValue: { key: desc.key, token: service }
  };

  return [vaultProvider, service, registryProvider];
}
