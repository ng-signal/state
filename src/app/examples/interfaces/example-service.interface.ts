import { Signal } from '@angular/core';
import { ResourceSignal } from '@ngss/state';
import { UserModel } from '../models/user.model';

/**
 * Defines the standard shape of an NGSS feature service
 * so base directives and components can be generically typed.
 */
export interface ExampleServiceInterface {
  /** Returns the reactive resource state (data, loading, error) */
  users(): ResourceSignal<UserModel[]>;

  /** Reactive computed selector that transforms or derives data */
  usersWithNames: Signal<UserModel[]>;

  /** Loads or refreshes the data from backend or cache */
  loadUsers(): void;
}
