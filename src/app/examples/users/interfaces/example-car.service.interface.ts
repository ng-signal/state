import { Signal } from '@angular/core';
import { VaultSignalRef } from '@ngvault/shared';

/**
 * Defines the standard shape of an ngVault feature service
 * so base directives and components can be generically typed.
 */
export interface ExampleCarServiceInterface<T> {
  /** Returns the reactive resource state (data, loading, error) */
  cars(): VaultSignalRef<T>;

  /** Reactive computed selector that transforms or derives data */
  carsWithDescriptions: Signal<T>;

  /** Loads or refreshes the data from backend or cache */
  loadCars(): void;

  loadCars(id: string): void;

  resetCars(setSpinner: boolean): void;

  reloadCars(setSpinner: boolean): void;

  reactiveReloadCars(): void;
}
