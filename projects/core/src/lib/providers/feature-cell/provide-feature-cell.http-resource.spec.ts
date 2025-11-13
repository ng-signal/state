import { httpResource, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef, Injector, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgVaultEventBus } from '@ngvault/dev-tools';
import { createTestEventListener, flushMicrotasksZoneless, provideVaultTesting } from '@ngvault/testing';
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

  const emitted: any[] = [];
  let stopListening: any;
  let eventBus: any;

  beforeEach(() => {
    warnSpy = spyOn(console, 'warn');

    TestBed.configureTestingModule({
      providers: [
        ...provideVaultTesting(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
        TestService,
        ...provideFeatureCell(TestService, { key: 'cars', initial: [] }, [])
      ]
    });

    mockBackend = TestBed.inject(HttpTestingController);
    injector = TestBed.inject(Injector);

    const testService = TestBed.inject(TestService);
    vault = testService.vault;

    eventBus = TestBed.inject(NgVaultEventBus);
    stopListening = createTestEventListener(eventBus, emitted);
  });

  afterEach(() => {
    resetWarnExperimentalHttpResourceTestingOnly();

    stopListening();
  });

  describe('replaceState', () => {
    it('should emit events from the httpResource lifecycle', async () => {
      let response = httpResource<TestModel[]>(() => '/data', { injector });

      vault.replaceState(response);
      TestBed.tick();

      expect(vault.state.value()).toEqual([]);
      expect(vault.state.isLoading()).toBeTrue();
      expect(vault.state.error()).toBeNull();
      expect(vault.state.hasValue()).toBeTrue();

      mockBackend.expectOne('/data').flush([{ id: 1, name: 'Ada' }]);
      TestBed.tick();
      await flushMicrotasksZoneless();

      expect(vault.state.value()).toEqual([{ id: 1, name: 'Ada' }]);
      expect(vault.state.isLoading()).toBeFalse();
      expect(vault.state.error()).toBeNull();
      expect(vault.state.hasValue()).toBeTrue();

      vault.replaceState(undefined);
      TestBed.tick();

      expect(vault.state.value()).toBeUndefined();
      expect(vault.state.isLoading()).toBeFalse();
      expect(vault.state.error()).toBeNull();
      expect(vault.state.hasValue()).toBeFalse();

      response = httpResource<TestModel[]>(() => '/data', { injector });

      vault.replaceState(response);
      TestBed.tick();

      mockBackend.expectOne('/data').flush([{ id: 2, name: 'Kai' }]);
      await flushMicrotasksZoneless();

      expect(vault.state.value()).toEqual([{ id: 2, name: 'Kai' }]);

      vault.destroy();
      TestBed.tick();
      await flushMicrotasksZoneless();

      expect(emitted).toEqual([]);

      expect(warnSpy).toHaveBeenCalledWith(
        '[NgVault] Experimental HttpResource support enabled — may change in Angular 21+.'
      );
    });
  });

  describe('mergeState', () => {
    it('should emit events from the httpResource lifecycle', async () => {
      // Arrange
      const mockBackend = TestBed.inject(HttpTestingController);
      const response = httpResource<number>(() => '/primitive', { injector });

      // Use mergeState to go through the experimental HttpResourceRef branch
      vault.mergeState(response);
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

      expect(emitted).toEqual([]);

      expect(warnSpy).toHaveBeenCalledWith(
        '[NgVault] Experimental HttpResource support enabled — may change in Angular 21+.'
      );
    });
  });
});
