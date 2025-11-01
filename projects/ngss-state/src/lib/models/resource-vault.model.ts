import { Observable } from 'rxjs';
import { VaultDataType } from '../types/vault-data.type';
import { ResourceSignal } from './resource-signal.model';
import { NormalizedError } from './resource-signal.normalized-error.model';
import { SignalVaultModel } from './signal-vault.model';

export interface ResourceVaultModel<T> extends SignalVaultModel<T> {
  setState(next: Partial<{ loading: boolean; data: VaultDataType<T>; error: NormalizedError | null }>): void;
  patchState(partial: Partial<{ loading?: boolean; data?: VaultDataType<T>; error?: NormalizedError | null }>): void;
  loadListFrom?(source$: Observable<T>): void;
  fromResource?(source$: Observable<T>): ResourceSignal<T>;
}
