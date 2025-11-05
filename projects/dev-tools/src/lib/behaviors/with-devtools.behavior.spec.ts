import { Injector, provideZonelessChangeDetection, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VaultBehavior, VaultStateSnapshot } from '@ngvault/shared-models';
import { NgVaultDebuggerService } from '../services/ngvault-debugger.service';
import { withDevtoolsBehavior } from './with-devtools.behavior';

describe('Behavior: withDevtools', () => {
  let behavior: VaultBehavior;
  const emitted: any[] = [];
  let stopListening: any;
  let ctx: VaultStateSnapshot<string>;

  beforeEach(() => {
    ctx = {
      isLoading: true,
      value: 'hello',
      error: null,
      hasValue: false
    };

    TestBed.configureTestingModule({
      providers: [NgVaultDebuggerService, provideZonelessChangeDetection()]
    });

    const injector = TestBed.inject(Injector);

    emitted.length = 0;

    // Subscribe to all vault events via the official hook
    const debuggerService = TestBed.inject(NgVaultDebuggerService);
    stopListening = debuggerService.listen((event) => emitted.push(event));

    runInInjectionContext(injector, () => {
      behavior = withDevtoolsBehavior({ injector });
    });
  });

  afterEach(() => {
    stopListening();
  });

  it('should register, emit init and prevent double registration', () => {
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
        type: 'dispose',
        timestamp: jasmine.any(Number),
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

    behavior.onDestroy?.('A', ctx);

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
        key: 'A',
        type: 'dispose',
        timestamp: jasmine.any(Number),
        state: Object({ isLoading: true, value: 'hello', error: null, hasValue: false })
      })
    ]);
  });
});
