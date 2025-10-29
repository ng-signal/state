import { Provider, Type, signal } from '@angular/core';
import { FEATURE_REGISTRY, FEATURE_VAULT_TOKEN, type FeatureVault } from './tokens';

export interface FeatureDescriptor<T> {
  key: string;
  initial: T;
}

export function provideState<Svc, T>(service: Type<Svc>, desc: FeatureDescriptor<T>): Provider[] {
  const token = FEATURE_VAULT_TOKEN<T>(desc.key);

  const vaultProvider: Provider = {
    provide: token,
    useFactory: (): FeatureVault<T> => {
      const s = signal<T>(desc.initial);

      const _set = (next: T) => s.set(next);
      const _patch = (partial: Partial<T>) => {
        const curr = s();
        s.set({ ...curr, ...partial });
      };

      return {
        _set,
        _patch,
        state: s.asReadonly()
      };
    }
  };

  const registryProvider: Provider = {
    provide: FEATURE_REGISTRY,
    multi: true,
    useValue: { key: desc.key, token: service }
  };

  return [vaultProvider, service, registryProvider];
}
