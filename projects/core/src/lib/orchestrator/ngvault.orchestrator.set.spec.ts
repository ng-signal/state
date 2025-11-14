import { httpResource, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Injector, provideZonelessChangeDetection, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgVaultEventBus } from '@ngvault/dev-tools';
import { NgVaultBehaviorContext, NgVaultBehaviorTypes } from '@ngvault/shared';
import { createTestEventListener, flushMicrotasksZoneless, provideVaultTesting } from '@ngvault/testing';
import { NgVaultMonitor } from '../monitor/ngvault-monitor.service';
import { VaultOrchestrator } from './ngvault.orchestrator';

describe('Orcestrator: Vault', () => {
  let dispatcher: VaultOrchestrator<any>;
  let mockCtx: NgVaultBehaviorContext<any>;
  let calls: string[];
  let injector: any;
  let ngVaultMonitor: any;
  let reducer1: any;

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

    reducer1 = () => calls.push('reducer 1');
  });

  afterEach(() => {
    stopListening();
  });

  function makeBehavior(type: string, returnValue?: any): any {
    return {
      type: type as NgVaultBehaviorTypes,
      key: `${type}-id`,
      computeState: async () => {
        calls.push(type);
        return returnValue ?? { [`${type}`]: true };
      },
      applyReducer: async () => {
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
      }
    };
  }

  it('should execute state → reduce (2 reducers) → encrypt → persist in order', async () => {
    // Two reducer functions
    reducer1 = () => calls.push('reducer 1');
    const reducer2 = () => calls.push('reducer 2');

    // Make behaviors using the helper + real reducer behavior
    const behaviors = [
      makeBehavior('state'),
      {
        ...makeBehavior('reduce'),
        applyReducer: (current: any, reducerFn: any) => reducerFn(current)
      },
      makeBehavior('encrypt'),
      makeBehavior('persist'),
      makeBehavior(NgVaultBehaviorTypes.Insights)
    ];

    // Create orchestrator
    runInInjectionContext(injector, () => {
      dispatcher = new VaultOrchestrator<any>('cell key', behaviors, [reducer1, reducer2], injector, ngVaultMonitor);
    });

    // Act — trigger reducer pipeline
    dispatcher.dispatchSet(mockCtx);
    await flushMicrotasksZoneless();

    // Reducer pipeline order + other behaviors
    expect(calls).toEqual(['state', 'reducer 1', 'reducer 2', 'encrypt', 'persist']);

    // Verify final state after reducer pipeline
    expect(mockCtx.isLoading?.()).toBeFalse();
    expect(mockCtx.error?.()).toBeNull();
    expect(mockCtx.value?.()).toEqual(3);

    // Verify event pipeline
    expect(emitted).toEqual([
      Object({
        id: 'id-removed',
        cell: 'cell key',
        behaviorKey: 'vault-orchestrator',
        type: 'lifecycle:start:replace',
        timestamp: 'timestamp-removed'
      }),

      // STATE behavior (start + end)
      Object({
        id: 'id-removed',
        cell: 'cell key',
        behaviorKey: 'state-id',
        type: 'stage:start:state',
        timestamp: 'timestamp-removed'
      }),
      Object({
        id: 'id-removed',
        cell: 'cell key',
        behaviorKey: 'state-id',
        type: 'stage:end:state',
        timestamp: 'timestamp-removed'
      }),

      // REDUCER #1 (start + end)
      Object({
        id: 'id-removed',
        cell: 'cell key',
        behaviorKey: 'reduce-id',
        type: 'stage:start:reducer',
        timestamp: 'timestamp-removed'
      }),
      Object({
        id: 'id-removed',
        cell: 'cell key',
        behaviorKey: 'reduce-id',
        type: 'stage:end:reducer',
        timestamp: 'timestamp-removed'
      }),

      // REDUCER #2 (start + end)
      Object({
        id: 'id-removed',
        cell: 'cell key',
        behaviorKey: 'reduce-id',
        type: 'stage:start:reducer',
        timestamp: 'timestamp-removed'
      }),
      Object({
        id: 'id-removed',
        cell: 'cell key',
        behaviorKey: 'reduce-id',
        type: 'stage:end:reducer',
        timestamp: 'timestamp-removed'
      }),

      // END REPLACE
      Object({
        id: 'id-removed',
        cell: 'cell key',
        behaviorKey: 'vault-orchestrator',
        type: 'lifecycle:end:replace',
        timestamp: 'timestamp-removed'
      })
    ]);
  });

  it('should throw an error with undefined state', async () => {
    const stateBehavior = makeBehavior('state');

    (stateBehavior as any).computeState = async () => {
      return undefined;
    };

    // Two reducer functions
    const reducer2 = () => calls.push('reducer 2');

    // Make behaviors usng the helper + real reducer behavior
    const behaviors = [
      stateBehavior,
      {
        ...makeBehavior('reduce'),
        applyReducer: (current: any, reducerFn: any) => reducerFn(current)
      }
    ];

    // Create orchestrator
    runInInjectionContext(injector, () => {
      dispatcher = new VaultOrchestrator<any>('cell key', behaviors, [reducer1, reducer2], injector, ngVaultMonitor);
    });

    // Act — trigger reducer pipeline
    dispatcher.dispatchSet(mockCtx);
    TestBed.tick();
    await flushMicrotasksZoneless();

    // Verify final state after reducer pipeline
    expect(mockCtx.isLoading?.()).toBeFalse();
    expect(mockCtx.error?.()?.message).toContain('Reducer stage received undefined state');
    expect(mockCtx.value?.()).toBeNull();

    // Verify event pipeline
    expect(emitted).toEqual([
      Object({
        id: 'id-removed',
        cell: 'cell key',
        behaviorKey: 'vault-orchestrator',
        type: 'lifecycle:start:replace',
        timestamp: 'timestamp-removed'
      }),

      // STATE behavior (start + end)
      Object({
        id: 'id-removed',
        cell: 'cell key',
        behaviorKey: 'state-id',
        type: 'stage:start:state',
        timestamp: 'timestamp-removed'
      }),
      Object({
        id: 'id-removed',
        cell: 'cell key',
        behaviorKey: 'state-id',
        type: 'stage:end:state',
        timestamp: 'timestamp-removed'
      }),
      Object({
        id: 'id-removed',
        cell: 'cell key',
        behaviorKey: 'reduce-id',
        type: 'error',
        timestamp: 'timestamp-removed'
      })
    ]);
  });

  it('should handle errors and set resourceError', async () => {
    const errorBehavior = makeBehavior('state');
    errorBehavior.computeState = async () => {
      throw new Error('Test error');
    };

    const behaviors = [errorBehavior];
    runInInjectionContext(injector, () => {
      dispatcher = new VaultOrchestrator<any>('cell key', behaviors, [reducer1], injector, ngVaultMonitor);
    });

    dispatcher.dispatchSet(mockCtx);
    await flushMicrotasksZoneless();

    // Verify error handling logic
    expect(mockCtx.error?.()).toEqual(
      Object({
        message: 'Test error',
        details: jasmine.any(String)
      })
    );
    expect(calls).toEqual([]);
    expect(mockCtx.isLoading?.()).toBeFalse();
    expect(mockCtx.error?.()).toEqual(Object({ message: 'Test error', details: jasmine.any(String) }));
    expect(mockCtx.value?.()).toBeNull();
  });

  it('should handle HttpResourceRef errors and propagate resourceError', async () => {
    // Arrange: create mock API backend and inject dependencies
    const mockBackend = TestBed.inject(HttpTestingController);
    const injector = TestBed.inject(Injector);

    const behaviors = [makeBehavior('state')];

    runInInjectionContext(injector, () => {
      dispatcher = new VaultOrchestrator<any>('cell key', behaviors, [reducer1], injector, ngVaultMonitor);
    });

    // Create HttpResourceRef (this will call the mock backend)
    mockCtx.incoming = httpResource<any[]>(() => '/api/users/error', { injector }) as any;

    // Act: trigger the orchestrator to process the resource
    dispatcher.dispatchSet(mockCtx);
    TestBed.tick();

    // Simulate a network error
    const req = mockBackend.expectOne('/api/users/error');
    req.flush('Boom!', { status: 500, statusText: 'Internal Server Error' });

    // Flush any queued microtasks
    await flushMicrotasksZoneless();

    // Assert: verify that safeAsync and HttpResourceRef updated the signals
    const err = mockCtx.error?.();

    expect(err).toEqual(
      Object({
        message: 'Http failure response for /api/users/error: 500 Internal Server Error',
        status: 500,
        statusText: 'Internal Server Error',
        details: 'Boom!'
      })
    );

    expect(mockCtx.isLoading?.()).toBeFalse();
    expect(mockCtx.value?.()).toBeNull();

    // Clean up
    mockBackend.verify();
  });

  it('should skip undefined stage results and maintain working state', async () => {
    const behaviors = [
      makeBehavior('state', { id: 1 }),
      { ...makeBehavior('reduce'), applyReducer: () => undefined },
      makeBehavior('encrypt')
    ];

    runInInjectionContext(injector, () => {
      dispatcher = new VaultOrchestrator<any>('cell key', behaviors, [reducer1], injector, ngVaultMonitor);
    });

    dispatcher.dispatchSet(mockCtx);
    await flushMicrotasksZoneless();

    expect(calls).toEqual(['state', 'encrypt']);
    expect(mockCtx.isLoading?.()).toBeFalse();
    expect(mockCtx.error?.()).toBeNull();
    expect(mockCtx.value?.()).toEqual({ id: 1 });
  });

  it('should not throw if optional ctx signals are undefined', async () => {
    const behaviors = [makeBehavior('state')];

    runInInjectionContext(injector, () => {
      dispatcher = new VaultOrchestrator<any>('cell key', behaviors, [reducer1], injector, ngVaultMonitor);
    });

    const minimalCtx = {} as NgVaultBehaviorContext<any>; // no signals
    expect(() => dispatcher.dispatchSet(minimalCtx)).not.toThrow();
    expect(calls).toEqual([]);
  });

  it('should set signals correctly after microtask flush', async () => {
    const behaviors = [makeBehavior('state', { ok: true })];
    runInInjectionContext(injector, () => {
      dispatcher = new VaultOrchestrator<any>('cell key', behaviors, [reducer1], injector, ngVaultMonitor);
    });

    dispatcher.dispatchSet(mockCtx);
    TestBed.tick();

    await flushMicrotasksZoneless();

    expect(calls).toEqual(['state']);
    expect(mockCtx.isLoading?.()).toBeFalse();
    expect(mockCtx.error?.()).toBeNull();
    expect(mockCtx.value?.()).toEqual({ ok: true });
  });

  describe('runStage failures - one of each', () => {
    it('should stop execution on a state event', async () => {
      const errorBehavior = makeBehavior('state');
      errorBehavior.computeState = async () => {
        throw new Error('Test error');
      };
      const behaviors = [errorBehavior, makeBehavior('reducee'), makeBehavior('encrypt'), makeBehavior('persist')];

      runInInjectionContext(injector, () => {
        dispatcher = new VaultOrchestrator<any>('cell key', behaviors, [reducer1], injector, ngVaultMonitor);
      });

      dispatcher.dispatchSet(mockCtx);
      await flushMicrotasksZoneless();

      expect(calls).toEqual([]);
      expect(mockCtx.isLoading?.()).toBeFalse();
      expect(mockCtx.error?.()).toEqual(
        Object({
          message: 'Test error',
          details: jasmine.any(String)
        })
      );
      expect(mockCtx.value?.()).toBeNull();
    });

    it('should stop execution on a reduce event', async () => {
      const reducer1 = () => {
        throw new Error('error');
      };

      const errorBehavior = makeBehavior('reduce');
      errorBehavior.applyReducer = async () => {
        throw new Error('Test error');
      };
      const behaviors = [makeBehavior('state'), errorBehavior, makeBehavior('encrypt'), makeBehavior('persist')];

      runInInjectionContext(injector, () => {
        dispatcher = new VaultOrchestrator<any>('cell key', behaviors, [reducer1], injector, ngVaultMonitor);
      });

      dispatcher.dispatchSet(mockCtx);
      await flushMicrotasksZoneless();

      expect(calls).toEqual(['state']);
      expect(mockCtx.isLoading?.()).toBeFalse();
      expect(mockCtx.error?.()).toEqual(
        Object({
          message: 'Test error',
          details: jasmine.any(String)
        })
      );
      expect(mockCtx.value?.()).toBeNull();
    });

    it('should stop execution on an encrypt event', async () => {
      const errorBehavior = makeBehavior('encrypt');
      errorBehavior.encryptState = async () => {
        throw new Error('Test error');
      };
      const behaviors = [makeBehavior('state'), makeBehavior('reduce'), errorBehavior, makeBehavior('persist')];

      runInInjectionContext(injector, () => {
        dispatcher = new VaultOrchestrator<any>('cell key', behaviors, [reducer1], injector, ngVaultMonitor);
      });

      dispatcher.dispatchSet(mockCtx);
      await flushMicrotasksZoneless();

      expect(calls).toEqual(['state', 'reduce']);
      expect(mockCtx.isLoading?.()).toBeFalse();
      expect(mockCtx.error?.()).toEqual(
        Object({
          message: 'Test error',
          details: jasmine.any(String)
        })
      );
      expect(mockCtx.value?.()).toBeNull();
    });

    it('should stop execution on a persist event', async () => {
      const errorBehavior = makeBehavior('persist');
      errorBehavior.persistState = async () => {
        throw new Error('Test error');
      };
      const behaviors = [makeBehavior('state'), makeBehavior('reduce'), makeBehavior('encrypt'), errorBehavior];

      runInInjectionContext(injector, () => {
        dispatcher = new VaultOrchestrator<any>('cell key', behaviors, [reducer1], injector, ngVaultMonitor);
      });

      dispatcher.dispatchSet(mockCtx);
      await flushMicrotasksZoneless();

      expect(calls).toEqual(['state', 'reduce', 'encrypt']);
      expect(mockCtx.isLoading?.()).toBeFalse();
      expect(mockCtx.error?.()).toEqual(
        Object({
          message: 'Test error',
          details: jasmine.any(String)
        })
      );
      expect(mockCtx.value?.()).toBeNull();
    });
  });

  describe('runStage failures - two of each', () => {
    it('should stop execution on a state event', async () => {
      const errorBehavior = makeBehavior('state');
      errorBehavior.computeState = async () => {
        throw new Error('Test error');
      };
      const behaviors = [
        makeBehavior('state'),
        errorBehavior,
        makeBehavior('reduce'),
        makeBehavior('encrypt'),
        makeBehavior('persist')
      ];

      runInInjectionContext(injector, () => {
        dispatcher = new VaultOrchestrator<any>('cell key', behaviors, [reducer1], injector, ngVaultMonitor);
      });

      dispatcher.dispatchSet(mockCtx);
      await flushMicrotasksZoneless();

      expect(calls).toEqual(['state']);
      expect(mockCtx.isLoading?.()).toBeFalse();
      expect(mockCtx.error?.()).toEqual(
        Object({
          message: 'Test error',
          details: jasmine.any(String)
        })
      );
      expect(mockCtx.value?.()).toBeNull();
    });

    it('should stop execution on a reduce event', async () => {
      const errorBehavior = makeBehavior('reduce');
      errorBehavior.applyReducer = async () => {
        throw new Error('Test error');
      };
      const behaviors = [
        makeBehavior('state'),
        makeBehavior('reduce'),
        errorBehavior,
        makeBehavior('encrypt'),
        makeBehavior('persist')
      ];

      runInInjectionContext(injector, () => {
        dispatcher = new VaultOrchestrator<any>('cell key', behaviors, [reducer1], injector, ngVaultMonitor);
      });

      dispatcher.dispatchSet(mockCtx);
      await flushMicrotasksZoneless();

      expect(calls).toEqual(['state', 'reduce']);
      expect(mockCtx.isLoading?.()).toBeFalse();
      expect(mockCtx.error?.()).toEqual(
        Object({
          message: 'Test error',
          details: jasmine.any(String)
        })
      );
      expect(mockCtx.value?.()).toBeNull();
    });

    it('should stop execution on an encrypt event', async () => {
      const errorBehavior = makeBehavior('encrypt');
      errorBehavior.encryptState = async () => {
        throw new Error('Test error');
      };
      const behaviors = [
        makeBehavior('state'),
        makeBehavior('reduce'),
        makeBehavior('encrypt'),
        errorBehavior,
        makeBehavior('persist')
      ];

      runInInjectionContext(injector, () => {
        dispatcher = new VaultOrchestrator<any>('cell key', behaviors, [reducer1], injector, ngVaultMonitor);
      });

      dispatcher.dispatchSet(mockCtx);
      await flushMicrotasksZoneless();

      expect(calls).toEqual(['state', 'reduce', 'encrypt']);
      expect(mockCtx.isLoading?.()).toBeFalse();
      expect(mockCtx.error?.()).toEqual(
        Object({
          message: 'Test error',
          details: jasmine.any(String)
        })
      );
      expect(mockCtx.value?.()).toBeNull();
    });

    it('should stop execution on a persist event', async () => {
      const errorBehavior = makeBehavior('persist');
      errorBehavior.persistState = async () => {
        throw new Error('Test error');
      };
      const behaviors = [
        makeBehavior('state'),
        makeBehavior('reduce'),
        makeBehavior('encrypt'),
        makeBehavior('persist'),
        errorBehavior
      ];

      runInInjectionContext(injector, () => {
        dispatcher = new VaultOrchestrator<any>('cell key', behaviors, [reducer1], injector, ngVaultMonitor);
      });

      dispatcher.dispatchSet(mockCtx);
      await flushMicrotasksZoneless();

      expect(calls).toEqual(['state', 'reduce', 'encrypt', 'persist']);
      expect(mockCtx.isLoading?.()).toBeFalse();
      expect(mockCtx.error?.()).toEqual(
        Object({
          message: 'Test error',
          details: jasmine.any(String)
        })
      );
      expect(mockCtx.value?.()).toBeNull();
    });
  });

  describe('runStage failures nothing before', () => {
    it('should stop execution on a reduce event', async () => {
      const behaviors = [makeBehavior('state'), makeBehavior('reduce')];

      runInInjectionContext(injector, () => {
        dispatcher = new VaultOrchestrator<any>('cell key', behaviors, [reducer1], injector, ngVaultMonitor);
      });

      dispatcher.dispatchSet(mockCtx);
      await flushMicrotasksZoneless();

      expect(calls).toEqual(['state', 'reduce']);
      expect(mockCtx.isLoading?.()).toBeFalse();
      expect(mockCtx.error?.()).toBeNull();
      expect(mockCtx.value?.()).toEqual(Object({ reduce: true }));
    });

    it('should stop execution on an encrypt event', async () => {
      const behaviors = [makeBehavior('state'), makeBehavior('encrypt')];

      runInInjectionContext(injector, () => {
        dispatcher = new VaultOrchestrator<any>('cell key', behaviors, [], injector, ngVaultMonitor);
      });

      dispatcher.dispatchSet(mockCtx);
      await flushMicrotasksZoneless();

      expect(calls).toEqual(['state', 'encrypt']);
      expect(mockCtx.isLoading?.()).toBeFalse();
      expect(mockCtx.error?.()).toBeNull();
      expect(mockCtx.value?.()).toEqual(Object({ state: true }));
    });

    it('should stop execution on a persist event', async () => {
      const behaviors = [makeBehavior('state'), makeBehavior('persist')];

      runInInjectionContext(injector, () => {
        dispatcher = new VaultOrchestrator<any>('cell key', behaviors, [], injector, ngVaultMonitor);
      });

      dispatcher.dispatchSet(mockCtx);
      await flushMicrotasksZoneless();

      expect(calls).toEqual(['state', 'persist']);
      expect(mockCtx.isLoading?.()).toBeFalse();
      expect(mockCtx.error?.()).toBeNull();
      expect(mockCtx.value?.()).toEqual(Object({ state: true }));
    });
  });
});
