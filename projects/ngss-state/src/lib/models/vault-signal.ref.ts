import { Signal } from '@angular/core';
import { VaultDataType } from '../types/vault-data.type';
import { ResourceStateError } from './resource-state-error.model';

export interface VaultSignalRef<T> {
  isLoading: Signal<boolean>;
  value: Signal<VaultDataType<T>>;
  error: Signal<ResourceStateError | null>;
}
