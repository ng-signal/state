import { VaultStateSnapshot } from '../models/vault-state-snapshot.model';

export interface VaultBehavior<T = unknown> {
  onInit?(key: string, service: string, state: Readonly<VaultStateSnapshot<T>>): void;
  onLoad?(key: string, state: Readonly<VaultStateSnapshot<T>>): void;
  onSet?(key: string, state: Readonly<VaultStateSnapshot<T>>): void;
  onPatch?(key: string, state: Readonly<VaultStateSnapshot<T>>): void;
  onReset?(key: string, state: Readonly<VaultStateSnapshot<T>>): void;
  onError?(key: string, state: Readonly<VaultStateSnapshot<T>>): void;
  onDestroy?(key: string, state: Readonly<VaultStateSnapshot<T>>): void;
  onDispose?(key: string, state: Readonly<VaultStateSnapshot<T>>): void;
}
