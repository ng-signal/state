// projects/core/src/lib/services/vault-behavior-lifecycle.service.ts
import { Injector } from '@angular/core';
import { validateNgVaultBehaviorKey } from '@ngvault/shared-models';
import { VaultBehaviorFactoryContext } from '../contexts/vault-behavior-factory.context';
import { VaultBehaviorContext } from '../contexts/vault-behavior.context';
import { VaultBehaviorRunner } from '../interfaces/vault-behavior-runner.interface';
import { VaultBehavior } from '../interfaces/vault-behavior.interface';
import { VaultBehaviorFactory } from '../types/vault-behavior-factory.type';
import { VaultBehaviorTypeOrder } from '../types/vault-behavior.type';

class VaultBehaviorRunnerClass implements VaultBehaviorRunner {
  readonly #typeOrder = [...VaultBehaviorTypeOrder];
  // eslint-disable-next-line
  #behaviors: VaultBehavior<any>[] = [];
  readonly #behaviorIds = new Map<VaultBehavior['type'], string>();
  readonly #idToType = new Map<string, VaultBehavior['type']>();
  #initialized = false;

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

  initialize(): string {
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

  #verifyInitialized(): void {
    if (!this.#initialized) {
      throw new Error(
        '[NgVault] VaultBehaviorRunner has not been initialized. ' +
          'Call initialize() before invoking lifecycle methods.'
      );
    }
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
    hook: keyof VaultBehavior<T>, // e.g., 'onInit', 'onSet', etc.
    vaultKey: string,
    ctx: VaultBehaviorContext<T>,
    serviceName?: string
  ): void {
    this.#verifyInitialized();
    if (!(this.#behaviors?.length && this.#isKnownBehaviorId(behaviorId))) return;

    const systemBehaviors = this.#behaviors.filter((b) => {
      return ['dev-tools', 'events'].includes(b.type);
    });
    this.#lifeCycle(hook, vaultKey, ctx, systemBehaviors, serviceName);

    const next = this.#getNextBehaviorFromId(behaviorId);
    if (!next) return; // End of the pipeline — nothing further to execute

    // 🔹 Retrieve and execute only that next run level
    const nextBehaviors = this.#behaviors.filter((b) => b.type === next.type);
    this.#lifeCycle(hook, vaultKey, ctx, nextBehaviors, serviceName);
  }

  initializeBehaviors<T>(injector: Injector, behaviors: Array<VaultBehaviorFactory<T>>): void {
    this.#verifyInitialized();

    if (!behaviors || behaviors.length === 0) return;

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
            behaviorId
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
