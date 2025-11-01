import { ResourceSignal } from './resource-signal.model';

export interface SignalVaultModel<T> {
  readonly state: ResourceSignal<T>;
}
