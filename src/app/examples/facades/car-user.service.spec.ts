import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideState } from '@ngss/state';
import { CarService } from '../cars/services/car.service';
import { CarModel } from '../models/car.model';
import { UserModel } from '../models/user.model';
import { UserStateManualService } from '../users/user-state-manual/services/user-state-manual.service';
import { UserCarFacadeService } from './car-user.service';

describe('UserCarFacadeService (integration)', () => {
  let service: UserCarFacadeService;
  let http: HttpTestingController;

  const NGSS_STATES = [
    provideState(UserStateManualService, { key: 'userManual', initial: null }),
    provideState(CarService, { key: 'cars', initial: null })
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
        UserCarFacadeService,
        CarService,
        UserStateManualService,
        ...NGSS_STATES
      ]
    });

    service = TestBed.inject(UserCarFacadeService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('should initialize with empty state', () => {
    const res = service.usersWithCars;
    expect(res.data()).toEqual([]);
    expect(res.error()).toBeNull();
    expect(res.loading()).toBeFalse();
  });

  it('should merge users and cars after loadAll()', (done) => {
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

    // Users request
    const userReq = http.expectOne('/api/users');
    expect(userReq.request.method).toBe('GET');

    // Cars request
    const carReq = http.expectOne('/api/cars');
    expect(carReq.request.method).toBe('GET');

    // Respond in any order — both effects should merge reactively
    userReq.flush(users);
    carReq.flush(cars);

    setTimeout(() => {
      const result = service.usersWithCars.data();

      expect(result?.length).toBe(3);
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

      const grouped = service.groupedByMake();
      expect(grouped.length).toBe(3);
      expect(grouped.some((g) => g.make === 'Tesla')).toBeTrue();
      expect(grouped.some((g) => g.make === 'Unassigned')).toBeTrue();

      done();
    }, 0);
  });

  it('should handle missing users or cars gracefully', (done) => {
    service.loadAll();

    const userReq = http.expectOne('/api/users');
    userReq.flush([]); // no users
    const carReq = http.expectOne('/api/cars');
    carReq.flush([{ id: '1', year: 2022, make: 'Tesla', model: 'Model S' }]);

    setTimeout(() => {
      expect(service.usersWithCars.data()).toEqual([]);
      expect(service.usersWithoutCars()).toEqual([]);
      done();
    }, 0);
  });
});
