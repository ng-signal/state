import { Signal } from '@angular/core';
import { VaultDataType } from '../types/vault-data.type';
import { ResourceStateError } from './resource-state-error.model';

export interface ResourceSignal<T> {
  loading: Signal<boolean>;
  data: Signal<VaultDataType<T>>;
  error: Signal<ResourceStateError | null>;
}
