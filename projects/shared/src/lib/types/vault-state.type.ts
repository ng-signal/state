import { ResourceStateError } from '../models/resource-state-error.model';
import { VaultDataType } from './vault-data.type';

export type VaultStateType<T> = Partial<{
  loading: boolean;
  value: VaultDataType<T | undefined>;
  error: ResourceStateError | null;
}>;
