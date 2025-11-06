import { Injector } from '@angular/core';
import {
  VaultBehavior,
  VaultBehaviorFactory,
  VaultBehaviorFactoryContext,
  VaultBehaviorRunner
} from '@ngvault/shared-models';

/**
 * Safely instantiate an array of VaultBehavior factories.
 */
export function initializeBehaviors<T>(
  injector: Injector,
  behaviors: Array<VaultBehaviorFactory<T>>,
  runner: VaultBehaviorRunner
): VaultBehavior<T>[] {
  if (!behaviors || behaviors.length === 0) return [];

  return behaviors
    .map((factory) => {
      try {
        // eslint-disable-next-line
        const behaviorType = (factory as any)?.type as VaultBehavior['type'] | undefined;

        const runLevelId = behaviorType ? runner.getRunLevelId(behaviorType) : undefined;

        const instance = factory({ injector, behaviorId: runLevelId } as VaultBehaviorFactoryContext);

        if (!instance || typeof instance !== 'object') {
          const message = `[NgVault] Behavior did not return an object`;

          // eslint-disable-next-line
          if ((factory as any)?.critical === true) {
            throw new Error(message);
          }

          // eslint-disable-next-line
          console.warn(`[NgVault] Behavior initialization failed: ${message}`);
          return null;
        }

        return instance;
      } catch (err) {
        // eslint-disable-next-line
        if ((factory as any)?.critical === true) {
          throw err;
        }

        // eslint-disable-next-line
        console.warn(`[NgVault] Non-critical behavior initialization failed: ${(err as any)?.message}`);
        return null;
      }
    })
    .filter((b): b is VaultBehavior<T> => !!b);
}
