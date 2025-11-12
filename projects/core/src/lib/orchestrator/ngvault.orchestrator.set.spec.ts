import { Injector, provideZonelessChangeDetection, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VaultBehaviorContext, VaultBehaviorType } from '@ngvault/shared';
import { flushMicrotasksZoneless, provideVaultTesting } from '@ngvault/testing';
import { VaultOrchestrator } from './ngvault.orchestrator';

describe('Orcestrator: Vault', () => {
  let dispatcher: VaultOrchestrator<any>;
  let mockCtx: VaultBehaviorContext<any>;
  let calls: string[];
  let injector: any;

  beforeEach(() => {
    calls = [];

    // mock ctx signals
    const isLoading = jasmine.createSpyObj('Signal', ['set']);
    const error = jasmine.createSpyObj('Signal', ['set']);
    const value = jasmine.createSpyObj('Signal', ['set']);

    mockCtx = {
      isLoading,
      error,
      value
    } as unknown as VaultBehaviorContext<any>;

    TestBed.configureTestingModule({
      providers: [provideVaultTesting(), provideZonelessChangeDetection()]
    });

    injector = TestBed.inject(Injector);
  });

  function makeBehavior(type: string, returnValue?: any): any {
    return {
      type: type as VaultBehaviorType,
      behaviorId: `${type}-id`,
      computeState: async () => {
        calls.push(type);
        return returnValue ?? { [`${type}`]: true };
      },
      applyReducers: async () => {
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

  it('should execute state → reduce → encrypt → persist in order', async () => {
    const behaviors = [makeBehavior('state'), makeBehavior('reduce'), makeBehavior('encrypt'), makeBehavior('persist')];

    runInInjectionContext(injector, () => {
      dispatcher = new VaultOrchestrator<any>(behaviors);
    });

    dispatcher.dispatchSet(mockCtx);
    await flushMicrotasksZoneless();

    expect(calls).toEqual(['state', 'reduce', 'encrypt', 'persist']);
    expect(mockCtx.isLoading?.set).toHaveBeenCalledWith(true);
    expect(mockCtx.error?.set).toHaveBeenCalledWith(null);
    expect(mockCtx.value?.set).toHaveBeenCalledWith({ reduce: true });
    expect(mockCtx.isLoading?.set).toHaveBeenCalledWith(false);
  });

  it('should handle errors and set resourceError', async () => {
    const errorBehavior = makeBehavior('state');
    errorBehavior.computeState = async () => {
      throw new Error('Test error');
    };

    const behaviors = [errorBehavior];
    runInInjectionContext(injector, () => {
      dispatcher = new VaultOrchestrator<any>(behaviors);
    });

    dispatcher.dispatchSet(mockCtx);
    await flushMicrotasksZoneless();

    // Verify error handling logic
    expect(mockCtx.error?.set).toHaveBeenCalledWith(
      Object({
        message: 'Test error',
        details: jasmine.any(String)
      })
    );
    expect(mockCtx.isLoading?.set).toHaveBeenCalledWith(true);
    expect(mockCtx.value?.set).not.toHaveBeenCalled();
    expect(mockCtx.isLoading?.set).toHaveBeenCalledWith(false);
  });

  it('should skip undefined stage results and maintain working state', async () => {
    const behaviors = [
      makeBehavior('state', { id: 1 }),
      { ...makeBehavior('reduce'), applyReducers: async () => undefined },
      makeBehavior('encrypt')
    ];

    runInInjectionContext(injector, () => {
      dispatcher = new VaultOrchestrator<any>(behaviors);
    });

    dispatcher.dispatchSet(mockCtx);
    await flushMicrotasksZoneless();

    expect(mockCtx.value?.set).toHaveBeenCalledWith({ id: 1 });
    expect(calls).toEqual(['state', 'encrypt']);
  });

  it('should not throw if optional ctx signals are undefined', async () => {
    const behaviors = [makeBehavior('state')];

    runInInjectionContext(injector, () => {
      dispatcher = new VaultOrchestrator<any>(behaviors);
    });

    const minimalCtx = {} as VaultBehaviorContext<any>; // no signals
    expect(() => dispatcher.dispatchSet(minimalCtx)).not.toThrow();
  });

  it('should set signals correctly after microtask flush', async () => {
    const behaviors = [makeBehavior('state', { ok: true })];
    runInInjectionContext(injector, () => {
      dispatcher = new VaultOrchestrator<any>(behaviors);
    });

    dispatcher.dispatchSet(mockCtx);

    await flushMicrotasksZoneless();

    expect(mockCtx.value?.set).toHaveBeenCalledWith({ ok: true });
    expect(mockCtx.isLoading?.set).toHaveBeenCalledWith(false);
    expect(mockCtx.error?.set).toHaveBeenCalledWith(null);
  });
});
