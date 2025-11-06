// projects/core/src/lib/services/vault-behavior-lifecycle.service.ts
import { VaultBehaviorContext } from '../contexts/vault-behavior.context';
import { VaultBehaviorRunner } from '../interfaces/vault-behavior-runner.interface';
import { VaultBehavior } from '../interfaces/vault-behavior.interface';

class VaultBehaviorRunnerClass implements VaultBehaviorRunner {
  readonly #typeOrder: VaultBehavior['type'][] = ['dev-tools', 'events', 'state', 'persistence', 'encryption'];

  readonly #runIds = new Map<VaultBehavior['type'], string>();
  readonly #idToType = new Map<string, VaultBehavior['type']>();

  #initializeRunLevelIds(): void {
    const gen = () =>
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);

    this.#typeOrder.forEach((type) => {
      const id = gen();
      this.#runIds.set(type, id);
      this.#idToType.set(id, type);
    });
  }

  #isKnownRunLevelId(runLevelId: string): boolean {
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

  constructor() {
    this.#initializeRunLevelIds();
  }

  getRunLevelId(type: VaultBehavior['type']): string | undefined {
    return this.#runIds.get(type);
  }

  #runLifecycle<T>(
    runLevelId: string,
    hook: keyof VaultBehavior<T>, // e.g., 'onInit', 'onSet', etc.
    vaultKey: string,
    ctx: VaultBehaviorContext<T>,
    behaviors: VaultBehavior<T>[],
    serviceName?: string
  ): void {
    if (!(behaviors?.length && this.#isKnownRunLevelId(runLevelId))) return;

    for (const type of this.#typeOrder) {
      const filtered = behaviors.filter((b) => b.type === type);
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
