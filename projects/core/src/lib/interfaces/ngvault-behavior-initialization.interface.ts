import { Injector } from '@angular/core';
import { NgVaultBehavior, NgVaultBehaviorFactory, NgVaultFeatureCell } from '@ngvault/shared';

// eslint-disable-next-line
export interface NgVaultBehaviorInit<T = any> {
  initializeBehaviors<T>(injector: Injector, factories: Array<NgVaultBehaviorFactory<T>>): NgVaultBehavior<T>[];
  applyBehaviorExtensions<T>(cell: NgVaultFeatureCell<T>): void;
}
