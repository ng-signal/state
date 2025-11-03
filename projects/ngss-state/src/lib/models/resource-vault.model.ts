import { Observable } from 'rxjs';
import { VaultStateInput } from '../types/vault-state-input.type';
import { SignalVaultModel } from './signal-vault.model';
import { VaultSignalRef } from './vault-signal.ref';

export interface ResourceVaultModel<T> extends SignalVaultModel<T> {
  setState(next: Partial<VaultStateInput<T>>): void;

  patchState(partial: Partial<VaultStateInput<T>>): void;

  fromObservable?(source$: Observable<T>): Observable<VaultSignalRef<T>>;
}
