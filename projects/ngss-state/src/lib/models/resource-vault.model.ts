import { Observable } from 'rxjs';
import { VaultDataType } from '../types/vault-data.type';
import { ResourceSignal } from './resource-signal.model';
import { ResourceStateError } from './resource-state-error.model';
import { SignalVaultModel } from './signal-vault.model';

export interface ResourceVaultModel<T> extends SignalVaultModel<T> {
  setState(next: Partial<{ loading: boolean; data: VaultDataType<T>; error: ResourceStateError | null }>): void;
  patchState(partial: Partial<{ loading?: boolean; data?: VaultDataType<T>; error?: ResourceStateError | null }>): void;
  loadListFrom?(source$: Observable<T>): void;
  fromResource?(source$: Observable<T>): Observable<ResourceSignal<T>>;
}
