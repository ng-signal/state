import { NgVaultReducerFunction } from '@ngvault/shared';
import { Observable } from 'rxjs';
import { VaultBehaviorContext } from '../contexts/vault-behavior.context';
import { VaultSignalRef } from '../references/vault-signal.reference';
import { NgVaultStateInputType } from '../types/ngvault-state-input.type';
import { SignalVaultModel } from './signal-vault.model';

export interface NgVaultFeatureCell<T> extends SignalVaultModel<T> {
  state: VaultSignalRef<T>;

  replaceState(incoming: NgVaultStateInputType<T>): void;
  mergeState(incoming: NgVaultStateInputType<T>): void;

  fromObservable?(source$: Observable<T>): Observable<VaultSignalRef<T>>;

  reset(): void;

  destroy(): void;

  destroyed$?: Observable<void>;
  reset$?: Observable<void>;

  /** @internal – used by NgVault for behavior extension context */
  readonly ctx?: VaultBehaviorContext<T>;
  /** @internal – the unique feature key for this cell */
  readonly key?: string;

  initialize(reducers?: NgVaultReducerFunction<T>[]): void;
}
