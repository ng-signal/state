import { Injector, provideZonelessChangeDetection, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  defineNgVaultBehaviorKey,
  NgVaultBehaviorFactoryContext,
  NgVaultBehaviorType,
  NgVaultReducerFunction
} from '@ngvault/shared';
import { provideVaultTesting } from '@ngvault/testing';
import { withCoreReducerBehavior } from './with-core-reducer.behavior';

describe('Behavior: CoreReducerBehavior', () => {
  let behavior: any;
  let injector: Injector;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideVaultTesting(), provideZonelessChangeDetection()]
    });

    injector = TestBed.inject(Injector);

    runInInjectionContext(injector, () => {
      behavior = withCoreReducerBehavior({
        type: NgVaultBehaviorType.Reduce,
        injector
      });
    });
  });

  it('should have default properties', () => {
    expect(behavior.critical).toBeTrue();
    expect(behavior.type).toBe('reduce');
    expect(behavior.key).toBe('NgVault::Core::Reducer');
  });

  it('should construct via factory and expose correct metadata', () => {
    const fakeContext = { injector: {} } as NgVaultBehaviorFactoryContext;

    const behavior = withCoreReducerBehavior(fakeContext);

    expect(behavior).toBeTruthy();
    expect(behavior.type).toBe(NgVaultBehaviorType.Reduce);
    expect(behavior.key).toBe(defineNgVaultBehaviorKey('Core', 'Reducer'));
  });

  it('should return current unchanged if reducer is not a function', () => {
    const current = { name: 'Ada' };
    const reducer: any = null;

    const result = behavior.applyReducer(current, reducer);

    expect(result).toBe(current); // same reference
  });

  it('should apply reducer function to current value', () => {
    const reducer: NgVaultReducerFunction<number> = (current) => current + 1;

    const result = behavior.applyReducer(5, reducer);

    expect(result).toBe(6);
  });

  it('should support object reducers immutably', () => {
    const reducer: NgVaultReducerFunction<{ count: number }> = (current) => ({
      ...current,
      count: current.count + 1
    });

    const current = { count: 1 };
    const result = behavior.applyReducer(current, reducer);

    expect(result).toEqual({ count: 2 });
    expect(result).not.toBe(current); // ensure immutability
  });

  it('should support multiple calls on same behavior instance', () => {
    const r1: NgVaultReducerFunction<number> = (x) => x * 2;
    const r2: NgVaultReducerFunction<number> = (x) => x + 10;

    const mid = behavior.applyReducer(3, r1);
    const final = behavior.applyReducer(mid, r2);

    expect(mid).toBe(6);
    expect(final).toBe(16);
  });
});
