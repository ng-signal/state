import { Injector, provideZonelessChangeDetection, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VaultBehavior, VaultBehaviorContext, VaultBehaviorType } from '@ngvault/shared';
import { flushMicrotasksZoneless, provideVaultTesting } from '@ngvault/testing';
import { VaultOrchestrator } from './ngvault.orchestrator';

describe('Orchestrator: Vault (dispatchPatch)', () => {
  let dispatcher: VaultOrchestrator<any>;
  let mockCtx: VaultBehaviorContext<any>;
  let calls: string[];
  let injector: Injector;

  beforeEach(() => {
    calls = [];

    // Mock signals
    const isLoading = jasmine.createSpyObj('Signal', ['set']);
    const error = jasmine.createSpyObj('Signal', ['set']);
    const value = jasmine.createSpyObj('Signal', ['set']);
    value.and = { callFake: () => ({ id: 1, existing: true }) }; // simulate .value() accessor

    mockCtx = {
      isLoading,
      error,
      value: Object.assign(jasmine.createSpy('value'), {
        set: value.set,
        // mock current value signal return
        call: () => ({ current: true })
      })
    } as unknown as VaultBehaviorContext<any>;

    TestBed.configureTestingModule({
      providers: [provideVaultTesting(), provideZonelessChangeDetection()]
    });

    injector = TestBed.inject(Injector);
  });

  /** Utility factory to create test behaviors */
  function makeBehavior(type: string, returnValue?: any): VaultBehavior<any> {
    return {
      type: type as VaultBehaviorType,
      behaviorId: `${type}-id`,
      onInit: () => {},
      run: async () => {
        calls.push(type);
        return returnValue ?? { [`${type}`]: true };
      }
    };
  }

  it('should execute state → reduce → encrypt → persist in order', async () => {
    const behaviors = [
      makeBehavior('state', { patch: true }),
      makeBehavior('reduce', { reduce: true }),
      makeBehavior('encrypt'),
      makeBehavior('persist')
    ];

    runInInjectionContext(injector, () => {
      dispatcher = new VaultOrchestrator<any>(behaviors);
    });

    dispatcher.dispatchPatch(mockCtx);
    await flushMicrotasksZoneless();

    expect(calls).toEqual(['state', 'reduce', 'encrypt', 'persist']);
    expect(mockCtx.isLoading?.set).toHaveBeenCalledWith(true);
    expect(mockCtx.error?.set).toHaveBeenCalledWith(null);
    expect(mockCtx.value?.set).toHaveBeenCalledWith({ reduce: true });
    expect(mockCtx.isLoading?.set).toHaveBeenCalledWith(false);
  });

  it('should correctly merge current and partial patch state', async () => {
    const behaviors = [makeBehavior('state', { newKey: true })];

    runInInjectionContext(injector, () => {
      dispatcher = new VaultOrchestrator<any>(behaviors);
    });

    const currentValue = { id: 1, existing: true };
    mockCtx.value = Object.assign(jasmine.createSpy('value') as any, {
      // Simulate the signal getter returning currentValue
      call: () => currentValue,
      // Simulate the signal being callable: mockCtx.value()
      apply: () => currentValue,
      // Allow .set()
      set: jasmine.createSpy('set')
    });

    dispatcher.dispatchPatch(mockCtx);
    await flushMicrotasksZoneless();

    expect(mockCtx.value?.set).toHaveBeenCalledWith(jasmine.objectContaining({ newKey: true }));
  });

  it('should handle errors gracefully and set resourceError', async () => {
    const errorBehavior = makeBehavior('state');
    errorBehavior.run = async () => {
      throw new Error('Patch error test');
    };

    const behaviors = [errorBehavior];
    runInInjectionContext(injector, () => {
      dispatcher = new VaultOrchestrator<any>(behaviors);
    });

    dispatcher.dispatchPatch(mockCtx);
    await flushMicrotasksZoneless();

    expect(mockCtx.error?.set).toHaveBeenCalledWith(
      jasmine.objectContaining({ message: 'Patch error test', details: jasmine.any(String) })
    );
    expect(mockCtx.isLoading?.set).toHaveBeenCalledWith(false);
  });

  it('should skip undefined results and continue processing later stages', async () => {
    const behaviors = [
      makeBehavior('state', { id: 1 }),
      { ...makeBehavior('reduce'), run: async () => undefined },
      makeBehavior('encrypt')
    ];

    runInInjectionContext(injector, () => {
      dispatcher = new VaultOrchestrator<any>(behaviors);
    });

    dispatcher.dispatchPatch(mockCtx);
    await flushMicrotasksZoneless();

    expect(calls).toEqual(['state', 'encrypt']);
    expect(mockCtx.value?.set).toHaveBeenCalledWith({ id: 1 });
  });

  it('should not throw if ctx signals are missing', async () => {
    const behaviors = [makeBehavior('state')];

    runInInjectionContext(injector, () => {
      dispatcher = new VaultOrchestrator<any>(behaviors);
    });

    const minimalCtx = {} as VaultBehaviorContext<any>;
    expect(() => dispatcher.dispatchPatch(minimalCtx)).not.toThrow();
  });

  it('should update signals correctly after microtask flush', async () => {
    const behaviors = [makeBehavior('state', { ok: true })];

    runInInjectionContext(injector, () => {
      dispatcher = new VaultOrchestrator<any>(behaviors);
    });

    dispatcher.dispatchPatch(mockCtx);
    await flushMicrotasksZoneless();

    expect(mockCtx.value?.set).toHaveBeenCalledWith({ ok: true });
    expect(mockCtx.isLoading?.set).toHaveBeenCalledWith(false);
    expect(mockCtx.error?.set).toHaveBeenCalledWith(null);
  });
});
