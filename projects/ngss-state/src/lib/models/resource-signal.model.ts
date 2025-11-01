import { Signal } from '@angular/core';
import { VaultDataType } from '../types/vault-data.type';
import { NormalizedError } from './resource-signal.normalized-error.model';

export interface ResourceSignal<T> {
  loading: Signal<boolean>;
  data: Signal<VaultDataType<T>>;
  error: Signal<NormalizedError | null>;
}
