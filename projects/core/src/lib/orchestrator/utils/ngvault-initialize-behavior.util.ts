// projects/core/src/lib/services/vault-behavior-lifecycle.service.ts
import { Injector } from '@angular/core';
import {
  NgVaultBehavior,
  NgVaultBehaviorFactory,
  NgVaultBehaviorFactoryContext,
  ngVaultError,
  NgVaultFeatureCell,
  ngVaultWarn,
  validateNgVaultBehaviorKey
} from '@ngvault/shared';
import { PROTECTED_FEATURE_CELL_KEYS } from '../../constants/protected-feature-cell-keys.constant';
import { NgVaultBehaviorInit } from '../../interfaces/ngvault-behavior-initialization.interface';

class VaultBehaviorInitializationClass implements NgVaultBehaviorInit {
  // eslint-disable-next-line
  #behaviors: NgVaultBehavior<any>[] = [];
  #initialized = false;
  #cellKey: string;

  constructor(cellKey: string) {
    this.#cellKey = cellKey;
  }

  initializeBehaviors<T>(injector: Injector, behaviors: Array<NgVaultBehaviorFactory<T>>): NgVaultBehavior<T>[] {
    if (this.#initialized)
      throw new Error(
        `[NgVault] VaultBehaviorRunner already initialized — cannot reissue core behavior ID for feature cell "${this.#cellKey}".`
      );

    this.#initialized = true;

    if (!behaviors || behaviors.length === 0) return [];

    const seenKeys = new Set<string>();

    this.#behaviors = behaviors
      .map((factory) => {
        let isCritical = false;
        try {
          // Determine declared behavior type
          // eslint-disable-next-line
          const behaviorType = (factory as any)?.type as NgVaultBehavior['type'] | undefined;
          if (!behaviorType) {
            isCritical = true;
            throw new Error(`[NgVault] Behavior factory missing type metadata.`);
          }

          const instance = factory({
            injector,
            type: behaviorType,
            featureCellKey: this.#cellKey
          } as NgVaultBehaviorFactoryContext);

          if (!instance || typeof instance !== 'object') {
            const message = `[NgVault] Behavior did not return an object`;

            // eslint-disable-next-line
            if ((factory as any)?.critical === true) {
              throw new Error(message);
            }

            ngVaultWarn(`[NgVault] Behavior initialization failed: ${message}`);
            return null;
          }

          if (!instance.key) {
            isCritical = true;
            throw new Error(
              `[NgVault] Behavior missing key for type "${behaviorType}". Every behavior must define a unique "key".`
            );
          }

          if (!validateNgVaultBehaviorKey(instance.key)) {
            isCritical = true;
            throw new Error(
              `[NgVault] Behavior key "${instance.key}" not valid format for "${behaviorType}" behavior.`
            );
          }

          if (instance.key && seenKeys.has(instance.key)) {
            ngVaultWarn(`[NgVault] Skipping duplicate behavior with key "${instance.key}"`);
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
          ngVaultWarn(`[NgVault] Non-critical behavior initialization failed: ${(err as any)?.message}`);
          return null;
        }
      })
      .filter((b): b is NgVaultBehavior<T> => !!b);

    return this.#behaviors;
  }

  applyBehaviorExtensions<T>(cell: NgVaultFeatureCell<T>): void {
    for (const behavior of this.#behaviors) {
      const extensions = behavior.extendCellAPI?.();
      if (!extensions || typeof extensions !== 'object') continue;

      for (const [key, fn] of Object.entries(extensions)) {
        const alreadyDefined = cell[key as keyof NgVaultFeatureCell<T>] !== undefined;
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
          ngVaultWarn(`[NgVault] Behavior "${behavior.key}" is overriding method "${key}" (explicitly allowed).`);
          //eslint-disable-next-line
          delete (cell as any)[key]; // always safe now
        }

        Object.defineProperty(cell, key, {
          //eslint-disable-next-line
          value: (...args: any[]) => {
            try {
              if (typeof fn !== 'function') return;
              return fn(cell.ctx!, ...args);
            } catch (err) {
              ngVaultError(`[NgVault] Behavior extension "${key}" threw an error:`, err);
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

export function ngVaultInitializeBehaviors(cellKey: string): NgVaultBehaviorInit {
  return new VaultBehaviorInitializationClass(cellKey);
}
