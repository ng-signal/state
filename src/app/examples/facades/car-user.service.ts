import { computed, inject, Injectable } from '@angular/core';
import { CarService } from '../cars/services/car.service';
import { CarModel } from '../models/car.model';
import { UserModel } from '../models/user.model';
import { UserStateManualService } from '../users/user-state-manual/services/user-state-manual.service';

export interface UserWithCarModel extends UserModel {
  car?: CarModel | null;
}

@Injectable({
  providedIn: 'root'
})
export class UserCarFacadeService {
  private readonly userState = inject(UserStateManualService);
  private readonly carState = inject(CarService);

  /**
   * Reactive combined list of users and their assigned cars.
   * Automatically re-computes whenever user or car data changes.
   */
  readonly usersWithCars = computed<UserWithCarModel[]>(() => {
    const users = this.userState.users().data();
    const cars = this.carState.cars().data();

    if (!users?.length || !cars?.length) {
      return [];
    }

    // Merge users with matching cars
    return users.map((user) => ({
      ...user,
      car: cars.find((car) => String(car.id) === String(user.carId)) || null
    }));
  });

  /**
   * Combined loading state (true if either users or cars are loading)
   */
  readonly loading = computed(() => {
    return this.userState.users().loading() || this.carState.cars().loading();
  });

  /**
   * Combined error state (prefers user error first)
   */
  readonly error = computed(() => {
    return this.userState.users().error() || this.carState.cars().error();
  });

  /**
   * Convenience method to trigger loading both stores.
   */
  loadAll(): void {
    this.userState.loadUsers();
    this.carState.loadCars();
  }
}
