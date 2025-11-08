import { ResourceStateError } from './resource-state-error.model';

export interface VaultStateSnapshot<T> {
  isLoading: boolean;
  value: T | undefined;
  error: ResourceStateError | null;
  hasValue: boolean;
}
