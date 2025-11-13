import { inject, Injectable } from '@angular/core';
import { NgVaultEventBus, NgVaultEventModel } from '@ngvault/dev-tools';
import {
  defineNgVaultBehaviorKey,
  VaultBehavior,
  VaultBehaviorContext,
  VaultBehaviorType,
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

  // eslint-disable-next-line
  registerCell(cellKey: string, behaviors: VaultBehavior<any>[]): void {
    // Extract insight behaviors
    const insights = behaviors
      .filter((b) => b.type === VaultBehaviorType.Insights)
      // eslint-disable-next-line
      .map((b) => (b as any).insight as VaultInsightDefinition)
      .filter((i): i is VaultInsightDefinition => !!i);

    // Store insight metadata for this cell
    this.#cellRegistry.set(cellKey, {
      hasInsight: insights.length > 0,
      insights
    });

    // Call lifecycle hooks on each insight
    for (const insight of insights) {
      insight.onCellRegistered?.(cellKey);
    }
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

    if (!config) return;

    for (const insight of config.insights) {
      const serializedType = this.#serializeName(type);
      if (insight.filterEventType && !insight.filterEventType(serializedType)) continue;

      const shouldEmitState = insight.wantsState ?? false;
      const shouldEmitPayload = insight.wantsPayload ?? false;
      const shouldEmitErrors = insight.wantsErrors ?? false;

      const event: NgVaultEventModel = {
        id: crypto.randomUUID(),
        cell,
        behaviorId,
        type: serializedType,
        timestamp: Date.now()
      };

      if (shouldEmitState) event.state = ctx;
      if (shouldEmitPayload && payload !== undefined) event.payload = payload;
      if (shouldEmitErrors && error) event.error = error;

      this.#eventBus.next(event);
    }
  }
}
