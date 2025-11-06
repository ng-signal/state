// projects/shared-models/src/lib/interfaces/vault-behavior-factory-context.interface.ts
import { Injector } from '@angular/core';

export interface VaultBehaviorFactoryContext {
  injector: Injector;
  runLevelId: string;
}
