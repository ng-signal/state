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

  describe('patchState', () => {
    it('should have default attributes', () => {
      behavior.onInit('fake-key', 'fake-service-name', ctx);
      expect(ctx.behaviorRunner.onInit).toHaveBeenCalled();
    });

    it('should handle an onInit call', () => {
      expect(behavior.critical).toBeTrue();
      expect(behavior.key).toBe('NgVault::CoreHttpResource::State');
      expect(behavior.type).toBe('state');
    });

    it('should reactively mirror HttpResourceRef signals via patchState()', async () => {
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
      const firstRequest = mockBackend.expectOne('/data/0');
      firstRequest.flush([{ id: 2, name: 'Grace' }]);
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
      const secondRequest = mockBackend.expectOne('/data/0');
      secondRequest.flush([{ id: 3, name: 'Brian' }]);
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

      // Step 8: verify experimental warning
      expect(warnSpy).toHaveBeenCalledWith(
        '[NgVault] Experimental HttpResource support enabled — may change in Angular 21+.'
      );
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
  });
});
