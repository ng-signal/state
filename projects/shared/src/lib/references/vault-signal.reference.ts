import { Signal } from '@angular/core';
import { NgVaultResourceStateError } from '../models/ngvault-resource-state-error.model';
import { NgVaultDataType } from '../types/ngvault-data.type';

export interface VaultSignalRef<T> {
  isLoading: Signal<boolean>;
  value: Signal<NgVaultDataType<T | undefined>>;
  error: Signal<NgVaultResourceStateError | null>;
  hasValue: Signal<boolean>;
}
