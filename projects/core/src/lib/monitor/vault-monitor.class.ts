import { inject, Injectable } from '@angular/core';
import {
  NgVaultEventBus,
  NgVaultEventModel,
  registerNgVault,
  unregisterNgVault,
  VaultEventType
} from '@ngvault/dev-tools';
import {
  defineNgVaultBehaviorKey,
  NgVaultDevModeService,
  VaultBehaviorContext,
  VaultStateSnapshot
} from '@ngvault/shared';

@Injectable({ providedIn: 'root' })
export class NgVaultMonitor {
  #devModeService = inject(NgVaultDevModeService);
  #registered = new Set<string>();
  #eventBus = inject(NgVaultEventBus);
  #initialized = new Set<string>();
  public readonly key = defineNgVaultBehaviorKey('DevTools', 'Telemetry');

  onInit<T>(vaultKey: string, serviceName: string, ctx: Readonly<VaultBehaviorContext<T>>): void {
    if (!this.#devModeService.isDevMode || this.#registered.has(vaultKey)) return;
    this.#registered.add(vaultKey);

    this.#initialized.add(vaultKey);

    registerNgVault({ key: vaultKey, service: serviceName, state: ctx });
    this.#emitEvent(vaultKey, ctx.state, 'init');
  }

  onLoad<T>(key: string, ctx: Readonly<VaultBehaviorContext<T>>): void {
    this.#emitEvent(key, ctx.state, 'load');
  }

  onSet<T>(key: string, ctx: Readonly<VaultBehaviorContext<T>>): void {
    this.#emitEvent(key, ctx.state, 'set');
  }

  onPatch<T>(key: string, ctx: Readonly<VaultBehaviorContext<T>>): void {
    this.#emitEvent(key, ctx.state, 'patch');
  }

  onReset<T>(key: string, ctx: Readonly<VaultBehaviorContext<T>>): void {
    this.#emitEvent(key, ctx.state, 'reset');
  }

  onError<T>(key: string, ctx: Readonly<VaultBehaviorContext<T>>): void {
    this.#emitEvent(key, ctx.state, 'error', ctx.message);
  }

  onDestroy<T>(key: string, ctx: Readonly<VaultBehaviorContext<T>>): void {
    this.#emitEvent(key, ctx.state, 'destroy');
    if (this.#registered.has(key)) {
      unregisterNgVault(key);
    }
  }

  onDispose<T>(key: string, ctx: Readonly<VaultBehaviorContext<T>>): void {
    this.#emitEvent(key, ctx.state, 'dispose');
  }

  #emitEvent<T>(key: string, ctx: Readonly<VaultStateSnapshot<T>>, type: VaultEventType, error?: string): void {
    if (!this.#initialized.has(key)) {
      throw new Error(`[NgVault] Behavior "${this.constructor.name}" used before onInit() for "${key}".`);
    }

    const event = {
      key,
      type,
      timestamp: Date.now(),
      state: ctx
    } as NgVaultEventModel;

    if (error) {
      event.error = error;
    }

    this.#eventBus.next(event);
  }
}

/*

// projects/core/src/lib/services/vault-monitor.service.ts
import { Injectable } from '@angular/core';
import {
  NgVaultEventBus,
  NgVaultEventModel,
  registerNgVault,
  unregisterNgVault,
  VaultEventType,
} from '@ngvault/dev-tools';
import { VaultBehaviorContext, VaultStateSnapshot } from '@ngvault/shared';

@Injectable({ providedIn: 'root' })
export class VaultMonitor {
  #registered = new Set<string>();
  constructor(private readonly bus: NgVaultEventBus) {}

  // ──────────────────────────────────────────────
  // Lifecycle / Setup
  // ──────────────────────────────────────────────
  init<T>(vaultKey: string, serviceName: string, ctx: Readonly<VaultBehaviorContext<T>>): void {
    if (this.#registered.has(vaultKey)) return;
    this.#registered.add(vaultKey);

    registerNgVault({ key: vaultKey, service: serviceName, state: ctx });
    this.#emit(vaultKey, ctx.state, 'init');
  }

  destroy<T>(vaultKey: string, ctx: Readonly<VaultBehaviorContext<T>>): void {
    this.#emit(vaultKey, ctx.state, 'destroy');
    if (this.#registered.has(vaultKey)) {
      unregisterNgVault(vaultKey);
      this.#registered.delete(vaultKey);
    }
  }

  // ──────────────────────────────────────────────
  // Declarative operation entry points
  // ──────────────────────────────────────────────
  startReplace<T>(ctx: Readonly<VaultBehaviorContext<T>>): void {
    this.#emit(ctx.state.key, ctx.state, 'lifecycle:start:replace');
  }

  endReplace<T>(ctx: Readonly<VaultBehaviorContext<T>>, value?: T): void {
    this.#emit(ctx.state.key, ctx.state, 'lifecycle:end:replace', undefined, value);
  }

  startMerge<T>(ctx: Readonly<VaultBehaviorContext<T>>): void {
    this.#emit(ctx.state.key, ctx.state, 'lifecycle:start:merge');
  }

  endMerge<T>(ctx: Readonly<VaultBehaviorContext<T>>, value?: T): void {
    this.#emit(ctx.state.key, ctx.state, 'lifecycle:end:merge', undefined, value);
  }

  error<T>(ctx: Readonly<VaultBehaviorContext<T>>, err: unknown): void {
    this.#emit(ctx.state.key, ctx.state, 'error', err instanceof Error ? err.message : String(err));
  }

  // ──────────────────────────────────────────────
  // Stage-level events (state, reduce, encrypt, persist)
  // ──────────────────────────────────────────────
  startStage<T>(stage: string, ctx: Readonly<VaultBehaviorContext<T>>): void {
    this.#emit(ctx.state.key, ctx.state, `stage:start:${stage}`);
  }

  endStage<T>(stage: string, ctx: Readonly<VaultBehaviorContext<T>>, value?: T): void {
    this.#emit(ctx.state.key, ctx.state, `stage:end:${stage}`, undefined, value);
  }

  errorStage<T>(stage: string, ctx: Readonly<VaultBehaviorContext<T>>, err: unknown): void {
    this.#emit(
      ctx.state.key,
      ctx.state,
      `stage:error:${stage}`,
      err instanceof Error ? err.message : String(err)
    );
  }

  // ──────────────────────────────────────────────
  // Private emit
  // ──────────────────────────────────────────────
  #emit<T>(
    key: string,
    ctx: Readonly<VaultStateSnapshot<T>>,
    type: VaultEventType | string,
    error?: string,
    value?: unknown
  ): void {
    const event: NgVaultEventModel = {
      key,
      type: type as VaultEventType,
      timestamp: Date.now(),
      state: ctx,
    };
    if (error) event.error = error;
    if (value !== undefined) (event as any).value = value;
    this.bus.next(event);
  }
}
  */
