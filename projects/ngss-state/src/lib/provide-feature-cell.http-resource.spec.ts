import { httpResource, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef, Injector, provideZonelessChangeDetection, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VaultEventBus } from './devtools/vault-event-bus';
import { ResourceVaultModel } from './models/resource-vault.model';
import { provideFeatureCell } from './provide-feature-cell';

interface TestModel {
  id: number;
  name: string;
}

describe('Provider: Feature Cell Resource', () => {
  let vault: ResourceVaultModel<TestModel[] | TestModel | number | undefined>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideZonelessChangeDetection()]
    });
    const providers = provideFeatureCell(class TestService {}, { key: 'http', initial: [] });

    const vaultFactory = (providers[0] as any).useFactory;
    runInInjectionContext(TestBed.inject(Injector), () => {
      vault = vaultFactory();
    });
  });

  describe('setState', () => {
    it('should reactively mirror HttpResourceRef signals via setState()', async () => {
      vault.setState({ loading: false, value: [{ id: 1, name: 'Ada' }], error: null });

      // initial snapshot
      expect(vault.state.isLoading()).toBeFalse();
      expect(vault.state.value()).toEqual([{ id: 1, name: 'Ada' }]);
      expect(vault.state.error()).toBeNull();
      expect(vault.state.hasValue()).toBeTrue();

      const id = signal(0);
      const mockBackend = TestBed.inject(HttpTestingController);
      const response = httpResource<TestModel[]>(() => `/data/${id()}`, { injector: TestBed.inject(Injector) });

      vault.setState(response);
      TestBed.tick();

      expect(vault.state.isLoading()).toBeTrue();
      expect(vault.state.value()).toBeUndefined();
      expect(vault.state.error()).toBeNull();
      expect(vault.state.hasValue()).toBeFalse();

      const firstRequest = mockBackend.expectOne('/data/0');
      firstRequest.flush([Object({ id: 1, name: 'Ada' }), Object({ id: 2, name: 'Grace' })]);

      await TestBed.inject(ApplicationRef).whenStable();

      expect(vault.state.isLoading()).toBeFalse();
      expect(vault.state.value()).toEqual([Object({ id: 1, name: 'Ada' }), Object({ id: 2, name: 'Grace' })]);
      expect(vault.state.error()).toBeNull();
      expect(vault.state.hasValue()).toBeTrue();

      response.reload();
      TestBed.tick();

      expect(vault.state.isLoading()).toBeTrue();
      expect(vault.state.value()).toEqual([Object({ id: 1, name: 'Ada' }), Object({ id: 2, name: 'Grace' })]);
      expect(vault.state.error()).toBeNull();
      expect(vault.state.hasValue()).toBeTrue();

      const secondRequest = mockBackend.expectOne('/data/0');
      secondRequest.flush([Object({ id: 3, name: 'Brian' })]);

      await TestBed.inject(ApplicationRef).whenStable();

      expect(vault.state.isLoading()).toBeFalse();
      expect(vault.state.value()).toEqual([Object({ id: 3, name: 'Brian' })]);
      expect(vault.state.error()).toBeNull();
      expect(vault.state.hasValue()).toBeTrue();

      response.reload();
      TestBed.tick();

      const thirdRequest = mockBackend.expectOne('/data/0');
      thirdRequest.flush('Internal Error', { status: 500, statusText: 'Server Error' });

      expect(vault.state.isLoading()).toBeTrue();
      expect(vault.state.value()).toEqual([Object({ id: 3, name: 'Brian' })]);
      expect(vault.state.error()).toBeNull();
      expect(vault.state.hasValue()).toBeTrue();

      await TestBed.inject(ApplicationRef).whenStable();

      expect(vault.state.error()).toEqual(
        Object({
          message: 'Http failure response for /data/0: 500 Server Error',
          status: 500,
          statusText: 'Server Error',
          details: 'Internal Error'
        })
      );
      expect(vault.state.isLoading()).toBeFalse();
      expect(vault.state.value()).toEqual([Object({ id: 3, name: 'Brian' })]);
      expect(vault.state.hasValue()).toBeTrue();
    });

    it('should react when underlying HttpResourceRef signals reloads', async () => {
      const id = signal(0);
      const mockBackend = TestBed.inject(HttpTestingController);
      const response = httpResource<TestModel[]>(() => `/data/${id()}`, { injector: TestBed.inject(Injector) });

      vault.setState(response);
      TestBed.tick();

      // 1st request
      const firstRequest = mockBackend.expectOne('/data/0');
      firstRequest.flush([{ id: 1, name: 'Ada' }]);
      await TestBed.inject(ApplicationRef).whenStable();

      expect(vault.state.value()).toEqual([{ id: 1, name: 'Ada' }]);
      expect(vault.state.hasValue()).toBeTrue();

      // trigger reload
      id.set(1);
      TestBed.tick();

      mockBackend.expectOne('/data/1').flush([{ id: 2, name: 'Grace' }]);
      await TestBed.inject(ApplicationRef).whenStable();

      expect(vault.state.value()).toEqual([{ id: 2, name: 'Grace' }]);
      expect(vault.state.hasValue()).toBeTrue();
    });

    it('should capture HttpResourceRef errors reactively', async () => {
      const mockBackend = TestBed.inject(HttpTestingController);
      const response = httpResource<TestModel[]>(() => '/fail', { injector: TestBed.inject(Injector) });

      vault.setState(response);
      TestBed.tick();

      const req = mockBackend.expectOne('/fail');
      req.flush('Internal Error', { status: 500, statusText: 'Server Error' });

      await TestBed.inject(ApplicationRef).whenStable();

      expect(vault.state.error()).toEqual(
        Object({
          message: 'Http failure response for /fail: 500 Server Error',
          status: 500,
          statusText: 'Server Error',
          details: 'Internal Error'
        })
      );
      expect(vault.state.isLoading()).toBeFalse();
      expect(vault.state.value()).toBeUndefined();
      expect(vault.state.hasValue()).toBeFalse();
    });

    it('should reset vault state when setState(null) is called after HttpResourceRef', async () => {
      const mockBackend = TestBed.inject(HttpTestingController);
      const response = httpResource<TestModel[]>(() => '/data', { injector: TestBed.inject(Injector) });

      vault.setState(response);
      TestBed.tick();

      mockBackend.expectOne('/data').flush([{ id: 1, name: 'Ada' }]);
      await TestBed.inject(ApplicationRef).whenStable();

      expect(vault.state.value()).toEqual([{ id: 1, name: 'Ada' }]);

      vault.setState(undefined);

      expect(vault.state.value()).toBeUndefined();
      expect(vault.state.isLoading()).toBeFalse();
      expect(vault.state.error()).toBeNull();
      expect(vault.state.hasValue()).toBeFalse();
    });

    it('should emit events from the httpResource lifecycle', async () => {
      const spy: any[] = [];
      VaultEventBus.asObservable().subscribe((event) => spy.push(event));

      const mockBackend = TestBed.inject(HttpTestingController);
      const response = httpResource<TestModel[]>(() => '/data', { injector: TestBed.inject(Injector) });

      vault.setState(response);
      TestBed.tick();

      mockBackend.expectOne('/data').flush([{ id: 1, name: 'Ada' }]);
      await TestBed.inject(ApplicationRef).whenStable();

      expect(vault.state.value()).toEqual([{ id: 1, name: 'Ada' }]);

      vault.setState(undefined);

      expect(vault.state.value()).toBeUndefined();
      expect(vault.state.isLoading()).toBeFalse();
      expect(vault.state.error()).toBeNull();
      expect(vault.state.hasValue()).toBeFalse();

      expect(spy).toEqual([
        Object({
          key: 'http',
          type: 'set',
          timestamp: jasmine.any(Number),
          payload: Object({ isLoading: true, value: undefined, error: null, hasValue: false }),
          source: 'http'
        }),
        Object({
          key: 'http',
          type: 'set',
          timestamp: jasmine.any(Number),
          payload: Object({ isLoading: false, value: [Object({ id: 1, name: 'Ada' })], error: null, hasValue: true }),
          source: 'http'
        }),
        Object({
          key: 'http',
          type: 'reset',
          timestamp: jasmine.any(Number),
          payload: Object({ isLoading: false, value: undefined, error: null, hasValue: false }),
          source: 'manual'
        })
      ]);
    });
  });

  describe('patchState', () => {
    it('should merge array data reactively from HttpResourceRef', async () => {
      // start with initial dataset
      vault.setState({ loading: false, value: [{ id: 1, name: 'Ada' }], error: null });

      const mockBackend = TestBed.inject(HttpTestingController);
      const response = httpResource<TestModel[]>(() => '/patch-array', { injector: TestBed.inject(Injector) });

      // patch the vault with a live HttpResourceRef
      vault.patchState(response);
      TestBed.tick();

      // initial reactive request
      const req = mockBackend.expectOne('/patch-array');
      req.flush([{ id: 2, name: 'Grace' }]);
      await TestBed.inject(ApplicationRef).whenStable();

      // patch merges current data with new resource array
      expect(vault.state.value()).toEqual([
        { id: 1, name: 'Ada' },
        { id: 2, name: 'Grace' }
      ]);
      expect(vault.state.isLoading()).toBeFalse();
      expect(vault.state.error()).toBeNull();
      expect(vault.state.hasValue()).toBeTrue();
    });

    it('should shallow merge object data reactively from HttpResourceRef', async () => {
      const providers = provideFeatureCell(class ObjService {}, { key: 'obj', initial: { id: 1, name: 'Ada' } });
      const vaultFactory = (providers[0] as any).useFactory;
      const objVault = runInInjectionContext(TestBed.inject(Injector), () => vaultFactory());

      const mockBackend = TestBed.inject(HttpTestingController);
      const response = httpResource<TestModel>(() => '/patch-object', { injector: TestBed.inject(Injector) });

      objVault.patchState(response);
      TestBed.tick();

      const req = mockBackend.expectOne('/patch-object');
      req.flush({ id: 1, name: 'Grace' });
      await TestBed.inject(ApplicationRef).whenStable();

      // object merge should replace only changed fields
      expect(objVault.state.value()).toEqual({ id: 1, name: 'Grace' });
      expect(objVault.state.error()).toBeNull();
      expect(objVault.state.isLoading()).toBeFalse();
      expect(vault.state.hasValue()).toBeTrue();
    });

    it('should preserve data and set error when HttpResourceRef request fails', async () => {
      vault.setState({ value: [{ id: 9, name: 'Existing' }], loading: false, error: null });

      const mockBackend = TestBed.inject(HttpTestingController);
      const response = httpResource<TestModel[]>(() => '/patch-fail', { injector: TestBed.inject(Injector) });

      vault.patchState(response);
      TestBed.tick();

      const req = mockBackend.expectOne('/patch-fail');
      req.flush('Bad request', { status: 400, statusText: 'Bad Request' });
      await TestBed.inject(ApplicationRef).whenStable();

      expect(vault.state.error()).toEqual(
        Object({
          message: 'Http failure response for /patch-fail: 400 Bad Request',
          status: 400,
          statusText: 'Bad Request',
          details: 'Bad request'
        })
      );

      // data should remain unchanged after error
      expect(vault.state.value()).toEqual([{ id: 9, name: 'Existing' }]);
      expect(vault.state.isLoading()).toBeFalse();
      expect(vault.state.hasValue()).toBeTrue();
    });

    it('should reset vault state when patchState(null) is called after HttpResourceRef', async () => {
      const mockBackend = TestBed.inject(HttpTestingController);
      const response = httpResource<TestModel[]>(() => '/patch-reset', { injector: TestBed.inject(Injector) });

      vault.patchState(response);
      TestBed.tick();

      mockBackend.expectOne('/patch-reset').flush([{ id: 1, name: 'Ada' }]);
      await TestBed.inject(ApplicationRef).whenStable();

      expect(vault.state.value()).toEqual([{ id: 1, name: 'Ada' }]);
      expect(vault.state.hasValue()).toBeTrue();

      vault.patchState(undefined);

      expect(vault.state.value()).toBeUndefined();
      expect(vault.state.isLoading()).toBeFalse();
      expect(vault.state.error()).toBeNull();
      expect(vault.state.hasValue()).toBeFalse();
    });

    it('should correctly update primitive data types from HttpResourceRef via patchState (final else path)', async () => {
      // Arrange
      const mockBackend = TestBed.inject(HttpTestingController);
      const response = httpResource<number>(() => '/primitive', { injector: TestBed.inject(Injector) });

      // Use patchState to go through the experimental HttpResourceRef branch
      vault.patchState(response);
      TestBed.tick();

      // Before response arrives, value() throws → _data should remain undefined
      expect(vault.state.value()).toEqual([]);
      expect(vault.state.isLoading()).toBeTrue();
      expect(vault.state.hasValue()).toBeTrue();

      // Simulate backend returning a primitive (final else case)
      mockBackend.expectOne('/primitive').flush(42);
      await TestBed.inject(ApplicationRef).whenStable();

      // After flush, final else executes (`_data.set(next as VaultDataType<T>)`)
      expect(vault.state.value()).toBe(42);
      expect(vault.state.isLoading()).toBeFalse();
      expect(vault.state.error()).toBeNull();
      expect(vault.state.hasValue()).toBeTrue();

      // Trigger reload → should still follow same "primitive replace" path
      response.reload();
      TestBed.tick();
      mockBackend.expectOne('/primitive').flush(7);
      await TestBed.inject(ApplicationRef).whenStable();

      expect(vault.state.value()).toBe(7);
      expect(vault.state.error()).toBeNull();
      expect(vault.state.isLoading()).toBeFalse();
      expect(vault.state.hasValue()).toBeTrue();
    });

    it('should emit events from the httpResource lifecycle', async () => {
      const spy: any[] = [];
      VaultEventBus.asObservable().subscribe((event) => spy.push(event));

      // Arrange
      const mockBackend = TestBed.inject(HttpTestingController);
      const response = httpResource<number>(() => '/primitive', { injector: TestBed.inject(Injector) });

      // Use patchState to go through the experimental HttpResourceRef branch
      vault.patchState(response);
      TestBed.tick();

      // Before response arrives, value() throws → _data should remain undefined
      expect(vault.state.value()).toEqual([]);
      expect(vault.state.isLoading()).toBeTrue();
      expect(vault.state.hasValue()).toBeTrue();

      // Simulate backend returning a primitive (final else case)
      mockBackend.expectOne('/primitive').flush(42);
      await TestBed.inject(ApplicationRef).whenStable();

      // After flush, final else executes (`_data.set(next as VaultDataType<T>)`)
      expect(vault.state.value()).toBe(42);
      expect(vault.state.isLoading()).toBeFalse();
      expect(vault.state.error()).toBeNull();
      expect(vault.state.hasValue()).toBeTrue();

      // Trigger reload → should still follow same "primitive replace" path
      response.reload();
      TestBed.tick();
      mockBackend.expectOne('/primitive').flush(7);
      await TestBed.inject(ApplicationRef).whenStable();

      expect(vault.state.value()).toBe(7);
      expect(vault.state.error()).toBeNull();
      expect(vault.state.isLoading()).toBeFalse();
      expect(vault.state.hasValue()).toBeTrue();

      expect(spy).toEqual([
        Object({
          key: 'http',
          type: 'patch',
          timestamp: jasmine.any(Number),
          payload: Object({ isLoading: false, value: 42, error: null, hasValue: true }),
          source: 'http'
        }),
        Object({
          key: 'http',
          type: 'patch',
          timestamp: jasmine.any(Number),
          payload: Object({ isLoading: true, value: 42, error: null, hasValue: true }),
          source: 'http'
        }),
        Object({
          key: 'http',
          type: 'patch',
          timestamp: jasmine.any(Number),
          payload: Object({ isLoading: false, value: 7, error: null, hasValue: true }),
          source: 'http'
        })
      ]);
    });
  });
});
