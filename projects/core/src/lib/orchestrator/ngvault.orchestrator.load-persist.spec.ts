import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
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

describe('Orcestrator: Vault - Load Persist', () => {
  let dispatcher: VaultOrchestrator<any>;
  let mockCtx: NgVaultBehaviorContext<any>;
  let calls: string[];
  let injector: any;
  let ngVaultMonitor: any;
  let cell: any;

  const emitted: any[] = [];
  let stopListening: any;
  let eventBus: any;

  beforeAll(() => {
    setTestBehaviorUniqueKeys();
  });

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

    cell = { key: 'cell key' };

    injector = TestBed.inject(Injector);
    ngVaultMonitor = TestBed.inject(NgVaultMonitor);
    ngVaultMonitor.registerCell(cell.key, { wantsPayload: true });

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

  it('should load state without decrypt', async () => {
    // Make behaviors using the helper + real reducer behavior
    const behaviors = [
      createTestBehavior(NgVaultBehaviorTypes.State, calls),
      createTestBehavior(NgVaultBehaviorTypes.Reduce, calls),
      createTestBehavior(NgVaultBehaviorTypes.Persist, calls, Object({ data: true }))
    ] as any;

    // Create orchestrator
    runInInjectionContext(injector, () => {
      dispatcher = new VaultOrchestrator<any>(cell, behaviors, [], injector, ngVaultMonitor);
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
        behaviorKey: 'NgVault::Test::Persist3',
        type: 'stage:start:loadpersist',
        timestamp: 'timestamp-removed'
      }),
      Object({
        id: 'id-removed',
        cell: 'cell key',
        behaviorKey: 'NgVault::Test::Persist3',
        type: 'stage:end:loadpersist',
        timestamp: 'timestamp-removed'
      })
    ]);
  });

  describe('decrypt', () => {
    it('should load state with a decrypt value', async () => {
      // Make behaviors using the helper + real reducer behavior
      const behaviors = [
        createTestBehavior(NgVaultBehaviorTypes.State, calls),
        createTestBehavior(NgVaultBehaviorTypes.Reduce, calls),
        createTestBehavior(NgVaultBehaviorTypes.Encrypt, calls, Object({ decrypt: true })),
        createTestBehavior(NgVaultBehaviorTypes.Persist, calls, Object({ persist: true }))
      ] as any;

      // Create orchestrator
      runInInjectionContext(injector, () => {
        dispatcher = new VaultOrchestrator<any>(cell, behaviors, [], injector, ngVaultMonitor);
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
          behaviorKey: 'NgVault::Test::Persist4',
          type: 'stage:start:loadpersist',
          timestamp: 'timestamp-removed'
        }),
        Object({
          id: 'id-removed',
          cell: 'cell key',
          behaviorKey: 'NgVault::Test::Persist4',
          type: 'stage:end:loadpersist',
          timestamp: 'timestamp-removed'
        }),
        Object({
          id: 'id-removed',
          cell: 'cell key',
          behaviorKey: 'NgVault::Test::Encrypt3',
          type: 'lifecycle:start:decrypt',
          timestamp: 'timestamp-removed'
        }),
        Object({
          id: 'id-removed',
          cell: 'cell key',
          behaviorKey: 'NgVault::Test::Encrypt3',
          type: 'lifecycle:end:decrypt',
          timestamp: 'timestamp-removed'
        })
      ]);
    });

    it('should load state without a decrypt value', async () => {
      // Make behaviors using the helper + real reducer behavior
      const behaviors = [
        createTestBehavior(NgVaultBehaviorTypes.State, calls),
        createTestBehavior(NgVaultBehaviorTypes.Reduce, calls),
        createTestBehavior(NgVaultBehaviorTypes.Persist, calls, Object({ persist: true })),
        createTestBehavior(NgVaultBehaviorTypes.Encrypt, calls)
      ] as any;

      // Create orchestrator
      runInInjectionContext(injector, () => {
        dispatcher = new VaultOrchestrator<any>(cell, behaviors, [], injector, ngVaultMonitor);
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
          behaviorKey: 'NgVault::Test::Persist3',
          type: 'stage:start:loadpersist',
          timestamp: 'timestamp-removed'
        }),
        Object({
          id: 'id-removed',
          cell: 'cell key',
          behaviorKey: 'NgVault::Test::Persist3',
          type: 'stage:end:loadpersist',
          timestamp: 'timestamp-removed'
        }),
        Object({
          id: 'id-removed',
          cell: 'cell key',
          behaviorKey: 'NgVault::Test::Encrypt4',
          type: 'lifecycle:start:decrypt',
          timestamp: 'timestamp-removed'
        }),
        Object({
          id: 'id-removed',
          cell: 'cell key',
          behaviorKey: 'NgVault::Test::Encrypt4',
          type: 'lifecycle:end:decrypt',
          timestamp: 'timestamp-removed',
          payload: Object({ noop: true })
        })
      ]);
    });

    it('should load state with a decrypt error value', async () => {
      // Make behaviors using the helper + real reducer behavior
      const behaviors = [
        createTestBehavior(NgVaultBehaviorTypes.State, calls),
        createTestBehavior(NgVaultBehaviorTypes.Reduce, calls),
        createTestBehavior(NgVaultBehaviorTypes.Persist, calls, Object({ persist: true })),
        createTestBehavior(NgVaultBehaviorTypes.Encrypt, calls, 'throw-error', true)
      ] as any;

      // Create orchestrator
      runInInjectionContext(injector, () => {
        dispatcher = new VaultOrchestrator<any>(cell, behaviors, [], injector, ngVaultMonitor);
      });

      // Act — trigger reducer pipeline
      const value = await dispatcher.loadPersistedState(mockCtx);
      await flushMicrotasksZoneless();

      expect(value).toBeUndefined();

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
          behaviorKey: 'NgVault::Test::Persist3',
          type: 'stage:start:loadpersist',
          timestamp: 'timestamp-removed'
        }),
        Object({
          id: 'id-removed',
          cell: 'cell key',
          behaviorKey: 'NgVault::Test::Persist3',
          type: 'stage:end:loadpersist',
          timestamp: 'timestamp-removed'
        }),
        Object({
          id: 'id-removed',
          cell: 'cell key',
          behaviorKey: 'NgVault::Test::Encrypt4',
          type: 'lifecycle:start:decrypt',
          timestamp: 'timestamp-removed'
        }),
        Object({
          id: 'id-removed',
          cell: 'cell key',
          behaviorKey: 'NgVault::Test::Encrypt4',
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
      createTestBehavior(NgVaultBehaviorTypes.State, calls),
      createTestBehavior(NgVaultBehaviorTypes.Reduce, calls),
      createTestBehavior(NgVaultBehaviorTypes.Encrypt, calls)
    ] as any;

    // Create orchestrator
    runInInjectionContext(injector, () => {
      dispatcher = new VaultOrchestrator<any>(cell, behaviors, [], injector, ngVaultMonitor);
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
      createTestBehavior(NgVaultBehaviorTypes.State, calls),
      createTestBehavior(NgVaultBehaviorTypes.Persist, calls, 'this is the error', true),
      createTestBehavior(NgVaultBehaviorTypes.Reduce, calls),
      createTestBehavior(NgVaultBehaviorTypes.Encrypt, calls)
    ] as any;

    // Create orchestrator
    runInInjectionContext(injector, () => {
      dispatcher = new VaultOrchestrator<any>(cell, behaviors, [], injector, ngVaultMonitor);
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
        behaviorKey: 'NgVault::Test::Persist2',
        type: 'stage:start:loadpersist',
        timestamp: 'timestamp-removed'
      }),
      Object({
        id: 'id-removed',
        cell: 'cell key',
        behaviorKey: 'NgVault::Test::Persist2',
        type: 'error',
        timestamp: 'timestamp-removed',
        payload: 'error'
      })
    ]);
  });
});
