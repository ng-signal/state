import { VaultSignalRef } from './vault-signal.ref';

export interface SignalVaultModel<T> {
  readonly state: VaultSignalRef<T>;
}
