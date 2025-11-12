// table-basic-code.ts

import { CAR_MODEL } from '../models/car.model';
import { SourceCodeModel } from '../models/source-code.model';

const HTML = `
<div example>
  @for (car of carsWithDescriptions(); track car.id) {
    <p>
      {{ car.blueBookDescription }}
    </p>
  }
</div>
`;

const COMPONENT = `
import { inject, Signal } from '@angular/core';
import { CarService } from 'car.service';
import { CarModel } from 'car.model';

export abstract class UserListDirective {
  protected readonly carService = inject(CarService);
  readonly carsWithDescriptions: Signal<CarModel[]>;

  constructor() {
    this.carsWithDescriptions = this.carService.carsWithDescriptions;
  }
}
`;

const SERVICE = `
import { HttpClient } from '@angular/common/http';
import { computed, DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FeatureCell, injectVault } from '@ngvault/core';
import { VaultSignalRef } from '@ngvault/shared';
import { CarModel } from 'car.model';
import { map, take } from 'rxjs';

@FeatureCell<CarModel[]>('cars')
@Injectable({
  providedIn: 'root'
})
export class CarService {
  private readonly vault = injectVault<CarModel[]>(CarService);
  readonly #destroyRef = inject(DestroyRef);
  private readonly http = inject(HttpClient);

  readonly carsWithDescriptions = computed(() => {
    const cars = this.vault.state.value() as CarModel[] | undefined;
    if (!cars) return [];

    return cars.map((car: carmodel) => {
      const bluebookdescription = car.make + ' ' + car.model + ' - ' + car.year;
      return {
        ...car,
        blueBookDescription
      };
    });
  });
  
  loadCars(): void {
    const state = this.vault.state;

    if (!state.hasValue() && !state.isLoading()) {
      this.vault.replaceState({
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
            this.vault.replaceState({
              loading: false,
              value: state.value(),
              error: null
            });
          },
          error: (err) => {
            this.vault.replaceState({
              loading: false,
              error: err
            });
          }
        });
    }
  }
}
`;

export const carsWithDescriptionsCodeModel: SourceCodeModel[] = [
  {
    type: 'html',
    label: 'HTML',
    code: HTML
  },
  {
    type: 'component',
    label: 'COMPONENT',
    code: COMPONENT
  },
  {
    type: 'service',
    label: 'SERVICE',
    code: SERVICE
  },
  {
    type: 'model',
    label: 'MODEL',
    code: CAR_MODEL
  }
];
