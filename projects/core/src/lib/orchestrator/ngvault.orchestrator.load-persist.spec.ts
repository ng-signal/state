import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
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

describe('Orcestrator: Vault - Load Persist', () => {
  let dispatcher: VaultOrchestrator<any>;
  let mockCtx: NgVaultBehaviorContext<any>;
  let calls: string[];
  let injector: any;
  let ngVaultMonitor: any;

  const emitted: any[] = [];
  let stopListening: any;
  let eventBus: any;

  beforeEach(() => {
    calls = [];

    mockCtx = {
      incoming: Object({ value: 22 }),
      isLoading: signal<any>(false),
      error: signal<any>(null),
      value: signal<any>(null),
      state: 22
    } as unknown as NgVaultBehaviorContext<any>;

    TestBed.configureTestingModule({
      providers: [
        provideVaultTesting(),
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    injector = TestBed.inject(Injector);
    ngVaultMonitor = TestBed.inject(NgVaultMonitor);
    ngVaultMonitor.registerCell('cell key', { wantsPayload: true });

    eventBus = TestBed.inject(NgVaultEventBus);
    stopListening = createTestEventListener(eventBus, emitted);
  });

  afterEach(() => {
    stopListening();
  });

  it('should load state without decrypt', async () => {
    // Make behaviors using the helper + real reducer behavior
    const behaviors = [
      createInitializedTestBehavior(NgVaultBehaviorTypes.State, calls),
      createInitializedTestBehavior(NgVaultBehaviorTypes.Reduce, calls),
      createInitializedTestBehavior(NgVaultBehaviorTypes.Persist, calls, Object({ data: true }))
    ] as any;

    // Create orchestrator
    runInInjectionContext(injector, () => {
      dispatcher = new VaultOrchestrator<any>('cell key', behaviors, [], injector, ngVaultMonitor);
    });

    // Act — trigger reducer pipeline
    const value = await dispatcher.loadPersistedState(mockCtx);
    await flushMicrotasksZoneless();
    expect(value).toEqual(Object({ data: true }));

    // Reducer pipeline order + other behaviors
    expect(calls).toEqual(['load']);

    // Verify final state after reducer pipeline
    expect(mockCtx.isLoading?.()).toBeFalse();
    expect(mockCtx.error?.()).toBeNull();
    expect(mockCtx.value?.()).toBeNull();

    // Verify event pipeline
    expect(emitted).toEqual([
      Object({
        id: 'id-removed',
        cell: 'cell key',
        behaviorKey: 'NgVault::Test::Persist',
        type: 'stage:start:loadpersist',
        timestamp: 'timestamp-removed'
      }),
      Object({
        id: 'id-removed',
        cell: 'cell key',
        behaviorKey: 'NgVault::Test::Persist',
        type: 'stage:end:loadpersist',
        timestamp: 'timestamp-removed'
      })
    ]);
  });

  describe('decrypt', () => {
    it('should load state with a decrypt value', async () => {
      // Make behaviors using the helper + real reducer behavior
      const behaviors = [
        createInitializedTestBehavior(NgVaultBehaviorTypes.State, calls),
        createInitializedTestBehavior(NgVaultBehaviorTypes.Reduce, calls),
        createInitializedTestBehavior(NgVaultBehaviorTypes.Encrypt, calls, Object({ decrypt: true })),
        createInitializedTestBehavior(NgVaultBehaviorTypes.Persist, calls, Object({ persist: true }))
      ] as any;

      // Create orchestrator
      runInInjectionContext(injector, () => {
        dispatcher = new VaultOrchestrator<any>('cell key', behaviors, [], injector, ngVaultMonitor);
      });

      // Act — trigger reducer pipeline
      const value = await dispatcher.loadPersistedState(mockCtx);
      await flushMicrotasksZoneless();

      expect(value).toEqual(Object({ decrypt: true }));

      // Reducer pipeline order + other behaviors
      expect(calls).toEqual(['load', 'decrypt']);

      // Verify final state after reducer pipeline
      expect(mockCtx.isLoading?.()).toBeFalse();
      expect(mockCtx.error?.()).toBeNull();
      expect(mockCtx.value?.()).toBeNull();

      // Verify event pipeline
      expect(emitted).toEqual([
        Object({
          id: 'id-removed',
          cell: 'cell key',
          behaviorKey: 'NgVault::Test::Persist',
          type: 'stage:start:loadpersist',
          timestamp: 'timestamp-removed'
        }),
        Object({
          id: 'id-removed',
          cell: 'cell key',
          behaviorKey: 'NgVault::Test::Persist',
          type: 'stage:end:loadpersist',
          timestamp: 'timestamp-removed'
        }),
        Object({
          id: 'id-removed',
          cell: 'cell key',
          behaviorKey: 'NgVault::Test::Encrypt',
          type: 'lifecycle:start:decrypt',
          timestamp: 'timestamp-removed'
        }),
        Object({
          id: 'id-removed',
          cell: 'cell key',
          behaviorKey: 'NgVault::Test::Encrypt',
          type: 'lifecycle:end:decrypt',
          timestamp: 'timestamp-removed'
        })
      ]);
    });

    it('should load state without a decrypt value', async () => {
      // Make behaviors using the helper + real reducer behavior
      const behaviors = [
        createInitializedTestBehavior(NgVaultBehaviorTypes.State, calls),
        createInitializedTestBehavior(NgVaultBehaviorTypes.Reduce, calls),
        createInitializedTestBehavior(NgVaultBehaviorTypes.Persist, calls, Object({ persist: true })),
        createInitializedTestBehavior(NgVaultBehaviorTypes.Encrypt, calls)
      ] as any;

      // Create orchestrator
      runInInjectionContext(injector, () => {
        dispatcher = new VaultOrchestrator<any>('cell key', behaviors, [], injector, ngVaultMonitor);
      });

      // Act — trigger reducer pipeline
      const value = await dispatcher.loadPersistedState(mockCtx);
      await flushMicrotasksZoneless();

      expect(value).toEqual(Object({ persist: true }));

      // Reducer pipeline order + other behaviors
      expect(calls).toEqual(['load', 'decrypt']);

      // Verify final state after reducer pipeline
      expect(mockCtx.isLoading?.()).toBeFalse();
      expect(mockCtx.error?.()).toBeNull();
      expect(mockCtx.value?.()).toBeNull();

      // Verify event pipeline
      expect(emitted).toEqual([
        Object({
          id: 'id-removed',
          cell: 'cell key',
          behaviorKey: 'NgVault::Test::Persist',
          type: 'stage:start:loadpersist',
          timestamp: 'timestamp-removed'
        }),
        Object({
          id: 'id-removed',
          cell: 'cell key',
          behaviorKey: 'NgVault::Test::Persist',
          type: 'stage:end:loadpersist',
          timestamp: 'timestamp-removed'
        }),
        Object({
          id: 'id-removed',
          cell: 'cell key',
          behaviorKey: 'NgVault::Test::Encrypt',
          type: 'lifecycle:start:decrypt',
          timestamp: 'timestamp-removed'
        }),
        Object({
          id: 'id-removed',
          cell: 'cell key',
          behaviorKey: 'NgVault::Test::Encrypt',
          type: 'lifecycle:end:decrypt',
          timestamp: 'timestamp-removed',
          payload: Object({ noop: true })
        })
      ]);
    });

    it('should load state with a decrypt error value', async () => {
      // Make behaviors using the helper + real reducer behavior
      const behaviors = [
        createInitializedTestBehavior(NgVaultBehaviorTypes.State, calls),
        createInitializedTestBehavior(NgVaultBehaviorTypes.Reduce, calls),
        createInitializedTestBehavior(NgVaultBehaviorTypes.Persist, calls, Object({ persist: true })),
        createInitializedTestBehavior(NgVaultBehaviorTypes.Encrypt, calls, 'throw-error')
      ] as any;

      // Create orchestrator
      runInInjectionContext(injector, () => {
        dispatcher = new VaultOrchestrator<any>('cell key', behaviors, [], injector, ngVaultMonitor);
      });

      // Act — trigger reducer pipeline
      const value = await dispatcher.loadPersistedState(mockCtx);
      await flushMicrotasksZoneless();

      expect(value).toBeUndefined();

      // Reducer pipeline order + other behaviors
      expect(calls).toEqual(['load', 'decrypt']);

      // Verify final state after reducer pipeline
      expect(mockCtx.isLoading?.()).toBeFalse();
      expect(mockCtx.error?.()).toBeNull();
      expect(mockCtx.value?.()).toBeNull();

      // Verify event pipeline
      expect(emitted).toEqual([
        Object({
          id: 'id-removed',
          cell: 'cell key',
          behaviorKey: 'NgVault::Test::Persist',
          type: 'stage:start:loadpersist',
          timestamp: 'timestamp-removed'
        }),
        Object({
          id: 'id-removed',
          cell: 'cell key',
          behaviorKey: 'NgVault::Test::Persist',
          type: 'stage:end:loadpersist',
          timestamp: 'timestamp-removed'
        }),
        Object({
          id: 'id-removed',
          cell: 'cell key',
          behaviorKey: 'NgVault::Test::Encrypt',
          type: 'lifecycle:start:decrypt',
          timestamp: 'timestamp-removed'
        }),
        Object({
          id: 'id-removed',
          cell: 'cell key',
          behaviorKey: 'NgVault::Test::Encrypt',
          type: 'error',
          timestamp: 'timestamp-removed',
          payload: 'error'
        })
      ]);
    });
  });

  it('should not load state', async () => {
    // Make behaviors using the helper + real reducer behavior
    const behaviors = [
      createInitializedTestBehavior(NgVaultBehaviorTypes.State, calls),
      createInitializedTestBehavior(NgVaultBehaviorTypes.Reduce, calls),
      createInitializedTestBehavior(NgVaultBehaviorTypes.Encrypt, calls)
    ] as any;

    // Create orchestrator
    runInInjectionContext(injector, () => {
      dispatcher = new VaultOrchestrator<any>('cell key', behaviors, [], injector, ngVaultMonitor);
    });

    // Act — trigger reducer pipeline
    dispatcher.loadPersistedState(mockCtx);
    await flushMicrotasksZoneless();

    // Reducer pipeline order + other behaviors
    expect(calls).toEqual([]);

    // Verify final state after reducer pipeline
    expect(mockCtx.isLoading?.()).toBeFalse();
    expect(mockCtx.error?.()).toBeNull();
    expect(mockCtx.value?.()).toBeNull();

    // Verify event pipeline
    expect(emitted).toEqual([]);
  });

  it('should handle an error', async () => {
    // Make behaviors using the helper + real reducer behavior
    const behaviors = [
      createInitializedTestBehavior(NgVaultBehaviorTypes.State, calls),

      {
        type: NgVaultBehaviorTypes.Persist,
        key: `perist-id`,
        loadState: () => {
          throw new Error('this is the error');
        }
      },
      createInitializedTestBehavior(NgVaultBehaviorTypes.Reduce, calls),
      createInitializedTestBehavior(NgVaultBehaviorTypes.Encrypt, calls)
    ] as any;

    // Create orchestrator
    runInInjectionContext(injector, () => {
      dispatcher = new VaultOrchestrator<any>('cell key', behaviors, [], injector, ngVaultMonitor);
    });

    // Act — trigger reducer pipeline
    dispatcher.loadPersistedState(mockCtx);
    await flushMicrotasksZoneless();

    // Reducer pipeline order + other behaviors
    expect(calls).toEqual([]);

    // Verify final state after reducer pipeline
    expect(mockCtx.isLoading?.()).toBeFalse();
    expect(mockCtx.error?.()).toBeNull();
    expect(mockCtx.value?.()).toBeNull();

    // Verify event pipeline
    expect(emitted).toEqual([
      Object({
        id: 'id-removed',
        cell: 'cell key',
        behaviorKey: 'perist-id',
        type: 'stage:start:loadpersist',
        timestamp: 'timestamp-removed'
      }),
      Object({
        id: 'id-removed',
        cell: 'cell key',
        behaviorKey: 'perist-id',
        type: 'error',
        timestamp: 'timestamp-removed',
        payload: 'error'
      })
    ]);
  });
});
