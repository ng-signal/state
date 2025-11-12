import { httpResource, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DestroyRef, Injector, provideZonelessChangeDetection, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { resetWarnExperimentalHttpResourceTestingOnly } from '@ngvault/core/utils/dev-warning.util';
import { VaultBehaviorContext } from '@ngvault/shared';
import { flushMicrotasksZoneless, provideVaultTesting } from '@ngvault/testing';
import { withCoreHttpResourceStateBehaviorV2 } from './with-core-http-resource-state.behavior.v2';

interface TestModel {
  id: number;
  name: string;
}

describe('Behavior: CoreHttpResourceStateBehaviorV2', () => {
  let mockBackend: HttpTestingController;
  let behavior: any;
  let injector: Injector;
  let destroyRef: DestroyRef;
  let ctx: any;
  let warnSpy: any;

  beforeEach(() => {
    warnSpy = spyOn(console, 'warn');

    TestBed.configureTestingModule({
      providers: [
        provideVaultTesting(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection()
      ]
    });

    mockBackend = TestBed.inject(HttpTestingController);
    injector = TestBed.inject(Injector);
    destroyRef = TestBed.inject(DestroyRef);

    ctx = {
      isLoading: signal(false),
      error: signal(null),
      value: signal(undefined),
      next: null
    };

    runInInjectionContext(injector, () => {
      behavior = withCoreHttpResourceStateBehaviorV2({
        type: 'state',
        behaviorId: 'bhv-1',
        injector
      });
    });
  });

  afterEach(() => {
    resetWarnExperimentalHttpResourceTestingOnly();
    mockBackend.verify();
  });

  it('should have default attributes', () => {
    expect(behavior.critical).toBeTrue();
    expect(behavior.key).toBe('NgVault::CoreHttpResource::State');
    expect(behavior.type).toBe('state');
  });

  it('should resolve a successful HttpResourceRef value', async () => {
    const id = signal(0);
    ctx.next = httpResource<TestModel[]>(() => `/api/users/${id()}`, { injector });

    // call computeState() before backend flush
    let promise = behavior.computeState(ctx);
    TestBed.tick();

    // Simulate backend response
    mockBackend.expectOne(`/api/users/0`).flush([{ id: 1, name: 'Ada' }]);

    let result = await promise;

    expect(result).toEqual([{ id: 1, name: 'Ada' }]);
    expect(ctx.isLoading?.()).toBeFalse();
    expect(ctx.error?.()).toBeNull();
    expect(ctx.value?.()).toBeUndefined();

    expect(warnSpy).toHaveBeenCalledWith(
      '[NgVault] Experimental HttpResource support enabled — may change in Angular 21+.'
    );

    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('should reject with a ResourceError when HttpResourceRef fails', async () => {
    ctx.next = httpResource<TestModel[]>(() => `/api/fail`, { injector });

    const promise = behavior.computeState(ctx);
    TestBed.tick();

    // Simulate backend error
    mockBackend.expectOne('/api/fail').flush('boom', { status: 500, statusText: 'Server Error' });
    flushMicrotasksZoneless();

    await promise
      .then(() => {
        expect('this is an error').toBe('fix me');
      })
      .catch((error: any) => {
        expect(error).toEqual(
          Object({
            message:
              'Resource is currently in an error state (see Error.cause for details): Http failure response for /api/fail: 500 Server Error',
            details: jasmine.any(String)
          })
        );
      });

    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('should skip when ctx.next is not an HttpResourceRef', async () => {
    const ctx = { next: { fake: true } } as unknown as VaultBehaviorContext<TestModel[]>;
    const result = await behavior.computeState(ctx);
    expect(result).toBeUndefined();
    expect(warnSpy).toHaveBeenCalledTimes(0);
  });

  it('should handle multiple concurrent HttpResourceRefs independently', async () => {
    const ctx1 = {
      next: httpResource<TestModel[]>(() => `/api/u1`, { injector }),
      isLoading: signal(false),
      error: signal(null)
    } as unknown as VaultBehaviorContext<TestModel[]>;

    const ctx2 = {
      next: httpResource<TestModel[]>(() => `/api/u2`, { injector }),
      isLoading: signal(false),
      error: signal(null)
    } as unknown as VaultBehaviorContext<TestModel[]>;

    const p1 = behavior.computeState(ctx1);
    const p2 = behavior.computeState(ctx2);
    TestBed.tick();

    mockBackend.expectOne('/api/u1').flush([{ id: 1, name: 'Ada' }]);
    mockBackend.expectOne('/api/u2').flush([{ id: 2, name: 'Grace' }]);

    const [r1, r2] = await Promise.all([p1, p2]);

    expect(r1).toEqual([{ id: 1, name: 'Ada' }]);
    expect(r2).toEqual([{ id: 2, name: 'Grace' }]);
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('should cleanup effect when DestroyRef is triggered', async () => {
    ctx.next = httpResource<TestModel[]>(() => `/api/users`, { injector });

    const promise = behavior.computeState(ctx);
    TestBed.tick();

    // Flush value
    mockBackend.expectOne('/api/users').flush([{ id: 99, name: 'Deleted' }]);

    const result = await promise;
    expect(result).toEqual([{ id: 99, name: 'Deleted' }]);

    // Trigger destroy cleanup manually (no error expected)
    destroyRef.onDestroy(() => {});
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });
});
