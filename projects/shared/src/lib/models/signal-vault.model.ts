import { VaultSignalRef } from '../references/vault-signal.reference';

export interface SignalVaultModel<T> {
  readonly state: VaultSignalRef<T>;
}
