import { Injector, provideZonelessChangeDetection, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgVaultEventBus, NgVaultEventModel } from '@ngvault/dev-tools';
import { NgVaultDevModeService } from '@ngvault/shared';
import { Subscription } from 'rxjs';
import { NgVaultMonitor } from './vault-monitor.service';

describe('Service: Vault Monitor', () => {
  let vaultMonitor: NgVaultMonitor;
  const emitted: any[] = [];
  let stopListening: any;
  let ctx: any;
  let eventBus: any;

  function listen(hook: (event: NgVaultEventModel) => void): () => void {
    const subscription: Subscription = eventBus.asObservable().subscribe(hook);
    return () => subscription.unsubscribe();
  }

  describe('development', () => {
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
      }).overrideProvider(NgVaultDevModeService, {
        useValue: { isDevMode: true }
      });

      const injector = TestBed.inject(Injector);

      emitted.length = 0;

      // Subscribe to all vault events via the official hook
      eventBus = TestBed.inject(NgVaultEventBus);
      stopListening = listen((event) => emitted.push(event));

      runInInjectionContext(injector, () => {
        vaultMonitor = TestBed.inject(NgVaultMonitor);
      });
    });

    afterEach(() => {
      stopListening();
    });

    it('should register, emit init and prevent double registration', () => {
      ctx.message = 'this is the message';
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

    /*
    it('should handle multiple vaults independently', () => {
      vaultMonitor.onInit?.('vault1', 'TestService', ctx);
      vaultMonitor.onInit?.('vault2', 'TestService', ctx);

      expect(emitted).toEqual([
        Object({
          id: jasmine.any(String),
          key: 'vault1',
          type: 'init',
          timestamp: jasmine.any(Number),
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        }),
        Object({
          id: jasmine.any(String),
          key: 'vault2',
          type: 'init',
          timestamp: jasmine.any(Number),
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        })
      ]);

      try {
        vaultMonitor.onDestroy?.('A', ctx);
        expect('this is an error').toBe('fix me');
      } catch (error) {
        expect((error as any).message).toBe('[NgVault] Behavior "NgVaultMonitor2" used before onInit() for "A".');
      }

      vaultMonitor.onDestroy?.('vault1', ctx);

      expect(emitted).toEqual([
        Object({
          id: jasmine.any(String),
          key: 'vault1',
          type: 'init',
          timestamp: jasmine.any(Number),
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        }),
        Object({
          id: jasmine.any(String),
          key: 'vault2',
          type: 'init',
          timestamp: jasmine.any(Number),
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        }),
        Object({
          id: jasmine.any(String),
          key: 'vault1',
          type: 'destroy',
          timestamp: jasmine.any(Number),
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        })
      ]);
    });
    */
  });

  /*
  describe('development', () => {
    beforeEach(() => {
      ctx = {
        isLoading: true,
        value: 'hello',
        error: null,
        hasValue: false
      };

      TestBed.configureTestingModule({
        providers: [NgVaultMonitor, provideZonelessChangeDetection()]
      }).overrideProvider(NgVaultDevModeService, {
        useValue: { isDevMode: false }
      });

      const injector = TestBed.inject(Injector);

      emitted.length = 0;

      // Subscribe to all vault events via the official hook
      eventBus = TestBed.inject(NgVaultEventBus);
      stopListening = listen((event) => emitted.push(event));

      runInInjectionContext(injector, () => {
        vaultMonitor = TestBed.inject(NgVaultMonitor);
      });
    });

    afterEach(() => {
      stopListening();
    });

    it('should not register', () => {
      vaultMonitor.onInit?.('vault1', 'TestService', ctx);
      vaultMonitor.onInit?.('vault2', 'TestService', ctx);

      expect(emitted).toEqual([]);
    });
  });
  */
});
