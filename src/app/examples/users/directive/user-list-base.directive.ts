import { Directive, Signal } from '@angular/core';
import { ResourceSignal } from '@ngss/state';
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
  protected readonly userState!: ExampleServiceInterface;

  readonly userList: ResourceSignal<UserModel[]>;

  readonly usersWithName: Signal<UserModel[]>;

  constructor(service: ExampleServiceInterface) {
    this.userState = service;
    this.userList = this.userState.users();
    this.usersWithName = this.userState.usersWithNames;
  }

  /**
   * Reactive list of users derived from the store.
   *
   * - Automatically triggers load when empty.
   * - Reactively updates as state changes.
   */

  /**
   * Retry handler for re-fetching users after an error.
   */
  retry() {
    this.userState.loadUsers();
  }
}
