import { Injector } from '@angular/core';
import { VaultBehaviorContext } from '../contexts/vault-behavior.context';
import { FeatureCell } from '../models/feature-cell.model';
import { VaultBehaviorFactory } from '../types/vault-behavior-factory.type';
import { VaultBehavior } from './vault-behavior.interface';

// eslint-disable-next-line
export interface VaultBehaviorRunner<T = any> {
  onInit(behaviorId: string, vaultKey: string, serviceName: string, ctx: VaultBehaviorContext<T>): void;

  initializeBehaviors<T>(injector: Injector, factories: Array<VaultBehaviorFactory<T>>): string;
  applyBehaviorExtensions<T>(cell: FeatureCell<T>): void;

  onSet(behaviorId: string, vaultKey: string, ctx: VaultBehaviorContext<T>): void;
  onPatch(behaviorId: string, vaultKey: string, ctx: VaultBehaviorContext<T>): void;

  onError(behaviorId: string, vaultKey: string, ctx: VaultBehaviorContext<T>): void;

  onLoad(behaviorId: string, vaultKey: string, ctx: VaultBehaviorContext<T>): void;

  onReset(behaviorId: string, vaultKey: string, ctx: VaultBehaviorContext<T>): void;
  onDestroy(behaviorId: string, vaultKey: string, ctx: VaultBehaviorContext<T>): void;
  onDispose(behaviorId: string, vaultKey: string, ctx: VaultBehaviorContext<T>): void;

  // eslint-disable-next-line
  behaviors: VaultBehavior<any>[];
}
