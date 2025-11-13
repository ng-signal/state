// projects/core/src/lib/services/vault-behavior-lifecycle.service.ts
import { Injector } from '@angular/core';
import { PROTECTED_FEATURE_CELL_KEYS } from '../constants/protected-feature-cell-keys.constant';
import { VaultBehaviorFactoryContext } from '../contexts/vault-behavior-factory.context';
import { VaultBehaviorContext } from '../contexts/vault-behavior.context';
import { VaultBehaviorRunner } from '../interfaces/vault-behavior-runner.interface';
import { VaultBehavior } from '../interfaces/vault-behavior.interface';
import { FeatureCell } from '../models/feature-cell.model';
import { VaultBehaviorFactory } from '../types/vault-behavior-factory.type';
import { validateNgVaultBehaviorKey } from '../utils/define-ngvault-behavior-key.util';

class VaultBehaviorRunnerClass implements VaultBehaviorRunner {
  // eslint-disable-next-line
  #behaviors: VaultBehavior<any>[] = [];
  #initialized = false;

  initializeBehaviors<T>(injector: Injector, behaviors: Array<VaultBehaviorFactory<T>>): VaultBehavior<T>[] {
    if (this.#initialized)
      throw new Error('[NgVault] VaultBehaviorRunner already initialized — cannot reissue core behavior ID.');

    this.#initialized = true;

    if (!behaviors || behaviors.length === 0) return [];

    const seenKeys = new Set<string>();

    this.#behaviors = behaviors
      .map((factory) => {
        let isCritical = false;
        try {
          // Determine declared behavior type
          // eslint-disable-next-line
          const behaviorType = (factory as any)?.type as VaultBehavior['type'] | undefined;
          if (!behaviorType) {
            isCritical = true;
            throw new Error(`[NgVault] Behavior factory missing type metadata.`);
          }

          const instance = factory({
            injector,
            type: behaviorType
          } as VaultBehaviorFactoryContext);

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

          if (!(instance.key && validateNgVaultBehaviorKey(instance.key))) {
            isCritical = true;
            throw new Error(
              `[NgVault] Behavior missing key for type "${behaviorType}". Every behavior must define a unique "key".`
            );
          }

          if (instance.key && seenKeys.has(instance.key)) {
            // eslint-disable-next-line
            console.warn(`[NgVault] Skipping duplicate behavior with key "${instance.key}"`);
            return null;
          }

          if (instance.key) seenKeys.add(instance.key);

          return instance;
        } catch (err) {
          // eslint-disable-next-line
          if ((factory as any)?.critical === true || isCritical) {
            throw err;
          }

          // eslint-disable-next-line
          console.warn(`[NgVault] Non-critical behavior initialization failed: ${(err as any)?.message}`);
          return null;
        }
      })
      .filter((b): b is VaultBehavior<T> => !!b);

    return this.#behaviors;
  }

  applyBehaviorExtensions<T>(cell: FeatureCell<T>): void {
    for (const behavior of this.#behaviors) {
      const extensions = behavior.extendCellAPI?.();
      if (!extensions || typeof extensions !== 'object') continue;

      for (const [key, fn] of Object.entries(extensions)) {
        const alreadyDefined = cell[key as keyof FeatureCell<T>] !== undefined;
        const canOverride =
          //eslint-disable-next-line
          Array.isArray((behavior as any).allowOverride) && (behavior as any).allowOverride.includes(key);

        // Block core keys
        if (PROTECTED_FEATURE_CELL_KEYS.has(key)) {
          throw new Error(
            `[NgVault] Behavior "${behavior.key}" attempted to overwrite core FeatureCell method "${key}".`
          );
        }

        if (alreadyDefined && !canOverride) {
          throw new Error(
            `[NgVault] Behavior "${behavior.key}" attempted to redefine method "${key}" already provided by another behavior.`
          );
        }

        if (alreadyDefined && canOverride) {
          //eslint-disable-next-line
          console.warn(`[NgVault] Behavior "${behavior.key}" is overriding method "${key}" (explicitly allowed).`);
          //eslint-disable-next-line
          delete (cell as any)[key]; // always safe now
        }

        // Always configurable for future safe overrides
        Object.defineProperty(cell, key, {
          //eslint-disable-next-line
          value: (...args: any[]) => {
            try {
              return fn?.(cell.key as string, cell.ctx as VaultBehaviorContext<T>, ...args);
            } catch (err) {
              //eslint-disable-next-line
              console.error(`[NgVault] Behavior extension "${key}" threw an error:`, err);
              throw err;
            }
          },
          enumerable: false,
          writable: false,
          configurable: true
        });
      }
    }
  }
}

export function NgVaultBehaviorLifecycleService(): VaultBehaviorRunner {
  return new VaultBehaviorRunnerClass();
}
