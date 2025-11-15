import { Injector, provideZonelessChangeDetection, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgVaultEventBus } from '@ngvault/dev-tools';
import { NgVaultBehaviorContext, NgVaultBehaviorTypes } from '@ngvault/shared';
import {
  createTestBehavior,
  createTestEventListener,
  flushMicrotasksZoneless,
  provideVaultTesting,
  resetTestBehaviorKeys,
  resetTestBehaviorUniqueKeys,
  setTestBehaviorUniqueKeys
} from '@ngvault/testing';
import { NgVaultMonitor } from '../monitor/ngvault-monitor.service';
import { VaultOrchestrator } from './ngvault.orchestrator';

describe('Orchestrator: Vault (dispatchPatch)', () => {
  let dispatcher: VaultOrchestrator<any>;
  let mockCtx: NgVaultBehaviorContext<any>;
  let calls: string[];
  let injector: Injector;
  let cell: any;

  const emitted: any[] = [];
  let stopListening: any;
  let eventBus: any;
  let ngVaultMonitor: any;

  beforeAll(() => {
    setTestBehaviorUniqueKeys();
  });

  beforeEach(() => {
    calls = [];

    mockCtx = {
      incoming: Object({ loading: true, value: 'incoming data' }),
      isLoading: signal<any>(false),
      error: signal<any>(null),
      value: signal<any>(null),
      state: 22
    } as unknown as NgVaultBehaviorContext<any>;
    TestBed.configureTestingModule({
      providers: [provideVaultTesting(), provideZonelessChangeDetection()]
    });

    cell = { key: 'cell key' };

    injector = TestBed.inject(Injector);
    ngVaultMonitor = TestBed.inject(NgVaultMonitor);

    eventBus = TestBed.inject(NgVaultEventBus);
    stopListening = createTestEventListener(eventBus, emitted);
  });

  afterEach(() => {
    resetTestBehaviorKeys();
    stopListening();
  });

  afterAll(() => {
    resetTestBehaviorUniqueKeys();
  });

  it('should execute state → reduce → encrypt → persist in order', async () => {
    const reducer1 = (current: any) => current;
    const behaviors = [
      createTestBehavior(NgVaultBehaviorTypes.State, calls),
      createTestBehavior(NgVaultBehaviorTypes.Reduce, calls),
      createTestBehavior(NgVaultBehaviorTypes.Encrypt, calls),
      createTestBehavior(NgVaultBehaviorTypes.Persist, calls)
    ];

    runInInjectionContext(injector, () => {
      dispatcher = new VaultOrchestrator<any>(cell, behaviors, [reducer1], injector, ngVaultMonitor);
    });

    dispatcher.dispatchPatch(mockCtx);
    await flushMicrotasksZoneless();

    expect(calls).toEqual(['state', 'reduce', 'encrypt', 'persist']);
    expect(mockCtx.isLoading?.()).toBeTrue();
    expect(mockCtx.error?.()).toBeNull();
    expect(mockCtx.value?.()).toEqual({});

    expect(emitted).toEqual([]);
  });

  it('should correctly merge current and partial patch state', async () => {
    const behaviors = [createTestBehavior('state', calls, { newKey: true })];

    runInInjectionContext(injector, () => {
      dispatcher = new VaultOrchestrator<any>(cell, behaviors, [], injector, ngVaultMonitor);
    });

    const currentValue = { id: 1, existing: true };
    mockCtx.value = Object.assign(jasmine.createSpy('value') as any, {
      // Simulate the signal getter returning currentValue
      call: () => currentValue,
      // Simulate the signal being callable: mockCtx.value()
      apply: () => currentValue,
      // Allow .set()
      set: jasmine.createSpy('set')
    });

    dispatcher.dispatchPatch(mockCtx);
    await flushMicrotasksZoneless();

    expect(calls).toEqual(['state']);
    expect(mockCtx.isLoading?.()).toBeTrue();
    expect(mockCtx.error?.()).toBeNull();
    expect(mockCtx.value?.set).toHaveBeenCalledWith(Object({ newKey: true }));
  });

  it('should handle errors gracefully and set resourceError', async () => {
    const errorBehavior = createTestBehavior('state', calls, 'Patch error test', true);
    runInInjectionContext(injector, () => {
      dispatcher = new VaultOrchestrator<any>(cell, [errorBehavior], [], injector, ngVaultMonitor);
    });

    dispatcher.dispatchPatch(mockCtx);
    await flushMicrotasksZoneless();

    expect(calls).toEqual([]);
    expect(mockCtx.isLoading?.()).toBeFalse();
    expect(mockCtx.error?.()).toEqual(Object({ message: 'Patch error test', details: jasmine.any(String) }));
    expect(mockCtx.value?.()).toBeNull();
  });

  it('should skip undefined results and continue processing later stages', async () => {
    const behaviors = [
      createTestBehavior('state', calls, { id: 1 }),
      { ...createTestBehavior('reduce', calls), applyReducers: async () => undefined },
      createTestBehavior('encrypt', calls)
    ];

    runInInjectionContext(injector, () => {
      dispatcher = new VaultOrchestrator<any>(cell, behaviors, [], injector, ngVaultMonitor);
    });

    dispatcher.dispatchPatch(mockCtx);
    await flushMicrotasksZoneless();

    expect(calls).toEqual(['state', 'encrypt']);
    expect(mockCtx.isLoading?.()).toBeTrue();
    expect(mockCtx.error?.()).toBeNull();
    expect(mockCtx.value?.()).toEqual({ id: 1 });
  });

  it('should not throw if ctx signals are missing', async () => {
    const behaviors = [createTestBehavior('state', calls)];

    runInInjectionContext(injector, () => {
      dispatcher = new VaultOrchestrator<any>(cell, behaviors, [], injector, ngVaultMonitor);
    });

    const minimalCtx = {} as NgVaultBehaviorContext<any>;
    expect(() => dispatcher.dispatchPatch(minimalCtx)).not.toThrow();
    expect(calls).toEqual([]);
    expect(mockCtx.isLoading?.()).toBeFalse();
    expect(mockCtx.error?.()).toBeNull();
    expect(mockCtx.value?.()).toBeNull();
  });

  it('should update signals correctly after microtask flush', async () => {
    const behaviors = [createTestBehavior('state', calls, { ok: true })];

    runInInjectionContext(injector, () => {
      dispatcher = new VaultOrchestrator<any>(cell, behaviors, [], injector, ngVaultMonitor);
    });

    dispatcher.dispatchPatch(mockCtx);
    await flushMicrotasksZoneless();

    expect(calls).toEqual(['state']);
    expect(mockCtx.isLoading?.()).toBeTrue();
    expect(mockCtx.error?.()).toBeNull();
    expect(mockCtx.value?.()).toEqual({ ok: true });
  });
});
