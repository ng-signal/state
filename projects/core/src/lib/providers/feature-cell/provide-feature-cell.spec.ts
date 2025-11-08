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
import { FeatureCell, VaultBehaviorFactory } from '@ngvault/shared';
import { flushNgVaultQueue, getTestBehavior, provideVaultTesting, withTestBehavior } from '@ngvault/testing';
import { FEATURE_CELL_REGISTRY } from '../../tokens/feature-cell-registry.token';
import { provideFeatureCell } from './provide-feature-cell';

describe('Provider: Feature Cell (core vault functionality)', () => {
  let providers: any[];
  let injector: any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideVaultTesting(),
        { provide: FEATURE_CELL_REGISTRY, multi: true, useValue: { key: 'user', token: {} } }
      ]
    });

    injector = TestBed.inject(Injector);

    runInInjectionContext(injector, () => {
      providers = provideFeatureCell(class TestService {}, { key: 'http', initial: [] });
    });
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
    expect(registry[1]).toEqual({ key: 'user', token: {} });
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

  it('should gracefully reset all vault signals when setState(null) or patchState(null) is used', async () => {
    runInInjectionContext(injector, () => {
      providers = provideFeatureCell(class DummyService {}, { key: 'reset-test', initial: [1, 2, 3] });
    });
    const provider = providers.find((p: any) => typeof p.useFactory === 'function');
    let vault!: FeatureCell<any>;

    runInInjectionContext(injector, () => {
      vault = (provider as any).useFactory();
    });

    vault.setState({ loading: true, error: { message: 'fail' }, value: [1, 2, 3] });
    await flushNgVaultQueue(1);
    expect(vault.state.isLoading()).toBeTrue();
    expect(vault.state.error()).toBeNull();
    expect(vault.state.value()).toEqual([1, 2, 3]);
    expect(vault.state.hasValue()).toBeTrue();

    vault.setState(undefined);
    await flushNgVaultQueue(1);
    expect(vault.state.isLoading()).toBeFalse();
    expect(vault.state.error()).toBeNull();
    expect(vault.state.value()).toBeUndefined();
    expect(vault.state.hasValue()).toBeFalse();

    vault.setState({ loading: true, error: { message: 'fail' }, value: [1, 2, 3] });
    await flushNgVaultQueue(2);
    expect(vault.state.isLoading()).toBeTrue();
    expect(vault.state.error()).toBeNull();
    expect(vault.state.value()).toEqual([1, 2, 3]);
    expect(vault.state.hasValue()).toBeTrue();

    vault.setState(null);
    await flushNgVaultQueue(1);
    expect(vault.state.isLoading()).toBeFalse();
    expect(vault.state.error()).toBeNull();
    expect(vault.state.value()).toBeUndefined();
    expect(vault.state.hasValue()).toBeFalse();

    vault.patchState({ loading: true, error: { message: 'fail' }, value: [1, 2, 3] });
    await flushNgVaultQueue(1);
    expect(vault.state.isLoading()).toBeTrue();
    expect(vault.state.error()).toBeNull();
    expect(vault.state.value()).toEqual([1, 2, 3]);
    expect(vault.state.hasValue()).toBeTrue();

    vault.patchState(undefined);
    await flushNgVaultQueue(1);
    expect(vault.state.isLoading()).toBeFalse();
    expect(vault.state.error()).toBeNull();
    expect(vault.state.value()).toBeUndefined();
    expect(vault.state.hasValue()).toBeFalse();

    vault.patchState({ loading: true, error: { message: 'fail' }, value: [1, 2, 3] });
    await flushNgVaultQueue(1);
    expect(vault.state.isLoading()).toBeTrue();
    expect(vault.state.error()).toBeNull();
    expect(vault.state.value()).toEqual([1, 2, 3]);
    expect(vault.state.hasValue()).toBeTrue();

    vault.patchState(null);
    await flushNgVaultQueue(1);
    expect(vault.state.isLoading()).toBeFalse();
    expect(vault.state.error()).toBeNull();
    expect(vault.state.value()).toBeUndefined();
    expect(vault.state.hasValue()).toBeFalse();
  });

  it('should merge arrays and objects correctly using patchState()', async () => {
    runInInjectionContext(injector, () => {
      providers = provideFeatureCell(class DummyService {}, { key: 'merge-test', initial: [] });
    });
    const provider = providers.find((p: any) => typeof p.useFactory === 'function');
    let vault!: FeatureCell<any>;

    runInInjectionContext(injector, () => {
      vault = (provider as any).useFactory();
    });

    vault.setState({ value: [1, 2] });
    await flushNgVaultQueue(1);
    vault.patchState({ value: [3, 4] });
    await flushNgVaultQueue(3);
    expect(vault.state.value()).toEqual([3, 4]);
    expect(vault.state.hasValue()).toBeTrue();

    vault.setState({ value: { name: 'Alice', age: 30 } });
    await flushNgVaultQueue(1);
    vault.patchState({ value: { age: 31 } });
    await flushNgVaultQueue(1);
    expect(vault.state.value()).toEqual({ name: 'Alice', age: 31 });
    expect(vault.state.hasValue()).toBeTrue();
  });

  it('should replace data completely when type differs between current and next', async () => {
    runInInjectionContext(injector, () => {
      providers = provideFeatureCell(class DummyService {}, { key: 'replace-test', initial: [1, 2] });
    });
    const provider = providers.find((p: any) => typeof p.useFactory === 'function');
    let vault!: FeatureCell<any>;

    runInInjectionContext(injector, () => {
      vault = (provider as any).useFactory();
    });

    vault.patchState({ value: { user: 'Alice' } });
    await flushNgVaultQueue(1);
    expect(vault.state.value()).toEqual({ user: 'Alice' });
    expect(vault.state.hasValue()).toBeTrue();
  });

  it('should correctly propagate loading and error updates', async () => {
    runInInjectionContext(injector, () => {
      providers = provideFeatureCell(class DummyService {}, { key: 'state-test', initial: [] });
    });
    const provider = providers.find((p: any) => typeof p.useFactory === 'function');
    let vault!: FeatureCell<any>;

    runInInjectionContext(injector, () => {
      vault = (provider as any).useFactory();
    });
    await flushNgVaultQueue(1);

    vault.setState({ loading: true });
    await flushNgVaultQueue(2);
    expect(vault.state.isLoading()).toBeTrue();
    expect(vault.state.hasValue()).toBeTrue();

    vault.patchState({ loading: false, error: { message: 'timeout' } });
    await flushNgVaultQueue(1);
    expect(vault.state.isLoading()).toBeFalse();
    expect(vault.state.error()).toEqual({ message: 'timeout' });
    expect(vault.state.hasValue()).toBeTrue();
  });

  it('should correctly handle primitive and null data updates in setState()', async () => {
    runInInjectionContext(injector, () => {
      providers = provideFeatureCell(class DummyService {}, { key: 'primitive-test', initial: 0 });
    });
    const provider = providers.find((p: any) => typeof p.useFactory === 'function');
    let vault: any;

    // Ensure DI context for Angular signals
    runInInjectionContext(injector, () => {
      vault = (provider as any).useFactory();
    });
    await flushNgVaultQueue(1);

    // Initial state
    expect(vault.state.value()).toBe(0);
    expect(vault.state.isLoading()).toBeFalse();
    expect(vault.state.error()).toBeNull();
    expect(vault.state.hasValue()).toBeTrue();

    // Set a new primitive (string)
    vault.setState({ value: 'new-value' });
    await flushNgVaultQueue(2);
    expect(vault.state.value()).toBe('new-value');
    expect(vault.state.isLoading()).toBeFalse();
    expect(vault.state.error()).toBeNull();
    expect(vault.state.hasValue()).toBeTrue();

    // Set a different primitive (boolean)
    vault.setState({ value: true });
    await flushNgVaultQueue(1);
    expect(vault.state.value()).toBeTrue();
    expect(vault.state.hasValue()).toBeTrue();

    // Set same primitive value (should not throw or rewrap)
    vault.setState({ value: true });
    await flushNgVaultQueue(1);
    expect(vault.state.value()).toBeTrue();
    expect(vault.state.hasValue()).toBeTrue();

    // Set null (reset to null state)
    vault.setState({ value: null });
    await flushNgVaultQueue(1);
    expect(vault.state.value()).toBeNull();
    expect(vault.state.hasValue()).toBeFalse();

    // Set a number again after null (rehydrate)
    vault.setState({ value: 42 });
    await flushNgVaultQueue(1);
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
    vault.setState({ value: [{ id: 1, name: 'Ada' }] });
    await flushNgVaultQueue(1);
    expect(vault.state.hasValue()).toBeTrue();
    vault.patchState({ value: [{ id: 2, name: 'Grace' }] });
    await flushNgVaultQueue(3);
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
    vault.setState({ value: { id: 1, name: 'Initial' } as any });
    await flushNgVaultQueue(2);
    expect(vault.state.hasValue()).toBeTrue();
    vault.patchState({ value: { name: 'Updated' } as any });
    await flushNgVaultQueue(2);
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
    vault.setState({ value: [{ id: 1, name: 'Ada' }] });
    expect(vault.state.hasValue()).toBeTrue();
    vault.patchState({ value: { id: 99, name: 'Replaced' } as any });
    await flushNgVaultQueue(2);
    expect(vault.state.value()).toEqual({ id: 99, name: 'Replaced' });
    expect(vault.state.hasValue()).toBeTrue();

    vault.patchState({ value: undefined });
    vault.patchState({ value: { id: 99, name: 'Replaced' } as any });
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
    vault.patchState({ loading: true });
    await flushNgVaultQueue(2);
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
    vault.patchState({ error: testError });
    await flushNgVaultQueue(2);
    expect(vault.state.error()).toEqual(testError);
    expect(vault.state.hasValue()).toBeTrue();
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

      vault.setState({ loading: true, value: [1, 2, 3], error: { message: 'oops' } as any });
      await flushNgVaultQueue(1);

      expect(vault.state.isLoading()).toBeTrue();
      expect(vault.state.value()).toEqual([1, 2, 3]);
      expect(vault.state.error()).toBeNull();

      vault.reset();

      await flushNgVaultQueue(1);
      expect(vault.state.isLoading()).toBeFalse();
      expect(vault.state.value()).toBeUndefined();
      expect(vault.state.error()).toBeNull();

      vault.setState({ loading: true, value: [1, 2, 3], error: { message: 'oops' } as any });
      await flushNgVaultQueue(2);
      expect(vault.state.isLoading()).toBeTrue();
      expect(vault.state.value()).toEqual([1, 2, 3]);
      expect(vault.state.error()).toBeNull();

      vault.destroy();
      await flushNgVaultQueue(1);

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
    let testBehavior: any;

    let vault: FeatureCell<any>;

    beforeEach(() => {
      testBehavior?.resetEvents();
      runInInjectionContext(injector, () => {
        providers = provideFeatureCell(class TestService {}, { key: 'devtools-test', initial: [] }, [withTestBehavior]);
      });
      factory = (providers[0] as any).useFactory;
    });

    it('should emit an "init" event when onInit is called', async () => {
      runInInjectionContext(injector, () => {
        vault = factory();
      });

      testBehavior = getTestBehavior();
      await flushNgVaultQueue(1);

      expect(testBehavior.getEvents()).toEqual([
        'onInit:devtools-test',
        'onInit:NgVault::Core::State',
        'onInit:NgVault::CoreHttpResource::State',
        'onInit:NgVault::Core::FromObservable'
      ]);
    });

    it('should emit a "dispose" event when vault.destroy() is called', async () => {
      runInInjectionContext(injector, () => {
        vault = factory();
        vault.destroy();
      });

      testBehavior = getTestBehavior();
      await flushNgVaultQueue(5);

      expect(testBehavior.getEvents()).toEqual([
        'onInit:devtools-test',
        'onInit:NgVault::Core::State',
        'onInit:NgVault::CoreHttpResource::State',
        'onInit:NgVault::Core::FromObservable',
        'onReset:devtools-test',
        'onReset:devtools-test',

        'onDestroy:devtools-test',
        'onDestroy:devtools-test'
      ]);
    });

    it('should emit on all the calls', async () => {
      runInInjectionContext(injector, () => {
        vault = factory();
      });

      // Trigger a reset (should emit "reset")
      vault.setState({ loading: true, error: { message: 'fail' }, value: [1, 2, 3] });
      vault.reset();
      vault.patchState({ loading: true, error: { message: 'fail' }, value: [4, 5, 6] });
      vault.patchState(undefined);
      vault.setState({ loading: true, error: { message: 'fail' }, value: [1, 2, 3] });
      vault.setState(undefined);

      testBehavior = getTestBehavior();
      await flushNgVaultQueue(6);

      expect(testBehavior.getEvents()).toEqual([
        'onInit:devtools-test',
        'onInit:NgVault::Core::State',
        'onInit:NgVault::CoreHttpResource::State',
        'onInit:NgVault::Core::FromObservable',
        'onSet:devtools-test:{"isLoading":false,"value":[],"error":null,"hasValue":true}',
        'onSet:NgVault::Core::State:{"isLoading":true,"value":[1,2,3],"error":null,"hasValue":true}',
        'onReset:devtools-test',
        'onReset:devtools-test',
        'onPatch:devtools-test:{"isLoading":false,"error":null,"hasValue":false}',
        'onPatch:NgVault::Core::State:{"isLoading":true,"value":[4,5,6],"error":null,"hasValue":true}',
        'onReset:devtools-test',
        'onReset:devtools-test',
        'onSet:devtools-test:{"isLoading":false,"error":null,"hasValue":false}',
        'onSet:NgVault::Core::State:{"isLoading":true,"value":[1,2,3],"error":null,"hasValue":true}',
        'onReset:devtools-test',
        'onReset:devtools-test'
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
        behaviorId: 'custom-id',
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
      vault.setState({ value: [1, 2, 3] });
      await flushNgVaultQueue(1);
      expect(vault.state.value()).toEqual([1, 2, 3]);
      expect(vault.state.hasValue()).toBeTrue();
    });

    it('should throw when two behaviors define the same method name without allowOverride', () => {
      const behaviorA = () => ({
        type: 'state',
        key: 'NgVault::Testing::BehaviorA',
        behaviorId: 'A-id',
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
        behaviorId: 'B-id',
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
        behaviorId: 'A-id',
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
        behaviorId: 'B-id',
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
      vault.setState({ value: [100] });
      await flushNgVaultQueue(1);

      expect(vault.state.value()).toEqual([100]);
      expect(vault.state.hasValue()).toBeTrue();
    });
  });
});
