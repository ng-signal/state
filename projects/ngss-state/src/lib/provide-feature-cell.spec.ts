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
import { NgVaultEventBus } from '@ngvault/dev-tools/utils/ngvault-event-bus';
import { take } from 'rxjs/operators';
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
    expect(nullVault.state.value()).toBeUndefined();
    expect(nullVault.state.isLoading()).toBeFalse();
    expect(nullVault.state.error()).toBeNull();
    expect(nullVault.state.hasValue()).toBeFalse();

    const undefinedVault = makeVault(undefined);
    expect(undefinedVault.state.value()).toBeUndefined();
    expect(undefinedVault.state.isLoading()).toBeFalse();
    expect(undefinedVault.state.error()).toBeNull();
    expect(undefinedVault.state.hasValue()).toBeFalse();
  });

  it('should gracefully reset all vault signals when setState(null) or patchState(null) is used', () => {
    const providers = provideFeatureCell(class DummyService {}, { key: 'reset-test', initial: [1, 2, 3] });
    const provider = providers.find((p: any) => typeof p.useFactory === 'function');
    let vault!: ResourceVaultModel<any>;

    runInInjectionContext(TestBed.inject(Injector), () => {
      vault = (provider as any).useFactory();
    });

    vault.setState({ loading: true, error: { message: 'fail' }, value: [1, 2, 3] });
    expect(vault.state.isLoading()).toBeTrue();
    expect(vault.state.error()).toEqual({ message: 'fail' });
    expect(vault.state.value()).toEqual([1, 2, 3]);
    expect(vault.state.hasValue()).toBeTrue();

    vault.setState(undefined);
    expect(vault.state.isLoading()).toBeFalse();
    expect(vault.state.error()).toBeNull();
    expect(vault.state.value()).toBeUndefined();
    expect(vault.state.hasValue()).toBeFalse();

    vault.setState({ loading: true, error: { message: 'fail' }, value: [1, 2, 3] });
    expect(vault.state.isLoading()).toBeTrue();
    expect(vault.state.error()).toEqual({ message: 'fail' });
    expect(vault.state.value()).toEqual([1, 2, 3]);
    expect(vault.state.hasValue()).toBeTrue();

    vault.setState(null);
    expect(vault.state.isLoading()).toBeFalse();
    expect(vault.state.error()).toBeNull();
    expect(vault.state.value()).toBeUndefined();
    expect(vault.state.hasValue()).toBeFalse();

    vault.patchState({ loading: true, error: { message: 'fail' }, value: [1, 2, 3] });
    expect(vault.state.isLoading()).toBeTrue();
    expect(vault.state.error()).toEqual({ message: 'fail' });
    expect(vault.state.value()).toEqual([1, 2, 3]);
    expect(vault.state.hasValue()).toBeTrue();

    vault.patchState(undefined);
    expect(vault.state.isLoading()).toBeFalse();
    expect(vault.state.error()).toBeNull();
    expect(vault.state.value()).toBeUndefined();
    expect(vault.state.hasValue()).toBeFalse();

    vault.patchState({ loading: true, error: { message: 'fail' }, value: [1, 2, 3] });
    expect(vault.state.isLoading()).toBeTrue();
    expect(vault.state.error()).toEqual({ message: 'fail' });
    expect(vault.state.value()).toEqual([1, 2, 3]);
    expect(vault.state.hasValue()).toBeTrue();

    vault.patchState(null);
    expect(vault.state.isLoading()).toBeFalse();
    expect(vault.state.error()).toBeNull();
    expect(vault.state.value()).toBeUndefined();
    expect(vault.state.hasValue()).toBeFalse();
  });

  it('should merge arrays and objects correctly using patchState()', () => {
    const providers = provideFeatureCell(class DummyService {}, { key: 'merge-test', initial: [] });
    const provider = providers.find((p: any) => typeof p.useFactory === 'function');
    let vault!: ResourceVaultModel<any>;

    runInInjectionContext(TestBed.inject(Injector), () => {
      vault = (provider as any).useFactory();
    });

    vault.setState({ value: [1, 2] });
    vault.patchState({ value: [3, 4] });
    expect(vault.state.value()).toEqual([1, 2, 3, 4]);
    expect(vault.state.hasValue()).toBeTrue();

    vault.setState({ value: { name: 'Alice', age: 30 } });
    vault.patchState({ value: { age: 31 } });
    expect(vault.state.value()).toEqual({ name: 'Alice', age: 31 });
    expect(vault.state.hasValue()).toBeTrue();
  });

  it('should replace data completely when type differs between current and next', () => {
    const providers = provideFeatureCell(class DummyService {}, { key: 'replace-test', initial: [1, 2] });
    const provider = providers.find((p: any) => typeof p.useFactory === 'function');
    let vault!: ResourceVaultModel<any>;

    runInInjectionContext(TestBed.inject(Injector), () => {
      vault = (provider as any).useFactory();
    });

    vault.patchState({ value: { user: 'Alice' } });
    expect(vault.state.value()).toEqual({ user: 'Alice' });
    expect(vault.state.hasValue()).toBeTrue();
  });

  it('should correctly propagate loading and error updates', () => {
    const providers = provideFeatureCell(class DummyService {}, { key: 'state-test', initial: [] });
    const provider = providers.find((p: any) => typeof p.useFactory === 'function');
    let vault!: ResourceVaultModel<any>;

    runInInjectionContext(TestBed.inject(Injector), () => {
      vault = (provider as any).useFactory();
    });

    vault.setState({ loading: true });
    expect(vault.state.isLoading()).toBeTrue();
    expect(vault.state.hasValue()).toBeTrue();

    vault.patchState({ loading: false, error: { message: 'timeout' } });
    expect(vault.state.isLoading()).toBeFalse();
    expect(vault.state.error()).toEqual({ message: 'timeout' });
    expect(vault.state.hasValue()).toBeTrue();
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
    expect(vault.state.value()).toBe(0);
    expect(vault.state.isLoading()).toBeFalse();
    expect(vault.state.error()).toBeNull();
    expect(vault.state.hasValue()).toBeTrue();

    // Set a new primitive (string)
    vault.setState({ value: 'new-value' });
    expect(vault.state.value()).toBe('new-value');
    expect(vault.state.isLoading()).toBeFalse();
    expect(vault.state.error()).toBeNull();
    expect(vault.state.hasValue()).toBeTrue();

    // Set a different primitive (boolean)
    vault.setState({ value: true });
    expect(vault.state.value()).toBeTrue();
    expect(vault.state.hasValue()).toBeTrue();

    // Set same primitive value (should not throw or rewrap)
    vault.setState({ value: true });
    expect(vault.state.value()).toBeTrue();
    expect(vault.state.hasValue()).toBeTrue();

    // Set null (reset to null state)
    vault.setState({ value: null });
    expect(vault.state.value()).toBeNull();
    expect(vault.state.hasValue()).toBeFalse();

    // Set a number again after null (rehydrate)
    vault.setState({ value: 42 });
    expect(vault.state.value()).toBe(42);
    expect(vault.state.hasValue()).toBeTrue();
  });

  it('should merge arrays when current and next are both arrays', () => {
    const providers = provideFeatureCell(class DummyService {}, { key: 'reset-test', initial: [1, 2, 3] });
    const provider = providers.find((p: any) => typeof p.useFactory === 'function');
    let vault!: ResourceVaultModel<any>;

    runInInjectionContext(TestBed.inject(Injector), () => {
      vault = (provider as any).useFactory();
    });
    vault.setState({ value: [{ id: 1, name: 'Ada' }] });
    expect(vault.state.hasValue()).toBeTrue();
    vault.patchState({ value: [{ id: 2, name: 'Grace' }] });
    expect(vault.state.value()).toEqual([
      { id: 1, name: 'Ada' },
      { id: 2, name: 'Grace' }
    ]);
    expect(vault.state.hasValue()).toBeTrue();
  });

  it('should merge objects shallowly when both current and next are plain objects', () => {
    const providers = provideFeatureCell(class DummyService {}, { key: 'reset-test', initial: [1, 2, 3] });
    const provider = providers.find((p: any) => typeof p.useFactory === 'function');
    let vault!: ResourceVaultModel<any>;

    runInInjectionContext(TestBed.inject(Injector), () => {
      vault = (provider as any).useFactory();
    });
    // simulate current object state
    vault.setState({ value: { id: 1, name: 'Initial' } as any });
    expect(vault.state.hasValue()).toBeTrue();
    vault.patchState({ value: { name: 'Updated' } as any });
    expect(vault.state.value()).toEqual({ id: 1, name: 'Updated' });
    expect(vault.state.hasValue()).toBeTrue();
  });

  it('should replace completely when types differ (array → object or null)', () => {
    const providers = provideFeatureCell(class DummyService {}, { key: 'reset-test', initial: [1, 2, 3] });
    const provider = providers.find((p: any) => typeof p.useFactory === 'function');
    let vault!: ResourceVaultModel<any>;

    runInInjectionContext(TestBed.inject(Injector), () => {
      vault = (provider as any).useFactory();
    });
    vault.setState({ value: [{ id: 1, name: 'Ada' }] });
    expect(vault.state.hasValue()).toBeTrue();
    vault.patchState({ value: { id: 99, name: 'Replaced' } as any });
    expect(vault.state.value()).toEqual({ id: 99, name: 'Replaced' });
    expect(vault.state.hasValue()).toBeTrue();

    vault.patchState({ value: undefined });
    vault.patchState({ value: { id: 99, name: 'Replaced' } as any });
    expect(vault.state.hasValue()).toBeTrue();
  });

  it('should update loading when partial.loading is provided', () => {
    const providers = provideFeatureCell(class DummyService {}, { key: 'reset-test', initial: [1, 2, 3] });
    const provider = providers.find((p: any) => typeof p.useFactory === 'function');
    let vault!: ResourceVaultModel<any>;

    runInInjectionContext(TestBed.inject(Injector), () => {
      vault = (provider as any).useFactory();
    });
    expect(vault.state.isLoading()).toBeFalse();
    expect(vault.state.hasValue()).toBeTrue();
    vault.patchState({ loading: true });
    expect(vault.state.isLoading()).toBeTrue();
    expect(vault.state.hasValue()).toBeTrue();
  });

  it('should update error when partial.error is provided', () => {
    const providers = provideFeatureCell(class DummyService {}, { key: 'reset-test', initial: [1, 2, 3] });
    const provider = providers.find((p: any) => typeof p.useFactory === 'function');
    let vault!: ResourceVaultModel<any>;

    runInInjectionContext(TestBed.inject(Injector), () => {
      vault = (provider as any).useFactory();
    });
    expect(vault.state.error()).toBeNull();
    expect(vault.state.hasValue()).toBeTrue();
    const testError = { message: 'Something went wrong' } as any;
    vault.patchState({ error: testError });
    expect(vault.state.error()).toEqual(testError);
    expect(vault.state.hasValue()).toBeTrue();
  });

  // FILE: provide-feature-cell.spec.ts
  describe('FeatureCell Destroy Lifecycle', () => {
    it('should fully destroy and reset signals on destroy()', () => {
      const providers = provideFeatureCell(class TestService {}, { key: 'destroy-test', initial: [] });
      const vaultFactory = (providers[0] as any).useFactory;

      let vault!: ResourceVaultModel<any>;
      runInInjectionContext(TestBed.inject(Injector), () => {
        vault = vaultFactory();
      });

      vault.setState({ loading: true, value: [1, 2, 3], error: { message: 'oops' } as any });
      expect(vault.state.isLoading()).toBeTrue();
      expect(vault.state.value()).toEqual([1, 2, 3]);
      expect(vault.state.error()).toEqual({ message: 'oops' });

      vault.reset();

      expect(vault.state.isLoading()).toBeFalse();
      expect(vault.state.value()).toBeUndefined();
      expect(vault.state.error()).toBeNull();

      vault.setState({ loading: true, value: [1, 2, 3], error: { message: 'oops' } as any });
      expect(vault.state.isLoading()).toBeTrue();
      expect(vault.state.value()).toEqual([1, 2, 3]);
      expect(vault.state.error()).toEqual({ message: 'oops' });

      vault.destroy();

      expect(vault.state.isLoading()).toBeFalse();
      expect(vault.state.value()).toBeUndefined();
      expect(vault.state.error()).toBeNull();

      let completed = false;
      vault.destroyed$?.subscribe({ complete: () => (completed = true) });
      expect(completed).toBeTrue();
    });
  });

  describe('Devtools hooks', () => {
    let factory: any;
    beforeEach(() => {
      // create a vault inside Angular DI
      const providers = provideFeatureCell(class TestService {}, {
        key: 'devtools-test',
        initial: []
      });
      factory = (providers[0] as any).useFactory;
    });

    it('should emit an "init" event when a vault is created', () => {
      const spy: any[] = [];

      NgVaultEventBus.asObservable()
        .pipe(take(1))
        .subscribe((event) => {
          spy.push(event);
        });

      runInInjectionContext(TestBed.inject(Injector), () => factory());

      expect(spy).toEqual([
        Object({
          key: 'devtools-test',
          type: 'init',
          timestamp: jasmine.any(Number),
          source: 'system',
          payload: Object({ isLoading: false, value: [], error: null, hasValue: true })
        })
      ]);
    });

    it('should emit a "dispose" event when vault.destroy() is called', () => {
      const spy: any[] = [];
      NgVaultEventBus.asObservable()
        .pipe(take(1))
        .subscribe((event) => {
          spy.push(event);
        });

      let vault: ResourceVaultModel<any>;
      runInInjectionContext(TestBed.inject(Injector), () => {
        vault = factory();
        vault.destroy();
      });

      expect(spy).toEqual([
        Object({
          key: 'devtools-test',
          type: 'init',
          timestamp: jasmine.any(Number),
          source: 'system',
          payload: Object({ isLoading: false, value: [], error: null, hasValue: true })
        })
      ]);
    });

    it('should emit on all the calls', () => {
      const spy: any[] = [];

      NgVaultEventBus.asObservable().subscribe((event) => {
        spy.push(event);
      });

      let vault!: ResourceVaultModel<any>;

      // Create vault inside DI context (this emits "init")
      runInInjectionContext(TestBed.inject(Injector), () => {
        vault = factory();
      });

      // Trigger a reset (should emit "reset")
      vault.setState({ loading: true, error: { message: 'fail' }, value: [1, 2, 3] });
      vault.reset();
      vault.patchState({ loading: true, error: { message: 'fail' }, value: [4, 5, 6] });
      vault.patchState(undefined);
      vault.setState({ loading: true, error: { message: 'fail' }, value: [1, 2, 3] });
      vault.setState(undefined);

      expect(spy).toEqual([
        Object({
          key: 'devtools-test',
          type: 'init',
          timestamp: jasmine.any(Number),
          source: 'system',
          payload: Object({ isLoading: false, value: [], error: null, hasValue: true })
        }),
        Object({
          key: 'devtools-test',
          type: 'set',
          timestamp: jasmine.any(Number),
          source: 'manual',
          payload: Object({ isLoading: true, value: [1, 2, 3], error: Object({ message: 'fail' }), hasValue: true })
        }),
        Object({
          key: 'devtools-test',
          type: 'reset',
          timestamp: jasmine.any(Number),
          source: 'manual',
          payload: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        }),
        Object({
          key: 'devtools-test',
          type: 'patch',
          timestamp: jasmine.any(Number),
          source: 'manual',
          payload: Object({ isLoading: true, value: [4, 5, 6], error: Object({ message: 'fail' }), hasValue: true })
        }),
        Object({
          key: 'devtools-test',
          type: 'reset',
          timestamp: jasmine.any(Number),
          source: 'manual',
          payload: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        }),
        Object({
          key: 'devtools-test',
          type: 'set',
          timestamp: jasmine.any(Number),
          source: 'manual',
          payload: Object({ isLoading: true, value: [1, 2, 3], error: Object({ message: 'fail' }), hasValue: true })
        }),
        Object({
          key: 'devtools-test',
          type: 'reset',
          timestamp: jasmine.any(Number),
          source: 'manual',
          payload: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        })
      ]);
    });
  });
});
