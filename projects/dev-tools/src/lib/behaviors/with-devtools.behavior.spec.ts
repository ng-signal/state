import { Injector, provideZonelessChangeDetection, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgVaultDevModeService, VaultBehavior } from '@ngvault/shared';
import { NgVaultInsightService } from '../services/ngvault-insight.service';
import { withDevtoolsBehavior } from './with-devtools.behavior';

describe('Behavior: withDevtools', () => {
  let behavior: VaultBehavior;
  const emitted: any[] = [];
  let stopListening: any;
  let ctx: any;

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
        providers: [NgVaultInsightService, provideZonelessChangeDetection()]
      }).overrideProvider(NgVaultDevModeService, {
        useValue: { isDevMode: true }
      });

      const injector = TestBed.inject(Injector);

      emitted.length = 0;

      // Subscribe to all vault events via the official hook
      const insightService = TestBed.inject(NgVaultInsightService);
      stopListening = insightService.listen((event) => emitted.push(event));

      runInInjectionContext(injector, () => {
        behavior = withDevtoolsBehavior({ type: 'dev-tools', injector, behaviorId: 'id' });
      });
    });

    afterEach(() => {
      stopListening();
    });

    it('should register, emit init and prevent double registration', () => {
      ctx.message = 'this is the message';
      behavior.onInit?.('vault1', 'TestService', ctx);

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

      behavior.onInit?.('vault1', 'TestService', ctx);

      expect(emitted).toEqual([
        Object({
          id: jasmine.any(String),
          key: 'vault1',
          type: 'init',
          timestamp: jasmine.any(Number),
          state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
        })
      ]);

      behavior.onLoad?.('vault1', ctx);
      behavior.onPatch?.('vault1', ctx);
      behavior.onReset?.('vault1', ctx);
      behavior.onSet?.('vault1', ctx);
      behavior.onDestroy?.('vault1', ctx);
      behavior.onDispose?.('vault1', ctx);
      behavior.onError?.('vault1', ctx);

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
      behavior.onInit?.('vault1', 'TestService', ctx);
      behavior.onInit?.('vault2', 'TestService', ctx);

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
        behavior.onDestroy?.('A', ctx);
        expect('this is an error').toBe('fix me');
      } catch (error) {
        expect((error as any).message).toBe('[NgVault] Behavior "DevtoolsBehavior" used before onInit() for "A".');
      }

      behavior.onDestroy?.('vault1', ctx);

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
        providers: [NgVaultInsightService, provideZonelessChangeDetection()]
      }).overrideProvider(NgVaultDevModeService, {
        useValue: { isDevMode: false }
      });

      const injector = TestBed.inject(Injector);

      emitted.length = 0;

      // Subscribe to all vault events via the official hook
      const debuggerService = TestBed.inject(NgVaultInsightService);
      stopListening = debuggerService.listen((event) => emitted.push(event));

      runInInjectionContext(injector, () => {
        behavior = withDevtoolsBehavior({ injector, behaviorId: 'id', type: 'dev-tools' });
      });
    });

    afterEach(() => {
      stopListening();
    });

    it('should not register', () => {
      behavior.onInit?.('vault1', 'TestService', ctx);
      behavior.onInit?.('vault2', 'TestService', ctx);

      expect(emitted).toEqual([]);
    });
  });
});
