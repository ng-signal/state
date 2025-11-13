import { Injector, provideZonelessChangeDetection, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgVaultEventBus } from '@ngvault/dev-tools';
import { VaultBehaviorType } from '@ngvault/shared';
import { createTestEventListener } from '@ngvault/testing';
import { NgVaultMonitor } from './vault-monitor.service';

describe('Service: Vault Monitor', () => {
  let vaultMonitor: NgVaultMonitor;
  const emitted: any[] = [];
  let stopListening: any;
  let ctx: any;
  let eventBus: any;
  let behavior: any;

  beforeEach(() => {
    ctx = {
      state: {
        isLoading: true,
        value: 'hello',
        error: null,
        hasValue: false
      }
    } as any;

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

    behavior = {
      type: VaultBehaviorType.Insights,
      behaviorId: `insights-id`,
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
  });

  afterEach(() => {
    stopListening();
  });

  describe('with insight behavior', () => {
    it('should register, emit init and prevent double registration', () => {
      //ctx.message = 'this is the message';
      vaultMonitor.registerCell('vault1', [behavior]);
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

      expect(behavior.insight.onCellRegistered).toHaveBeenCalledWith('vault1');

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
      vaultMonitor.registerCell('vault1', [behavior]);
      vaultMonitor.registerCell('vault2', [behavior]);
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
  });

  describe('No emits', () => {
    it('should not emit with wrong cell', () => {
      vaultMonitor.registerCell('wrong', [behavior]);
      vaultMonitor.startMerge?.('vault1', 'TestService', ctx);

      expect(emitted).toEqual([]);
    });

    it('should not emit without registration ', () => {
      vaultMonitor.startMerge?.('vault1', 'TestService', ctx);

      expect(emitted).toEqual([]);
    });

    it('should not emit with insight behaviors', () => {
      vaultMonitor.registerCell('vault1', []);
      vaultMonitor.startMerge?.('vault1', 'TestService', ctx);

      expect(emitted).toEqual([]);
    });

    it('should display state, errors or payload with explicit', () => {
      behavior.insight.wantsState = false;
      behavior.insight.wantsPayload = false;
      behavior.insight.wantsErrors = false;
      behavior.insight.filterEventType = (type: string) => !type.includes('merge');
      vaultMonitor.registerCell('vault1', [behavior]);

      vaultMonitor.startReplace('vault1', 'state key', ctx);
      vaultMonitor.startMerge?.('vault1', 'end key', ctx);
      vaultMonitor.error?.('vault1', 'error string', ctx, 'this is the error');

      expect(behavior.insight.onCellRegistered).toHaveBeenCalledWith('vault1');

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
      delete behavior.insight.wantsState;
      delete behavior.insight.wantsPayload;
      delete behavior.insight.wantsErrors;
      vaultMonitor.registerCell('vault1', [behavior]);

      vaultMonitor.startReplace('vault1', 'state key', ctx);
      vaultMonitor.error?.('vault1', 'error string', ctx, 'this is the error');

      expect(behavior.insight.onCellRegistered).toHaveBeenCalledWith('vault1');

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
