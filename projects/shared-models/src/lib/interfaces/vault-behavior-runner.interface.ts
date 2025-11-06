import { Injector } from '@angular/core';
import { VaultBehaviorContext } from '../contexts/vault-behavior.context';
import { VaultBehaviorFactory } from '../types/vault-behavior-factory.type';

// eslint-disable-next-line
export interface VaultBehaviorRunner<T = any> {
  onInit(behaviorId: string, vaultKey: string, serviceName: string, ctx: VaultBehaviorContext<T>): void;

  onSet(behaviorId: string, vaultKey: string, ctx: VaultBehaviorContext<T>): void;

  initializeBehaviors<T>(injector: Injector, factories: Array<VaultBehaviorFactory<T>>): void;
  initialize(): string;
}
