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
import { NgVaultEventBus } from '@ngvault/dev-tools';
import { FeatureCell, VaultBehaviorFactory } from '@ngvault/shared';
import {
  createTestEventListener,
  flushMicrotasksZoneless,
  getTestBehavior,
  provideVaultTesting
} from '@ngvault/testing';
import { FEATURE_CELL_REGISTRY } from '../../tokens/feature-cell-registry.token';
import { provideFeatureCell } from './provide-feature-cell';

describe('Provider: Feature Cell (core vault functionality)', () => {
  let providers: any[];
  let injector: any;

  const emitted: any[] = [];
  let stopListening: any;
  let eventBus: any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideVaultTesting(),
        { provide: FEATURE_CELL_REGISTRY, multi: true, useValue: { key: 'user', token: {}, insights: {} as any } }
      ]
    });

    injector = TestBed.inject(Injector);

    runInInjectionContext(injector, () => {
      providers = provideFeatureCell(
        class TestService {
          behaviorKey = 'behavior-id';
        },
        { key: 'http', initial: [] }
      );
    });

    eventBus = TestBed.inject(NgVaultEventBus);
    stopListening = createTestEventListener(eventBus, emitted);
  });

  afterEach(() => {
    stopListening();
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
    expect(registry.length).toBe(2);
    expect(registry[1]).toEqual({ key: 'user', token: {}, insights: {} });
  });

  it('should throw an error if desc.initial contains a "data" field (resource-like object)', () => {
    const invalidInitial = {
      loading: false,
      data: [],
      error: null
    };

    runInInjectionContext(injector, () => {
      providers = provideFeatureCell(class DummyService {}, {
        key: 'invalid-initial',
        initial: invalidInitial
      });
    });

    const provider = providers.find((p: any) => typeof p.useFactory === 'function');

    expect(() =>
      // 👇 ensure the factory runs inside an Angular injection context
      runInInjectionContext(injector, () => (provider as any).useFactory())
    ).toThrowError(
      `[NgVault] Invalid FeatureCellDescriptorModel.initial for feature "invalid-initial". ` +
        `Expected raw data (e.g., [] or {}), but received an object with resource fields { loading, data, error }. ` +
        `Pass plain data to avoid double-wrapping.`
    );
  });

  it('should gracefully reset all vault signals when replaceState(null) or mergeState(null) is used', async () => {
    runInInjectionContext(injector, () => {
      providers = provideFeatureCell(class DummyService {}, { key: 'reset-test', initial: null });
    });
    const provider = providers.find((p: any) => typeof p.useFactory === 'function');
    let vault!: FeatureCell<any>;

    runInInjectionContext(injector, () => {
      vault = (provider as any).useFactory();
    });

    vault.replaceState({ loading: true, error: { message: 'fail' }, value: [1, 2, 3] });
    expect(vault.state.isLoading()).toBeTrue();
    expect(vault.state.error()).toEqual({ message: 'fail' });
    expect(vault.state.value()).toBeUndefined();
    expect(vault.state.hasValue()).toBeFalse();

    await flushMicrotasksZoneless();
    expect(vault.state.isLoading()).toBeTrue();
    expect(vault.state.error()).toEqual({ message: 'fail' });
    expect(vault.state.value()).toEqual([1, 2, 3]);
    expect(vault.state.hasValue()).toBeTrue();

    vault.replaceState(undefined);
    await flushMicrotasksZoneless();

    expect(vault.state.isLoading()).toBeFalse();
    expect(vault.state.error()).toBeNull();
    expect(vault.state.value()).toBeUndefined();
    expect(vault.state.hasValue()).toBeFalse();

    vault.replaceState({ loading: true, error: { message: 'fail' }, value: [1, 3] });
    expect(vault.state.isLoading()).toBeTrue();
    await flushMicrotasksZoneless();
    expect(vault.state.isLoading()).toBeTrue();
    expect(vault.state.error()).toEqual({ message: 'fail' });
    expect(vault.state.value()).toEqual([1, 3]);
    expect(vault.state.hasValue()).toBeTrue();

    vault.replaceState(null);
    await flushMicrotasksZoneless();
    expect(vault.state.isLoading()).toBeFalse();
    expect(vault.state.error()).toBeNull();
    expect(vault.state.value()).toBeUndefined();
    expect(vault.state.hasValue()).toBeFalse();

    vault.mergeState({ loading: true, error: { message: 'fail' }, value: [2, 3, 1] });
    expect(vault.state.isLoading()).toBeTrue();
    await flushMicrotasksZoneless();
    expect(vault.state.isLoading()).toBeTrue();
    expect(vault.state.error()).toEqual({ message: 'fail' });
    expect(vault.state.value()).toEqual([2, 3, 1]);
    expect(vault.state.hasValue()).toBeTrue();

    vault.mergeState(undefined);
    await flushMicrotasksZoneless();
    expect(vault.state.isLoading()).toBeFalse();
    expect(vault.state.error()).toBeNull();
    expect(vault.state.value()).toBeUndefined();
    expect(vault.state.hasValue()).toBeFalse();

    vault.mergeState({ loading: false, error: { message: 'fail' }, value: [1, 2, 3] });
    expect(vault.state.isLoading()).toBeFalse();
    await flushMicrotasksZoneless();
    expect(vault.state.isLoading()).toBeFalse();
    expect(vault.state.error()).toEqual({ message: 'fail' });
    expect(vault.state.value()).toEqual([1, 2, 3]);
    expect(vault.state.hasValue()).toBeTrue();

    vault.mergeState(null);
    await flushMicrotasksZoneless();
    expect(vault.state.isLoading()).toBeFalse();
    expect(vault.state.error()).toBeNull();
    expect(vault.state.value()).toBeUndefined();
    expect(vault.state.hasValue()).toBeFalse();
  });

  it('should replace arrays and objects correctly using replaceState()', async () => {
    runInInjectionContext(injector, () => {
      providers = provideFeatureCell(class DummyService {}, { key: 'merge-test', initial: [] });
    });
    const provider = providers.find((p: any) => typeof p.useFactory === 'function');
    let vault!: FeatureCell<any>;

    runInInjectionContext(injector, () => {
      vault = (provider as any).useFactory();
    });

    vault.replaceState({ value: [1, 2] });
    await flushMicrotasksZoneless();
    vault.mergeState({ value: [3, 4] });
    await flushMicrotasksZoneless();
    expect(vault.state.value()).toEqual([3, 4]);
    expect(vault.state.hasValue()).toBeTrue();

    vault.replaceState({ value: { name: 'Alice', age: 30 } });
    await flushMicrotasksZoneless();
    vault.mergeState({ value: { age: 31 } });
    await flushMicrotasksZoneless();
    expect(vault.state.value()).toEqual({ name: 'Alice', age: 31 });
    expect(vault.state.hasValue()).toBeTrue();
  });

  it('should merge arrays and objects correctly using mergeState()', async () => {
    runInInjectionContext(injector, () => {
      providers = provideFeatureCell(class DummyService {}, { key: 'merge-test', initial: [] });
    });
    const provider = providers.find((p: any) => typeof p.useFactory === 'function');
    let vault!: FeatureCell<any>;

    runInInjectionContext(injector, () => {
      vault = (provider as any).useFactory();
    });

    vault.mergeState({ value: [1, 2] });
    await flushMicrotasksZoneless();
    vault.mergeState({ value: [3, 4] });
    await flushMicrotasksZoneless();
    expect(vault.state.value()).toEqual([3, 4]);
    expect(vault.state.hasValue()).toBeTrue();

    vault.mergeState({ value: { name: 'Alice', age: 30 } });
    await flushMicrotasksZoneless();
    vault.mergeState({ value: { age: 31 } });
    await flushMicrotasksZoneless();
    expect(vault.state.value()).toEqual({ name: 'Alice', age: 31 });
    expect(vault.state.hasValue()).toBeTrue();
  });

  it('should correctly propagate partial value, loading and error updates', async () => {
    runInInjectionContext(injector, () => {
      providers = provideFeatureCell(class DummyService {}, { key: 'state-test', initial: [] });
    });
    const provider = providers.find((p: any) => typeof p.useFactory === 'function');
    let vault!: FeatureCell<any>;

    runInInjectionContext(injector, () => {
      vault = (provider as any).useFactory();
    });
    await flushMicrotasksZoneless();

    vault.replaceState({ loading: true, error: { message: 'timeout' }, value: 22 });
    await flushMicrotasksZoneless();
    expect(vault.state.isLoading()).toBeTrue();
    expect(vault.state.error()).toEqual({ message: 'timeout' });
    expect(vault.state.value()).toBe(22);
    expect(vault.state.hasValue()).toBeTrue();

    vault.replaceState({ loading: true });
    await flushMicrotasksZoneless();
    expect(vault.state.isLoading()).toBeTrue();
    expect(vault.state.error()).toBeNull();
    expect(vault.state.value()).toBeUndefined();
    expect(vault.state.hasValue()).toBeFalse();

    vault.replaceState({ error: { message: 'timeout' } });
    await flushMicrotasksZoneless();
    expect(vault.state.isLoading()).toBeFalse();
    expect(vault.state.error()).toEqual({ message: 'timeout' });
    expect(vault.state.value()).toBeUndefined();
    expect(vault.state.hasValue()).toBeFalse();

    vault.replaceState({ value: 33 });
    await flushMicrotasksZoneless();
    expect(vault.state.isLoading()).toBeFalse();
    expect(vault.state.error()).toBeNull();
    expect(vault.state.value()).toBe(33);
    expect(vault.state.hasValue()).toBeTrue();

    vault.mergeState({ error: { message: 'timeout' } });
    await flushMicrotasksZoneless();
    expect(vault.state.isLoading()).toBeFalse();
    expect(vault.state.error()).toEqual({ message: 'timeout' });
    expect(vault.state.value()).toBe(33);
    expect(vault.state.hasValue()).toBeTrue();

    vault.mergeState({ loading: true });
    await flushMicrotasksZoneless();
    expect(vault.state.isLoading()).toBeTrue();
    expect(vault.state.error()).toEqual({ message: 'timeout' });
    expect(vault.state.value()).toBe(33);
    expect(vault.state.hasValue()).toBeTrue();

    vault.mergeState({ value: 22 });
    await flushMicrotasksZoneless();
    expect(vault.state.isLoading()).toBeTrue();
    expect(vault.state.error()).toEqual({ message: 'timeout' });
    expect(vault.state.hasValue()).toBeTrue();
    expect(vault.state.value()).toBe(22);
  });

  it('should correctly handle primitive and null data updates in replaceState()', async () => {
    runInInjectionContext(injector, () => {
      providers = provideFeatureCell(class DummyService {}, { key: 'primitive-test', initial: 0 });
    });
    const provider = providers.find((p: any) => typeof p.useFactory === 'function');
    let vault: any;

    // Ensure DI context for Angular signals
    runInInjectionContext(injector, () => {
      vault = (provider as any).useFactory();
    });
    await flushMicrotasksZoneless();

    // Initial state
    expect(vault.state.value()).toBe(0);
    expect(vault.state.isLoading()).toBeFalse();
    expect(vault.state.error()).toBeNull();
    expect(vault.state.hasValue()).toBeTrue();

    // Set a new primitive (string)
    vault.replaceState({ value: 'new-value' });
    await flushMicrotasksZoneless();
    expect(vault.state.value()).toBe('new-value');
    expect(vault.state.isLoading()).toBeFalse();
    expect(vault.state.error()).toBeNull();
    expect(vault.state.hasValue()).toBeTrue();

    // Set a different primitive (boolean)
    vault.replaceState({ value: true });
    await flushMicrotasksZoneless();
    expect(vault.state.value()).toBeTrue();
    expect(vault.state.hasValue()).toBeTrue();

    // Set same primitive value (should not throw or rewrap)
    vault.replaceState({ value: true });
    await flushMicrotasksZoneless();
    expect(vault.state.value()).toBeTrue();
    expect(vault.state.hasValue()).toBeTrue();

    // Set null (reset to null state)
    vault.replaceState({ value: null });
    await flushMicrotasksZoneless();
    expect(vault.state.value()).toBeNull();
    expect(vault.state.hasValue()).toBeFalse();

    // Set a number again after null (rehydrate)
    vault.replaceState({ value: 42 });
    await flushMicrotasksZoneless();
    expect(vault.state.value()).toBe(42);
    expect(vault.state.hasValue()).toBeTrue();
  });

  it('should merge arrays when current and next are both arrays', async () => {
    runInInjectionContext(injector, () => {
      providers = provideFeatureCell(class DummyService {}, { key: 'reset-test', initial: [1, 2, 3] });
    });
    const provider = providers.find((p: any) => typeof p.useFactory === 'function');
    let vault!: FeatureCell<any>;

    runInInjectionContext(injector, () => {
      vault = (provider as any).useFactory();
    });
    vault.replaceState({ value: [{ id: 1, name: 'Ada' }] });
    await flushMicrotasksZoneless();
    expect(vault.state.hasValue()).toBeTrue();
    vault.mergeState({ value: [{ id: 2, name: 'Grace' }] });
    await flushMicrotasksZoneless();
    expect(vault.state.value()).toEqual([{ id: 2, name: 'Grace' }]);
    expect(vault.state.hasValue()).toBeTrue();
  });

  it('should merge objects shallowly when both current and next are plain objects', async () => {
    runInInjectionContext(injector, () => {
      providers = provideFeatureCell(class DummyService {}, { key: 'reset-test', initial: [1, 2, 3] });
    });
    const provider = providers.find((p: any) => typeof p.useFactory === 'function');
    let vault!: FeatureCell<any>;

    runInInjectionContext(injector, () => {
      vault = (provider as any).useFactory();
    });
    // simulate current object state
    vault.replaceState({ value: { id: 1, name: 'Initial' } as any });
    await flushMicrotasksZoneless();
    expect(vault.state.hasValue()).toBeTrue();
    vault.mergeState({ value: { name: 'Updated' } as any });
    await flushMicrotasksZoneless();
    expect(vault.state.value()).toEqual({ id: 1, name: 'Updated' });
    expect(vault.state.hasValue()).toBeTrue();
  });

  it('should replace completely when types differ (array → object or null)', async () => {
    runInInjectionContext(injector, () => {
      providers = provideFeatureCell(class DummyService {}, { key: 'reset-test', initial: [1, 2, 3] });
    });
    const provider = providers.find((p: any) => typeof p.useFactory === 'function');
    let vault!: FeatureCell<any>;

    runInInjectionContext(injector, () => {
      vault = (provider as any).useFactory();
    });
    vault.replaceState({ value: [{ id: 1, name: 'Ada' }] });
    await flushMicrotasksZoneless();
    expect(vault.state.value()).toEqual([{ id: 1, name: 'Ada' }]);
    expect(vault.state.hasValue()).toBeTrue();
    vault.mergeState({ value: { id: 99, name: 'Replaced' } as any });
    await flushMicrotasksZoneless();
    expect(vault.state.value()).toEqual({ id: 99, name: 'Replaced' });
    expect(vault.state.hasValue()).toBeTrue();

    vault.mergeState({ value: undefined });
    vault.mergeState({ value: { id: 99, name: 'Replaced' } as any });
    expect(vault.state.hasValue()).toBeTrue();
  });

  it('should update loading when partial.loading is provided', async () => {
    runInInjectionContext(injector, () => {
      providers = provideFeatureCell(class DummyService {}, { key: 'reset-test', initial: [1, 2, 3] });
    });
    const provider = providers.find((p: any) => typeof p.useFactory === 'function');
    let vault!: FeatureCell<any>;

    runInInjectionContext(injector, () => {
      vault = (provider as any).useFactory();
    });
    expect(vault.state.isLoading()).toBeFalse();
    expect(vault.state.hasValue()).toBeTrue();
    vault.mergeState({ loading: true });

    expect(vault.state.isLoading()).toBeTrue();
    await flushMicrotasksZoneless();
    expect(vault.state.isLoading()).toBeTrue();
    expect(vault.state.hasValue()).toBeTrue();
  });

  it('should update error when partial.error is provided', async () => {
    runInInjectionContext(injector, () => {
      providers = provideFeatureCell(class DummyService {}, { key: 'reset-test', initial: [1, 2, 3] });
    });
    const provider = providers.find((p: any) => typeof p.useFactory === 'function');
    let vault!: FeatureCell<any>;

    runInInjectionContext(injector, () => {
      vault = (provider as any).useFactory();
    });
    expect(vault.state.error()).toBeNull();
    expect(vault.state.hasValue()).toBeTrue();
    const testError = { message: 'Something went wrong' } as any;
    vault.mergeState({ error: testError });
    expect(vault.state.isLoading()).toBeFalse();
    await flushMicrotasksZoneless();
    expect(vault.state.isLoading()).toBeFalse();

    expect(vault.state.error()).toEqual(testError);
    expect(vault.state.hasValue()).toBeTrue();
  });

  it('should handle and normalize thrown errors from a behavior', async () => {
    // Step 1: Behavior that throws an error when computeState runs
    const withErrorBehavior = () => {
      return {
        type: 'state' as const,
        critical: true,
        behaviorKey: 'behavior-id',
        key: 'NgVault::Test::ThrowBehavior',
        onInit: () => false,
        async computeState() {
          throw new Error('Simulated failure inside behavior');
        }
      } as unknown as VaultBehaviorFactory;
    };

    withErrorBehavior.type = 'state';
    withErrorBehavior.critical = true;

    // Step 2: Register the FeatureCell with the throwing behavior
    runInInjectionContext(injector, () => {
      providers = provideFeatureCell(class DummyService {}, { key: 'error-test', initial: [] }, [
        withErrorBehavior as any
      ]);
    });

    const provider = providers.find((p: any) => typeof p.useFactory === 'function');
    let vault!: FeatureCell<any>;

    runInInjectionContext(injector, () => {
      vault = (provider as any).useFactory();
    });

    // Step 3: Trigger replaceState to cause orchestrator → computeState → throw
    vault.replaceState({ loading: true, value: [1, 2, 3], error: { message: 'oops' } as any });

    // Step 4: Flush microtasks to let safeAsync complete
    await flushMicrotasksZoneless();

    // Step 5: Validate error normalization
    const error = vault.state.error();
    expect(error).toEqual(
      jasmine.objectContaining({
        message: 'Simulated failure inside behavior',
        details: jasmine.any(String)
      })
    );

    // And ensure loading is safely reset
    expect(vault.state.isLoading()).toBeFalse();

    // The value should remain unchanged
    expect(vault.state.value()).toEqual([]);
  });

  describe('FeatureCell Destroy Lifecycle', () => {
    it('should fully destroy and reset signals on destroy()', async () => {
      runInInjectionContext(injector, () => {
        providers = provideFeatureCell(class TestService {}, { key: 'destroy-test', initial: [] });
      });

      const vaultFactory = (providers[0] as any).useFactory;

      let vault!: FeatureCell<any>;
      runInInjectionContext(injector, () => {
        vault = vaultFactory();
      });

      vault.replaceState({ loading: true, value: [1, 2, 3], error: { message: 'oops' } as any });

      expect(vault.state.isLoading()).toBeTrue();
      await flushMicrotasksZoneless();
      expect(vault.state.isLoading()).toBeTrue();
      expect(vault.state.value()).toEqual([1, 2, 3]);
      expect(vault.state.error()).toEqual(Object({ message: 'oops' }));

      vault.reset();

      expect(vault.state.isLoading()).toBeFalse();
      await flushMicrotasksZoneless();
      expect(vault.state.isLoading()).toBeFalse();
      expect(vault.state.value()).toBeUndefined();
      expect(vault.state.error()).toBeNull();

      vault.replaceState({ loading: true, value: [1, 2, 3], error: { message: 'oops' } as any });
      expect(vault.state.isLoading()).toBeTrue();
      await flushMicrotasksZoneless();

      expect(vault.state.isLoading()).toBeTrue();
      expect(vault.state.value()).toEqual([1, 2, 3]);
      expect(vault.state.error()).toEqual(Object({ message: 'oops' }));

      vault.destroy();
      await flushMicrotasksZoneless();

      expect(vault.state.isLoading()).toBeFalse();
      expect(vault.state.value()).toBeUndefined();
      expect(vault.state.error()).toBeNull();

      let completed = false;
      vault.destroyed$?.subscribe({ complete: () => (completed = true) });
      expect(completed).toBeTrue();
    });
  });

  it('should default to {} when incoming is not a plain object (primitive)', async () => {
    runInInjectionContext(injector, () => {
      providers = provideFeatureCell(class DummyService {}, { key: 'state-test', initial: [] });
    });
    const provider = providers.find((p: any) => typeof p.useFactory === 'function');
    let vault!: FeatureCell<any>;

    runInInjectionContext(injector, () => {
      vault = (provider as any).useFactory();
    });
    await flushMicrotasksZoneless();

    vault.replaceState(22 as any);
    await flushMicrotasksZoneless();
    expect(vault.state.isLoading()).toBeFalse();
    expect(vault.state.error()).toBeNull();
    expect(vault.state.value()).toBeUndefined();
    expect(vault.state.hasValue()).toBeFalse();

    // Call replaceState → triggers safeAsync → uses {} fallback
    vault.replaceState(undefined);
    await flushMicrotasksZoneless();

    // No errors, signals remain safe
    expect(vault.state.isLoading()).toBeFalse();
    expect(vault.state.error()).toBeNull();
    expect(vault.state.value()).toBeUndefined();
    expect(vault.state.hasValue()).toBeFalse();
  });

  describe('Devtools hooks', () => {
    let factory: any;
    let testBehavior: any;

    let vault: FeatureCell<any>;
    let insightsOptions: any;

    beforeEach(() => {
      insightsOptions = {
        id: 'manual-insights',
        wantsState: true,
        wantsPayload: true,
        wantsErrors: true
      } as any;

      testBehavior?.resetEvents();
      runInInjectionContext(injector, () => {
        providers = provideFeatureCell(
          class TestService {},
          { key: 'devtools-test', initial: [], insights: insightsOptions },
          []
        );
      });
      factory = (providers[0] as any).useFactory;
    });

    it('should emit an "init" event when onInit is called', async () => {
      runInInjectionContext(injector, async () => {
        vault = factory();
      });

      TestBed.tick();
      await flushMicrotasksZoneless();

      expect(emitted).toEqual([]);
    });

    it('should emit a "dispose" event when vault.destroy() is called', async () => {
      runInInjectionContext(injector, () => {
        vault = factory();
        vault.destroy();
      });

      testBehavior = getTestBehavior();
      await flushMicrotasksZoneless();

      expect(emitted).toEqual([]);
    });

    it('should emit on all the calls', async () => {
      runInInjectionContext(injector, () => {
        vault = factory();
      });

      // Trigger a reset (should emit "reset")
      vault.replaceState({ loading: true, error: { message: 'fail' }, value: [1, 2, 3] });
      vault.reset();
      vault.mergeState({ loading: true, error: { message: 'fail' }, value: [4, 5, 6] });
      vault.mergeState(undefined);
      vault.replaceState({ loading: true, error: { message: 'fail' }, value: [1, 2, 3] });
      vault.replaceState(undefined);

      testBehavior = getTestBehavior();
      await flushMicrotasksZoneless();

      expect(emitted).toEqual([
        Object({
          id: '9821de50-8156-4857-a524-0a8eb4217d4e',
          cell: 'devtools-test',
          behaviorKey: 'vault-orchestrator',
          type: 'lifecycle:start:replace',
          timestamp: 1763046299711,
          state: Object({ isLoading: false, value: [], error: null, hasValue: true })
        }),
        Object({
          id: 'ba58f5f7-dd2a-445b-8998-046c644adc08',
          cell: 'devtools-test',
          behaviorKey: 'NgVault::Core::StateV2',
          type: 'stage:start:state',
          timestamp: 1763046299711,
          state: Object({ isLoading: true, value: [], error: Object({ message: 'fail' }), hasValue: true })
        }),
        Object({
          id: '617ca5a5-f8a1-4c27-876a-fff89504e7d8',
          cell: 'devtools-test',
          behaviorKey: 'vault-orchestrator',
          type: 'lifecycle:start:merge',
          timestamp: 1763046299711,
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        }),
        Object({
          id: 'fa0f7266-c270-4c59-952b-4612e557d82d',
          cell: 'devtools-test',
          behaviorKey: 'NgVault::Core::StateV2',
          type: 'stage:start:state',
          timestamp: 1763046299711,
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: '87b28ce7-bff6-49b8-ad89-8022c1b20489',
          cell: 'devtools-test',
          behaviorKey: 'vault-orchestrator',
          type: 'lifecycle:start:merge',
          timestamp: 1763046299712,
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: '31214e26-1012-4781-bfe7-beb6aad175d7',
          cell: 'devtools-test',
          behaviorKey: 'vault-orchestrator',
          type: 'lifecycle:start:replace',
          timestamp: 1763046299712,
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        }),
        Object({
          id: 'd369f404-016f-45a3-9563-207a13638ef7',
          cell: 'devtools-test',
          behaviorKey: 'NgVault::Core::StateV2',
          type: 'stage:start:state',
          timestamp: 1763046299712,
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: '7046bf45-c692-42e9-9e2d-9ee5eb6b521d',
          cell: 'devtools-test',
          behaviorKey: 'vault-orchestrator',
          type: 'lifecycle:start:replace',
          timestamp: 1763046299712,
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: 'e1b62a11-a5ca-4398-8ee7-391a3b9a0fb0',
          cell: 'devtools-test',
          behaviorKey: 'NgVault::Core::StateV2',
          type: 'stage:end:state',
          timestamp: 1763046299712,
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        }),
        Object({
          id: '725ac42c-03cb-4577-bc63-d15ab88e5f59',
          cell: 'devtools-test',
          behaviorKey: 'NgVault::CoreHttpResource::StateV2',
          type: 'stage:start:state',
          timestamp: 1763046299712,
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        }),
        Object({
          id: '622d18d8-356a-48dc-837e-8395e1362806',
          cell: 'devtools-test',
          behaviorKey: 'NgVault::Core::StateV2',
          type: 'stage:end:state',
          timestamp: 1763046299712,
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        }),
        Object({
          id: '4c55ead1-13fa-4704-8fe2-9006140e1273',
          cell: 'devtools-test',
          behaviorKey: 'NgVault::CoreHttpResource::StateV2',
          type: 'stage:start:state',
          timestamp: 1763046299712,
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        }),
        Object({
          id: 'a6a1357b-d07c-4a08-aee8-ac6b410a4176',
          cell: 'devtools-test',
          behaviorKey: 'NgVault::Core::StateV2',
          type: 'stage:end:state',
          timestamp: 1763046299712,
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        }),
        Object({
          id: '743c486b-abf7-4074-b715-3edaa1b4aa16',
          cell: 'devtools-test',
          behaviorKey: 'NgVault::CoreHttpResource::StateV2',
          type: 'stage:start:state',
          timestamp: 1763046299712,
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        }),
        Object({
          id: '1550db02-959c-400b-9e44-ac01d3cf8726',
          cell: 'devtools-test',
          behaviorKey: 'NgVault::CoreHttpResource::StateV2',
          type: 'stage:end:state',
          timestamp: 1763046299712,
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        }),
        Object({
          id: 'ec4809a9-feab-45f3-a294-a30490b89d9b',
          cell: 'devtools-test',
          behaviorKey: 'NgVault::CoreHttpResource::StateV2',
          type: 'stage:end:state',
          timestamp: 1763046299712,
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        }),
        Object({
          id: '39926254-70e2-4760-b98f-1461677b77bb',
          cell: 'devtools-test',
          behaviorKey: 'NgVault::CoreHttpResource::StateV2',
          type: 'stage:end:state',
          timestamp: 1763046299712,
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        }),
        Object({
          id: 'd16f92ab-b81c-4bf4-99b9-029fa57f7c9e',
          cell: 'devtools-test',
          behaviorKey: 'vault-orchestrator',
          type: 'lifecycle:end:replace',
          timestamp: 1763046299712,
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        }),
        Object({
          id: '4f8556b1-fe9c-438e-8e81-df8a9a91b94c',
          cell: 'devtools-test',
          behaviorKey: 'vault-orchestrator',
          type: 'lifecycle:end:merge',
          timestamp: 1763046299712,
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        }),
        Object({
          id: 'e3b328a5-0c15-4992-b01c-8defee36df1a',
          cell: 'devtools-test',
          behaviorKey: 'vault-orchestrator',
          type: 'lifecycle:end:replace',
          timestamp: 1763046299712,
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        })
      ]);
    });
  });

  describe('Behavior Factory Instantiation)', () => {
    it('filters null and undefined factories but retains valid ones', () => {
      spyOn(console, 'warn');
      const nullFactory = (() => null as any) as unknown as VaultBehaviorFactory<any>;
      nullFactory.type = 'state';

      runInInjectionContext(injector, () => {
        providers = provideFeatureCell(class ExampleService {}, { key: 'cell-filter', initial: null }, [nullFactory]);
      });

      const provider = providers.find((p: any) => typeof p.useFactory === 'function');

      const vault = runInInjectionContext(injector, () => (provider as any).useFactory());
      expect(vault).toBeDefined();
      // eslint-disable-next-line
      expect(console.warn).toHaveBeenCalledWith(
        '[NgVault] Behavior initialization failed: [NgVault] Behavior did not return an object'
      );
    });
  });

  describe('Behavior Factory extendCellApi)', () => {
    it('should attach and execute an extended FeatureCell API method from a behavior', async () => {
      // Step 1: Create a behavior that adds a custom method via extendCellAPI
      // eslint-disable-next-line
      const withCustomBehavior = (ctx: any) => ({
        type: 'state',
        key: 'NgVault::Testing::CustomBehavior',
        behaviorKey: 'custom-id',
        onInit: () => {},
        extendCellAPI: () => ({
          sayHello: (key: string, _ctx: any, name: string) => `Hello ${name} from ${key}`
        })
      });

      // Add required metadata (type and critical flags)
      (withCustomBehavior as any).type = 'state';
      (withCustomBehavior as any).critical = false;

      // Step 2: Provide the feature cell with the custom behavior

      runInInjectionContext(injector, () => {
        providers = provideFeatureCell(class DummyService {}, { key: 'extension-test', initial: [] }, [
          withCustomBehavior as any
        ]);
      });

      const provider = providers.find((p: any) => typeof p.useFactory === 'function');
      let vault!: FeatureCell<any>;

      // Step 3: Instantiate the feature cell within Angular DI
      runInInjectionContext(injector, () => {
        vault = (provider as any).useFactory();
      });

      // Step 4: Verify that the extension method was added
      expect(typeof (vault as any).sayHello).toBe('function');

      // Step 5: Call the method and verify it works
      const result = (vault as any).sayHello('World');
      expect(result).toBe('Hello World from extension-test');

      // Step 6: Confirm that the base FeatureCell API still works
      vault.replaceState({ value: [1, 2, 3] });
      await flushMicrotasksZoneless();
      expect(vault.state.value()).toEqual([1, 2, 3]);
      expect(vault.state.hasValue()).toBeTrue();
    });

    it('should throw when two behaviors define the same method name without allowOverride', () => {
      const behaviorA = () => ({
        type: 'state',
        key: 'NgVault::Testing::BehaviorA',
        behaviorKey: 'A-id',
        onInit: () => {},
        extendCellAPI: () => ({
          shared: () => 'shared-A'
        })
      });
      (behaviorA as any).type = 'state';
      (behaviorA as any).critical = false;

      const behaviorB = () => ({
        type: 'state',
        key: 'NgVault::Testing::BehaviorB',
        behaviorKey: 'B-id',
        onInit: () => {},
        extendCellAPI: () => ({
          shared: () => 'shared-B'
        })
      });
      (behaviorB as any).type = 'state';
      (behaviorB as any).critical = false;

      runInInjectionContext(injector, () => {
        providers = provideFeatureCell(class DummyService {}, { key: 'override-test', initial: [] }, [
          behaviorA as any,
          behaviorB as any
        ]);
      });

      const provider = providers.find((p: any) => typeof p.useFactory === 'function');

      expect(() => {
        runInInjectionContext(injector, () => {
          (provider as any).useFactory();
        });
      }).toThrowError(
        `[NgVault] Behavior "NgVault::Testing::BehaviorB" attempted to redefine method "shared" already provided by another behavior.`
      );
    });

    it('should allow overriding when allowOverride explicitly includes the method name', async () => {
      spyOn(console, 'warn');
      // Step 1: Behavior A defines shared method
      const behaviorA = () => ({
        type: 'state',
        key: 'NgVault::Testing::BehaviorA',
        behaviorKey: 'A-id',
        onInit: () => {},
        extendCellAPI: () => ({
          shared: (key: string, _ctx: any) => `shared-A from ${key}`
        })
      });
      (behaviorA as any).type = 'state';
      (behaviorA as any).critical = false;

      // Step 2: Behavior B defines same method, but explicitly allows override
      const behaviorB = () => ({
        type: 'state',
        key: 'NgVault::Testing::BehaviorB',
        behaviorKey: 'B-id',
        allowOverride: ['shared'],
        onInit: () => {},
        extendCellAPI: () => ({
          shared: (key: string, _ctx: any) => `shared-B from ${key}`
        })
      });
      (behaviorB as any).type = 'state';
      (behaviorB as any).critical = false;

      // Step 3: Provide FeatureCell with both behaviors

      runInInjectionContext(injector, () => {
        providers = provideFeatureCell(class DummyService {}, { key: 'override-test', initial: [] }, [
          behaviorA as any,
          behaviorB as any
        ]);
      });

      const provider = providers.find((p: any) => typeof p.useFactory === 'function');
      let vault!: FeatureCell<any>;

      // Step 4: Instantiate FeatureCell via Angular injector context
      runInInjectionContext(injector, () => {
        vault = (provider as any).useFactory();
      });

      // Step 5: Verify the overridden method exists
      expect(typeof (vault as any).shared).toBe('function');

      // Step 6: Behavior B’s override wins
      const result = (vault as any).shared();
      expect(result).toBe('shared-B from override-test');

      // Step 7: Verify warning message logged (not an error)
      // eslint-disable-next-line
      expect(console.warn).toHaveBeenCalledWith(
        `[NgVault] Behavior "NgVault::Testing::BehaviorB" is overriding method "shared" (explicitly allowed).`
      );

      // Step 8: Confirm FeatureCell’s base state API still works
      vault.replaceState({ value: [100] });
      await flushMicrotasksZoneless();

      expect(vault.state.value()).toEqual([100]);
      expect(vault.state.hasValue()).toBeTrue();
    });
  });
});
