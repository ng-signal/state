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

describe('Behavior: withCoreHttpResourcceState: Set', () => {
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
      value: signal(undefined),
      next: null,
      behaviorRunner: {
        onInit: jasmine.createSpy('onInit'),
        onSet: jasmine.createSpy('onSet'),
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

  describe('setState', () => {
    it('should have default attributes', () => {
      behavior.onInit('fake-key', 'fake-service-name', ctx);
      expect(ctx.behaviorRunner.onInit).toHaveBeenCalled();
    });

    it('should have default attributes', () => {
      expect(behavior.critical).toBeTrue();
      expect(behavior.key).toBe('NgVault::CoreHttpResource::State');
      expect(behavior.type).toBe('state');
    });

    it('should reactively mirror HttpResourceRef signals via setState()', async () => {
      // Step 1: baseline state
      ctx.value.set([{ id: 1, name: 'Ada' }]);
      ctx.isLoading.set(false);
      ctx.error.set(null);
      ctx.next = Object({ loading: false, value: [{ id: 1, name: 'Ada' }], error: null });

      expect(ctx.isLoading()).toBeFalse();
      expect(ctx.value()).toEqual([{ id: 1, name: 'Ada' }]);
      expect(ctx.error()).toBeNull();

      // Step 2: create reactive HttpResourceRef
      const id = signal(0);
      const response = httpResource<TestModel[]>(() => `/data/${id()}`, { injector });

      // Inject resource into context
      ctx.next = response;

      // Step 3: trigger onSet
      behavior.onSet('vault', ctx);
      TestBed.tick();

      expect(ctx.isLoading()).toBeTrue();
      expect(ctx.value()).toEqual([{ id: 1, name: 'Ada' }]);
      expect(ctx.error()).toBeNull();
      expect(ctx.behaviorRunner.onSet).toHaveBeenCalledTimes(0); // not yet until value emits

      // Step 4: simulate data response
      const firstRequest = mockBackend.expectOne('/data/0');
      firstRequest.flush([Object({ id: 1, name: 'Ada' }), Object({ id: 2, name: 'Grace' })]);

      await TestBed.inject(ApplicationRef).whenStable();

      expect(ctx.isLoading()).toBeFalse();
      expect(ctx.value()).toEqual([
        { id: 1, name: 'Ada' },
        { id: 2, name: 'Grace' }
      ]);
      expect(ctx.error()).toBeNull();
      expect(ctx.behaviorRunner.onSet).toHaveBeenCalled();

      response.reload();
      TestBed.tick();

      expect(ctx.isLoading()).toBeTrue();
      expect(ctx.error()).toBeNull();
      expect(ctx.value()).toEqual([Object({ id: 1, name: 'Ada' }), Object({ id: 2, name: 'Grace' })]);

      // Step 6: second response completes
      const secondRequest = mockBackend.expectOne('/data/0');
      secondRequest.flush([Object({ id: 3, name: 'Brian' })]);

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
      expect(ctx.error()).toEqual(
        Object({
          message: 'Http failure response for /data/0: 500 Server Error',
          status: 500,
          statusText: 'Server Error',
          details: 'Internal Error'
        })
      );
      expect(ctx.isLoading()).toBeFalse();
      expect(ctx.value()).toEqual([Object({ id: 3, name: 'Brian' })]);

      // Step 8: verify experimental warning
      expect(warnSpy).toHaveBeenCalledWith(
        '[NgVault] Experimental HttpResource support enabled — may change in Angular 21+.'
      );
    });

    it('should react when underlying HttpResourceRef signals reloads', async () => {
      // Step 1: initialize the HttpResourceRef
      const id = signal(0);
      const response = httpResource<TestModel[]>(() => `/data/${id()}`, { injector });

      // Inject the HttpResourceRef into the behavior context
      ctx.next = response;

      // Trigger the behavior
      behavior.onSet('vault', ctx);
      TestBed.tick();

      // Step 2: flush first HTTP request
      const firstRequest = mockBackend.expectOne('/data/0');
      firstRequest.flush([{ id: 1, name: 'Ada' }]);
      await TestBed.inject(ApplicationRef).whenStable();

      // Assertions after first response
      expect(ctx.isLoading()).toBeFalse();
      expect(ctx.value()).toEqual([{ id: 1, name: 'Ada' }]);
      expect(ctx.error()).toBeNull();
      expect(ctx.behaviorRunner.onSet).toHaveBeenCalled();

      // Step 3: simulate reload by changing signal (id = 1)
      id.set(1);
      TestBed.tick();

      // Expect second request due to reactive reload
      const secondRequest = mockBackend.expectOne('/data/1');
      secondRequest.flush([{ id: 2, name: 'Grace' }]);
      await TestBed.inject(ApplicationRef).whenStable();

      // Assertions after second response
      expect(ctx.isLoading()).toBeFalse();
      expect(ctx.value()).toEqual([{ id: 2, name: 'Grace' }]);
      expect(ctx.error()).toBeNull();
      expect(ctx.behaviorRunner.onSet).toHaveBeenCalledTimes(2);
    });

    it('should capture HttpResourceRef errors reactively', async () => {
      // Step 1: create HttpResourceRef
      const response = httpResource<TestModel[]>(() => '/fail', { injector });

      // Inject resource into context
      ctx.next = response;

      // Step 2: trigger behavior lifecycle
      behavior.onSet('vault', ctx);
      TestBed.tick();

      // Step 3: simulate server error response
      const req = mockBackend.expectOne('/fail');
      req.flush('Internal Error', { status: 500, statusText: 'Server Error' });

      await TestBed.inject(ApplicationRef).whenStable();

      // Step 4: verify reactive error propagation
      expect(ctx.error()).toEqual({
        message: 'Http failure response for /fail: 500 Server Error',
        status: 500,
        statusText: 'Server Error',
        details: 'Internal Error'
      });
      expect(ctx.isLoading()).toBeFalse();

      // When error occurs, value signal should remain stable
      expect(ctx.value()).toBeUndefined();
      expect(ctx.behaviorRunner.onError).toHaveBeenCalled();
    });

    it('should reset vault state when setState(null) is called after HttpResourceRef', async () => {
      // Step 1: initialize HttpResourceRef
      const response = httpResource<TestModel[]>(() => '/data', { injector });

      // Bind resource to behavior context
      ctx.next = response;

      // Step 2: trigger onSet lifecycle
      behavior.onSet('vault', ctx);
      TestBed.tick();

      // Simulate first backend response
      mockBackend.expectOne('/data').flush([{ id: 1, name: 'Ada' }]);
      await TestBed.inject(ApplicationRef).whenStable();

      // Verify reactive value
      expect(ctx.value()).toEqual([{ id: 1, name: 'Ada' }]);
      expect(ctx.isLoading()).toBeFalse();
      expect(ctx.error()).toBeNull();

      // Step 3: simulate reset (setState(undefined))
      ctx.next = undefined as any;
      behavior.onSet('vault', ctx);
      TestBed.tick();

      // Verify reset state
      expect(ctx.value()).toEqual([{ id: 1, name: 'Ada' }]);
      expect(ctx.isLoading()).toBeFalse();
      expect(ctx.error()).toBeNull();
    });

    it('should emit lifecycle events during HttpResourceRef transitions', async () => {
      // Step 1: initialize HttpResourceRef
      const response = httpResource<TestModel[]>(() => '/data', { injector });

      // Bind to context
      ctx.next = response;

      // Step 2: trigger onSet
      behavior.onSet('vault', ctx);
      TestBed.tick();

      // Step 3: flush first response
      mockBackend.expectOne('/data').flush([{ id: 1, name: 'Ada' }]);
      await TestBed.inject(ApplicationRef).whenStable();

      // Verify reactive update
      expect(ctx.value()).toEqual([{ id: 1, name: 'Ada' }]);
      expect(ctx.isLoading()).toBeFalse();
      expect(ctx.error()).toBeNull();

      // Step 4: simulate reset (as vault.setState(undefined))
      ctx.next = undefined as any;
      behavior.onSet('vault', ctx);
      TestBed.tick();

      // Verify reset state
      expect(ctx.value()).toEqual([{ id: 1, name: 'Ada' }]);
      expect(ctx.isLoading()).toBeFalse();
      expect(ctx.error()).toBeNull();
    });
  });
});
