import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { FeatureCell, injectVault } from '@ngvault/core';
import { VaultSignalRef } from '@ngvault/shared-models';
import { map, take } from 'rxjs';
import { CarModel } from '../../models/car.model';

@FeatureCell<CarModel[]>('cars')
@Injectable({
  providedIn: 'root'
})
export class CarService {
  private readonly vault = injectVault<CarModel[]>(CarService);

  private readonly http = inject(HttpClient);

  cars(): VaultSignalRef<CarModel[]> {
    this.loadCars();

    return this.vault.state;
  }

  loadCars(): void {
    const state = this.vault.state;

    if (!state.value() && !state.isLoading()) {
      this.vault.setState({
        loading: true,
        error: null
      });
      const source$ = this.http.get<CarModel[]>('/api/cars').pipe(map((list: CarModel[]) => list));
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
