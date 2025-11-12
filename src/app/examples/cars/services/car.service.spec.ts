import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CarService } from './car.service';

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideFeatureCell } from '@ngvault/core';
import { provideVaultTesting } from '@ngvault/testing';
import { getCarData } from 'src/testing/data/car.data';

describe('Service: Car State', () => {
  let service: CarService;
  let mockHttpClient: HttpTestingController;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      providers: [
        provideVaultTesting(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
        provideFeatureCell(CarService, {
          key: 'cars',
          initial: null // initial vault state shape
        })
      ]
    });

    service = TestBed.inject(CarService);
    mockHttpClient = TestBed.inject(HttpTestingController);
  });

  describe('cars', () => {
    it('should reflect cars() based on current state', () => {
      const carList = service.cars();

      expect(carList.value()).toBeUndefined();
      expect(carList.isLoading()).toBeTrue();
      expect(carList.error()).toBeNull();

      const result = mockHttpClient.expectOne('/api/cars');
      expect(result.request.method).toBe('GET');

      result.flush(getCarData(0, true));

      expect(carList.value()).toEqual([Object({ id: '1', year: 2022, make: 'Tesla', model: 'Model 3' })]);

      expect(carList.isLoading()).toBeFalse();
      expect(carList.error()).toBeNull();
    });
  });

  describe('loadcars()', () => {
    it('should set loading to true, then set cars on success', () => {
      service.loadCars();

      const state = service.cars();

      expect(state.value()).toBeUndefined();
      expect(state.isLoading()).toBeTrue();
      expect(state.error()).toBeNull();

      const result = mockHttpClient.expectOne('/api/cars');
      expect(result.request.method).toBe('GET');
      result.flush(getCarData(0, true));

      expect(state.value()).toEqual([Object({ id: '1', year: 2022, make: 'Tesla', model: 'Model 3' })]);
      expect(state.hasValue()).toBeTrue();

      expect(state.isLoading()).toBeFalse();
      expect(state.error()).toBeNull();
    });

    it('should set error when http fails', () => {
      service.loadCars();

      const state = service.cars();

      expect(state.value()).toBeUndefined();
      expect(state.hasValue()).toBeFalse();
      expect(state.isLoading()).toBeTrue();
      expect(state.error()).toBeNull();

      const result = mockHttpClient.expectOne('/api/cars');
      expect(result.request.method).toBe('GET');

      result.flush(
        { message: 'Internal Server Error' }, // response body
        {
          status: 500,
          statusText: 'Server Error'
        }
      );

      expect(state.value()).toBeUndefined();
      expect(state.hasValue()).toBeFalse();
      expect(state.isLoading()).toBeFalse();
      const err = state.error();
      expect(err?.status).toBe(500);
      expect(err?.statusText).toBe('Server Error');
      expect(err?.message).toBe('Http failure response for /api/cars: 500 Server Error');
      expect(err?.details).toEqual(Object({ message: 'Internal Server Error' }));
    });
  });

  it('should handle a resetCars', async () => {
    spyOn(service['vault'], 'reset');
    expect(service['isLoaded']()).toBeFalse();

    service.resetCars();

    expect(service['vault'].reset).toHaveBeenCalledWith();
    expect(service['isLoaded']()).toBeFalse();
  });

  it('should handle a reloadcar', async () => {
    spyOn(service['vault'], 'reset');
    (service as any).isLoaded.set(true);

    service.reloadCars();
    TestBed.tick();

    expect(service['vault'].reset).not.toHaveBeenCalled();
    expect(service['isLoaded']()).toBeTrue();
  });

  it('should handle a reactiveReloadCars', async () => {
    spyOn(service['vault'], 'reset');
    (service as any).isLoaded.set(true);

    service.reactiveReloadCars();

    expect(service['vault'].reset).toHaveBeenCalledWith();
    expect(service['isLoaded']()).toBeFalse();
  });

  describe('carsWithDescriptions', () => {
    it('should return [] when vault state has no cars', () => {
      const result = service.carsWithDescriptions();
      expect(result).toEqual([]);
    });

    it('should compute reversed names when vault state is populated', () => {
      const testcars = getCarData() as any;

      // Act: update vault (this is the real reactive store)
      service['vault'].replaceState({
        loading: false,
        value: testcars,
        error: null
      });
      TestBed.tick();

      // Assert: computed selector should reflect reversed names
      const result = service.carsWithDescriptions();
      TestBed.tick();

      expect(result.length).toBe(10);
      expect(result[0]).toEqual(
        Object({
          id: '1',
          year: 2022,
          make: 'Tesla',
          model: 'Model 3',
          blueBookDescription: 'Tesla Model 3 - 2022'
        })
      );
    });

    it('should handle no cars gracefully', () => {
      service['vault'].replaceState({
        loading: false,
        value: [],
        error: null
      });

      const result = service.carsWithDescriptions();

      expect(result.length).toBe(0);
    });

    it('should handle null cars gracefully', () => {
      service['vault'].replaceState({
        loading: false,
        value: undefined,
        error: null
      });

      const result = service.carsWithDescriptions();

      expect(result.length).toBe(0);
    });

    it('should recompute reactively when vault data changes', () => {
      service['vault'].replaceState({
        loading: false,
        value: [{ id: '1', make: 'Ada Lovelace' } as any],
        error: null
      });

      const first = service.carsWithDescriptions();
      expect(first[0].make).toBe('Ada Lovelace');

      // Update real vault again — signal change should propagate
      service['vault'].replaceState({
        loading: false,
        value: [{ id: '2', make: 'Alan Turing' } as any],
        error: null
      });

      const second = service.carsWithDescriptions();
      expect(second[0].make).toBe('Alan Turing');
    });
  });
});
