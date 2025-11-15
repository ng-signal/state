import { Injector, provideZonelessChangeDetection, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgVaultEventBus } from '@ngvault/dev-tools';
import { NgVaultFeatureCell } from '@ngvault/shared';
import { createTestEventListener, flushMicrotasksZoneless, provideVaultTesting } from '@ngvault/testing';
import { FEATURE_CELL_REGISTRY } from '../../tokens/feature-cell-registry.token';
import { provideFeatureCell } from './provide-feature-cell';

describe('Provider: Feature Cell - extendVCellApi', () => {
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

  it('should attach and execute an extended FeatureCell API method from a behavior', async () => {
    // Step 1: Create a behavior that adds a custom method via extendCellAPI
    // eslint-disable-next-line
    const withCustomBehavior = (ctx: any) => ({
      type: 'state',
      key: 'NgVault::Testing::CustomBehavior',
      behaviorKey: 'custom-id',
      onInit: () => {},
      extendCellAPI: () => ({
        sayHello: (_ctx: any, name: string) => `Hello ${name} from ${_ctx.state.hasValue}`
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

    await flushMicrotasksZoneless();

    const provider = providers.find((p: any) => typeof p.useFactory === 'function');
    let vault!: NgVaultFeatureCell<any>;

    // Step 3: Instantiate the feature cell within Angular DI
    runInInjectionContext(injector, () => {
      vault = (provider as any).useFactory();
      vault.initialize();
    });

    await flushMicrotasksZoneless();

    // Step 4: Verify that the extension method was added
    expect(typeof (vault as any).sayHello).toBe('function');

    // Step 5: Call the method and verify it works
    const result = (vault as any).sayHello('World');
    expect(result).toBe('Hello World from true');

    // Step 6: Confirm that the base FeatureCell API still works
    vault.replaceState({ value: [1, 2, 3] });
    await flushMicrotasksZoneless();
    expect(vault.state.value()).toEqual([1, 2, 3]);
    expect(vault.state.hasValue()).toBeTrue();

    expect(emitted).toEqual([]);
  });

  it('should throw when two behaviors define the same method name without allowOverride', async () => {
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

    await flushMicrotasksZoneless();

    const provider = providers.find((p: any) => typeof p.useFactory === 'function');

    await expectAsync(
      runInInjectionContext(injector, async () => {
        const vault = (provider as any).useFactory();
        await vault.initialize(); // error thrown inside here
      })
    ).toBeRejectedWithError(
      `[NgVault] Behavior "NgVault::Testing::BehaviorB" attempted to redefine method "shared" already provided by another behavior.`
    );

    expect(emitted).toEqual([]);
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
        shared: (_ctx: any) => `shared-A from ${_ctx.state.hasValue}`
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
        shared: (_ctx: any) => `shared-B from ${_ctx.state.hasValue}`
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
    let vault!: NgVaultFeatureCell<any>;

    // Step 4: Instantiate FeatureCell via Angular injector context
    runInInjectionContext(injector, () => {
      vault = (provider as any).useFactory();
      vault.initialize();
    });

    await flushMicrotasksZoneless();

    // Step 5: Verify the overridden method exists
    expect(typeof (vault as any).shared).toBe('function');

    // Step 6: Behavior B’s override wins
    const result = (vault as any).shared();
    expect(result).toBe('shared-B from true');

    // Step 8: Confirm FeatureCell’s base state API still works
    vault.replaceState({ value: [100] });
    await flushMicrotasksZoneless();

    expect(vault.state.value()).toEqual([100]);
    expect(vault.state.hasValue()).toBeTrue();
    expect(emitted).toEqual([]);
  });
});
