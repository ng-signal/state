import { httpResource, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef, Injector, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { getTestBehavior, provideVaultTesting, withTestBehavior } from '@ngvault/testing';
import { FeatureCell } from '../../decorators/feature-cell.decorator';
import { injectVault } from '../../injectors/feature-vault.injector';
import { resetWarnExperimentalHttpResourceTestingOnly } from '../../utils/dev-warning.util';
import { provideFeatureCell } from './provide-feature-cell';

interface TestModel {
  id: number;
  name: string;
}

@FeatureCell<TestModel[]>('cars')
class TestService {
  vault = injectVault<TestModel[]>(TestService);
}

describe('Provider: Feature Cell Resource', () => {
  let vault: any;
  let injector: any;
  let warnSpy: any;
  let mockBackend: any;

  beforeEach(() => {
    warnSpy = spyOn(console, 'warn');

    TestBed.configureTestingModule({
      providers: [
        ...provideVaultTesting(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
        TestService,
        ...provideFeatureCell(TestService, { key: 'cars', initial: [] }, [withTestBehavior])
      ]
    });

    mockBackend = TestBed.inject(HttpTestingController);
    injector = TestBed.inject(Injector);

    const testService = TestBed.inject(TestService);
    vault = testService.vault;
  });

  afterEach(() => {
    resetWarnExperimentalHttpResourceTestingOnly();
  });

  describe('setState', () => {
    it('should emit events from the httpResource lifecycle', async () => {
      let response = httpResource<TestModel[]>(() => '/data', { injector });

      vault.setState(response);
      TestBed.tick();

      mockBackend.expectOne('/data').flush([{ id: 1, name: 'Ada' }]);
      await TestBed.inject(ApplicationRef).whenStable();

      expect(vault.state.value()).toEqual([{ id: 1, name: 'Ada' }]);

      vault.setState(undefined);
      await TestBed.inject(ApplicationRef).whenStable();

      expect(vault.state.value()).toBeUndefined();
      expect(vault.state.isLoading()).toBeFalse();
      expect(vault.state.error()).toBeNull();
      expect(vault.state.hasValue()).toBeFalse();

      response = httpResource<TestModel[]>(() => '/data', { injector });

      vault.setState(response);
      TestBed.tick();

      mockBackend.expectOne('/data').flush([{ id: 2, name: 'Kai' }]);
      await TestBed.inject(ApplicationRef).whenStable();

      expect(vault.state.value()).toEqual([{ id: 2, name: 'Kai' }]);

      vault.destroy();

      expect(getTestBehavior().getEvents()).toEqual([
        'onInit:cars',
        'onInit:NgVault::Core::State',
        'onInit:NgVault::CoreHttpResource::State',
        'onInit:NgVault::Core::FromObservable',
        'onSet:cars:{"isLoading":false,"value":[],"error":null,"hasValue":true}',
        'onSet:NgVault::CoreHttpResource::State:{"isLoading":false,"value":[{"id":1,"name":"Ada"}],"error":null,"hasValue":true}',
        'onReset:cars',
        'onReset:cars',

        'onSet:cars:{"isLoading":false,"error":null,"hasValue":false}',

        'onSet:NgVault::CoreHttpResource::State:{"isLoading":true,"value":[{"id":1,"name":"Ada"}],"error":null,"hasValue":true}',

        'onSet:NgVault::CoreHttpResource::State:{"isLoading":false,"value":[{"id":2,"name":"Kai"}],"error":null,"hasValue":true}',

        'onReset:cars',
        'onReset:cars',
        'onDestroy:cars',
        'onDestroy:cars'
      ]);

      expect(warnSpy).toHaveBeenCalledWith(
        '[NgVault] Experimental HttpResource support enabled — may change in Angular 21+.'
      );
    });
  });

  describe('patchState', () => {
    it('should emit events from the httpResource lifecycle', async () => {
      // Arrange
      const mockBackend = TestBed.inject(HttpTestingController);
      const response = httpResource<number>(() => '/primitive', { injector });

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

      expect(getTestBehavior().getEvents()).toEqual([
        'onInit:cars',
        'onInit:NgVault::Core::State',
        'onInit:NgVault::CoreHttpResource::State',
        'onInit:NgVault::Core::FromObservable',
        'onPatch:cars:{"isLoading":false,"value":[],"error":null,"hasValue":true}',
        'onPatch:NgVault::CoreHttpResource::State:{"isLoading":false,"value":42,"error":null,"hasValue":true}',
        'onPatch:NgVault::CoreHttpResource::State:{"isLoading":true,"value":42,"error":null,"hasValue":true}',
        'onPatch:NgVault::CoreHttpResource::State:{"isLoading":false,"value":7,"error":null,"hasValue":true}'
      ]);

      expect(warnSpy).toHaveBeenCalledWith(
        '[NgVault] Experimental HttpResource support enabled — may change in Angular 21+.'
      );
    });
  });
});
