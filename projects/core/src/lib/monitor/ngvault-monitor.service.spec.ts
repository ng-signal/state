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
          id: jasmine.any(String),
          cell: 'vault1',
          behaviorId: 'state key',
          type: 'lifecycle:start:replace',
          timestamp: jasmine.any(Number),
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        })
      ]);

      vaultMonitor.endReplace?.('vault1', 'end key', ctx);
      vaultMonitor.startMerge?.('vault1', 'start merge', ctx);
      vaultMonitor.endMerge?.('vault1', 'end merge', ctx);
      vaultMonitor.error?.('vault1', 'error string', ctx, 'this is the error');
      vaultMonitor.error?.('vault1', 'error error', ctx, new Error('this is the error'));
      vaultMonitor.startState?.('vault1', 'start state', ctx);
      vaultMonitor.endState?.('vault1', 'end state', ctx);

      expect(emitted).toEqual([
        Object({
          id: jasmine.any(String),
          cell: 'vault1',
          behaviorId: 'state key',
          type: 'lifecycle:start:replace',
          timestamp: jasmine.any(Number),
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        }),
        Object({
          id: jasmine.any(String),
          cell: 'vault1',
          behaviorId: 'end key',
          type: 'lifecycle:end:replace',
          timestamp: jasmine.any(Number),
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        }),
        Object({
          id: jasmine.any(String),
          cell: 'vault1',
          behaviorId: 'start merge',
          type: 'lifecycle:start:merge',
          timestamp: jasmine.any(Number),
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        }),
        Object({
          id: jasmine.any(String),
          cell: 'vault1',
          behaviorId: 'end merge',
          type: 'lifecycle:end:merge',
          timestamp: jasmine.any(Number),
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        }),
        Object({
          id: jasmine.any(String),
          cell: 'vault1',
          behaviorId: 'error string',
          type: 'lifecycle:error:unknown',
          timestamp: jasmine.any(Number),
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false }),
          payload: 'error',
          error: 'this is the error'
        }),
        Object({
          id: jasmine.any(String),
          cell: 'vault1',
          behaviorId: 'error error',
          type: 'lifecycle:error:unknown',
          timestamp: jasmine.any(Number),
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false }),
          payload: 'error',
          error: 'this is the error'
        }),
        Object({
          id: jasmine.any(String),
          cell: 'vault1',
          behaviorId: 'start state',
          type: 'stage:start:state',
          timestamp: jasmine.any(Number),
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        }),
        Object({
          id: jasmine.any(String),
          cell: 'vault1',
          behaviorId: 'end state',
          type: 'stage:end:state',
          timestamp: jasmine.any(Number),
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
          id: jasmine.any(String),
          cell: 'vault1',
          behaviorId: 'TestService',
          type: 'lifecycle:start:merge',
          timestamp: jasmine.any(Number),
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        }),
        Object({
          id: jasmine.any(String),
          cell: 'vault2',
          behaviorId: 'TestService',
          type: 'lifecycle:start:merge',
          timestamp: jasmine.any(Number),
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        })
      ]);
    });

    it('should not emit with insight behaviors', () => {
      vaultMonitor.registerCell('vault1', {} as any);
      vaultMonitor.startMerge?.('vault1', 'TestService', ctx);

      expect(emitted).toEqual([
        Object({
          id: jasmine.any(String),
          cell: 'vault1',
          behaviorId: 'TestService',
          type: 'lifecycle:start:merge',
          timestamp: jasmine.any(Number)
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
            id: jasmine.any(String),
            cell: 'vault1',
            behaviorId: 'state key',
            type: 'lifecycle:start:replace',
            timestamp: jasmine.any(Number)
          }),
          Object({
            id: jasmine.any(String),
            cell: 'vault1',
            behaviorId: 'error string',
            type: 'lifecycle:error:unknown',
            timestamp: jasmine.any(Number)
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
            id: jasmine.any(String),
            cell: 'vault1',
            behaviorId: 'state key',
            type: 'lifecycle:start:replace',
            timestamp: jasmine.any(Number)
          }),
          Object({
            id: jasmine.any(String),
            cell: 'vault1',
            behaviorId: 'error string',
            type: 'lifecycle:error:unknown',
            timestamp: jasmine.any(Number)
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
          id: jasmine.any(String),
          cell: 'vault1',
          behaviorId: 'state key',
          type: 'lifecycle:start:replace',
          timestamp: jasmine.any(Number)
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
          id: jasmine.any(String),
          cell: 'vault1',
          behaviorId: 'state key',
          type: 'lifecycle:start:replace',
          timestamp: jasmine.any(Number),
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        }),
        Object({
          id: jasmine.any(String),
          cell: 'vault1',
          behaviorId: 'error string',
          type: 'lifecycle:error:unknown',
          timestamp: jasmine.any(Number),
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false }),
          payload: 'error',
          error: 'this is the error'
        }),
        Object({
          id: jasmine.any(String),
          cell: 'vault1',
          behaviorId: 'error error',
          type: 'lifecycle:error:unknown',
          timestamp: jasmine.any(Number),
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
          id: jasmine.any(String),
          cell: 'vault1',
          behaviorId: 'state key',
          type: 'lifecycle:start:replace',
          timestamp: jasmine.any(Number),
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
          id: jasmine.any(String),
          cell: 'vault1',
          behaviorId: 'state key',
          type: 'lifecycle:start:replace',
          timestamp: jasmine.any(Number),
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        }),
        Object({
          id: jasmine.any(String),
          cell: 'vault1',
          behaviorId: 'error string',
          type: 'lifecycle:error:unknown',
          timestamp: jasmine.any(Number),
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false }),
          payload: 'error',
          error: 'this is the error'
        }),
        Object({
          id: jasmine.any(String),
          cell: 'vault1',
          behaviorId: 'error object',
          type: 'lifecycle:error:unknown',
          timestamp: jasmine.any(Number),
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false }),
          payload: 'error',
          error: 'this is the error'
        })
      ]);
    });
  });
});
