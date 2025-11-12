import { inject, Injectable } from '@angular/core';
import { NgVaultEventBus, NgVaultEventModel } from '@ngvault/dev-tools';
import { defineNgVaultBehaviorKey, VaultBehaviorContext, VaultStateSnapshot } from '@ngvault/shared';

@Injectable({ providedIn: 'root' })
export class NgVaultMonitor {
  #eventBus = inject(NgVaultEventBus);
  public readonly key = defineNgVaultBehaviorKey('DevTools', 'Telemetry');

  #serializeName(name: string): string {
    const lower = name.toLowerCase();
    const phase = lower.startsWith('start') ? 'start' : lower.startsWith('end') ? 'end' : 'error';

    const domain = /(replace|merge)/.test(lower)
      ? 'lifecycle'
      : /(state|reduce|encrypt|persist)/.test(lower)
        ? 'stage'
        : 'lifecycle';

    const operation = lower.replace(/^(start|end|error)/, '');
    return `${domain}:${phase}:${operation || 'unknown'}`;
  }

  startReplace<T>(cell: string, behaviorId: string, ctx: Readonly<VaultBehaviorContext<T>>): void {
    this.#emitEvent(cell, behaviorId, 'startReplace', ctx.state);
  }

  endReplace<T>(cell: string, behaviorId: string, ctx: Readonly<VaultBehaviorContext<T>>): void {
    this.#emitEvent(cell, behaviorId, 'endReplace', ctx.state);
  }

  startMerge<T>(cell: string, behaviorId: string, ctx: Readonly<VaultBehaviorContext<T>>): void {
    this.#emitEvent(cell, behaviorId, 'startMerge', ctx.state);
  }

  endMerge<T>(cell: string, behaviorId: string, ctx: Readonly<VaultBehaviorContext<T>>): void {
    this.#emitEvent(cell, behaviorId, 'endMerge', ctx.state);
  }

  startState<T>(cell: string, behaviorId: string, ctx: Readonly<VaultBehaviorContext<T>>): void {
    this.#emitEvent(cell, behaviorId, 'startState', ctx.state);
  }

  endState<T>(cell: string, behaviorId: string, ctx: Readonly<VaultBehaviorContext<T>>): void {
    this.#emitEvent(cell, behaviorId, 'endState', ctx.state);
  }

  error<T>(cell: string, behaviorId: string, ctx: Readonly<VaultBehaviorContext<T>>, err: unknown): void {
    this.#emitEvent(cell, behaviorId, 'error', ctx.state, 'error', err instanceof Error ? err.message : String(err));
  }

  #emitEvent<T>(
    cell: string,
    behaviorId: string,
    type: string,
    ctx: Readonly<VaultStateSnapshot<T>>,
    payload?: unknown,
    error?: string
  ): void {
    const event = {
      id: crypto.randomUUID(),
      cell,
      behaviorId: behaviorId,
      type: this.#serializeName(type),
      timestamp: Date.now(),
      state: ctx,
      ...(payload ? { payload } : {})
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
