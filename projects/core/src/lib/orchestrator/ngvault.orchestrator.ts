// ─────────────────────────────────────────────────────────────
// vault-dispatcher.ts
// ─────────────────────────────────────────────────────────────
import { inject } from '@angular/core';
import { VaultBehavior, VaultBehaviorContext, VaultDataType } from '@ngvault/shared';
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

  // ────────────────────────────────────────────────
  // Core stage executor
  // ────────────────────────────────────────────────
  async #runStage(
    stage: 'state' | 'reduce' | 'encrypt' | 'persist',
    ctx: VaultBehaviorContext<T>,
    working?: T
  ): Promise<T | undefined> {
    const stageBehaviors = this.behaviors.filter((b) => b.type === stage);
    let current = working;

    for (const behavior of stageBehaviors) {
      const next = await behavior.run?.(ctx, current);
      if (next !== undefined) current = next;
    }

    return current;
  }
}
