import { VaultBehaviorContext } from '../contexts/vault-behavior.context';

export interface VaultBehavior<T = unknown> {
  critical?: boolean;
  onInit?(key: string, service: string, ctx: VaultBehaviorContext<T>): void;
  onLoad?(key: string, ctx: VaultBehaviorContext<T>): void;
  onSet?(key: string, ctx: VaultBehaviorContext<T>): void;
  onPatch?(key: string, ctx: VaultBehaviorContext<T>): void;
  onReset?(key: string, ctx: VaultBehaviorContext<T>): void;
  onError?(key: string, ctx: VaultBehaviorContext<T>): void;
  onDestroy?(key: string, ctx: VaultBehaviorContext<T>): void;
  onDispose?(key: string, ctx: VaultBehaviorContext<T>): void;
}
