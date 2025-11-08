import { provideFeatureCell } from '@ngvault/core';
import { withDevtoolsBehavior } from '@ngvault/dev-tools';
import { CarService } from '../examples/cars/services/car.service';
import { CarModel } from '../examples/models/car.model';
import { UserModel } from '../examples/models/user.model';
import { UserCellManualService } from '../examples/users/user-cell-manual/services/user-cell-manual.service';
import { UserCellNoCacheService } from '../examples/users/user-cell-no-cache/services/user-cell-no-cache.service';

const initialUsers: UserModel[] | null = null;
const initialCars: CarModel[] | null = null;

export const NGVAULT_CELLS = [
  provideFeatureCell(
    UserCellNoCacheService,
    { key: 'userNoCache', initial: initialUsers },

    [withDevtoolsBehavior]
  ),
  provideFeatureCell(UserCellManualService, { key: 'userManual', initial: initialUsers }, [withDevtoolsBehavior]),
  provideFeatureCell(CarService, { key: 'cars', initial: initialCars }, [])
];
