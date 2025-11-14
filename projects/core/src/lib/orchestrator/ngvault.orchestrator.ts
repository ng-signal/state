// ─────────────────────────────────────────────────────────────
// vault-dispatcher.ts
// ─────────────────────────────────────────────────────────────
import { HttpResourceRef } from '@angular/common/http';
import { effect, inject, Injector, runInInjectionContext } from '@angular/core';
import {
  NgVaultDataType,
  NgVaultReducerFunction,
  NgVaultStateInputType,
  NrVaultStateType,
  VaultBehavior,
  VaultBehaviorContext,
  VaultEncryptionBehavior,
  VaultPersistenceBehavior,
  VaultReducerBehavior,
  VaultStateBehavior
} from '@ngvault/shared';
import { NgVaultMonitor } from '../monitor/ngvault-monitor.service';
import { NGVAULT_QUEUE } from '../tokens/ngvault-queue.token';
import { applyNgVaultValueMerge } from '../utils/apply-vault-merge.util';
import { isHttpResourceRef } from '../utils/is-http-resource.util';
import { resourceError } from '../utils/resource-error.util';

export class VaultOrchestrator<T> {
  #queue = inject(NGVAULT_QUEUE);
  #ngVaultMonitor!: NgVaultMonitor;

  constructor(
    private cellKey: string,
    private readonly behaviors: VaultBehavior<T>[],
    private readonly reducers: NgVaultReducerFunction<T>[],
    private readonly injector: Injector,
    readonly ngVaultMonitor: NgVaultMonitor
  ) {
    this.#ngVaultMonitor = ngVaultMonitor;
  }

  #ensureIncoming(ctx: VaultBehaviorContext<T>): NgVaultStateInputType<T> | null {
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
      this.#ngVaultMonitor.startReplace(this.cellKey, 'vault-orchestrator', ctx);

      const incoming = this.#ensureIncoming(ctx);
      if (!incoming) return;

      this.#safeAsync(async () => {
        const stateResult = await this.#runStage('state', ctx);

        const finalState = await this.#finishPipeline(ctx, stateResult);

        this.#ngVaultMonitor.endReplace(this.cellKey, 'vault-orchestrator', ctx);
        return finalState;
      }, ctx);
    });
  }

  dispatchPatch(ctx: VaultBehaviorContext<T>): void {
    this.#queue.enqueue(async () => {
      ctx.operation = 'merge';
      this.#ngVaultMonitor.startMerge(this.cellKey, 'vault-orchestrator', ctx);

      const incoming = this.#ensureIncoming(ctx);
      if (!incoming) {
        this.#ngVaultMonitor.endMerge(this.cellKey, 'vault-orchestrator', ctx, { noop: true });
        return;
      }

      this.#safeAsync(async () => {
        const current = ctx.value?.() ?? ({} as T);

        const partial = await this.#runStage('state', ctx);

        const stateResult = structuredClone(applyNgVaultValueMerge<T>(current, partial));

        const finalState = await this.#finishPipeline(ctx, stateResult);
        this.#ngVaultMonitor.endMerge(this.cellKey, 'vault-orchestrator', ctx);
        return finalState;
      }, ctx);
    });
  }

  async #safeAsync(
    fn: () => Promise<NgVaultDataType<T> | void | Partial<NrVaultStateType<T>> | null>,
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

      if (incoming?.loading !== undefined) ctx.isLoading?.set(incoming.loading);
      if (incoming?.error !== undefined) ctx.error?.set(incoming.error);

      const result = await fn();

      queueMicrotask(() => {
        // Case 1: pipeline produced a real value
        if (result !== undefined && result !== null) {
          ctx.value?.set(result as T);

          // DO NOT override loading/error — user set these
          return;
        }

        // Case 2: pipeline explicitly produced null → wipe value
        if (result === null) {
          ctx.value?.set(undefined);

          // DO NOT override loading/error — user set these
          return;
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

      try {
        switch (stage) {
          case 'state':
            if (typeof (behavior as VaultStateBehavior<T>).computeState === 'function') {
              // TODO - make this better for state management
              this.#ngVaultMonitor.startState(this.cellKey, behavior.key, ctx);
              next = await (behavior as VaultStateBehavior<T>).computeState(ctx);
              this.#ngVaultMonitor.endState(this.cellKey, behavior.key, ctx);
            }
            break;

          case 'reduce':
            if (typeof (behavior as VaultReducerBehavior<T>).applyReducer === 'function') {
              if (current === undefined) {
                throw new Error(`[NgVault] Reducer stage received undefined state in cell "${this.cellKey}".`);
              }

              for (const reducer of this.reducers) {
                this.#ngVaultMonitor.startReducer(this.cellKey, behavior.key, ctx);
                const nextValue = (behavior as VaultReducerBehavior<T>).applyReducer(current, reducer);

                this.#ngVaultMonitor.endReducer(this.cellKey, behavior.key, ctx);
                if (nextValue !== undefined) {
                  current = nextValue;
                }
              }
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
      } catch (err) {
        ctx.error?.set(resourceError(err));
        ctx.isLoading?.set(false);
        this.#ngVaultMonitor.error(this.cellKey, behavior.key, ctx, err);
        throw err;
      }

      if (next !== undefined) current = next;
    }

    return current;
  }
}
