import { Injector } from '@angular/core';
import { VaultBehaviorContext } from '../contexts/vault-behavior.context';
import { VaultBehaviorFactory } from '../types/vault-behavior-factory.type';
import { VaultBehavior } from './vault-behavior.interface';

// eslint-disable-next-line
export interface VaultBehaviorRunner<T = any> {
  onInit(
    runLevelId: string,
    vaultKey: string,
    serviceName: string,
    ctx: VaultBehaviorContext<T>,
    behaviors: VaultBehavior<T>[]
  ): void;

  onSet(runLevelId: string, vaultKey: string, ctx: VaultBehaviorContext<T>, behaviors: VaultBehavior<T>[]): void;

  initializeBehaviors<T>(injector: Injector, factories: Array<VaultBehaviorFactory<T>>): VaultBehavior<T>[];
}
