import { Signal } from '@angular/core';
import { ResourceStateError } from '../models/resource-state-error.model';
import { VaultDataType } from '../types/vault-data.type';

export interface VaultSignalRef<T> {
  isLoading: Signal<boolean>;
  value: Signal<VaultDataType<T | undefined>>;
  error: Signal<ResourceStateError | null>;
  hasValue: Signal<boolean>;
}
