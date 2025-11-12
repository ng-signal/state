import { Signal } from '@angular/core';
import { VaultSignalRef } from '@ngvault/shared';

/**
 * Defines the standard shape of an ngVault feature service
 * so base directives and components can be generically typed.
 */
export interface ExampleUserServiceInterface<T> {
  /** Returns the reactive resource state (data, loading, error) */
  users(): VaultSignalRef<T>;

  /** Reactive computed selector that transforms or derives data */
  usersWithNames: Signal<T>;

  /** Loads or refreshes the data from backend or cache */
  loadUsers(): void;

  loadUser(id: string): void;

  resetUsers(): void;

  reloadUsers(): void;

  reactiveReloadUsers(): void;
}
