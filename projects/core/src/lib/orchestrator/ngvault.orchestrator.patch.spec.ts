import { Injector, provideZonelessChangeDetection, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgVaultEventBus } from '@ngvault/dev-tools';
import { NgVaultBehaviorContext, NgVaultBehaviorType } from '@ngvault/shared';
import { createTestEventListener, flushMicrotasksZoneless, provideVaultTesting } from '@ngvault/testing';
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

  /** Utility factory to create test behaviors */
  function makeBehavior(type: string, returnValue?: any): any {
    return {
      type: type as NgVaultBehaviorType,
      key: `${type}-id`,
      computeState: async () => {
        calls.push(type);
        return returnValue ?? { [`${type}`]: true };
      },
      applyReducers: async () => {
        calls.push(type);
        return returnValue ?? { [`${type}`]: true };
      },
      encryptState: async () => {
        calls.push(type);
        return returnValue ?? { [`${type}`]: true };
      },
      persistState: async () => {
        calls.push(type);
        return returnValue ?? { [`${type}`]: true };
      },
      insight: {
        onCellRegistered: jasmine.createSpy('onCellRegistered'),

        // ✔ allow all events
        filterEventType: () => true,

        // ✔ request full state, payloads, and errors
        wantsState: true,
        wantsPayload: true,
        wantsErrors: true
      }
    };
  }

  xit('should execute state → reduce → encrypt → persist in order', async () => {
    const behaviors = [
      makeBehavior('state', { patch: true }),
      makeBehavior('reduce', { reduce: true }),
      makeBehavior('encrypt'),
      makeBehavior('persist'),
      makeBehavior(NgVaultBehaviorType.Insights)
    ];

    runInInjectionContext(injector, () => {
      dispatcher = new VaultOrchestrator<any>('cell key', behaviors, [], injector, ngVaultMonitor);
    });

    dispatcher.dispatchPatch(mockCtx);
    await flushMicrotasksZoneless();

    expect(calls).toEqual(['state', 'reduce', 'encrypt', 'persist']);
    expect(mockCtx.isLoading?.()).toBeTrue();
    expect(mockCtx.error?.()).toBeNull();
    expect(mockCtx.value?.()).toEqual({ reduce: true });

    expect(emitted).toEqual([
      Object({
        id: 'id-removed',
        cell: 'cell key',
        behaviorKey: 'vault-orchestrator',
        type: 'lifecycle:start:merge',
        timestamp: 'timestamp-removed',
        state: 22
      }),
      Object({
        id: 'id-removed',
        cell: 'cell key',
        behaviorKey: 'state-id',
        type: 'stage:start:state',
        timestamp: 'timestamp-removed',
        state: 22
      }),
      Object({
        id: 'id-removed',
        cell: 'cell key',
        behaviorKey: 'state-id',
        type: 'stage:end:state',
        timestamp: 'timestamp-removed',
        state: 22
      }),
      Object({
        id: 'id-removed',
        cell: 'cell key',
        behaviorKey: 'vault-orchestrator',
        type: 'lifecycle:end:merge',
        timestamp: 'timestamp-removed',
        state: 22
      })
    ]);
  });

  it('should correctly merge current and partial patch state', async () => {
    const behaviors = [makeBehavior('state', { newKey: true })];

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
    const errorBehavior = makeBehavior('state');
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
      makeBehavior('state', { id: 1 }),
      { ...makeBehavior('reduce'), applyReducers: async () => undefined },
      makeBehavior('encrypt')
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
    const behaviors = [makeBehavior('state')];

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
    const behaviors = [makeBehavior('state', { ok: true })];

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
