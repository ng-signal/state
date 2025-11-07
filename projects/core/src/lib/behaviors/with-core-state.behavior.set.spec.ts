import { runInInjectionContext, signal } from '@angular/core';
import { VaultBehaviorFactoryContext } from '@ngvault/shared-models';
import { withCoreStateBehavior } from './with-core-state.behavior';

describe('Behavior: withCoreState: Set', () => {
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
      behavior = withCoreStateBehavior({ injector, behaviorId: 'id', type: 'core' });
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

  it('should ignore HttpResourceRef values', () => {
    const mockResource = {
      value: () => [{ id: 1 }],
      isLoading: () => true,
      error: () => null,
      hasValue: () => null
    };

    ctx.next = mockResource;
    behavior.onSet?.('vault', ctx);

    expect(ctx.value()).toBeUndefined();
    expect(ctx.isLoading()).toBeFalse();
    expect(ctx.error()).toBeNull();
  });

  it('should trigger behaviorRunner.onSet exactly once per valid patch', () => {
    const spyRunner = jasmine.createSpyObj('runner', ['onSet']);
    ctx.behaviorRunner = spyRunner;

    ctx.next = { value: [42] };
    behavior.onSet?.('vault', ctx);

    expect(spyRunner.onSet).toHaveBeenCalledTimes(1);
    expect(spyRunner.onSet).toHaveBeenCalledWith('id', behavior.key, ctx);
  });

  it('should not trigger behaviorRunner.onSet for invalid or HttpResourceRef patches', () => {
    const spyRunner = jasmine.createSpyObj('runner', ['onSet']);
    ctx.behaviorRunner = spyRunner;

    ctx.next = 42; // invalid
    behavior.onSet?.('vault', ctx);

    expect(spyRunner.onSet).not.toHaveBeenCalled();
  });

  it('should shallow merge nested objects', () => {
    ctx.value.set({ profile: { name: 'Alice' }, meta: { age: 30 } });
    ctx.next = { value: { profile: { city: 'Paris' } } };

    behavior.onSet?.('vault', ctx);

    // Shallow merge: profile should be overwritten, not deeply merged
    expect(ctx.value()).toEqual({
      profile: { city: 'Paris' }
    });
  });
});
