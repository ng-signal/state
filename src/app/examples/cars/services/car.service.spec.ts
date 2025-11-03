import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CarService } from './car.service';

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideFeatureCell } from '@ngvault/core';
import { getCarData } from 'src/testing/data/car.data';

describe('Service: Car State', () => {
  let service: CarService;
  let mockHttpClient: HttpTestingController;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      providers: [
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

      expect(carList.data()).toBeNull();
      expect(carList.loading()).toBeTrue();
      expect(carList.error()).toBeNull();

      const result = mockHttpClient.expectOne('/api/cars');
      expect(result.request.method).toBe('GET');

      result.flush(getCarData(0, true));

      expect(carList.data()).toEqual([Object({ id: '1', year: 2022, make: 'Tesla', model: 'Model 3' })]);

      expect(carList.loading()).toBeFalse();
      expect(carList.error()).toBeNull();
    });
  });

  describe('loadcars()', () => {
    it('should set loading to true, then set cars on success', () => {
      service.loadCars();

      const state = service.cars();

      expect(state.data()).toBeNull();
      expect(state.loading()).toBeTrue();
      expect(state.error()).toBeNull();

      const result = mockHttpClient.expectOne('/api/cars');
      expect(result.request.method).toBe('GET');
      result.flush(getCarData(0, true));

      expect(state.data()).toEqual([Object({ id: '1', year: 2022, make: 'Tesla', model: 'Model 3' })]);

      expect(state.loading()).toBeFalse();
      expect(state.error()).toBeNull();
    });

    it('should set error when http fails', () => {
      service.loadCars();

      const state = service.cars();

      expect(state.data()).toBeNull();
      expect(state.loading()).toBeTrue();
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

      expect(state.data()).toBeNull();
      expect(state.loading()).toBeFalse();
      const err = state.error();
      expect(err?.status).toBe(500);
      expect(err?.statusText).toBe('Server Error');
      expect(err?.message).toBe('Http failure response for /api/cars: 500 Server Error');
      expect(err?.details).toEqual(Object({ message: 'Internal Server Error' }));
    });
  });
});
