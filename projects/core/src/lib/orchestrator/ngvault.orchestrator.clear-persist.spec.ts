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
    ngVaultMonitor.registerCell(cell.key, {});

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

  it('should clear state', async () => {
    // Make behaviors using the helper + real reducer behavior
    const behaviors = [
      createTestBehavior(NgVaultBehaviorTypes.State, calls),
      createTestBehavior(NgVaultBehaviorTypes.Reduce, calls),
      createTestBehavior(NgVaultBehaviorTypes.Encrypt, calls),
      createTestBehavior(NgVaultBehaviorTypes.Persist, calls)
    ] as any;

    // Create orchestrator
    runInInjectionContext(injector, () => {
      dispatcher = new VaultOrchestrator<any>(cell, behaviors, [], injector, ngVaultMonitor);
    });

    // Act — trigger reducer pipeline
    dispatcher.clearPersistedState(mockCtx);
    await flushMicrotasksZoneless();

    // Reducer pipeline order + other behaviors
    expect(calls).toEqual(['clear']);

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
        type: 'stage:start:clearpersist',
        timestamp: 'timestamp-removed'
      }),
      Object({
        id: 'id-removed',
        cell: 'cell key',
        behaviorKey: 'NgVault::Test::Persist4',
        type: 'stage:end:clearpersist',
        timestamp: 'timestamp-removed'
      })
    ]);
  });

  it('should not clear state', async () => {
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
    dispatcher.clearPersistedState(mockCtx);
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
    dispatcher.clearPersistedState(mockCtx);
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
        type: 'stage:start:clearpersist',
        timestamp: 'timestamp-removed'
      }),
      Object({
        id: 'id-removed',
        cell: 'cell key',
        behaviorKey: 'NgVault::Test::Persist2',
        type: 'error',
        timestamp: 'timestamp-removed'
      })
    ]);
  });
});
