import { HttpClient } from '@angular/common/http';
import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FeatureCell, injectVault } from '@ngvault/core';
import { VaultSignalRef } from '@ngvault/shared';
import { map, take } from 'rxjs';
import { CarModel } from '../../models/car.model';

@FeatureCell<CarModel[]>('cars')
@Injectable({
  providedIn: 'root'
})
export class CarService {
  private readonly vault = injectVault<CarModel[]>(CarService);
  readonly #destroyRef = inject(DestroyRef);
  private readonly isLoaded = signal(false);

  private readonly http = inject(HttpClient);

  resetCars() {
    this.vault.reset();
  }

  reloadCars(): void {
    this.isLoaded.set(false);
  }

  reactiveReloadCars(): void {
    this.isLoaded.set(false);
    this.vault.reset();
  }

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
      const source$ = this.http.get<CarModel[]>('/api/cars').pipe(
        take(1),
        takeUntilDestroyed(this.#destroyRef),
        map((list: CarModel[]) => list)
      );
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
}
