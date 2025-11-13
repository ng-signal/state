import { NgVaultResourceStateError } from '../models/ngvault-resource-state-error.model';
import { NgVaultDataType } from './ngvault-data.type';

export type NrVaultStateType<T> = Partial<{
  loading: boolean;
  value: NgVaultDataType<T | undefined>;
  error: NgVaultResourceStateError | null;
}>;
