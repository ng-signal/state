// projects/core/src/lib/services/vault-behavior-lifecycle.service.ts
import { Injector } from '@angular/core';
import { PROTECTED_FEATURE_CELL_KEYS } from '../constants/protected-feature-cell-keys.constant';
import { VaultBehaviorFactoryContext } from '../contexts/vault-behavior-factory.context';
import { VaultBehaviorContext } from '../contexts/vault-behavior.context';
import { VaultBehaviorRunner } from '../interfaces/vault-behavior-runner.interface';
import { VaultBehavior } from '../interfaces/vault-behavior.interface';
import { FeatureCell } from '../models/feature-cell.model';
import { VaultBehaviorFactory } from '../types/vault-behavior-factory.type';
import { VaultBehaviorTypeOrder } from '../types/vault-behavior.type';
import { validateNgVaultBehaviorKey } from '../utils/define-ngvault-behavior-key.util';
import { NgVaultAsyncQueue } from './ngvault-async-queue';

class VaultBehaviorRunnerClass implements VaultBehaviorRunner {
  readonly #typeOrder = [...VaultBehaviorTypeOrder];
  // eslint-disable-next-line
  #behaviors: VaultBehavior<any>[] = [];
  readonly #behaviorIds = new Map<VaultBehavior['type'], string>();
  readonly #idToType = new Map<string, VaultBehavior['type']>();
  #initialized = false;
  #queue = new NgVaultAsyncQueue();

  #initializeBehaviorIds(): void {
    const gen = () =>
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);

    this.#typeOrder.forEach((type) => {
      const id = gen();
      this.#behaviorIds.set(type, id);
      this.#idToType.set(id, type);
    });
  }

  #isKnownBehaviorId(behaviorId: string): boolean {
    return this.#idToType.has(behaviorId);
  }

  #getNextBehaviorFromId(behaviorId: string): { type: VaultBehavior['type']; id: string } | undefined {
    const currentType = this.#idToType.get(behaviorId)!;
    const currentIndex = this.#typeOrder.indexOf(currentType);
    const nextType = this.#typeOrder[currentIndex + 1];
    const nextId = this.#behaviorIds.get(nextType);

    if (!nextId) return undefined;

    return { type: nextType, id: nextId };
  }

  #lifeCycle<T>(
    hook: keyof VaultBehavior<T>, // e.g., 'onInit', 'onSet', etc.
    vaultKey: string,
    ctx: VaultBehaviorContext<T>,
    behaviors: VaultBehavior<T>[],
    serviceName?: string
  ): void {
    for (const behavior of behaviors) {
      const fn = behavior[hook];
      if (typeof fn === 'function') {
        if (hook === 'onInit') {
          (fn as (this: VaultBehavior<T>, key: string, service: string, ctx: VaultBehaviorContext<T>) => void).call(
            behavior,
            vaultKey,
            serviceName!,
            ctx
          );
        } else {
          (fn as (this: VaultBehavior<T>, key: string, ctx: VaultBehaviorContext<T>) => void).call(
            behavior,
            vaultKey,
            ctx
          );
        }
      }
    }
  }

  #runLifecycles<T>(
    behaviorId: string,
    hook: keyof VaultBehavior<T>, // 'onInit', 'onSet', etc.
    vaultKey: string,
    ctx: VaultBehaviorContext<T>,
    serviceName?: string
  ): void {
    this.#verifyInitialized();
    if (!(this.#behaviors?.length && this.#isKnownBehaviorId(behaviorId))) return;

    this.#queue.enqueue(() => {
      // 1) system-first (dev-tools, events)
      const systemBehaviors = this.#behaviors.filter((b) => b.type === 'dev-tools' || b.type === 'events');
      this.#lifeCycle(hook, vaultKey, ctx, systemBehaviors, serviceName);

      // 2) then the next run-level derived from caller
      const next = this.#getNextBehaviorFromId(behaviorId);
      if (!next) return;

      const nextBehaviors = this.#behaviors.filter((b) => b.type === next.type);
      this.#lifeCycle(hook, vaultKey, ctx, nextBehaviors, serviceName);
    });
  }

  #verifyInitialized(): void {
    if (!this.#initialized) {
      throw new Error(
        '[NgVault] VaultBehaviorRunner has not been initialized. ' +
          'Call initialize() before invoking lifecycle methods.'
      );
    }
  }

  #initialize(): string {
    if (this.#initialized) {
      throw new Error('[NgVault] VaultBehaviorRunner already initialized — cannot reissue core behavior ID.');
    }
    this.#initializeBehaviorIds();

    const coreId = this.#behaviorIds.get('core');
    if (!coreId) throw new Error('[NgVault] Failed to obtain core behavior ID during initialization.');

    this.#initialized = true;
    Object.freeze(this.#behaviorIds);
    Object.freeze(this.#idToType);

    return coreId;
  }

  initializeBehaviors<T>(injector: Injector, behaviors: Array<VaultBehaviorFactory<T>>): string {
    const coreId = this.#initialize();

    if (!behaviors || behaviors.length === 0) return coreId;

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
          // Create the instance with its signed ID
          const behaviorId = this.#behaviorIds.get(behaviorType);

          const instance = factory({
            injector,
            behaviorId,
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

          if (typeof instance.onInit !== 'function') {
            throw new Error(
              `[NgVault] Behavior "${instance.constructor.name}" missing required "onInit" method. All behaviors must implement onInit().`
            );
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

    return coreId;
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

      behavior.onInit(behavior.key!, cell.key!, cell.ctx!);
    }
  }

  onInit<T>(behaviorId: string, vaultKey: string, serviceName: string, ctx: VaultBehaviorContext<T>): void {
    this.#runLifecycles(behaviorId, 'onInit', vaultKey, ctx, serviceName);
  }

  onLoad<T>(behaviorId: string, vaultKey: string, ctx: VaultBehaviorContext<T>): void {
    this.#runLifecycles(behaviorId, 'onLoad', vaultKey, ctx);
  }

  onSet<T>(behaviorId: string, vaultKey: string, ctx: VaultBehaviorContext<T>): void {
    this.#runLifecycles(behaviorId, 'onSet', vaultKey, ctx);
  }

  onPatch<T>(behaviorId: string, vaultKey: string, ctx: VaultBehaviorContext<T>): void {
    this.#runLifecycles(behaviorId, 'onPatch', vaultKey, ctx);
  }

  onError<T>(behaviorId: string, vaultKey: string, ctx: VaultBehaviorContext<T>): void {
    this.#runLifecycles(behaviorId, 'onError', vaultKey, ctx);
  }

  onReset<T>(behaviorId: string, vaultKey: string, ctx: VaultBehaviorContext<T>): void {
    this.#runLifecycles(behaviorId, 'onReset', vaultKey, ctx);
  }

  onDestroy<T>(behaviorId: string, vaultKey: string, ctx: VaultBehaviorContext<T>): void {
    this.#runLifecycles(behaviorId, 'onDestroy', vaultKey, ctx);
  }

  onDispose<T>(behaviorId: string, vaultKey: string, ctx: VaultBehaviorContext<T>): void {
    this.#runLifecycles(behaviorId, 'onDispose', vaultKey, ctx);
  }
}

export function NgVaultBehaviorLifecycleService(): VaultBehaviorRunner {
  return new VaultBehaviorRunnerClass();
}
