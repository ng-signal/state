import {
  ClassProvider,
  ExistingProvider,
  FactoryProvider,
  provideZonelessChangeDetection,
  ValueProvider
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FEATURE_CELL_REGISTRY } from './constants/feature-cell-registry.constant';
import { VAULT_ROOT } from './constants/vault-root.constant';
import { provideVault } from './provide-vault';

describe('Provider: Feature Cell', () => {
  let providers = provideVault();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        ...providers,
        { provide: FEATURE_CELL_REGISTRY, multi: true, useValue: { key: 'user', token: {} } }
      ]
    });
  });

  it('should return an array with two providers', () => {
    expect(Array.isArray(providers)).toBeTrue();
    expect(providers.length).toBe(2);
  });

  it('should provide VAULT_ROOT with useValue true', () => {
    // Cast to a provider object type to safely access "provide"
    const storeRootProvider = providers.find(
      (p): p is ValueProvider | ClassProvider | FactoryProvider | ExistingProvider => (p as any).provide === VAULT_ROOT
    );

    expect(storeRootProvider).toBeDefined();
    if (!storeRootProvider) fail('VAULT_ROOT provider not found');

    expect(storeRootProvider?.provide).toBe(VAULT_ROOT);
    expect((storeRootProvider as ValueProvider).useValue).toBeTrue();
  });

  it('should provide FEATURE_CELL_REGISTRY with an empty array and multi true', () => {
    const registryProvider = providers.find(
      (p): p is ValueProvider | ClassProvider | FactoryProvider | ExistingProvider =>
        (p as any).provide === FEATURE_CELL_REGISTRY
    );

    expect(registryProvider).toBeDefined();
    if (!registryProvider) fail('FEATURE_CELL_REGISTRY provider not found');

    const valueProvider = registryProvider as ValueProvider;
    expect(valueProvider.provide).toBe(FEATURE_CELL_REGISTRY);
    expect(valueProvider.useValue).toEqual([]);
    expect((valueProvider as any).multi).toBeTrue();
  });

  it('should resolve VAULT_ROOT and FEATURE_CELL_REGISTRY via TestBed', () => {
    const storeRoot = TestBed.inject(VAULT_ROOT);
    expect(storeRoot).toBeTrue();

    const registry = TestBed.inject(FEATURE_CELL_REGISTRY);
    expect(Array.isArray(registry)).toBeTrue();
    expect(registry.length).toBe(2);
    expect(registry[0]).toEqual([] as any);
    expect(registry[1]).toEqual({ key: 'user', token: {} });
  });

  it('should support FEATURE_CELL_REGISTRY multi-provider merging', () => {
    const registry = TestBed.inject(FEATURE_CELL_REGISTRY) as unknown[];

    expect(Array.isArray(registry)).toBeTrue();
    expect(registry.length).toBe(2);
    expect(registry[0]).toEqual([]); // first from provideStore()
    expect(registry[1]).toEqual({ key: 'user', token: {} });
  });
});
