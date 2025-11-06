import { runInInjectionContext, signal } from '@angular/core';
import { VaultBehaviorFactoryContext } from '@ngvault/shared-models';
import { withCoreSetBehavior } from './with-core-set.behavior';

describe('Behavior: withCoreSet', () => {
  let behavior: any;
  let ctx: any;

  beforeEach(() => {
    const injector = {} as VaultBehaviorFactoryContext['injector']; // mock injector

    ctx = {
      isLoading: signal(false),
      error: signal(null),
      value: signal(undefined),
      patch: null
    };

    runInInjectionContext(injector, () => {
      behavior = withCoreSetBehavior({ injector, behaviorId: 'id', type: 'core' });
    });
  });

  it('should mark factory as critical', () => {
    expect(behavior.critical).toBeTrue();
  });

  it('should safely return when patch is null or not an object', () => {
    ctx.next = null;
    behavior.onSet?.('vault', ctx);
    expect(ctx.value()).toBeUndefined();

    ctx.next = 42; // invalid
    behavior.onSet?.('vault', ctx);
    expect(ctx.value()).toBeUndefined();
  });

  it('should update loading and error when provided', () => {
    ctx.next = { loading: true, error: { message: 'fail' } };
    behavior.onSet?.('vault', ctx);

    expect(ctx.isLoading()).toBeTrue();
    expect(ctx.error()).toEqual({ message: 'fail' });
  });

  it('should set primitive value correctly', () => {
    ctx.next = { value: 123 };
    behavior.onSet?.('vault', ctx);
    expect(ctx.value()).toBe(123);

    ctx.next = { value: 'test' };
    behavior.onSet?.('vault', ctx);
    expect(ctx.value()).toBe('test');

    ctx.next = { value: true };
    behavior.onSet?.('vault', ctx);
    expect(ctx.value()).toBeTrue();
  });

  it('should clone and set arrays correctly', () => {
    const arr = [1, 2, 3];
    ctx.next = { value: arr };
    behavior.onSet?.('vault', ctx);

    expect(ctx.value()).toEqual([1, 2, 3]);
    expect(ctx.value()).not.toBe(arr); // ensure immutability
  });

  it('should clone and set plain objects correctly', () => {
    const obj = { name: 'Alice', age: 30 };
    ctx.next = { value: obj };
    behavior.onSet?.('vault', ctx);

    expect(ctx.value()).toEqual({ name: 'Alice', age: 30 });
    expect(ctx.value()).not.toBe(obj);
  });

  it('should handle multiple updates sequentially', () => {
    ctx.next = { loading: true, value: [1, 2] };
    behavior.onSet?.('vault', ctx);
    expect(ctx.isLoading()).toBeTrue();
    expect(ctx.value()).toEqual([1, 2]);

    ctx.next = { loading: false, error: { message: 'done' }, value: { status: 'ok' } };
    behavior.onSet?.('vault', ctx);

    expect(ctx.isLoading()).toBeFalse();
    expect(ctx.error()).toEqual({ message: 'done' });
    expect(ctx.value()).toEqual({ status: 'ok' });
  });
});
