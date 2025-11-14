import { inject, Injectable } from '@angular/core';
import { NgVaultEventBus, NgVaultEventModel } from '@ngvault/dev-tools';
import {
  defineNgVaultBehaviorKey,
  NgVaultBehaviorContext,
  NgVaultDevModeService,
  NgVaultInsightDefinition,
  VaultStateSnapshot
} from '@ngvault/shared';

@Injectable({ providedIn: 'root' })
export class NgVaultMonitor {
  #devModeService = inject(NgVaultDevModeService);
  globalInsightOverride: NgVaultInsightDefinition | null = null;

  #eventBus = inject(NgVaultEventBus);
  #cellRegistry = new Map<
    string,
    {
      hasInsight: boolean;
      insights: NgVaultInsightDefinition[];
    }
  >();
  public readonly key = defineNgVaultBehaviorKey('DevTools', 'Telemetry');

  #serializeName(name: string): string {
    const lower = name.toLowerCase();

    const phase = lower.startsWith('start') ? 'start' : lower.startsWith('end') ? 'end' : 'error';

    let operation = lower.replace(/^(start|end|error)\s*/, '');
    if (!operation) operation = 'unknown';

    if (phase === 'error') {
      return `error`;
    }

    const domain = /(replace|merge)/.test(operation)
      ? 'lifecycle'
      : /(state|reduce|encrypt|persist)/.test(operation)
        ? 'stage'
        : 'lifecycle';

