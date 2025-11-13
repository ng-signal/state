import { Injector } from '@angular/core';
import { NgVaultFeatureCell } from '../models/feature-cell.model';
import { NgVaultBehaviorFactory } from '../types/ngvault-behavior-factory.type';
import { VaultBehavior } from './vault-behavior.interface';

// eslint-disable-next-line
export interface VaultBehaviorRunner<T = any> {
  initializeBehaviors<T>(injector: Injector, factories: Array<NgVaultBehaviorFactory<T>>): VaultBehavior<T>[];
  applyBehaviorExtensions<T>(cell: NgVaultFeatureCell<T>): void;
}
