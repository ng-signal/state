import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { ResourceSignal, ResourceStateError } from '@ngss/state';
import { CarService } from '../cars/services/car.service';
import { CarModel } from '../models/car.model';
import { UserModel } from '../models/user.model';
import { UserStateManualService } from '../users/user-state-manual/services/user-state-manual.service';

export interface UserWithCarModel extends UserModel {
  car?: CarModel | null;
}

export interface UsersGroupedByMake {
  make: string;
  users: UserWithCarModel[];
}

@Injectable({
  providedIn: 'root'
})
export class UserCarFacadeService {
  private readonly userState = inject(UserStateManualService);
  private readonly carState = inject(CarService);

  private readonly _loading = signal(false);
  private readonly _error = signal<ResourceStateError | null>(null);
  private readonly _data = signal<UserWithCarModel[]>([]);

  readonly usersWithCars: ResourceSignal<UserWithCarModel[]> = {
    loading: this._loading.asReadonly(),
    data: this._data.asReadonly(),
    error: this._error.asReadonly()
  };

  /** Derived: Users without cars (reactive) */
  readonly usersWithoutCars = computed(() => this._data().filter((u) => !u.car));

  /** Derived: Users grouped by car make (reactive) */
  readonly groupedByMake = computed<UsersGroupedByMake[]>(() => {
    const list = this._data();
    const map = new Map<string, UserWithCarModel[]>();

    for (const user of list) {
      const make = user.car?.make ?? 'Unassigned';
      if (!map.has(make)) map.set(make, []);
      map.get(make)!.push(user);
    }

    return Array.from(map, ([make, users]) => ({ make, users }));
  });

  constructor() {
    effect(() => {
      const users = this.userState.users().data();
      const cars = this.carState.cars().data();
      const loading = this.userState.users().loading() || this.carState.cars().loading();
      const error = this.userState.users().error() || this.carState.cars().error();

      this._loading.set(loading);
      this._error.set(error);

      if (!users?.length || !cars?.length) {
        this._data.set([]);
        return;
      }

      const merged = users.map((user) => ({
        ...user,
        car: cars.find((car) => String(car.id) === String(user.carId)) || null
      }));

      this._data.set(merged);
    });
  }

  loadAll(): void {
    this._loading.set(true);
    this.userState.loadUsers();
    this.carState.loadCars();
  }
}