    return `${domain}:${phase}:${operation}`;
  }

  startReplace<T>(cell: string, behaviorKey: string, ctx: Readonly<NgVaultBehaviorContext<T>>): void {
    this.#emitEvent(cell, behaviorKey, 'startReplace', ctx.state);
  }

  endReplace<T>(cell: string, behaviorKey: string, ctx: Readonly<NgVaultBehaviorContext<T>>): void {
    this.#emitEvent(cell, behaviorKey, 'endReplace', ctx.state);
  }

  startMerge<T>(cell: string, behaviorKey: string, ctx: Readonly<NgVaultBehaviorContext<T>>): void {
    this.#emitEvent(cell, behaviorKey, 'startMerge', ctx.state);
  }

  endMerge<T>(cell: string, behaviorKey: string, ctx: Readonly<NgVaultBehaviorContext<T>>, payload?: unknown): void {
    this.#emitEvent(cell, behaviorKey, 'endMerge', ctx.state, payload);
  }

  startState<T>(cell: string, behaviorKey: string, ctx: Readonly<NgVaultBehaviorContext<T>>): void {
    this.#emitEvent(cell, behaviorKey, 'startState', ctx.state);
  }

  endState<T>(cell: string, behaviorKey: string, ctx: Readonly<NgVaultBehaviorContext<T>>): void {
    this.#emitEvent(cell, behaviorKey, 'endState', ctx.state);
  }

  startReducer<T>(cell: string, behaviorKey: string, ctx: Readonly<NgVaultBehaviorContext<T>>): void {
    this.#emitEvent(cell, behaviorKey, 'startReducer', ctx.state);
  }

  endReducer<T>(cell: string, behaviorKey: string, ctx: Readonly<NgVaultBehaviorContext<T>>): void {
    this.#emitEvent(cell, behaviorKey, 'endReducer', ctx.state);
  }

  error<T>(cell: string, behaviorKey: string, ctx: Readonly<NgVaultBehaviorContext<T>>, err: unknown): void {
    this.#emitEvent(cell, behaviorKey, 'error', ctx.state, 'error', err instanceof Error ? err.message : String(err));
  }

  startReset<T>(cell: string, behaviorKey: string, ctx: Readonly<NgVaultBehaviorContext<T>>): void {
    this.#emitEvent(cell, behaviorKey, 'startReset', ctx.state);
  }

  endReset<T>(cell: string, behaviorKey: string, ctx: Readonly<NgVaultBehaviorContext<T>>): void {
    this.#emitEvent(cell, behaviorKey, 'endReset', ctx.state);
  }

  startDestroy<T>(cell: string, behaviorKey: string, ctx: Readonly<NgVaultBehaviorContext<T>>): void {
    this.#emitEvent(cell, behaviorKey, 'startDestroy', ctx.state);
  }

  endDestroy<T>(cell: string, behaviorKey: string, ctx: Readonly<NgVaultBehaviorContext<T>>): void {
    this.#emitEvent(cell, behaviorKey, 'endDestroy', ctx.state);
  }

  startInitialized<T>(cell: string, behaviorKey: string, ctx: Readonly<NgVaultBehaviorContext<T>>): void {
    this.#emitEvent(cell, behaviorKey, 'startInitialized', ctx.state);
  }

  endInitialized<T>(cell: string, behaviorKey: string, ctx: Readonly<NgVaultBehaviorContext<T>>): void {
    this.#emitEvent(cell, behaviorKey, 'endInitialized', ctx.state);
  }

  startPersist<T>(cell: string, behaviorKey: string, ctx: Readonly<NgVaultBehaviorContext<T>>) {
    this.#emitEvent(cell, behaviorKey, 'startPersist', ctx.state);
  }

  endPersist<T>(cell: string, behaviorKey: string, ctx: Readonly<NgVaultBehaviorContext<T>>) {
    this.#emitEvent(cell, behaviorKey, 'endPersist', ctx.state);
  }

  startClearPersist<T>(cell: string, behaviorKey: string, ctx: Readonly<NgVaultBehaviorContext<T>>) {
    this.#emitEvent(cell, behaviorKey, 'startClearPersist', ctx.state);
  }

  endClearPersist<T>(cell: string, behaviorKey: string, ctx: Readonly<NgVaultBehaviorContext<T>>) {
    this.#emitEvent(cell, behaviorKey, 'endClearPersist', ctx.state);
  }

  startLoadPersist<T>(cell: string, behaviorKey: string, ctx: Readonly<NgVaultBehaviorContext<T>>) {
    this.#emitEvent(cell, behaviorKey, 'startLoadPersist', ctx.state);
  }

  endLoadPersist<T>(cell: string, behaviorKey: string, ctx: Readonly<NgVaultBehaviorContext<T>>) {
    this.#emitEvent(cell, behaviorKey, 'endLoadPersist', ctx.state);
  }

  startClearValue<T>(cell: string, behaviorKey: string, ctx: Readonly<NgVaultBehaviorContext<T>>) {
    this.#emitEvent(cell, behaviorKey, 'startClearValue', ctx.state);
  }

  endClearValue<T>(cell: string, behaviorKey: string, ctx: Readonly<NgVaultBehaviorContext<T>>) {
    this.#emitEvent(cell, behaviorKey, 'endClearValue', ctx.state);
  }

  registerCell(cellKey: string, insight?: NgVaultInsightDefinition): void {
    const hasInsight = !!insight;

    this.#cellRegistry.set(cellKey, {
      hasInsight,
      insights: hasInsight ? [insight!] : []
    });
  }

  #emitEvent<T>(
    cell: string,
    behaviorKey: string,
    type: string,
    ctx: Readonly<VaultStateSnapshot<T>>,
    payload?: unknown,
    error?: string
  ): void {
    if (!this.#devModeService.isDevMode) return;

    let insight: NgVaultInsightDefinition;

    if (this.globalInsightOverride) {
      insight = this.globalInsightOverride;
    } else {
      const config = this.#cellRegistry.get(cell);

      if (!config || !config.hasInsight) return;

      insight = config.insights[0];
    }

    const serializedType = this.#serializeName(type);

    const event: NgVaultEventModel = {
      id: crypto.randomUUID(),
      cell,
      behaviorKey,
      type: serializedType,
      timestamp: Date.now()
    };

    if (insight.wantsState) {
      event.state = ctx;
    }

    if (insight.wantsPayload && payload !== undefined) {
      event.payload = payload;
    }

    if (insight.wantsErrors && error) {
      event.error = error;
    }

    this.#eventBus.next(event);
  }

  activateGlobalInsights(def: NgVaultInsightDefinition): void {
    this.globalInsightOverride = def;
  }
}
