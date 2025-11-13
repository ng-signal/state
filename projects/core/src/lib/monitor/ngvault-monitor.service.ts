import { inject, Injectable } from '@angular/core';
import { NgVaultEventBus, NgVaultEventModel } from '@ngvault/dev-tools';
import {
  defineNgVaultBehaviorKey,
  VaultBehaviorContext,
  VaultInsightDefinition,
  VaultStateSnapshot
} from '@ngvault/shared';

@Injectable({ providedIn: 'root' })
export class NgVaultMonitor {
  #eventBus = inject(NgVaultEventBus);
  #cellRegistry = new Map<
    string,
    {
      hasInsight: boolean;
      insights: VaultInsightDefinition[];
    }
  >();
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

  registerCell(cellKey: string, insight?: VaultInsightDefinition): void {
    const hasInsight = !!insight;

    this.#cellRegistry.set(cellKey, {
      hasInsight,
      insights: hasInsight ? [insight!] : []
    });
  }

  #emitEvent<T>(
    cell: string,
    behaviorId: string,
    type: string,
    ctx: Readonly<VaultStateSnapshot<T>>,
    payload?: unknown,
    error?: string
  ): void {
    const config = this.#cellRegistry.get(cell);

    if (!config || !config.hasInsight) return;

    // We know there is exactly ONE insight definition if enabled
    const insight = config.insights[0];

    const serializedType = this.#serializeName(type);

    const event: NgVaultEventModel = {
      id: crypto.randomUUID(),
      cell,
      behaviorId,
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
}
