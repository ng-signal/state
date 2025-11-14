// projects/shared/src/lib/interfaces/vault-behavior-factory-context.interface.ts
import { Injector } from '@angular/core';
import { NgVaultBehaviorType } from '../types/ngvault-behavior.type';

export interface NgVaultBehaviorFactoryContext {
  injector: Injector;
  readonly type: NgVaultBehaviorType;
}
