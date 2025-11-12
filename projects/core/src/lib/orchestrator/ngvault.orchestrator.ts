// ─────────────────────────────────────────────────────────────
// vault-dispatcher.ts
// ─────────────────────────────────────────────────────────────
import { inject } from '@angular/core';
import {
  VaultBehavior,
  VaultBehaviorContext,
  VaultDataType,
  VaultEncryptionBehavior,
  VaultPersistenceBehavior,
  VaultReducerBehavior,
  VaultStateBehavior
} from '@ngvault/shared';
import { NGVAULT_QUEUE } from '../tokens/ngvault-queue.token';
import { applyNgVaultValueMergev2 } from '../utils/apply-vault-merge.util';
import { resourceError } from '../utils/resource-error.util';

/**
 * Core async dispatcher that drives the vault lifecycle:
 *   state → reduce → encrypt → persist → commit
 */
export class VaultOrchestrator<T> {
  // Deterministic async queue
  #queue = inject(NGVAULT_QUEUE);

  constructor(private readonly behaviors: VaultBehavior<T>[]) {}

  dispatchSet(ctx: VaultBehaviorContext<T>): void {
    this.#queue.enqueue(async () => {
      this.#safeAsync(async () => {
        let pipelineDataFlow = await this.#runStage('state', ctx);

        pipelineDataFlow = await this.#runStage('reduce', ctx, pipelineDataFlow);

        const stateData = structuredClone(pipelineDataFlow);

        pipelineDataFlow = await this.#runStage('encrypt', ctx, pipelineDataFlow);

        await this.#runStage('persist', ctx, pipelineDataFlow);

        return stateData;
      }, ctx);
    });
  }

  dispatchPatch(ctx: VaultBehaviorContext<T>): void {
    this.#queue.enqueue(async () => {
      this.#safeAsync(async () => {
        const current = ctx.value?.() ?? ({} as T);

        const partial = await this.#runStage('state', ctx);

        let pipelineDataFlow = structuredClone(applyNgVaultValueMergev2<T>(ctx, current, partial));

        pipelineDataFlow = await this.#runStage('reduce', ctx, pipelineDataFlow);

        const stateData = structuredClone(pipelineDataFlow);

        pipelineDataFlow = await this.#runStage('encrypt', ctx, pipelineDataFlow);

        await this.#runStage('persist', ctx, pipelineDataFlow);

        return stateData;
      }, ctx);
    });
  }

  async #safeAsync(fn: () => Promise<VaultDataType<T>>, ctx: VaultBehaviorContext<T>): Promise<void> {
    try {
      ctx.isLoading?.set(true);
      ctx.error?.set(null);
      const stateData = await fn();
      queueMicrotask(() => {
        ctx.value?.set(stateData);
        ctx.isLoading?.set(false);
        ctx.error?.set(null);
      });
    } catch (err) {
      ctx.error?.set(resourceError(err));
      ctx.isLoading?.set(false);
    }
  }

  async #runStage(
    stage: 'state' | 'reduce' | 'encrypt' | 'persist',
    ctx: VaultBehaviorContext<T>,
    working?: T
  ): Promise<T | undefined> {
    const stageBehaviors = this.behaviors.filter((b) => b.type === stage);
    let current = working;

    for (const behavior of stageBehaviors) {
      let next: T | void | undefined;

      switch (stage) {
        case 'state':
          next = await (behavior as VaultStateBehavior<T>).computeState(ctx);
          break;

        case 'reduce':
          next = await (behavior as VaultReducerBehavior<T>).applyReducers(ctx, current!);
          break;

        case 'encrypt':
          next = await (behavior as VaultEncryptionBehavior<T>).encryptState(ctx, current!);
          break;

        case 'persist':
          await (behavior as VaultPersistenceBehavior<T>).persistState(ctx, current!);
          break;
      }

      if (next !== undefined) current = next;
    }

    return current;
  }
}
