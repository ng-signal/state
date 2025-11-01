import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideState } from '@ngss/state';
import { CarService } from '../cars/services/car.service';
import { CarModel } from '../models/car.model';
import { UserModel } from '../models/user.model';
import { UserStateManualService } from '../users/user-state-manual/services/user-state-manual.service';
import { UserCarFacadeService } from './car-user.service';

describe('FacadeService: User Cars', () => {
  let facade: UserCarFacadeService;
  let userService: UserStateManualService;
  let carService: CarService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        provideHttpClient(),
        provideZonelessChangeDetection(),
        UserCarFacadeService,
        UserStateManualService,
        CarService,
        provideState(UserStateManualService, { key: 'userManual', initial: [] }),
        provideState(CarService, { key: 'cars', initial: [] })
      ]
    });

    facade = TestBed.inject(UserCarFacadeService);
    userService = TestBed.inject(UserStateManualService);
    carService = TestBed.inject(CarService);
  });

  it('should create the facade service', () => {
    expect(facade).toBeTruthy();
    expect(userService).toBeTruthy();
    expect(carService).toBeTruthy();
  });

  it('should start with empty arrays', () => {
    const usersWithCars = facade.usersWithCars();
    expect(Array.isArray(usersWithCars)).toBeTrue();
    expect(usersWithCars.length).toBe(0);
  });

  it('should recompute when users or cars change', (done) => {
    const users: UserModel[] = [
      { id: '1', name: 'Ada Lovelace', carId: 1 },
      { id: '2', name: 'Alan Turing', carId: 2 }
    ];
    const cars: CarModel[] = [
      { id: '1', year: 2022, make: 'Tesla', model: 'Model 3' },
      { id: '2', year: 2023, make: 'Ford', model: 'Mustang' }
    ];

    // simulate fromResource signals updating underlying vault
    userService['vault'].setState({
      data: users,
      loading: false,
      error: null
    });
    carService['vault'].setState({
      data: cars,
      loading: false,
      error: null
    });

    // first assertion
    const joined = facade.usersWithCars();
    expect(joined.length).toBe(2);
    expect(joined[0].car?.make).toBe('Tesla');
    expect(joined[1].car?.model).toBe('Mustang');

    // now simulate new car data; computed should reflect automatically
    const updatedCars: CarModel[] = [
      { id: '1', year: 2025, make: 'BMW', model: 'i4' },
      { id: '2', year: 2023, make: 'Ford', model: 'Mustang' }
    ];

    carService['vault'].setState({
      data: updatedCars,
      loading: false,
      error: null
    });

    // allow microtask flush
    setTimeout(() => {
      const recomputed = facade.usersWithCars();
      expect(recomputed[0].car?.make).toBe('BMW');
      done();
    }, 0);
  });

  it('should handle users without cars gracefully', () => {
    userService['vault'].setState({
      data: [{ id: '3', name: 'Grace Hopper' }],
      loading: false,
      error: null
    });
    carService['vault'].setState({
      data: [{ id: '1', year: 2022, make: 'Tesla', model: 'Model 3' }],
      loading: false,
      error: null
    });

    const result = facade.usersWithCars();
    expect(result.length).toBe(1);
    expect(result[0].car).toBeNull();
  });

  it('should expose combined loading state', () => {
    // manually simulate both services loading
    userService['vault'].setState({ loading: true });
    carService['vault'].setState({ loading: true });
    expect(facade.loading()).toBeTrue();

    userService['vault'].setState({ loading: false });
    carService['vault'].setState({ loading: false });
    expect(facade.loading()).toBeFalse();
  });

  it('should expose combined error state', () => {
    const error = { message: 'Server Error' };
    userService['vault'].setState({ error });
    expect(facade.error()).toEqual(error);

    userService['vault'].setState({ error: null });
    carService['vault'].setState({ error });
    expect(facade.error()).toEqual(error);
  });

  it('should load all data when loadAll() is called', () => {
    spyOn(userService, 'loadUsers').and.callThrough();
    spyOn(carService, 'loadCars').and.callThrough();

    facade.loadAll();

    expect(userService.loadUsers).toHaveBeenCalled();
    expect(carService.loadCars).toHaveBeenCalled();
  });
});
