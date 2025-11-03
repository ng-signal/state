import {
  ClassProvider,
  ExistingProvider,
  FactoryProvider,
  Injector,
  ValueProvider,
  provideZonelessChangeDetection,
  runInInjectionContext
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FEATURE_CELL_REGISTRY } from './constants/feature-cell-registry.constant';
import { ResourceVaultModel } from './models/resource-vault.model';
import { provideFeatureCell } from './provide-feature-cell';

describe('Provider: Feature Cell (core vault functionality)', () => {
  let providers: any[];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: FEATURE_CELL_REGISTRY, multi: true, useValue: { key: 'user', token: {} } }
      ]
    });

    providers = provideFeatureCell(class TestService {}, { key: 'http', initial: [] });
  });

  // ──────────────────────────────────────────────
  // Provider registration
  // ──────────────────────────────────────────────

  it('should return an array with two providers', () => {
    expect(Array.isArray(providers)).toBeTrue();
    expect(providers.length).toBe(3);
  });

  it('should provide FEATURE_CELL_REGISTRY provider with multi:true and correct structure', () => {
    const registryProvider = providers.find(
      (p: any): p is ValueProvider | ClassProvider | FactoryProvider | ExistingProvider =>
        (p as any).provide === FEATURE_CELL_REGISTRY
    ) as ValueProvider;

    expect(registryProvider).toBeDefined();
    expect((registryProvider as any).multi).toBeTrue();
    expect(registryProvider.useValue).toEqual({ key: 'http', token: jasmine.any(Function) });
  });

  it('should support FEATURE_CELL_REGISTRY multi-provider merging', () => {
    const registry = TestBed.inject(FEATURE_CELL_REGISTRY) as unknown[];

    expect(Array.isArray(registry)).toBeTrue();
    expect(registry.length).toBe(1);
    expect(registry[0]).toEqual({ key: 'user', token: {} });
  });

  it('should throw an error if desc.initial contains a "data" field (resource-like object)', () => {
    const invalidInitial = {
      loading: false,
      data: [],
      error: null
    };

    const providers = provideFeatureCell(class DummyService {}, {
      key: 'invalid-initial',
      initial: invalidInitial
    });
    const provider = providers.find((p: any) => typeof p.useFactory === 'function');

    expect(() =>
      // 👇 ensure the factory runs inside an Angular injection context
      runInInjectionContext(TestBed.inject(Injector), () => (provider as any).useFactory())
    ).toThrowError(
      `[NgVault] Invalid FeatureCellDescriptorModel.initial for feature "invalid-initial". ` +
        `Expected raw data (e.g., [] or {}), but received an object with resource fields { loading, data, error }. ` +
        `Pass plain data to avoid double-wrapping.`
    );
  });

  it('should initialize _data as null when desc.initial is null or undefined', () => {
    const makeVault = (initial: any) => {
      const providers = provideFeatureCell(class DummyService {}, { key: 'init-test', initial });
      const provider = providers.find((p: any) => typeof p.useFactory === 'function');
      let vault: ResourceVaultModel<any>;
      runInInjectionContext(TestBed.inject(Injector), () => {
        vault = (provider as any).useFactory();
      });
      return vault!;
    };

    const nullVault = makeVault(null);
    expect(nullVault.state.data()).toBeNull();
    expect(nullVault.state.loading()).toBeFalse();
    expect(nullVault.state.error()).toBeNull();

    const undefinedVault = makeVault(undefined);
    expect(undefinedVault.state.data()).toBeNull();
    expect(undefinedVault.state.loading()).toBeFalse();
    expect(undefinedVault.state.error()).toBeNull();
  });

  it('should gracefully reset all vault signals when setState(null) or patchState(null) is used', () => {
    const providers = provideFeatureCell(class DummyService {}, { key: 'reset-test', initial: [1, 2, 3] });
    const provider = providers.find((p: any) => typeof p.useFactory === 'function');
    let vault!: ResourceVaultModel<any>;

    runInInjectionContext(TestBed.inject(Injector), () => {
      vault = (provider as any).useFactory();
    });

    vault.setState({ loading: true, error: { message: 'fail' }, data: [1, 2, 3] });
    expect(vault.state.loading()).toBeTrue();
    expect(vault.state.error()).toEqual({ message: 'fail' });
    expect(vault.state.data()).toEqual([1, 2, 3]);

    vault.setState(null);
    expect(vault.state.loading()).toBeFalse();
    expect(vault.state.error()).toBeNull();
    expect(vault.state.data()).toBeNull();

    vault.patchState({ loading: true, data: [4, 5] });
    vault.patchState(null);
    expect(vault.state.loading()).toBeFalse();
    expect(vault.state.error()).toBeNull();
    expect(vault.state.data()).toBeNull();
  });

  it('should merge arrays and objects correctly using patchState()', () => {
    const providers = provideFeatureCell(class DummyService {}, { key: 'merge-test', initial: [] });
    const provider = providers.find((p: any) => typeof p.useFactory === 'function');
    let vault!: ResourceVaultModel<any>;

    runInInjectionContext(TestBed.inject(Injector), () => {
      vault = (provider as any).useFactory();
    });

    vault.setState({ data: [1, 2] });
    vault.patchState({ data: [3, 4] });
    expect(vault.state.data()).toEqual([1, 2, 3, 4]);

    vault.setState({ data: { name: 'Alice', age: 30 } });
    vault.patchState({ data: { age: 31 } });
    expect(vault.state.data()).toEqual({ name: 'Alice', age: 31 });
  });

  it('should replace data completely when type differs between current and next', () => {
    const providers = provideFeatureCell(class DummyService {}, { key: 'replace-test', initial: [1, 2] });
    const provider = providers.find((p: any) => typeof p.useFactory === 'function');
    let vault!: ResourceVaultModel<any>;

    runInInjectionContext(TestBed.inject(Injector), () => {
      vault = (provider as any).useFactory();
    });

    vault.patchState({ data: { user: 'Alice' } });
    expect(vault.state.data()).toEqual({ user: 'Alice' });
  });

  it('should correctly propagate loading and error updates', () => {
    const providers = provideFeatureCell(class DummyService {}, { key: 'state-test', initial: [] });
    const provider = providers.find((p: any) => typeof p.useFactory === 'function');
    let vault!: ResourceVaultModel<any>;

    runInInjectionContext(TestBed.inject(Injector), () => {
      vault = (provider as any).useFactory();
    });

    vault.setState({ loading: true });
    expect(vault.state.loading()).toBeTrue();

    vault.patchState({ loading: false, error: { message: 'timeout' } });
    expect(vault.state.loading()).toBeFalse();
    expect(vault.state.error()).toEqual({ message: 'timeout' });
  });

  it('should correctly handle primitive and null data updates in setState()', () => {
    const providers = provideFeatureCell(class DummyService {}, { key: 'primitive-test', initial: 0 });
    const provider = providers.find((p: any) => typeof p.useFactory === 'function');
    let vault: any;

    // Ensure DI context for Angular signals
    runInInjectionContext(TestBed.inject(Injector), () => {
      vault = (provider as any).useFactory();
    });

    // Initial state
    expect(vault.state.data()).toBe(0);
    expect(vault.state.loading()).toBeFalse();
    expect(vault.state.error()).toBeNull();

    // Set a new primitive (string)
    vault.setState({ data: 'new-value' });
    expect(vault.state.data()).toBe('new-value');
    expect(vault.state.loading()).toBeFalse();
    expect(vault.state.error()).toBeNull();

    // Set a different primitive (boolean)
    vault.setState({ data: true });
    expect(vault.state.data()).toBeTrue();

    // Set same primitive value (should not throw or rewrap)
    vault.setState({ data: true });
    expect(vault.state.data()).toBeTrue();

    // Set null (reset to null state)
    vault.setState({ data: null });
    expect(vault.state.data()).toBeNull();

    // Set a number again after null (rehydrate)
    vault.setState({ data: 42 });
    expect(vault.state.data()).toBe(42);
  });
});
