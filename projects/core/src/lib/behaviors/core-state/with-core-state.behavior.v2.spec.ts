import { Injector, provideZonelessChangeDetection, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VaultBehaviorContext } from '@ngvault/shared';
import { provideVaultTesting } from '@ngvault/testing';
import { withCoreStateBehaviorV2 } from './with-core-state.behavior.v2';

describe('Behavior: CoreStateBehaviorV2', () => {
  let behavior: any;
  let injector: Injector;
  let ctx: VaultBehaviorContext<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideVaultTesting(), provideZonelessChangeDetection()]
    });

    injector = TestBed.inject(Injector);

    ctx = {
      isLoading: signal(false),
      error: signal(null),
      value: signal(undefined),
      incoming: null
    } as unknown as VaultBehaviorContext<any>;

    runInInjectionContext(injector, () => {
      behavior = withCoreStateBehaviorV2({
        type: 'state',
        injector
      });
    });
  });

  it('should have default properties', () => {
    expect(behavior.critical).toBeTrue();
    expect(behavior.type).toBe('state');
    expect(behavior.key).toBe('NgVault::Core::StateV2');
  });

  it('should skip when ctx.incoming is null', async () => {
    ctx.incoming = null;
    const result = await behavior.computeState(ctx);
    expect(result).toBeUndefined();
  });

  it('should skip when ctx.incoming is not an object', async () => {
    ctx.incoming = 'invalid' as any;
    const result = await behavior.computeState(ctx);
    expect(result).toBeUndefined();
  });

  it('should skip when ctx.incoming is an HttpResourceRef-like object', async () => {
    // simulate HttpResourceRef shape
    ctx.incoming = { value: () => [], isLoading: () => false, error: () => false, hasValue: () => false } as any;
    const result = await behavior.computeState(ctx);
    expect(result).toBeUndefined();
  });

  it('should return a shallow-cloned array', async () => {
    ctx.incoming = {
      value: [
        { id: 1, name: 'Ada' },
        { id: 2, name: 'Grace' }
      ]
    };
    const result = await behavior.computeState(ctx);

    expect(result).toEqual([
      { id: 1, name: 'Ada' },
      { id: 2, name: 'Grace' }
    ]);

    // Should be a new array instance
    expect(result).not.toBe((ctx.incoming as any).value);
  });

  it('should return a shallow-cloned object', async () => {
    ctx.incoming = { value: { id: 1, name: 'Alan' } };
    const result = await behavior.computeState(ctx);

    expect(result).toEqual({ id: 1, name: 'Alan' });
    expect(result).not.toBe((ctx.incoming as any).value);
  });

  it('should return primitive values directly', async () => {
    ctx.incoming = { value: 42 };
    const result = await behavior.computeState(ctx);
    expect(result).toBe(42);

    ctx.incoming = { value: 'Hello' };
    const result2 = await behavior.computeState(ctx);
    expect(result2).toBe('Hello');

    ctx.incoming = { value: true };
    const result3 = await behavior.computeState(ctx);
    expect(result3).toBeTrue();
  });

  it('should handle undefined value safely', async () => {
    ctx.incoming = { value: undefined };
    const result = await behavior.computeState(ctx);
    expect(result).toBeUndefined();
  });

  it('should handle empty array and empty object', async () => {
    ctx.incoming = { value: [] };
    const arr = await behavior.computeState(ctx);
    expect(arr).toEqual([]);

    ctx.incoming = { value: {} };
    const obj = await behavior.computeState(ctx);
    expect(obj).toEqual({});
  });

  it('should not mutate the original array or object', async () => {
    const original = [{ id: 1 }];
    ctx.incoming = { value: original };
    const result = await behavior.computeState(ctx);

    (result as any[]).push({ id: 2 });
    expect(original).toEqual([{ id: 1 }]);
  });

  it('should handle deeply nested objects shallowly', async () => {
    const original = { id: 1, meta: { nested: true } };
    ctx.incoming = { value: original };
    const result = await behavior.computeState(ctx);

    expect(result).toEqual(original);
    expect(result.meta).toBe(original.meta); // shallow clone only
  });

  it('should handle NaN gracefully', async () => {
    ctx.incoming = { value: NaN };
    const result = await behavior.computeState(ctx);
    expect(result).toBeNaN();
  });
});
