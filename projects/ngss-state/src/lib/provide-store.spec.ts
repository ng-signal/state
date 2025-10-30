import {
  ClassProvider,
  ExistingProvider,
  FactoryProvider,
  Provider,
  provideZonelessChangeDetection,
  ValueProvider
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FEATURE_REGISTRY } from './constants/feature-registry.constant';
import { STORE_ROOT } from './constants/store-root.constant';
import { provideStore } from './provide-store';

describe('provideStore', () => {
  let providers: Provider[];

  beforeEach(() => {
    providers = provideStore();

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        ...providers,
        { provide: FEATURE_REGISTRY, multi: true, useValue: { key: 'user', token: {} } }
      ]
    });
  });

  it('should return an array with two providers', () => {
    expect(Array.isArray(providers)).toBeTrue();
    expect(providers.length).toBe(2);
  });

  it('should provide STORE_ROOT with useValue true', () => {
    // Cast to a provider object type to safely access "provide"
    const storeRootProvider = providers.find(
      (p): p is ValueProvider | ClassProvider | FactoryProvider | ExistingProvider => (p as any).provide === STORE_ROOT
    );

    expect(storeRootProvider).toBeDefined();
    if (!storeRootProvider) fail('STORE_ROOT provider not found');

    expect(storeRootProvider?.provide).toBe(STORE_ROOT);
    expect((storeRootProvider as ValueProvider).useValue).toBeTrue();
  });

  it('should provide FEATURE_REGISTRY with an empty array and multi true', () => {
    const registryProvider = providers.find(
      (p): p is ValueProvider | ClassProvider | FactoryProvider | ExistingProvider =>
        (p as any).provide === FEATURE_REGISTRY
    );

    expect(registryProvider).toBeDefined();
    if (!registryProvider) fail('FEATURE_REGISTRY provider not found');

    const valueProvider = registryProvider as ValueProvider;
    expect(valueProvider.provide).toBe(FEATURE_REGISTRY);
    expect(valueProvider.useValue).toEqual([]);
    expect((valueProvider as any).multi).toBeTrue();
  });

  it('should resolve STORE_ROOT and FEATURE_REGISTRY via TestBed', () => {
    const storeRoot = TestBed.inject(STORE_ROOT);
    expect(storeRoot).toBeTrue();

    const registry = TestBed.inject(FEATURE_REGISTRY);
    expect(Array.isArray(registry)).toBeTrue();
    expect(registry.length).toBe(2);
    expect(registry[0]).toEqual([] as any);
    expect(registry[1]).toEqual({ key: 'user', token: {} });
  });

  it('should support FEATURE_REGISTRY multi-provider merging', () => {
    const registry = TestBed.inject(FEATURE_REGISTRY) as unknown[];

    expect(Array.isArray(registry)).toBeTrue();
    expect(registry.length).toBe(2);
    expect(registry[0]).toEqual([]); // first from provideStore()
    expect(registry[1]).toEqual({ key: 'user', token: {} });
  });
});
