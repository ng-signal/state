import { CarModel } from 'src/app/examples/models/car.model';

const Data: CarModel[] = [
  { id: '1', year: 2022, make: 'Tesla', model: 'Model 3' },
  { id: '2', year: 2021, make: 'Ford', model: 'Mustang Mach-E' },
  { id: '3', year: 2020, make: 'Chevrolet', model: 'Bolt EV' },
  { id: '4', year: 2023, make: 'Toyota', model: 'Corolla Hybrid' },
  { id: '5', year: 2019, make: 'Honda', model: 'Civic LX' },
  { id: '6', year: 2022, make: 'Volkswagen', model: 'ID.4' },
  { id: '7', year: 2021, make: 'Hyundai', model: 'Ioniq 5' },
  { id: '8', year: 2020, make: 'Kia', model: 'Niro EV' },
  { id: '9', year: 2023, make: 'Subaru', model: 'Outback Touring XT' },
  { id: '10', year: 2024, make: 'BMW', model: 'i4 M50' }
];

export function getCarData(index?: number, asArray = false): CarModel | CarModel[] {
  if (index !== undefined && index >= 0 && index < Data.length) {
    const item = structuredClone(Data[index]);
    return asArray ? [item] : item;
  }

  return structuredClone(Data);
}
