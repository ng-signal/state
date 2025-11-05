import { Observable } from 'rxjs';
import { VaultSignalRef } from '../references/vault-signal.reference';
import { VaultStateInputType } from '../types/vault-state-input.type';
import { SignalVaultModel } from './signal-vault.model';

export interface ResourceVaultModel<T> extends SignalVaultModel<T> {
  state: VaultSignalRef<T>;
  setState(next: Partial<VaultStateInputType<T>>): void;

  patchState(partial: Partial<VaultStateInputType<T>>): void;

  fromObservable?(source$: Observable<T>): Observable<VaultSignalRef<T>>;

  reset(): void;

  destroy(): void;

  destroyed$?: Observable<void>;
}
