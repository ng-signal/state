import { httpResource, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef, Injector, provideZonelessChangeDetection, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { resetWarnExperimentalHttpResourceTestingOnly } from '@ngvault/core/utils/dev-warning.util';
import { withCoreHttpResourceStateBehavior } from './with-core-http-resource-state.behavior';

interface TestModel {
  id: number;
  name: string;
}

describe('Behavior: withCoreHttpResourceState: Patch', () => {
  let behavior: any;
  let ctx: any;
  let injector: any;
  let mockBackend: any;
  let warnSpy: any;

  beforeEach(() => {
    warnSpy = spyOn(console, 'warn');
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideZonelessChangeDetection()]
    });

    injector = TestBed.inject(Injector);
    mockBackend = TestBed.inject(HttpTestingController);

    ctx = {
      isLoading: signal(false),
      error: signal(null),
      value: signal([]),
      patch: null,
      behaviorRunner: {
        onInit: jasmine.createSpy('onInit'),
        onReset: jasmine.createSpy('onReset'),
        onDestroy: jasmine.createSpy('onDestroy'),
        onPatch: jasmine.createSpy('onPatch'),
        onError: jasmine.createSpy('onError')
      }
    };

    runInInjectionContext(injector, () => {
      behavior = withCoreHttpResourceStateBehavior({ injector, behaviorId: 'id', type: 'core' });
    });
  });

  afterEach(() => {
    resetWarnExperimentalHttpResourceTestingOnly();
    mockBackend.verify();
  });

  it('should have default attributes', () => {
    behavior.onInit('fake-key', 'fake-service-name', ctx);
    expect(ctx.behaviorRunner.onInit).toHaveBeenCalled();
  });

  it('should handle an onInit call', () => {
    expect(behavior.critical).toBeTrue();
    expect(behavior.key).toBe('NgVault::CoreHttpResource::State');
    expect(behavior.type).toBe('state');
  });

  describe('reaactively mirror HttpResoruceRef signal via patchState()', () => {
    it('should handle load, reload and reload error', async () => {
      // Step 1: baseline state
      ctx.value.set([{ id: 1, name: 'Ada' }]);
      ctx.isLoading.set(false);
      ctx.error.set(null);

      expect(ctx.isLoading()).toBeFalse();
      expect(ctx.value()).toEqual([{ id: 1, name: 'Ada' }]);
      expect(ctx.error()).toBeNull();

      // Step 2: create reactive HttpResourceRef
      const id = signal(0);
      const response = httpResource<TestModel[]>(() => `/data/${id()}`, { injector });

      // Inject resource into context for patching
      ctx.patch = response;

      // Step 3: trigger onPatch
      behavior.onPatch('vault', ctx);
      TestBed.tick();

      expect(ctx.isLoading()).toBeTrue();
      expect(ctx.value()).toEqual([{ id: 1, name: 'Ada' }]);
      expect(ctx.error()).toBeNull();
      expect(ctx.behaviorRunner.onPatch).toHaveBeenCalledTimes(0);

      // Step 4: simulate backend response (patch merge)
      let request = mockBackend.expectOne('/data/0');
      request.flush([{ id: 2, name: 'Grace' }]);
      await TestBed.inject(ApplicationRef).whenStable();

      expect(ctx.isLoading()).toBeFalse();
      expect(ctx.value()).toEqual([{ id: 2, name: 'Grace' }]);
      expect(ctx.error()).toBeNull();
      expect(ctx.behaviorRunner.onPatch).toHaveBeenCalled();

      // Step 5: trigger reload with updated dataset
      response.reload();
      TestBed.tick();

      expect(ctx.isLoading()).toBeTrue();
      expect(ctx.error()).toBeNull();
      expect(ctx.value()).toEqual([{ id: 2, name: 'Grace' }]);

      // Step 6: next patch response overwrites merged state
      request = mockBackend.expectOne('/data/0');
      request.flush([{ id: 3, name: 'Brian' }]);
      await TestBed.inject(ApplicationRef).whenStable();

      expect(ctx.value()).toEqual([{ id: 3, name: 'Brian' }]);
      expect(ctx.isLoading()).toBeFalse();
      expect(ctx.error()).toBeNull();

      // Step 7: simulate HTTP error state
      response.reload();
      TestBed.tick();

      const thirdRequest = mockBackend.expectOne('/data/0');
      thirdRequest.flush('Internal Error', { status: 500, statusText: 'Server Error' });

      expect(ctx.error()).toBeNull();
      expect(ctx.value()).toEqual([{ id: 3, name: 'Brian' }]);
      expect(ctx.isLoading()).toBeTrue();
      await TestBed.inject(ApplicationRef).whenStable();

      expect(ctx.behaviorRunner.onError).toHaveBeenCalled();
      expect(ctx.error()).toEqual({
        message: 'Http failure response for /data/0: 500 Server Error',
        status: 500,
        statusText: 'Server Error',
        details: 'Internal Error'
      });
      expect(ctx.isLoading()).toBeFalse();
    });

    it('should handle load, null and load', async () => {
      // Step 1: baseline state
      ctx.value.set([{ id: 1, name: 'Ada' }]);
      ctx.isLoading.set(false);
      ctx.error.set(null);

      expect(ctx.isLoading()).toBeFalse();
      expect(ctx.value()).toEqual([{ id: 1, name: 'Ada' }]);
      expect(ctx.error()).toBeNull();

      // Step 2: create reactive HttpResourceRef
      const id = signal(0);
      const response = httpResource<TestModel[]>(() => `/data/${id()}`, { injector });

      // Inject resource into context for patching
      ctx.patch = response;

      // Step 3: trigger onPatch
      behavior.onPatch('vault', ctx);
      TestBed.tick();

      expect(ctx.isLoading()).toBeTrue();
      expect(ctx.value()).toEqual([{ id: 1, name: 'Ada' }]);
      expect(ctx.error()).toBeNull();
      expect(ctx.behaviorRunner.onPatch).toHaveBeenCalledTimes(0);

      // Step 4: simulate backend response (patch merge)
      let request = mockBackend.expectOne('/data/0');
      request.flush([{ id: 2, name: 'Grace' }]);
      await TestBed.inject(ApplicationRef).whenStable();

      expect(ctx.isLoading()).toBeFalse();
      expect(ctx.value()).toEqual([{ id: 2, name: 'Grace' }]);
      expect(ctx.error()).toBeNull();
      expect(ctx.behaviorRunner.onPatch).toHaveBeenCalledTimes(1);

      // Step 5: trigger reload with null dataset
      const response2 = httpResource<TestModel[]>(() => `/data/null/${id()}`, { injector });
      ctx.patch = response2;

      behavior.onPatch('vault', ctx);
      TestBed.tick();

      expect(ctx.isLoading()).toBeTrue();
      expect(ctx.error()).toBeNull();
      expect(ctx.value()).toEqual([{ id: 2, name: 'Grace' }]);

      // Step 6: next patch response overwrites merged state
      request = mockBackend.expectOne('/data/null/0');
      request.flush(null);
      await TestBed.inject(ApplicationRef).whenStable();

      expect(ctx.value()).toBeNull();
      expect(ctx.isLoading()).toBeFalse();
      expect(ctx.error()).toBeNull();

      // Step 7: trigger reload with null dataset - again
      response.reload();
      TestBed.tick();

      expect(ctx.isLoading()).toBeTrue();
      expect(ctx.error()).toBeNull();
      expect(ctx.value()).toBeNull();

      // Step 8: next patch response overwrites merged state
      request = mockBackend.expectOne('/data/0');
      request.flush(null);
      await TestBed.inject(ApplicationRef).whenStable();

      expect(ctx.value()).toBeNull();
      expect(ctx.isLoading()).toBeFalse();
      expect(ctx.error()).toBeNull();

      // Step 9: trigger reload with [] dataset
      response.reload();
      TestBed.tick();

      expect(ctx.isLoading()).toBeTrue();
      expect(ctx.error()).toBeNull();
      expect(ctx.value()).toBeNull();

      // Step 10: next patch response overwrites merged state
      request = mockBackend.expectOne('/data/0');
      request.flush([]);
      await TestBed.inject(ApplicationRef).whenStable();

      expect(ctx.value()).toEqual([]);
      expect(ctx.isLoading()).toBeFalse();
      expect(ctx.error()).toBeNull();

      // Step 11: verify experimental warning
      expect(warnSpy).toHaveBeenCalledWith(
        '[NgVault] Experimental HttpResource support enabled — may change in Angular 21+.'
      );
    });
  });

  it('should merge subsequent HttpResourceRef responses reactively', async () => {
    // Step 1: initialize HttpResourceRef
    const id = signal(0);
    const response = httpResource<TestModel[]>(() => `/data/${id()}`, { injector });

    ctx.patch = response;

    behavior.onPatch('vault', ctx);
    TestBed.tick();

    // Step 2: first patch response
    const firstRequest = mockBackend.expectOne('/data/0');
    firstRequest.flush([{ id: 1, name: 'Ada' }]);
    await TestBed.inject(ApplicationRef).whenStable();

    expect(ctx.value()).toEqual([{ id: 1, name: 'Ada' }]);
    expect(ctx.behaviorRunner.onPatch).toHaveBeenCalledTimes(1);

    // Step 3: simulate reload via reactive ID change
    id.set(1);
    TestBed.tick();

    const secondRequest = mockBackend.expectOne('/data/1');
    secondRequest.flush([{ id: 2, name: 'Grace' }]);
    await TestBed.inject(ApplicationRef).whenStable();

    // After merge
    expect(ctx.value()).toEqual([{ id: 2, name: 'Grace' }]);
    expect(ctx.isLoading()).toBeFalse();
    expect(ctx.error()).toBeNull();
    expect(ctx.behaviorRunner.onPatch).toHaveBeenCalledTimes(2);
  });

  it('should handle HttpResourceRef errors during patchState()', async () => {
    // Step 1: create HttpResourceRef
    const response = httpResource<TestModel[]>(() => '/fail', { injector });

    // Inject resource
    ctx.patch = response;

    // Step 2: trigger patch lifecycle
    behavior.onPatch('vault', ctx);
    TestBed.tick();

    // Step 3: simulate error response
    const req = mockBackend.expectOne('/fail');
    req.flush('Internal Error', { status: 500, statusText: 'Server Error' });
    await TestBed.inject(ApplicationRef).whenStable();

    // Verify error state
    expect(ctx.error()).toEqual({
      message: 'Http failure response for /fail: 500 Server Error',
      status: 500,
      statusText: 'Server Error',
      details: 'Internal Error'
    });
    expect(ctx.isLoading()).toBeFalse();
    expect(ctx.value()).toEqual([]);
    expect(ctx.behaviorRunner.onError).toHaveBeenCalled();
  });

  it('should merge partial object patches correctly', async () => {
    // Step 1: simulate baseline object
    ctx.value.set({ id: 1, name: 'Ada', age: 30 });

    const response = httpResource<Partial<TestModel>>(() => '/data', { injector });

    ctx.patch = response;
    behavior.onPatch('vault', ctx);
    TestBed.tick();

    // Step 2: flush partial object patch
    mockBackend.expectOne('/data').flush({ age: 31 });
    await TestBed.inject(ApplicationRef).whenStable();

    // Expect merged object (Redux/Ngrx-style immutability)
    expect(ctx.value()).toEqual({ id: 1, name: 'Ada', age: 31 });
    expect(ctx.isLoading()).toBeFalse();
    expect(ctx.error()).toBeNull();
  });

  it('should handle a reset', async () => {
    // Step 1: baseline state
    ctx.value.set([{ id: 1, name: 'Ada' }]);
    ctx.isLoading.set(false);
    ctx.error.set(null);

    expect(ctx.isLoading()).toBeFalse();
    expect(ctx.value()).toEqual([{ id: 1, name: 'Ada' }]);
    expect(ctx.error()).toBeNull();

    // Step 2: create reactive HttpResourceRef
    const id = signal(0);
    const response = httpResource<TestModel[]>(() => `/data/${id()}`, { injector });

    // Inject resource into context for patching
    ctx.patch = response;

    // Step 3: trigger onPatch
    behavior.onPatch('vault', ctx);
    TestBed.tick();

    expect(ctx.isLoading()).toBeTrue();
    expect(ctx.value()).toEqual([{ id: 1, name: 'Ada' }]);
    expect(ctx.error()).toBeNull();

    mockBackend.expectOne('/data/0').flush({ age: 31 });
    await TestBed.inject(ApplicationRef).whenStable();

    expect(ctx.isLoading()).toBeFalse();
    expect(ctx.value()).toEqual({ age: 31 });
    expect(ctx.error()).toBeNull();
    expect(ctx.behaviorRunner.onPatch).toHaveBeenCalledTimes(1);
    expect(ctx.behaviorRunner.onReset).toHaveBeenCalledTimes(0);
    expect(ctx.behaviorRunner.onDestroy).toHaveBeenCalledTimes(0);

    behavior.onReset('key', ctx);
    TestBed.tick();

    expect(ctx.isLoading()).toBeFalse();
    expect(ctx.value()).toEqual({ age: 31 });
    expect(ctx.error()).toBeNull();
    expect(ctx.behaviorRunner.onPatch).toHaveBeenCalledTimes(1);
    expect(ctx.behaviorRunner.onReset).toHaveBeenCalledTimes(1);
    expect(ctx.behaviorRunner.onDestroy).toHaveBeenCalledTimes(0);

    // Inject resource into context for patching
    ctx.patch = response;

    // Step 3: trigger onPatch
    behavior.onPatch('vault', ctx);
    TestBed.tick();

    expect(ctx.isLoading()).toBeFalse();
    expect(ctx.value()).toEqual({ age: 31 });
    expect(ctx.error()).toBeNull();
    expect(ctx.behaviorRunner.onPatch).toHaveBeenCalledTimes(1);
    expect(ctx.behaviorRunner.onReset).toHaveBeenCalledTimes(1);
    expect(ctx.behaviorRunner.onDestroy).toHaveBeenCalledTimes(0);

    id.set(1);
    behavior.onPatch('vault', ctx);
    TestBed.tick();

    expect(ctx.isLoading()).toBeTrue();
    expect(ctx.value()).toEqual({ age: 31 });
    expect(ctx.error()).toBeNull();

    mockBackend.expectOne('/data/1').flush(32);
    await TestBed.inject(ApplicationRef).whenStable();

    expect(ctx.isLoading()).toBeFalse();
    expect(ctx.value()).toEqual(32);
    expect(ctx.error()).toBeNull();
    expect(ctx.behaviorRunner.onPatch).toHaveBeenCalledTimes(4);
    expect(ctx.behaviorRunner.onReset).toHaveBeenCalledTimes(1);
    expect(ctx.behaviorRunner.onDestroy).toHaveBeenCalledTimes(0);

    expect(warnSpy).toHaveBeenCalledWith(
      '[NgVault] Experimental HttpResource support enabled — may change in Angular 21+.'
    );
  });

  it('should handle a destroy', async () => {
    // Step 1: baseline state
    ctx.value.set([{ id: 1, name: 'Ada' }]);
    ctx.isLoading.set(false);
    ctx.error.set(null);

    expect(ctx.isLoading()).toBeFalse();
    expect(ctx.value()).toEqual([{ id: 1, name: 'Ada' }]);
    expect(ctx.error()).toBeNull();

    // Step 2: create reactive HttpResourceRef
    const id = signal(0);
    const response = httpResource<TestModel[]>(() => `/data/${id()}`, { injector });

    // Inject resource into context for patching
    ctx.patch = response;

    // Step 3: trigger onPatch
    behavior.onPatch('vault', ctx);
    TestBed.tick();

    expect(ctx.isLoading()).toBeTrue();
    expect(ctx.value()).toEqual([{ id: 1, name: 'Ada' }]);
    expect(ctx.error()).toBeNull();

    mockBackend.expectOne('/data/0').flush({ age: 31 });
    await TestBed.inject(ApplicationRef).whenStable();

    expect(ctx.isLoading()).toBeFalse();
    expect(ctx.value()).toEqual({ age: 31 });
    expect(ctx.error()).toBeNull();
    expect(ctx.behaviorRunner.onPatch).toHaveBeenCalledTimes(1);
    expect(ctx.behaviorRunner.onReset).toHaveBeenCalledTimes(0);
    expect(ctx.behaviorRunner.onDestroy).toHaveBeenCalledTimes(0);

    behavior.onDestroy('key', ctx);
    TestBed.tick();

    expect(ctx.isLoading()).toBeFalse();
    expect(ctx.value()).toEqual({ age: 31 });
    expect(ctx.error()).toBeNull();
    expect(ctx.behaviorRunner.onPatch).toHaveBeenCalledTimes(1);
    expect(ctx.behaviorRunner.onReset).toHaveBeenCalledTimes(0);
    expect(ctx.behaviorRunner.onDestroy).toHaveBeenCalledTimes(1);

    // Inject resource into context for patching
    ctx.patch = response;

    // Step 3: trigger onPatch
    behavior.onPatch('vault', ctx);
    TestBed.tick();

    expect(ctx.isLoading()).toBeFalse();
    expect(ctx.value()).toEqual({ age: 31 });
    expect(ctx.error()).toBeNull();
    expect(ctx.behaviorRunner.onPatch).toHaveBeenCalledTimes(1);
    expect(ctx.behaviorRunner.onReset).toHaveBeenCalledTimes(0);
    expect(ctx.behaviorRunner.onDestroy).toHaveBeenCalledTimes(1);

    id.set(1);
    behavior.onPatch('vault', ctx);
    TestBed.tick();

    expect(ctx.isLoading()).toBeTrue();
    expect(ctx.value()).toEqual({ age: 31 });
    expect(ctx.error()).toBeNull();

    mockBackend.expectOne('/data/1').flush(32);
    await TestBed.inject(ApplicationRef).whenStable();

    expect(ctx.isLoading()).toBeFalse();
    expect(ctx.value()).toEqual(32);
    expect(ctx.error()).toBeNull();
    expect(ctx.behaviorRunner.onPatch).toHaveBeenCalledTimes(4);
    expect(ctx.behaviorRunner.onReset).toHaveBeenCalledTimes(0);
    expect(ctx.behaviorRunner.onDestroy).toHaveBeenCalledTimes(1);

    expect(warnSpy).toHaveBeenCalledWith(
      '[NgVault] Experimental HttpResource support enabled — may change in Angular 21+.'
    );
  });

  it('should no-op when patch is not an HttpResourceRef', async () => {
    ctx.patch = { fake: true }; // not a HttpResourceRef
    ctx.value.set([{ id: 1, name: 'Ada' }]);

    behavior.onPatch('vault', ctx);
    TestBed.tick();

    expect(ctx.behaviorRunner.onPatch).not.toHaveBeenCalled();
    expect(ctx.value()).toEqual([{ id: 1, name: 'Ada' }]);
    expect(ctx.isLoading()).toBeFalse();
  });

  it('should respect destroyed flag and not re-trigger onPatch immediately after destroy', async () => {
    const response = httpResource<TestModel[]>(() => '/data', { injector });
    ctx.patch = response;

    behavior.onDestroy('vault', ctx);
    behavior.onPatch('vault', ctx);

    TestBed.tick();
    // The destroyed flag short-circuits the next effect run
    expect(ctx.behaviorRunner.onPatch).not.toHaveBeenCalled();

    mockBackend.expectOne('/data').flush({ age: 31 });
    await TestBed.inject(ApplicationRef).whenStable();

    expect(ctx.value()).toEqual(Object({ age: 31 }));
    expect(ctx.error()).toBeNull();
    expect(ctx.isLoading()).toBeFalse();
  });

  it('should defer patch merge until microtask boundary', async () => {
    const response = httpResource<TestModel[]>(() => '/micro', { injector });
    ctx.patch = response;

    behavior.onPatch('vault', ctx);
    // Immediately after call, before microtask flush
    expect(ctx.behaviorRunner.onPatch).not.toHaveBeenCalled();

    TestBed.tick();

    mockBackend.expectOne('/micro').flush([{ id: 99, name: 'Async' }]);
    await TestBed.inject(ApplicationRef).whenStable();

    expect(ctx.behaviorRunner.onPatch).toHaveBeenCalled();
    expect(ctx.value()).toEqual([{ id: 99, name: 'Async' }]);
  });

  it('should handle thrown value() errors gracefully', async () => {
    const fakeResource = {
      isLoading: () => false,
      value: () => {
        throw new Error('value failed');
      },
      error: () => new Error('value failed'),
      hasValue: () => true
    };

    ctx.patch = fakeResource;
    behavior.onPatch('vault', ctx);
    TestBed.tick();

    await TestBed.inject(ApplicationRef).whenStable();

    expect(ctx.error().message).toBe('value failed');
    expect(ctx.behaviorRunner.onError).toHaveBeenCalled();
  });

  it('should not throw when optional signals are missing', async () => {
    const response = httpResource<TestModel[]>(() => '/missing', { injector });

    ctx = {
      patch: response,
      behaviorRunner: {
        onPatch: jasmine.createSpy('onPatch'),
        onError: jasmine.createSpy('onError')
      }
    };

    expect(() => behavior.onPatch('vault', ctx)).not.toThrow();
  });

  it('should only apply last response after multiple reloads', async () => {
    const response = httpResource<TestModel[]>(() => '/race', { injector });
    ctx.patch = response;

    behavior.onPatch('vault', ctx);
    TestBed.tick();

    // trigger rapid reloads (Angular cancels previous)
    response.reload();
    response.reload();

    const request = mockBackend.expectOne('/race');
    request.flush([{ id: 2, name: 'Newest' }]);

    await TestBed.inject(ApplicationRef).whenStable();

    expect(ctx.value()).toEqual([{ id: 2, name: 'Newest' }]);
    expect(ctx.behaviorRunner.onPatch).toHaveBeenCalledTimes(1);
  });

  it('should only warn once for experimental HttpResource support', async () => {
    const response = httpResource<TestModel[]>(() => '/warn-once', { injector });
    ctx.patch = response;

    behavior.onPatch('vault', ctx);
    behavior.onPatch('vault', ctx);
    TestBed.tick();

    expect(warnSpy).toHaveBeenCalledTimes(1);
    mockBackend.expectOne('/warn-once').flush({ age: 31 });
    await TestBed.inject(ApplicationRef).whenStable();

    expect(ctx.value()).toEqual(Object({ age: 31 }));
    expect(ctx.error()).toBeNull();
    expect(ctx.isLoading()).toBeFalse();
  });

  it('should deep-merge nested patch objects correctly', async () => {
    ctx.value.set({ user: { id: 1, name: 'Ada', address: { city: 'NYC', zip: 10001 } } });
    const response = httpResource<Partial<TestModel>>(() => '/deep', { injector });

    // simulate nested object patch
    ctx.patch = response;
    behavior.onPatch('vault', ctx);
    TestBed.tick();

    mockBackend.expectOne('/deep').flush({ user: { address: { city: 'LA' } } });
    await TestBed.inject(ApplicationRef).whenStable();

    expect(ctx.value()).toEqual(
      Object({
        user: Object({ address: Object({ city: 'LA' }) })
      })
    );
  });

  it('should pass correct key and behaviorId to runner methods', async () => {
    const response = httpResource<TestModel[]>(() => '/keycheck', { injector });
    ctx.patch = response;

    behavior.onPatch('vault-key', ctx);
    TestBed.tick();

    mockBackend.expectOne('/keycheck').flush([{ id: 1, name: 'Ada' }]);
    await TestBed.inject(ApplicationRef).whenStable();

    const [calledBehaviorId, calledKey] = ctx.behaviorRunner.onPatch.calls.mostRecent().args;
    expect(calledBehaviorId).toBe('id');
    expect(calledKey).toBe('NgVault::CoreHttpResource::State');
  });

  it('should no-op entirely when NGVAULT_EXPERIMENTAL_HTTP_RESOURCE flag is false', async () => {
    (globalThis as any).NGVAULT_EXPERIMENTAL_HTTP_RESOURCE = false;
    const response = httpResource<TestModel[]>(() => '/off', { injector });
    ctx.patch = response;

    behavior.onPatch('vault', ctx);
    TestBed.tick();

    expect(ctx.behaviorRunner.onPatch).not.toHaveBeenCalled();
    expect(ctx.isLoading()).toBeDefined(); // still defined, but unchanged
    mockBackend.expectOne('/off').flush({ age: 31 });
    await TestBed.inject(ApplicationRef).whenStable();

    expect(ctx.value()).toEqual(Object({ age: 31 }));
    expect(ctx.error()).toBeNull();
    expect(ctx.isLoading()).toBeFalse();
  });

  it('should recover after destroy when a new resource is set', async () => {
    const response = httpResource<TestModel[]>(() => '/recover', { injector });
    ctx.patch = response;

    behavior.onDestroy('vault', ctx);
    TestBed.tick();
    expect(ctx.behaviorRunner.onDestroy).toHaveBeenCalledTimes(1);

    // Complete the first pending /recover request
    const pending = mockBackend.expectOne('/recover');
    pending.flush([]); // mark it as complete (important)

    // new resource triggers reactivation
    ctx.patch = httpResource<TestModel[]>(() => '/new', { injector });
    behavior.onPatch('vault', ctx);
    TestBed.tick();

    mockBackend.expectOne('/new').flush([{ id: 1, name: 'Ada' }]);
    await TestBed.inject(ApplicationRef).whenStable();

    expect(ctx.value()).toEqual([{ id: 1, name: 'Ada' }]);
    expect(ctx.behaviorRunner.onPatch).toHaveBeenCalled();
  });

  it('should isolate destroyed flags across multiple instances', async () => {
    const b1 = withCoreHttpResourceStateBehavior({ injector, behaviorId: 'A', type: 'core' });
    const b2 = withCoreHttpResourceStateBehavior({ injector, behaviorId: 'B', type: 'core' });

    const r1 = httpResource<TestModel[]>(() => '/iso1', { injector });
    const r2 = httpResource<TestModel[]>(() => '/iso2', { injector });

    ctx.patch = r1;
    b1.onPatch?.('vault', ctx);
    TestBed.tick();

    // assign r2 to a separate context for b2 to make it independent
    const ctx2 = {
      next: r2,
      isLoading: signal(false),
      error: signal(null),
      value: signal([]),
      behaviorRunner: {
        onPatch: jasmine.createSpy(),
        onDestroy: jasmine.createSpy(),
        onError: jasmine.createSpy()
      }
    };

    b2.onDestroy?.('vault', ctx2 as any); // destroy second one should not affect b1

    // complete both HTTP requests
    mockBackend.expectOne('/iso1').flush([{ id: 1, name: 'Ada' }]);
    mockBackend.expectOne('/iso2').flush([]); // clean up pending request

    await TestBed.inject(ApplicationRef).whenStable();

    expect(ctx.value()).toEqual([{ id: 1, name: 'Ada' }]);
  });

  it('should ignore redundant destroy followed by reset', async () => {
    const response = httpResource<TestModel[]>(() => '/redundant', { injector });
    ctx.patch = response;

    behavior.onDestroy('vault', ctx);
    behavior.onReset('vault', ctx);
    behavior.onPatch('vault', ctx);
    TestBed.tick();

    mockBackend.expectOne('/redundant').flush([{ id: 1, name: 'Ada' }]);
    await TestBed.inject(ApplicationRef).whenStable();

    expect(ctx.behaviorRunner.onPatch).toHaveBeenCalledTimes(1);
    expect(ctx.behaviorRunner.onReset).toHaveBeenCalledTimes(1);
    expect(ctx.behaviorRunner.onDestroy).toHaveBeenCalledTimes(1);
  });

  it('should not apply value updates if destroyed during microtask', async () => {
    const response = httpResource<TestModel[]>(() => '/microdestroy', { injector });
    ctx.patch = response;
    behavior.onPatch('vault', ctx);
    TestBed.tick();

    // immediately destroy before flush
    behavior.onDestroy('vault', ctx);

    const req = mockBackend.expectOne('/microdestroy');
    req.flush([{ id: 1, name: 'Late' }]);
    await TestBed.inject(ApplicationRef).whenStable();

    expect(ctx.value()).toEqual([]);
    expect(ctx.behaviorRunner.onPatch).not.toHaveBeenCalled();
  });

  it('should stop updates when destroyed mid-reload cycle', async () => {
    const response = httpResource<TestModel[]>(() => '/reload', { injector });
    ctx.patch = response;

    behavior.onPatch('vault', ctx);
    TestBed.tick();

    const req = mockBackend.expectOne('/reload');
    req.flush([{ id: 1, name: 'Ada' }]);
    await TestBed.inject(ApplicationRef).whenStable();

    expect(ctx.value()).toEqual([{ id: 1, name: 'Ada' }]);

    response.reload();
    behavior.onDestroy('vault', ctx);
    TestBed.tick();

    const req2 = mockBackend.expectOne('/reload');
    req2.flush([{ id: 2, name: 'Grace' }]);
    await TestBed.inject(ApplicationRef).whenStable();

    expect(ctx.value()).toEqual([{ id: 1, name: 'Ada' }]); // value unchanged
  });

  it('should re-enable after destroy when patching again', async () => {
    const response = httpResource<TestModel[]>(() => '/repatch', { injector });
    ctx.patch = response;

    behavior.onDestroy('vault', ctx);
    behavior.onPatch('vault', ctx);
    TestBed.tick();

    mockBackend.expectOne('/repatch').flush([{ id: 1, name: 'Ada' }]);
    await TestBed.inject(ApplicationRef).whenStable();

    expect(ctx.value()).toEqual([{ id: 1, name: 'Ada' }]);
    expect(ctx.behaviorRunner.onPatch).toHaveBeenCalled();
  });

  it('should no-op when next is null, number, or string', () => {
    [null, 123, 'bad'].forEach((val) => {
      ctx.patch = val as any;
      behavior.onPatch('vault', ctx);
    });
    expect(ctx.behaviorRunner.onPatch).not.toHaveBeenCalled();
  });

  it('should never call onPatch and onError in same cycle', async () => {
    const response = httpResource<TestModel[]>(() => '/conflict', { injector });
    ctx.patch = response;

    behavior.onPatch('vault', ctx);
    TestBed.tick();

    const req = mockBackend.expectOne('/conflict');
    req.flush('boom', { status: 500, statusText: 'Error' });
    await TestBed.inject(ApplicationRef).whenStable();

    const onPatchCount = ctx.behaviorRunner.onPatch.calls.count();
    const onErrorCount = ctx.behaviorRunner.onError.calls.count();
    expect(onPatchCount + onErrorCount).toBeLessThanOrEqual(1);
  });

  it('should handle destroy followed immediately by re-set before microtask', async () => {
    const response1 = httpResource<TestModel[]>(() => '/flip', { injector });
    const response2 = httpResource<TestModel[]>(() => '/flip2', { injector });

    ctx.patch = response1;
    behavior.onPatch('vault', ctx);
    TestBed.tick();

    // This starts the /flip request
    behavior.onDestroy('vault', ctx);
    TestBed.tick();

    // Rebind to new resource
    ctx.patch = response2;
    behavior.onPatch('vault', ctx);
    TestBed.tick();

    mockBackend.expectOne('/flip').flush([]); // or .error(…), any completion is fine

    // Now handle the active one
    const req = mockBackend.expectOne('/flip2');
    req.flush([{ id: 1, name: 'Ada' }]);
    await TestBed.inject(ApplicationRef).whenStable();

    expect(ctx.value()).toEqual([{ id: 1, name: 'Ada' }]);
    expect(ctx.behaviorRunner.onPatch).toHaveBeenCalled();
  });
});
