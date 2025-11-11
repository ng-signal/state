import { UserModel } from 'src/app/examples/models/user.model';

const Data: UserModel[] = [
  { id: '1', name: 'Ada Lovelace', carId: 2 },
  { id: '2', name: 'Alan Turing', carId: 4 },
  { id: '3', name: 'Grace Hopper', carId: 6 },
  { id: '4', name: 'Kai Nagato' }
];

export function getInMemoryUserData(): UserModel[] {
  return structuredClone(Data);
}

export function getUserData(index?: number, asArray = false): UserModel | UserModel[] {
  if (index !== undefined && index >= 0 && index < Data.length) {
    const item = structuredClone(Data[index]);
    return asArray ? [item] : item;
  }

  return structuredClone(Data);
}
