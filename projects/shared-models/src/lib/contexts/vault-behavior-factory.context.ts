// projects/shared-models/src/lib/interfaces/vault-behavior-factory-context.interface.ts
import { Injector } from '@angular/core';
import { VaultBehaviorType } from '../types/vault-behavior.type';

export interface VaultBehaviorFactoryContext {
  injector: Injector;
  behaviorId: string;
  readonly type?: VaultBehaviorType;
}
