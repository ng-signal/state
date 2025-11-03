import { HttpResourceRef } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VaultStateType } from '../types/vault-state.type';
import { SignalVaultModel } from './signal-vault.model';
import { VaultSignalRef } from './vault-signal.ref';

export interface ResourceVaultModel<T> extends SignalVaultModel<T> {
  setState(next: Partial<VaultStateType<T>> | HttpResourceRef<T> | null): void;

  patchState(partial: Partial<VaultStateType<T>> | HttpResourceRef<T> | null): void;

  fromObservable?(source$: Observable<T>): Observable<VaultSignalRef<T>>;
}
