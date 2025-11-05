// projects/shared-models/src/lib/types/vault-behavior-factory.type.ts
import { VaultBehaviorFactoryContext } from '../interfaces/vault-behavior-factory-context.interface';
import { VaultBehavior } from '../interfaces/vault-behavior.interface';

export type VaultBehaviorFactory<T = unknown> = (context: VaultBehaviorFactoryContext) => VaultBehavior<T>;
