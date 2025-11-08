import { httpResource, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef, Injector, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { flushNgVaultQueue, getTestBehavior, withTestBehavior } from '@ngvault/testing';
import { FeatureCell } from './decorators/feature-cell.decorator';
import { injectVault } from './injectors/feature-vault.injector';
import { provideFeatureCell } from './provide-feature-cell';
import { resetWarnExperimentalHttpResourceTestingOnly } from './utils/dev-warning.util';

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

  beforeEach(() => {
    warnSpy = spyOn(console, 'warn');
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),

        provideFeatureCell(TestService, { key: 'cars', initial: [] }, [withTestBehavior])
      ]
    });

    injector = TestBed.inject(Injector);

    const service = TestBed.inject(TestService);
    vault = service.vault;
  });

  afterEach(() => {
    resetWarnExperimentalHttpResourceTestingOnly();
  });

  describe('setState', () => {
    it('should emit events from the httpResource lifecycle', async () => {
      const mockBackend = TestBed.inject(HttpTestingController);
      const response = httpResource<TestModel[]>(() => '/data', { injector });

      vault.setState(response);
      TestBed.tick();

      mockBackend.expectOne('/data').flush([{ id: 1, name: 'Ada' }]);
      await TestBed.inject(ApplicationRef).whenStable();

      expect(vault.state.value()).toEqual([{ id: 1, name: 'Ada' }]);

      vault.setState(undefined);
      await flushNgVaultQueue(1);

      expect(vault.state.value()).toBeUndefined();
      expect(vault.state.isLoading()).toBeFalse();
      expect(vault.state.error()).toBeNull();
      expect(vault.state.hasValue()).toBeFalse();

      expect(getTestBehavior().getEvents()).toEqual([
        'onInit:cars',
        'onInit:NgVault::Core::FromObservable',
        'onSet:cars:{"isLoading":false,"value":[],"error":null,"hasValue":true}',
        'onInit:NgVault::Core::State',
        'onInit:NgVault::CoreHttpResource::State',
        'onInit:NgVault::Core::FromObservable',
        'onSet:NgVault::CoreHttpResource::State:{"isLoading":false,"value":[{"id":1,"name":"Ada"}],"error":null,"hasValue":true}',
        'onReset:cars'
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
      expect(vault.state.isLoading()).toBeFalse();
      expect(vault.state.hasValue()).toBeTrue();

      // Simulate backend returning a primitive (final else case)
      mockBackend.expectOne('/primitive').flush(42);
      await flushNgVaultQueue(1);

      // After flush, final else executes (`_data.set(next as VaultDataType<T>)`)
      expect(vault.state.value()).toBe(42);
      expect(vault.state.isLoading()).toBeFalse();
      expect(vault.state.error()).toBeNull();
      expect(vault.state.hasValue()).toBeTrue();

      // Trigger reload → should still follow same "primitive replace" path
      response.reload();
      TestBed.tick();
      mockBackend.expectOne('/primitive').flush(7);
      await flushNgVaultQueue(1);

      expect(vault.state.value()).toBe(7);
      expect(vault.state.error()).toBeNull();
      expect(vault.state.isLoading()).toBeFalse();
      expect(vault.state.hasValue()).toBeTrue();
      await flushNgVaultQueue(1);

      expect(getTestBehavior().getEvents()).toEqual([
        'onInit:cars',
        'onInit:NgVault::Core::FromObservable',
        'onPatch:cars:{"isLoading":false,"value":[],"error":null,"hasValue":true}',
        'onInit:NgVault::Core::State',
        'onInit:NgVault::CoreHttpResource::State',
        'onInit:NgVault::Core::FromObservable',
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
