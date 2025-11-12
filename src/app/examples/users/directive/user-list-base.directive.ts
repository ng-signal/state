import { Directive, inject, Signal } from '@angular/core';
import { VaultSignalRef } from '@ngvault/shared';
import { getUserData } from 'src/testing/data/user.data';
import { CarService } from '../../cars/services/car.service';
import { UserCarFacadeService } from '../../facades/car-user-facade.service';
import { CarModel } from '../../models/car.model';
import { UserModel } from '../../models/user.model';
import { ExampleUserServiceInterface } from '../interfaces/example-user.service.interface';

@Directive()
export abstract class UserListDirective {
  /** Header title for the view */
  public title!: string;

  /** Spinner caption shown during manual load operations */
  public spinnerTitle!: string;
  /**
   * Injected instance of the user feature store service.
   */
  protected readonly userService!: ExampleUserServiceInterface<UserModel[]>;
  readonly userList: VaultSignalRef<UserModel[]>;
  readonly usersWithName: Signal<UserModel[]>;
  readonly staticUsers = getUserData() as UserModel[];

  protected readonly carService = inject(CarService);
  readonly cars = this.carService.cars();
  readonly carsWithDescriptions: Signal<CarModel[]>;

  protected readonly userCarFacadeService = inject(UserCarFacadeService);
  readonly usersWithoutCars = this.userCarFacadeService.usersWithoutCars;
  readonly usersWithCars = this.userCarFacadeService.usersWithCars;
  readonly carsWithoutUsers = this.userCarFacadeService.carsWithoutUsers;
  readonly groupedByMake = this.userCarFacadeService.groupedByMake;

  constructor(userCellService: ExampleUserServiceInterface<UserModel[]>) {
    this.userService = userCellService;
    this.userList = this.userService.users();
    this.usersWithName = this.userService.usersWithNames;
    this.carsWithDescriptions = this.carService.carsWithDescriptions;
  }

  /**
   * Reactive list of users derived from the store.
   *
   * - Automatically triggers load when empty.
   * - Reactively updates as cell changes.
   */

  loadUser(id: string): void {
    this.userService.loadUser(id);
  }

  /**
   * Retry handler for re-fetching users after an error.
   */
  retry() {
    this.userService.loadUsers();
  }

  resetUsers() {
    this.userService.resetUsers();
  }

  reloadUsers() {
    this.userService.reloadUsers();
  }

  reactiveReloadUsers() {
    this.userService.reactiveReloadUsers();
  }

  resetCars() {
    this.carService.resetCars();
  }

  reloadCars() {
    this.carService.reloadCars();
  }

  reactiveReloadCars() {
    this.carService.reactiveReloadCars();
  }
}
