import { Injector, provideZonelessChangeDetection, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgVaultEventBus, NgVaultEventModel } from '@ngvault/dev-tools';
import { NgVaultDevModeService } from '@ngvault/shared';
import { Subscription } from 'rxjs';
import { NgVaultMonitor } from './vault-monitor.class';

describe('Class: Vault Monitor', () => {
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
      vaultMonitor.onInit?.('vault1', 'TestService', ctx);

      expect(emitted).toEqual([
        Object({
          id: jasmine.any(String),
          key: 'vault1',
          type: 'init',
          timestamp: jasmine.any(Number),
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        })
      ]);

      // Second call should be ignored (already registered)

      vaultMonitor.onInit?.('vault1', 'TestService', ctx);

      expect(emitted).toEqual([
        Object({
          id: jasmine.any(String),
          key: 'vault1',
          type: 'init',
          timestamp: jasmine.any(Number),
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        })
      ]);

      vaultMonitor.onLoad?.('vault1', ctx);
      vaultMonitor.onPatch?.('vault1', ctx);
      vaultMonitor.onReset?.('vault1', ctx);
      vaultMonitor.onSet?.('vault1', ctx);
      vaultMonitor.onDestroy?.('vault1', ctx);
      vaultMonitor.onDispose?.('vault1', ctx);
      vaultMonitor.onError?.('vault1', ctx);

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
          key: 'vault1',
          type: 'load',
          timestamp: jasmine.any(Number),
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        }),
        Object({
          id: jasmine.any(String),
          key: 'vault1',
          type: 'patch',
          timestamp: jasmine.any(Number),
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        }),
        Object({
          id: jasmine.any(String),
          key: 'vault1',
          type: 'reset',
          timestamp: jasmine.any(Number),
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        }),
        Object({
          id: jasmine.any(String),
          key: 'vault1',
          type: 'set',
          timestamp: jasmine.any(Number),
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        }),
        Object({
          id: jasmine.any(String),
          key: 'vault1',
          type: 'destroy',
          timestamp: jasmine.any(Number),
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        }),
        Object({
          id: jasmine.any(String),
          key: 'vault1',
          type: 'dispose',
          timestamp: jasmine.any(Number),
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        }),
        Object({
          id: jasmine.any(String),
          key: 'vault1',
          type: 'error',
          timestamp: jasmine.any(Number),
          error: 'this is the message',
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        })
      ]);
    });

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
  });

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
});
