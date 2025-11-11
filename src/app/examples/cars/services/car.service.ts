import { HttpClient } from '@angular/common/http';
import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FeatureCell, injectVault } from '@ngvault/core';
import { VaultDataType, VaultSignalRef } from '@ngvault/shared';
import { take } from 'rxjs';
import { CarModel } from '../../models/car.model';
import { ExampleCarServiceInterface } from '../../users/interfaces/example-car.service.interface';

@FeatureCell<CarModel[]>('cars')
@Injectable({
  providedIn: 'root'
})
export class CarService implements ExampleCarServiceInterface<CarModel[]> {
  private readonly vault = injectVault<CarModel[]>(CarService);
  readonly #destroyRef = inject(DestroyRef);
  private readonly isLoaded = signal(false);

  private readonly http = inject(HttpClient);

  readonly carsWithDescriptions = computed(() => {
    const cars = this.vault.state.value() as CarModel[] | undefined;
    if (!cars) return [];

    return cars.map((car: CarModel) => {
      const blueBookDescription = car.make + ' ' + car.model + ' - ' + car.year;
      return {
        ...car,
        blueBookDescription
      };
    });
  });

  cars(): VaultSignalRef<CarModel[]> {
    if (!this.isLoaded()) {
      this.isLoaded.set(true);
      this.loadCars();
    }

    return this.vault.state;
  }

  loadCars(): void {
    const state = this.vault.state;

    if (!state.hasValue() && !state.isLoading()) {
      this.vault.setState({
        loading: true,
        error: null
      });
      const source$ = this.http.get<CarModel[]>('/api/cars').pipe(take(1), takeUntilDestroyed(this.#destroyRef));
      this.vault.fromObservable!(source$)
        .pipe(take(1))
        .subscribe({
          next: (state: VaultSignalRef<CarModel[]>) => {
            this.vault.setState({
              loading: false,
              value: state.value(),
              error: null
            });
          },
          error: (err) => {
            this.vault.setState({
              loading: false,
              error: err
            });
          }
        });
    }
  }

  resetCars(setSpinner: boolean = true) {
    this.vault.setState({
      loading: setSpinner,
      value: [] as VaultDataType<CarModel[]>
    });
  }

  reloadCars(setSpinner: boolean = true): void {
    this.isLoaded.set(false);
    this.resetCars(setSpinner);
  }

  reactiveReloadCars(): void {
    this.isLoaded.set(false);
    this.vault.reset();
  }
}
