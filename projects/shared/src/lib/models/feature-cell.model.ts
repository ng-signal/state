import { Observable } from 'rxjs';
import { VaultBehaviorContext } from '../contexts/vault-behavior.context';
import { VaultSignalRef } from '../references/vault-signal.reference';
import { VaultStateInputType } from '../types/vault-state-input.type';
import { SignalVaultModel } from './signal-vault.model';

export interface FeatureCell<T> extends SignalVaultModel<T> {
  state: VaultSignalRef<T>;
  setState(next: Partial<VaultStateInputType<T>>): void;

  patchState(partial: Partial<VaultStateInputType<T>>): void;

  fromObservable?(source$: Observable<T>): Observable<VaultSignalRef<T>>;

  reset(): void;

  destroy(): void;

  destroyed$?: Observable<void>;
  reset$?: Observable<void>;

  /** @internal – used by NgVault for behavior extension context */
  readonly ctx?: VaultBehaviorContext<T>;
  /** @internal – the unique feature key for this cell */
  readonly key?: string;
}
