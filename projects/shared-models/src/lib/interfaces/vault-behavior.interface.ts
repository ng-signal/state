import { VaultBehaviorContext } from '../contexts/vault-behavior.context';
import { FeatureCell } from '../models/feature-cell.model';
import { VaultBehaviorType } from '../types/vault-behavior.type';

export interface VaultBehavior<T = unknown> {
  readonly type: VaultBehaviorType;
  readonly key?: string;
  readonly behaviorId: string;
  onInit?(key: string, service: string, ctx: VaultBehaviorContext<T>): void;
  onLoad?(key: string, ctx: VaultBehaviorContext<T>): void;
  onSet?(key: string, ctx: VaultBehaviorContext<T>): void;
  onPatch?(key: string, ctx: VaultBehaviorContext<T>): void;
  onReset?(key: string, ctx: VaultBehaviorContext<T>): void;
  onError?(key: string, ctx: VaultBehaviorContext<T>): void;
  onDestroy?(key: string, ctx: VaultBehaviorContext<T>): void;
  onDispose?(key: string, ctx: VaultBehaviorContext<T>): void;

  // eslint-disable-next-line
  extendCellAPI?(cell: FeatureCell<T>): void | Record<string, (...args: any[]) => unknown>;
}
