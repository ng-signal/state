import { Injector } from '@angular/core';
import { NgVaultFeatureCell } from '../models/feature-cell.model';
import { NgVaultBehaviorFactory } from '../types/ngvault-behavior-factory.type';
import { NgVaultBehavior } from './ngvault-behavior.interface';

// eslint-disable-next-line
export interface NgVaultBehaviorRunner<T = any> {
  initializeBehaviors<T>(injector: Injector, factories: Array<NgVaultBehaviorFactory<T>>): NgVaultBehavior<T>[];
  applyBehaviorExtensions<T>(cell: NgVaultFeatureCell<T>): void;
}
