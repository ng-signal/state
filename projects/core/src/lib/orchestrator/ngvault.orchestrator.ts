// ─────────────────────────────────────────────────────────────
// vault-dispatcher.ts
// ─────────────────────────────────────────────────────────────
import { HttpResourceRef } from '@angular/common/http';
import { effect, inject, Injector, runInInjectionContext } from '@angular/core';
import {
  VaultBehavior,
  VaultBehaviorContext,
  VaultDataType,
  VaultEncryptionBehavior,
  VaultPersistenceBehavior,
  VaultReducerBehavior,
  VaultStateBehavior,
  VaultStateInputType,
  VaultStateType
} from '@ngvault/shared';
import { NGVAULT_QUEUE } from '../tokens/ngvault-queue.token';
import { applyNgVaultValueMergev2 } from '../utils/apply-vault-merge.util';
import { isHttpResourceRef } from '../utils/is-http-resource.util';
import { resourceError } from '../utils/resource-error.util';

export class VaultOrchestrator<T> {
  #queue = inject(NGVAULT_QUEUE);

  constructor(
    private readonly behaviors: VaultBehavior<T>[],
    private readonly injector: Injector
  ) {}

  #ensureIncoming(ctx: VaultBehaviorContext<T>): VaultStateInputType<T> | null {
    const incoming = ctx.incoming;

    if (incoming == null) {
      ctx.isLoading?.set(false);
      ctx.error?.set(null);
      ctx.value?.set(undefined);
      return null;
    }

    return incoming;
  }

  async #finishPipeline(ctx: VaultBehaviorContext<T>, working?: T): Promise<T | undefined> {
    // Stage 1: reduce
    let pipelineDataFlow = await this.#runStage('reduce', ctx, working);

    // Clone AFTER reduce for purity
    const stateData = structuredClone(pipelineDataFlow);

    // Stage 2: encrypt
    pipelineDataFlow = await this.#runStage('encrypt', ctx, pipelineDataFlow);

    // Stage 3: persist
    await this.#runStage('persist', ctx, pipelineDataFlow);

    // Commit the *cloned* pre-encrypted snapshot to signals
    return stateData;
  }
  // ──────────────────────────────
  // dispatchSet with proper narrowing
  // ──────────────────────────────
  dispatchSet(ctx: VaultBehaviorContext<T>): void {
    this.#queue.enqueue(async () => {
      ctx.operation = 'replace';

      const incoming = this.#ensureIncoming(ctx);
      if (!incoming) return;

      this.#safeAsync(async () => {
        const stateResult = await this.#runStage('state', ctx);

        return await this.#finishPipeline(ctx, stateResult);
      }, ctx);
    });
  }

  dispatchPatch(ctx: VaultBehaviorContext<T>): void {
    this.#queue.enqueue(async () => {
      ctx.operation = 'merge';

      const incoming = this.#ensureIncoming(ctx);
      if (!incoming) return;

      this.#safeAsync(async () => {
        const current = ctx.value?.() ?? ({} as T);

        const partial = await this.#runStage('state', ctx);

        const stateResult = structuredClone(applyNgVaultValueMergev2<T>(ctx, current, partial));

        return await this.#finishPipeline(ctx, stateResult);
      }, ctx);
    });
  }

  async #safeAsync(
    fn: () => Promise<VaultDataType<T> | void | Partial<VaultStateType<T>> | null>,
    ctx: VaultBehaviorContext<T>
  ): Promise<void> {
    try {
      const incoming = ctx.incoming;

      if (isHttpResourceRef(incoming)) {
        const resource = incoming as HttpResourceRef<T>;

        // Run inside injector to attach Angular reactivity
        runInInjectionContext(this.injector, () => {
          const stop = effect(() => {
            // Always mirror current resource state
            ctx.isLoading?.set(resource.isLoading());

            try {
              if (resource.value() !== undefined) {
                ctx.value?.set(resource.value());
                ctx.error?.set(null);
              }
            } catch {
              ctx.error?.set(resourceError(resource.error()));
            }
          });

          // Destroy effect when FeatureCell is destroyed
          ctx.destroyed$?.subscribe(() => stop.destroy());
        });

        // Let the behavior’s pipeline continue
        await fn();
        return;
      }

      const isPlainState = incoming != null && typeof incoming === 'object' && !isHttpResourceRef(incoming);
      const incomingState = isPlainState ? (incoming as Partial<VaultStateType<T>>) : {};
      const isReplace = ctx.operation === 'replace';

      if (incomingState.loading !== undefined) ctx.isLoading?.set(incomingState.loading);
      if (incomingState.error !== undefined) ctx.error?.set(incomingState.error);

      const result = await fn();

      queueMicrotask(() => {
        let normalized: Partial<VaultStateType<T>> = {};

        if (result == null) {
          normalized = incomingState;
        } else {
          normalized = { value: result as T };
        }

        if (normalized.value !== undefined) {
          ctx.value?.set(normalized.value);
        } else if (isReplace) {
          ctx.value?.set(undefined);
        }

        if (normalized.loading !== undefined) {
          ctx.isLoading?.set(normalized.loading);
        } else if (incomingState.loading !== undefined) {
          ctx.isLoading?.set(incomingState.loading);
        } else if (isReplace) {
          ctx.isLoading?.set(false);
        }

        if (normalized.error !== undefined) {
          ctx.error?.set(normalized.error);
        } else if (incomingState.error !== undefined) {
          ctx.error?.set(incomingState.error);
        } else if (isReplace) {
          ctx.error?.set(null);
        }
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
          if (typeof (behavior as VaultStateBehavior<T>).computeState === 'function') {
            next = await (behavior as VaultStateBehavior<T>).computeState(ctx);
          }
          break;

        case 'reduce':
          if (typeof (behavior as VaultReducerBehavior<T>).applyReducers === 'function') {
            next = await (behavior as VaultReducerBehavior<T>).applyReducers(ctx, current!);
          }
          break;

        case 'encrypt':
          if (typeof (behavior as VaultEncryptionBehavior<T>).encryptState === 'function') {
            next = await (behavior as VaultEncryptionBehavior<T>).encryptState(ctx, current!);
          }
          break;

        case 'persist':
          if (typeof (behavior as VaultPersistenceBehavior<T>).persistState === 'function') {
            await (behavior as VaultPersistenceBehavior<T>).persistState(ctx, current!);
          }
          break;
      }

      if (next !== undefined) current = next;
    }

    return current;
  }
}
