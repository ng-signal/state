import { Injector } from '@angular/core';
import { FeatureCell } from '../models/feature-cell.model';
import { VaultBehaviorFactory } from '../types/vault-behavior-factory.type';
import { VaultBehavior } from './vault-behavior.interface';

// eslint-disable-next-line
export interface VaultBehaviorRunner<T = any> {
  initializeBehaviors<T>(injector: Injector, factories: Array<VaultBehaviorFactory<T>>): VaultBehavior<T>[];
  applyBehaviorExtensions<T>(cell: FeatureCell<T>): void;
}
