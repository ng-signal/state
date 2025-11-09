import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideFeatureCell } from '@ngvault/core';
import { provideVaultTesting } from '@ngvault/testing';
import { CarService } from '../cars/services/car.service';
import { CarModel } from '../models/car.model';
import { UserModel } from '../models/user.model';
import { UserCellManualService } from '../users/user-cell-manual/services/user-cell-manual.service';
import { UserCarFacadeService } from './car-user-facade.service';

describe('UserCarFacadeService (integration)', () => {
  let service: UserCarFacadeService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        provideVaultTesting(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
        UserCarFacadeService,
        CarService,
        UserCellManualService,
        provideFeatureCell(UserCellManualService, { key: 'userManual', initial: null }),
        provideFeatureCell(CarService, { key: 'cars', initial: null })
      ]
    });

    service = TestBed.inject(UserCarFacadeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('loadAll', () => {
    it('should merge users and cars', async () => {
      const users: UserModel[] = [
        { id: '1', name: 'Ada Lovelace', carId: 1 },
        { id: '2', name: 'Alan Turing', carId: 2 },
        { id: '3', name: 'Grace Hopper' }
      ];

      const cars: CarModel[] = [
        { id: '1', year: 2023, make: 'Tesla', model: 'Model 3' },
        { id: '2', year: 2021, make: 'Ford', model: 'Mustang Mach-E' }
      ];

      service.loadAll();
      TestBed.tick();

      // Users request
      const userReq = httpMock.expectOne('/api/users');
      expect(userReq.request.method).toBe('GET');

      // Cars request
      const carReq = httpMock.expectOne('/api/cars');
      expect(carReq.request.method).toBe('GET');

      // Respond in any order — both effects should merge reactively
      userReq.flush(users);
      carReq.flush(cars);
      await TestBed.inject(ApplicationRef).whenStable();

      const result = service.usersWithCars();
      expect(result.length).toBe(3);

      const ada = result?.find((u) => u.name.includes('Ada'));
      const alan = result?.find((u) => u.name.includes('Alan'));
      const grace = result?.find((u) => u.name.includes('Grace'));

      expect(ada?.car?.make).toBe('Tesla');
      expect(alan?.car?.make).toBe('Ford');
      expect(grace?.car).toBeNull();

      // Derived signals
      const noCars = service.usersWithoutCars();
      expect(noCars.length).toBe(1);
      expect(noCars[0].name).toContain('Grace');

      const noUsers = service.carsWithoutUsers();
      expect(noUsers.length).toBe(0);

      const grouped = service.groupedByMake();
      expect(grouped.length).toBe(3);
      expect(grouped.some((g) => g.make === 'Tesla')).toBeTrue();
      expect(grouped.some((g) => g.make === 'Unassigned')).toBeTrue();
    });

    it('should gracefully handle no users and cars', async () => {
      const users = null;

      const cars = null;

      service.loadAll();
      TestBed.tick();

      // Users request
      const userReq = httpMock.expectOne('/api/users');
      expect(userReq.request.method).toBe('GET');

      // Cars request
      const carReq = httpMock.expectOne('/api/cars');
      expect(carReq.request.method).toBe('GET');

      // Respond in any order — both effects should merge reactively
      userReq.flush(users);
      carReq.flush(cars);

      await TestBed.inject(ApplicationRef).whenStable();

      const result = service.usersWithCars();
      expect(result.length).toBe(0);

      // Derived signals
      const noCars = service.usersWithoutCars();
      expect(noCars.length).toBe(0);

      const noUsers = service.carsWithoutUsers();
      expect(noUsers.length).toBe(0);

      const grouped = service.groupedByMake();
      expect(grouped.length).toBe(0);
    });

    it('should merge users and no cars', async () => {
      const users: UserModel[] = [
        { id: '1', name: 'Ada Lovelace', carId: 1 },
        { id: '2', name: 'Alan Turing', carId: 2 },
        { id: '3', name: 'Grace Hopper' }
      ];

      const cars = null;

      service.loadAll();
      TestBed.tick();

      // Users request
      const userReq = httpMock.expectOne('/api/users');
      expect(userReq.request.method).toBe('GET');

      // Cars request
      const carReq = httpMock.expectOne('/api/cars');
      expect(carReq.request.method).toBe('GET');

      // Respond in any order — both effects should merge reactively
      userReq.flush(users);
      carReq.flush(cars);
      await TestBed.inject(ApplicationRef).whenStable();

      const result = service.usersWithCars();
      expect(result.length).toBe(0);

      // Derived signals
      const noCars = service.usersWithoutCars();
      expect(noCars.length).toBe(0);

      const noUsers = service.carsWithoutUsers();
      expect(noUsers.length).toBe(0);

      const grouped = service.groupedByMake();
      expect(grouped.length).toBe(0);
    });

    it('should merge cars and no users', async () => {
      const users = null;

      const cars: CarModel[] = [
        { id: '1', year: 2023, make: 'Tesla', model: 'Model 3' },
        { id: '2', year: 2021, make: 'Ford', model: 'Mustang Mach-E' }
      ];
      service.loadAll();
      TestBed.tick();

      // Users request
      const userReq = httpMock.expectOne('/api/users');
      expect(userReq.request.method).toBe('GET');

      // Cars request
      const carReq = httpMock.expectOne('/api/cars');
      expect(carReq.request.method).toBe('GET');

      // Respond in any order — both effects should merge reactively
      userReq.flush(users);
      carReq.flush(cars);
      await TestBed.inject(ApplicationRef).whenStable();

      const result = service.usersWithCars();
      expect(result.length).toBe(0);

      // Derived signals
      const noCars = service.usersWithoutCars();
      expect(noCars.length).toBe(0);

      const noUsers = service.carsWithoutUsers();
      expect(noUsers.length).toBe(2);

      const grouped = service.groupedByMake();
      expect(grouped.length).toBe(0);
    });
  });

  it('should handle missing users or cars gracefully', (done) => {
    service.loadAll();

    const userReq = httpMock.expectOne('/api/users');
    userReq.flush([]); // no users
    const carReq = httpMock.expectOne('/api/cars');
    carReq.flush([{ id: '1', year: 2022, make: 'Tesla', model: 'Model S' }]);

    setTimeout(() => {
      expect(service.usersWithCars()).toEqual([]);
      expect(service.usersWithoutCars()).toEqual([]);
      done();
    }, 0);
  });
});
