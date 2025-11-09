import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { ResourceStateError } from '@ngvault/shared';
import { CarService } from '../cars/services/car.service';
import { CarModel } from '../models/car.model';
import { UserModel } from '../models/user.model';
import { UserCellManualService } from '../users/user-cell-manual/services/user-cell-manual.service';

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
  private readonly userState = inject(UserCellManualService);
  private readonly carState = inject(CarService);

  private readonly _isLoading = signal(false);
  private readonly _error = signal<ResourceStateError | null>(null);
  private readonly _userValue = signal<UserWithCarModel[]>([]);

  /** Derived: Cars without assigned users (reactive) — opposite from the car perspective */
  readonly carsWithoutUsers = computed(() => {
    const cars = this.carState.cars().value() ?? [];
    const users = this._userValue();

    const assignedIds = new Set(users.filter((u) => u.car).map((u) => String(u.car!.id)));
    return cars.filter((car) => !assignedIds.has(String(car.id)));
  });

  /** Derived: Users without cars (reactive) */
  readonly usersWithoutCars = computed(() => this._userValue().filter((u) => !u.car));
  readonly usersWithCars = computed(() => this._userValue().filter((u) => u.car));

  /** Derived: Users grouped by car make (reactive) */
  readonly groupedByMake = computed<UsersGroupedByMake[]>(() => {
    const list = this._userValue();
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
      const users = this.userState.users().value() as UserModel[] | undefined;

      const cars = this.carState.cars().value();
      const loading = this.userState.users().isLoading() || this.carState.cars().isLoading();
      const error = this.userState.users().error() || this.carState.cars().error();

      this._isLoading.set(loading);
      this._error.set(error);

      if (!users?.length || !cars?.length) {
        this._userValue.set([]);
        return;
      }

      const merged = users.map((user) => ({
        ...user,
        car: cars.find((car: CarModel) => String(car.id) === String(user.carId)) || null
      }));

      this._userValue.set(merged);
    });
  }

  loadAll(): void {
    this._isLoading.set(true);
    this.userState.loadUsers();
    this.carState.loadCars();
  }
}
