import { provideState } from '@ngss/state';
import { CarService } from '../examples/cars/services/car.service';
import { CarModel } from '../examples/models/car.model';
import { UserModel } from '../examples/models/user.model';
import { UserStateManualService } from '../examples/users/user-state-manual/services/user-state-manual.service';
import { UserStateNoCacheService } from '../examples/users/user-state-no-cache/services/user-state-no-cache.service';

const initialUsers: UserModel[] | null = null;
const initialCars: CarModel[] | null = null;

export const NGSS_STATES = [
  provideState(UserStateNoCacheService, { key: 'userNoCache', initial: initialUsers }),
  provideState(UserStateManualService, { key: 'userManual', initial: initialUsers }),
  provideState(CarService, { key: 'cars', initial: initialCars })
];
