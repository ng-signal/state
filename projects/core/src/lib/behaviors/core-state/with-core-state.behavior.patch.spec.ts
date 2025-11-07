import { runInInjectionContext, signal } from '@angular/core';
import { VaultBehaviorFactoryContext } from '@ngvault/shared-models';
import { withCoreStateBehavior } from './with-core-state.behavior';

describe('Behavior: withCoreState: Patch', () => {
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
      behavior = withCoreStateBehavior({ injector, behaviorId: 'id', type: 'state' });
    });
  });

  it('should have default attributes', () => {
    expect(behavior.critical).toBeTrue();
    expect(behavior.key).toBe('NgVault::Core::State');
    expect(behavior.type).toBe('state');
  });

  it('should safely return when patch is null or not an object', () => {
    ctx.patch = null;
    behavior.onPatch?.('vault', ctx);
    expect(ctx.value()).toBeUndefined();

    ctx.patch = 42; // invalid
    behavior.onPatch?.('vault', ctx);
    expect(ctx.value()).toBeUndefined();
  });

  it('should update loading and error when provided', () => {
    ctx.patch = { loading: true, error: { message: 'fail' } };
    behavior.onPatch?.('vault', ctx);

    expect(ctx.isLoading()).toBeTrue();
    expect(ctx.error()).toEqual({ message: 'fail' });
  });

  it('should set primitive value correctly', () => {
    ctx.patch = { value: 123 };
    behavior.onPatch?.('vault', ctx);
    expect(ctx.value()).toBe(123);

    ctx.patch = { value: 'test' };
    behavior.onPatch?.('vault', ctx);
    expect(ctx.value()).toBe('test');

    ctx.patch = { value: true };
    behavior.onPatch?.('vault', ctx);
    expect(ctx.value()).toBeTrue();
  });

  it('should clone and patch arrays correctly', () => {
    const setArgs = [1, 2, 3];
    ctx.next = { value: setArgs };

    behavior.onSet?.('vault', ctx);

    const patchArgs = [1, 2, 6];
    ctx.patch = { value: patchArgs };
    behavior.onPatch?.('vault', ctx);

    expect(ctx.value()).toEqual([1, 2, 6]);
    expect(ctx.value()).not.toEqual(setArgs); // ensure immutability
  });

  it('should clone and patch plain objects correctly', () => {
    const obj = { name: 'Alice', age: 30 };
    ctx.next = { value: obj };
    behavior.onSet?.('vault', ctx);

    const patch = { name: 'Alice', age: 30 }; // simulate identical shape but new ref
    ctx.next = { value: patch };
    behavior.onPatch?.('vault', ctx);

    expect(ctx.value()).toEqual({ name: 'Alice', age: 30 });
    expect(ctx.value()).not.toBe(obj);
  });

  it('should handle multiple updates sequentially', () => {
    ctx.patch = { loading: true, value: [1, 2] };
    behavior.onPatch?.('vault', ctx);
    expect(ctx.isLoading()).toBeTrue();
    expect(ctx.value()).toEqual([1, 2]);

    ctx.patch = { loading: false, error: { message: 'done' }, value: { status: 'ok' } };
    behavior.onPatch?.('vault', ctx);

    expect(ctx.isLoading()).toBeFalse();
    expect(ctx.error()).toBeNull();
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
    behavior.onPatch?.('vault', ctx);

    expect(ctx.value()).toBeUndefined();
    expect(ctx.isLoading()).toBeFalse();
    expect(ctx.error()).toBeNull();
  });

  it('should trigger behaviorRunner.onPatch exactly once per valid patch', () => {
    const spyRunner = jasmine.createSpyObj('runner', ['onPatch']);
    ctx.behaviorRunner = spyRunner;

    ctx.patch = { value: [42] };
    behavior.onPatch?.('vault', ctx);

    expect(spyRunner.onPatch).toHaveBeenCalledTimes(1);
    expect(spyRunner.onPatch).toHaveBeenCalledWith('id', behavior.key, ctx);
  });

  it('should not trigger behaviorRunner.onPatch for invalid or HttpResourceRef patches', () => {
    const spyRunner = jasmine.createSpyObj('runner', ['onPatch']);
    ctx.behaviorRunner = spyRunner;

    ctx.next = 42; // invalid
    behavior.onPatch?.('vault', ctx);

    expect(spyRunner.onPatch).not.toHaveBeenCalled();
  });

  it('should shallow merge nested objects', () => {
    ctx.value.set({ profile: { name: 'Alice' }, meta: { age: 30 } });
    ctx.patch = { value: { profile: { city: 'Paris' } } };

    behavior.onPatch?.('vault', ctx);

    // Shallow merge: profile should be overwritten, not deeply merged
    expect(ctx.value()).toEqual({
      profile: { city: 'Paris' },
      meta: { age: 30 }
    });
  });
});
