// projects/core/src/lib/services/vault-behavior-lifecycle.service.ts
import { Injector } from '@angular/core';
import { VaultBehaviorFactoryContext } from '../contexts/vault-behavior-factory.context';
import { VaultBehaviorContext } from '../contexts/vault-behavior.context';
import { VaultBehaviorRunner } from '../interfaces/vault-behavior-runner.interface';
import { VaultBehavior } from '../interfaces/vault-behavior.interface';
import { VaultBehaviorFactory } from '../types/vault-behavior-factory.type';
import { VaultBehaviorTypeOrder } from '../types/vault-behavior.type';

class VaultBehaviorRunnerClass implements VaultBehaviorRunner {
  readonly #typeOrder = [...VaultBehaviorTypeOrder];

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

  #isKnownBehaviorId(runLevelId: string): boolean {
    return this.#idToType.has(runLevelId);
  }

  /*
  #getNextRunLevelFromId(runLevelId: string): { type: VaultBehavior['type']; id: string } | undefined {
    const currentType = this.#idToType.get(runLevelId);
    if (!currentType) {
      return undefined;
    }

    const currentIndex = this.#typeOrder.indexOf(currentType);
    if (currentIndex === -1 || currentIndex >= this.#typeOrder.length - 1) return undefined;

    const nextType = this.#typeOrder[currentIndex + 1];
    const nextId = this.#runIds.get(nextType)!;
    return { type: nextType, id: nextId };
  }
    */

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

  #runLifecycle<T>(
    behaviorId: string,
    hook: keyof VaultBehavior<T>, // e.g., 'onInit', 'onSet', etc.
    vaultKey: string,
    ctx: VaultBehaviorContext<T>,
    behaviors: VaultBehavior<T>[],
    serviceName?: string
  ): void {
    this.#verifyInitialized();
    if (!(behaviors?.length && this.#isKnownBehaviorId(behaviorId))) return;

    for (const type of this.#typeOrder) {
      const filtered = behaviors.filter((b) => {
        return b.type === type;
      });
      for (const behavior of filtered) {
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
  }

  initializeBehaviors<T>(injector: Injector, behaviors: Array<VaultBehaviorFactory<T>>): VaultBehavior<T>[] {
    this.#verifyInitialized();

    if (!behaviors || behaviors.length === 0) return [];

    return behaviors
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

  onInit<T>(
    runLevelId: string,
    vaultKey: string,
    serviceName: string,
    ctx: VaultBehaviorContext<T>,
    behaviors: VaultBehavior<T>[]
  ): void {
    this.#runLifecycle(runLevelId, 'onInit', vaultKey, ctx, behaviors, serviceName);
  }

  onSet<T>(runLevelId: string, vaultKey: string, ctx: VaultBehaviorContext<T>, behaviors: VaultBehavior<T>[]): void {
    if (!behaviors?.length) return;

    this.#runLifecycle(runLevelId, 'onSet', vaultKey, ctx, behaviors);
  }
}

export function NgVaultBehaviorLifecycleService(): VaultBehaviorRunner {
  return new VaultBehaviorRunnerClass();
}
