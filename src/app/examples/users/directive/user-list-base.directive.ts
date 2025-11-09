import { Directive, inject, Signal } from '@angular/core';
import { VaultSignalRef } from '@ngvault/shared';
import { CarService } from '../../cars/services/car.service';
import { UserCarFacadeService } from '../../facades/car-user-facade.service';
import { UserModel } from '../../models/user.model';
import { ExampleServiceInterface } from '../interfaces/example-service.interface';

@Directive()
export abstract class UserListDirective {
  /** Header title for the view */
  public title!: string;

  /** Spinner caption shown during manual load operations */
  public spinnerTitle!: string;
  /**
   * Injected instance of the user feature store service.
   */
  protected readonly userService!: ExampleServiceInterface;

  readonly userList: VaultSignalRef<UserModel[]>;

  readonly usersWithName: Signal<UserModel[]>;

  protected readonly carService = inject(CarService);

  readonly cars = this.carService.cars();

  protected readonly userCarFacadeService = inject(UserCarFacadeService);

  readonly usersWithoutCars = this.userCarFacadeService.usersWithoutCars;

  readonly groupedByMake = this.userCarFacadeService.groupedByMake;

  constructor(userCellService: ExampleServiceInterface) {
    this.userService = userCellService;
    this.userList = this.userService.users();
    this.usersWithName = this.userService.usersWithNames;
  }

  /**
   * Reactive list of users derived from the store.
   *
   * - Automatically triggers load when empty.
   * - Reactively updates as cell changes.
   */

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
