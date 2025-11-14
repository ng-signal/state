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
    ngVaultMonitor.registerCell('cell key', {});

    eventBus = TestBed.inject(NgVaultEventBus);
    stopListening = createTestEventListener(eventBus, emitted);
  });

  afterEach(() => {
    stopListening();
  });

  it('should clear state', async () => {
    // Make behaviors using the helper + real reducer behavior
    const behaviors = [
      createInitializedTestBehavior(NgVaultBehaviorTypes.State, calls),
      createInitializedTestBehavior(NgVaultBehaviorTypes.Reduce, calls),
      createInitializedTestBehavior(NgVaultBehaviorTypes.Encrypt, calls),
      createInitializedTestBehavior(NgVaultBehaviorTypes.Persist, calls)
    ] as any;

    // Create orchestrator
    runInInjectionContext(injector, () => {
      dispatcher = new VaultOrchestrator<any>('cell key', behaviors, [], injector, ngVaultMonitor);
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
        behaviorKey: 'NgVault::Test::Persist',
        type: 'stage:start:clearpersist',
        timestamp: 'timestamp-removed'
      }),
      Object({
        id: 'id-removed',
        cell: 'cell key',
        behaviorKey: 'NgVault::Test::Persist',
        type: 'stage:end:clearpersist',
        timestamp: 'timestamp-removed'
      })
    ]);
  });

  it('should not clear state', async () => {
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
      createInitializedTestBehavior(NgVaultBehaviorTypes.State, calls),

      {
        type: NgVaultBehaviorTypes.Persist,
        key: `perist-id`,
        clearState: () => {
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
        behaviorKey: 'perist-id',
        type: 'stage:start:clearpersist',
        timestamp: 'timestamp-removed'
      }),
      Object({
        id: 'id-removed',
        cell: 'cell key',
        behaviorKey: 'perist-id',
        type: 'error',
        timestamp: 'timestamp-removed'
      })
    ]);
  });
});
