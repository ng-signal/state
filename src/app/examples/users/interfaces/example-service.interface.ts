import { Signal } from '@angular/core';
import { VaultSignalRef } from '@ngvault/shared';
import { UserModel } from '../../models/user.model';

/**
 * Defines the standard shape of an ngVault feature service
 * so base directives and components can be generically typed.
 */
export interface ExampleServiceInterface {
  /** Returns the reactive resource state (data, loading, error) */
  users(): VaultSignalRef<UserModel[]>;

  /** Reactive computed selector that transforms or derives data */
  usersWithNames: Signal<UserModel[]>;

  /** Loads or refreshes the data from backend or cache */
  loadUsers(): void;
}
