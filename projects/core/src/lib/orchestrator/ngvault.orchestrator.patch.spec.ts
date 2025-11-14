import { Injector, provideZonelessChangeDetection, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgVaultEventBus } from '@ngvault/dev-tools';
import { NgVaultBehaviorContext, NgVaultBehaviorTypes } from '@ngvault/shared';
import {
  createInitializedTestBehavior,
  createTestEventListener,
  flushMicrotasksZoneless,
  provideVaultTesting
} from '@ngvault/testing';
import { NgVaultMonitor } from '../monitor/ngvault-monitor.service';
import { VaultOrchestrator } from './ngvault.orchestrator';

describe('Orchestrator: Vault (dispatchPatch)', () => {
  let dispatcher: VaultOrchestrator<any>;
  let mockCtx: NgVaultBehaviorContext<any>;
  let calls: string[];
  let injector: Injector;

  const emitted: any[] = [];
  let stopListening: any;
  let eventBus: any;
  let ngVaultMonitor: any;

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

    injector = TestBed.inject(Injector);
    ngVaultMonitor = TestBed.inject(NgVaultMonitor);

    eventBus = TestBed.inject(NgVaultEventBus);
    stopListening = createTestEventListener(eventBus, emitted);
  });

  afterEach(() => {
    stopListening();
  });

  it('should execute state → reduce → encrypt → persist in order', async () => {
    const reducer1 = (current: any) => current;
    const behaviors = [
      createInitializedTestBehavior(NgVaultBehaviorTypes.State, calls),
      createInitializedTestBehavior(NgVaultBehaviorTypes.Reduce, calls),
      createInitializedTestBehavior(NgVaultBehaviorTypes.Encrypt, calls),
      createInitializedTestBehavior(NgVaultBehaviorTypes.Persist, calls)
    ];

    runInInjectionContext(injector, () => {
      dispatcher = new VaultOrchestrator<any>('cell key', behaviors, [reducer1], injector, ngVaultMonitor);
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
    const behaviors = [createInitializedTestBehavior('state', calls, { newKey: true })];

    runInInjectionContext(injector, () => {
      dispatcher = new VaultOrchestrator<any>('cell key', behaviors, [], injector, ngVaultMonitor);
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
    const errorBehavior = createInitializedTestBehavior('state', calls);
    errorBehavior.computeState = async () => {
      throw new Error('Patch error test');
    };

    const behaviors = [errorBehavior];
    runInInjectionContext(injector, () => {
      dispatcher = new VaultOrchestrator<any>('cell key', behaviors, [], injector, ngVaultMonitor);
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
      createInitializedTestBehavior('state', calls, { id: 1 }),
      { ...createInitializedTestBehavior('reduce', calls), applyReducers: async () => undefined },
      createInitializedTestBehavior('encrypt', calls)
    ];

    runInInjectionContext(injector, () => {
      dispatcher = new VaultOrchestrator<any>('cell key', behaviors, [], injector, ngVaultMonitor);
    });

    dispatcher.dispatchPatch(mockCtx);
    await flushMicrotasksZoneless();

    expect(calls).toEqual(['state', 'encrypt']);
    expect(mockCtx.isLoading?.()).toBeTrue();
    expect(mockCtx.error?.()).toBeNull();
    expect(mockCtx.value?.()).toEqual({ id: 1 });
  });

  it('should not throw if ctx signals are missing', async () => {
    const behaviors = [createInitializedTestBehavior('state', calls)];

    runInInjectionContext(injector, () => {
      dispatcher = new VaultOrchestrator<any>('cell key', behaviors, [], injector, ngVaultMonitor);
    });

    const minimalCtx = {} as NgVaultBehaviorContext<any>;
    expect(() => dispatcher.dispatchPatch(minimalCtx)).not.toThrow();
    expect(calls).toEqual([]);
    expect(mockCtx.isLoading?.()).toBeFalse();
    expect(mockCtx.error?.()).toBeNull();
    expect(mockCtx.value?.()).toBeNull();
  });

  it('should update signals correctly after microtask flush', async () => {
    const behaviors = [createInitializedTestBehavior('state', calls, { ok: true })];

    runInInjectionContext(injector, () => {
      dispatcher = new VaultOrchestrator<any>('cell key', behaviors, [], injector, ngVaultMonitor);
    });

    dispatcher.dispatchPatch(mockCtx);
    await flushMicrotasksZoneless();

    expect(calls).toEqual(['state']);
    expect(mockCtx.isLoading?.()).toBeTrue();
    expect(mockCtx.error?.()).toBeNull();
    expect(mockCtx.value?.()).toEqual({ ok: true });
  });
});
