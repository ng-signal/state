import { NgVaultResourceStateError } from './ngvault-resource-state-error.model';

export interface VaultStateSnapshot<T> {
  isLoading: boolean;
  value: T | undefined;
  error: NgVaultResourceStateError | null;
  hasValue: boolean;
}
