import { Injector, provideZonelessChangeDetection, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgVaultEventBus } from '@ngvault/dev-tools';
import { NgVaultDevModeService } from '@ngvault/shared';
import { createTestEventListener } from '@ngvault/testing';
import { NgVaultMonitor } from './ngvault-monitor.service';

describe('Service: Vault Monitor', () => {
  let vaultMonitor: NgVaultMonitor;
  const emitted: any[] = [];
  let stopListening: any;
  let ctx: any;
  let eventBus: any;
  let insightsOptions: any;

  beforeEach(() => {
    ctx = {
      state: {
        isLoading: true,
        value: 'hello',
        error: null,
        hasValue: false
      }
    } as any;

    insightsOptions = {
      id: 'manual-insights',
      wantsState: true,
      wantsPayload: true,
      wantsErrors: true
    } as any;
  });

  describe('with insight behavior - dev mode', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [NgVaultMonitor, provideZonelessChangeDetection()]
      });

      const injector = TestBed.inject(Injector);

      emitted.length = 0;

      // Subscribe to all vault events via the official hook
      eventBus = TestBed.inject(NgVaultEventBus);
      stopListening = createTestEventListener(eventBus, emitted);

      runInInjectionContext(injector, () => {
        vaultMonitor = TestBed.inject(NgVaultMonitor);
      });
    });

    afterEach(() => {
      stopListening();
    });

    it('should register, emit init and prevent double registration', () => {
      vaultMonitor.registerCell('vault1', insightsOptions);
      vaultMonitor.startReplace('vault1', 'state key', ctx);

      expect(emitted).toEqual([
        Object({
          id: 'id-removed',
          cell: 'vault1',
          behaviorKey: 'state key',
          type: 'lifecycle:start:replace',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        })
      ]);

      vaultMonitor.endReplace?.('vault1', 'end key', ctx);
      vaultMonitor.startMerge?.('vault1', 'start merge', ctx);
      vaultMonitor.endMerge?.('vault1', 'end merge', ctx);
      vaultMonitor.endMerge?.('vault1', 'end merge', ctx, { noop: true });
      vaultMonitor.error?.('vault1', 'error string', ctx, 'this is the error');
      vaultMonitor.error?.('vault1', 'error error', ctx, new Error('this is the error'));
      vaultMonitor.startState?.('vault1', 'start state', ctx);
      vaultMonitor.endState?.('vault1', 'end state', ctx);
      vaultMonitor.startReducer?.('vault1', 'start reducer', ctx);
      vaultMonitor.endReducer?.('vault1', 'end reducer', ctx);
      vaultMonitor.startReset?.('vault1', 'start reducer', ctx);
      vaultMonitor.endReset?.('vault1', 'end reducer', ctx);
      vaultMonitor.startDestroy?.('vault1', 'start destroy', ctx);
      vaultMonitor.endDestroy?.('vault1', 'end destroy', ctx);
      vaultMonitor.startInitialized?.('vault1', 'start initialized', ctx);
      vaultMonitor.endInitialized?.('vault1', 'end initialized', ctx);
      vaultMonitor.startPersist?.('vault1', 'start persist', ctx);
      vaultMonitor.endPersist?.('vault1', 'end persist', ctx);
      vaultMonitor.startClearPersist?.('vault1', 'start clear persist', ctx);
      vaultMonitor.endClearPersist?.('vault1', 'end clear persist', ctx);
      vaultMonitor.startLoadPersist?.('vault1', 'start load persist', ctx);
      vaultMonitor.endLoadPersist?.('vault1', 'end load persist', ctx);

      expect(emitted).toEqual([
        Object({
          id: 'id-removed',
          cell: 'vault1',
          behaviorKey: 'state key',
          type: 'lifecycle:start:replace',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'vault1',
          behaviorKey: 'end key',
          type: 'lifecycle:end:replace',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'vault1',
          behaviorKey: 'start merge',
          type: 'lifecycle:start:merge',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'vault1',
          behaviorKey: 'end merge',
          type: 'lifecycle:end:merge',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'vault1',
          behaviorKey: 'end merge',
          type: 'lifecycle:end:merge',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false }),
          payload: Object({ noop: true })
        }),
        Object({
          id: 'id-removed',
          cell: 'vault1',
          behaviorKey: 'error string',
          type: 'error',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false }),
          payload: 'error',
          error: 'this is the error'
        }),
        Object({
          id: 'id-removed',
          cell: 'vault1',
          behaviorKey: 'error error',
          type: 'error',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false }),
          payload: 'error',
          error: 'this is the error'
        }),
        Object({
          id: 'id-removed',
          cell: 'vault1',
          behaviorKey: 'start state',
          type: 'stage:start:state',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'vault1',
          behaviorKey: 'end state',
          type: 'stage:end:state',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'vault1',
          behaviorKey: 'start reducer',
          type: 'stage:start:reducer',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'vault1',
          behaviorKey: 'end reducer',
          type: 'stage:end:reducer',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'vault1',
          behaviorKey: 'start reducer',
          type: 'lifecycle:start:reset',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'vault1',
          behaviorKey: 'end reducer',
          type: 'lifecycle:end:reset',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'vault1',
          behaviorKey: 'start destroy',
          type: 'lifecycle:start:destroy',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'vault1',
          behaviorKey: 'end destroy',
          type: 'lifecycle:end:destroy',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'vault1',
          behaviorKey: 'start initialized',
          type: 'lifecycle:start:initialized',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'vault1',
          behaviorKey: 'end initialized',
          type: 'lifecycle:end:initialized',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'vault1',
          behaviorKey: 'start persist',
          type: 'stage:start:persist',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'vault1',
          behaviorKey: 'end persist',
          type: 'stage:end:persist',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'vault1',
          behaviorKey: 'start clear persist',
          type: 'stage:start:clearpersist',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'vault1',
          behaviorKey: 'end clear persist',
          type: 'stage:end:clearpersist',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'vault1',
          behaviorKey: 'start load persist',
          type: 'stage:start:loadpersist',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'vault1',
          behaviorKey: 'end load persist',
          type: 'stage:end:loadpersist',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        })
      ]);
    });

    it('should handle multiple vaults independently', () => {
      vaultMonitor.registerCell('vault1', insightsOptions);
      vaultMonitor.registerCell('vault2', insightsOptions);
      vaultMonitor.startMerge?.('vault1', 'TestService', ctx);
      vaultMonitor.startMerge?.('vault2', 'TestService', ctx);
      vaultMonitor.startMerge?.('vault3', 'TestService', ctx);

      expect(emitted).toEqual([
        Object({
          id: 'id-removed',
          cell: 'vault1',
          behaviorKey: 'TestService',
          type: 'lifecycle:start:merge',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'vault2',
          behaviorKey: 'TestService',
          type: 'lifecycle:start:merge',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        })
      ]);
    });

    it('should not emit with insight behaviors', () => {
      vaultMonitor.registerCell('vault1', {} as any);
      vaultMonitor.startMerge?.('vault1', 'TestService', ctx);

      expect(emitted).toEqual([
        Object({
          id: 'id-removed',
          cell: 'vault1',
          behaviorKey: 'TestService',
          type: 'lifecycle:start:merge',
          timestamp: 'timestamp-removed'
        })
      ]);
    });

    describe('No emits', () => {
      it('should not emit with wrong cell', () => {
        vaultMonitor.registerCell('wrong', insightsOptions);
        vaultMonitor.startMerge?.('vault1', 'TestService', ctx);

        expect(emitted).toEqual([]);
      });

      it('should not emit without registration ', () => {
        vaultMonitor.startMerge?.('vault1', 'TestService', ctx);

        expect(emitted).toEqual([]);
      });

      it('should not emit with insight behaviors', () => {
        vaultMonitor.registerCell('vault1');
        vaultMonitor.startMerge?.('vault1', 'TestService', ctx);

        expect(emitted).toEqual([]);
      });

      it('should display state, errors or payload with explicit', () => {
        insightsOptions.wantsState = false;
        insightsOptions.wantsPayload = false;
        insightsOptions.wantsErrors = false;
        vaultMonitor.registerCell('vault1', insightsOptions);

        vaultMonitor.startReplace('vault1', 'state key', ctx);
        vaultMonitor.error?.('vault1', 'error string', ctx, 'this is the error');

        expect(emitted).toEqual([
          Object({
            id: 'id-removed',
            cell: 'vault1',
            behaviorKey: 'state key',
            type: 'lifecycle:start:replace',
            timestamp: 'timestamp-removed'
          }),
          Object({
            id: 'id-removed',
            cell: 'vault1',
            behaviorKey: 'error string',
            type: 'error',
            timestamp: 'timestamp-removed'
          })
        ]);
      });

      it('should display state, errors or payload with implicit', () => {
        delete insightsOptions.wantsState;
        delete insightsOptions.wantsPayload;
        delete insightsOptions.wantsErrors;
        vaultMonitor.registerCell('vault1', insightsOptions);

        vaultMonitor.startReplace('vault1', 'state key', ctx);
        vaultMonitor.error?.('vault1', 'error string', ctx, 'this is the error');

        expect(emitted).toEqual([
          Object({
            id: 'id-removed',
            cell: 'vault1',
            behaviorKey: 'state key',
            type: 'lifecycle:start:replace',
            timestamp: 'timestamp-removed'
          }),
          Object({
            id: 'id-removed',
            cell: 'vault1',
            behaviorKey: 'error string',
            type: 'error',
            timestamp: 'timestamp-removed'
          })
        ]);
      });
    });
  });

  describe('devMode', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [NgVaultMonitor, provideZonelessChangeDetection()]
      }).overrideProvider(NgVaultDevModeService, {
        useValue: { isDevMode: false }
      });

      const injector = TestBed.inject(Injector);

      emitted.length = 0;

      eventBus = TestBed.inject(NgVaultEventBus);
      stopListening = createTestEventListener(eventBus, emitted);

      runInInjectionContext(injector, () => {
        vaultMonitor = TestBed.inject(NgVaultMonitor);
      });
    });

    afterEach(() => {
      stopListening();
    });

    it('should not register', () => {
      vaultMonitor.registerCell('vault1', insightsOptions);
      vaultMonitor.startReplace('vault1', 'state key', ctx);

      expect(emitted).toEqual([]);
    });

    it('should not registernot', () => {
      vaultMonitor.activateGlobalInsights({} as any);
      vaultMonitor.registerCell('vault1');
      vaultMonitor.startReplace('vault1', 'state key', ctx);

      expect(emitted).toEqual([]);
    });
  });

  describe('chromeMode', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [NgVaultMonitor, provideZonelessChangeDetection()]
      }).overrideProvider(NgVaultDevModeService, {
        useValue: { isDevMode: true }
      });

      const injector = TestBed.inject(Injector);

      emitted.length = 0;

      eventBus = TestBed.inject(NgVaultEventBus);
      stopListening = createTestEventListener(eventBus, emitted);

      runInInjectionContext(injector, () => {
        vaultMonitor = TestBed.inject(NgVaultMonitor);
      });
    });

    afterEach(() => {
      stopListening();
    });

    it('should register', () => {
      vaultMonitor.activateGlobalInsights({} as any);
      vaultMonitor.registerCell('vault1');
      vaultMonitor.startReplace('vault1', 'state key', ctx);

      expect(emitted).toEqual([
        Object({
          id: 'id-removed',
          cell: 'vault1',
          behaviorKey: 'state key',
          type: 'lifecycle:start:replace',
          timestamp: 'timestamp-removed'
        })
      ]);
    });

    it('should not register', () => {
      vaultMonitor.activateGlobalInsights(undefined as any);
      vaultMonitor.registerCell('vault1');
      vaultMonitor.startReplace('vault1', 'state key', ctx);

      expect(emitted).toEqual([]);
    });

    it('should register', () => {
      vaultMonitor.activateGlobalInsights(insightsOptions);
      vaultMonitor.registerCell('vault1');
      vaultMonitor.startReplace('vault1', 'state key', ctx);

      vaultMonitor.error?.('vault1', 'error string', ctx, 'this is the error');
      vaultMonitor.error?.('vault1', 'error error', ctx, new Error('this is the error'));

      expect(emitted).toEqual([
        Object({
          id: 'id-removed',
          cell: 'vault1',
          behaviorKey: 'state key',
          type: 'lifecycle:start:replace',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'vault1',
          behaviorKey: 'error string',
          type: 'error',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false }),
          payload: 'error',
          error: 'this is the error'
        }),
        Object({
          id: 'id-removed',
          cell: 'vault1',
          behaviorKey: 'error error',
          type: 'error',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false }),
          payload: 'error',
          error: 'this is the error'
        })
      ]);
    });
  });

  describe('chromeMode (via chrome plugin hook)', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [NgVaultMonitor, provideZonelessChangeDetection()]
      }).overrideProvider(NgVaultDevModeService, {
        useValue: { isDevMode: true }
      });

      emitted.length = 0;

      eventBus = TestBed.inject(NgVaultEventBus);
      stopListening = createTestEventListener(eventBus, emitted);

      const injector = TestBed.inject(Injector);

      // Simulate Window hook exposure by provideVault
      (window as any).ngVault = {
        NgVaultMonitor
      };

      // Simulate Chrome extension obtaining monitor from DI
      runInInjectionContext(injector, () => {
        const tokenFromWindow = (window as any).ngVault.NgVaultMonitor;
        vaultMonitor = TestBed.inject(tokenFromWindow);
      });
    });

    afterEach(() => {
      stopListening();
    });

    it('should activate via chrome hook', () => {
      // Chrome plugin activates global insights
      vaultMonitor.activateGlobalInsights({
        wantsState: true,
        wantsPayload: false,
        wantsErrors: false
      } as any);

      vaultMonitor.registerCell('vault1');
      vaultMonitor.startReplace('vault1', 'state key', ctx);

      expect(emitted).toEqual([
        Object({
          id: 'id-removed',
          cell: 'vault1',
          behaviorKey: 'state key',
          type: 'lifecycle:start:replace',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        })
      ]);
    });

    it('should disable chrome insights when undefined', () => {
      vaultMonitor.activateGlobalInsights(undefined as any);

      vaultMonitor.registerCell('vault1');
      vaultMonitor.startReplace('vault1', 'state key', ctx);

      expect(emitted).toEqual([]);
    });

    it('should activate fully with error and payload', () => {
      const insight = {
        wantsState: true,
        wantsPayload: true,
        wantsErrors: true
      } as any;

      vaultMonitor.activateGlobalInsights(insight);
      vaultMonitor.registerCell('vault1');

      vaultMonitor.startReplace('vault1', 'state key', ctx);
      vaultMonitor.error?.('vault1', 'error string', ctx, 'this is the error');
      vaultMonitor.error?.('vault1', 'error object', ctx, new Error('this is the error'));

      expect(emitted).toEqual([
        Object({
          id: 'id-removed',
          cell: 'vault1',
          behaviorKey: 'state key',
          type: 'lifecycle:start:replace',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'vault1',
          behaviorKey: 'error string',
          type: 'error',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false }),
          payload: 'error',
          error: 'this is the error'
        }),
        Object({
          id: 'id-removed',
          cell: 'vault1',
          behaviorKey: 'error object',
          type: 'error',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false }),
          payload: 'error',
          error: 'this is the error'
        })
      ]);
    });
  });
});
