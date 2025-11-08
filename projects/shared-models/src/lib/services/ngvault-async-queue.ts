import { signal } from '@angular/core';
import { Subject } from 'rxjs';
import { NgVaultQueueEvent } from '../models/ngvault-queue-event.model';
import { NgVaultQueueStats } from '../models/ngvault-queue-stats.model';

export class NgVaultAsyncQueue {
  #queue: (() => Promise<void> | void)[] = [];
  #running = false;
  #processedCount = 0;
  #enqueueCount = 0;
  #instanceId = Math.random().toString(36).slice(2, 8); // 6 chars of random entropy

  readonly #statsSignal = signal<NgVaultQueueStats>({
    id: this.#instanceId,
    isRunning: false,
    queued: 0,
    enqueuedTotal: 0,
    processedTotal: 0
  });

  readonly events$ = new Subject<NgVaultQueueEvent>();

  /** Reactive signal snapshot */
  get stats$() {
    return this.#statsSignal.asReadonly();
  }

  /** Frozen public stats object */
  get stats(): Readonly<NgVaultQueueStats> {
    return Object.freeze(this.#statsSignal());
  }

  enqueue(task: () => Promise<void> | void): void {
    this.#queue.push(task);
    this.#enqueueCount++;
    this.#syncStats();
    this.events$.next({ type: 'enqueue', stats: this.stats });

    if (!this.#running) {
      this.#running = true;
      // 🔸 Parity with old behavior: start immediately (no queueMicrotask)
      this.#dequeue();
    }
  }

  async #dequeue(): Promise<void> {
    while (this.#queue.length > 0) {
      const task = this.#queue.shift()!;
      this.#syncStats();
      this.events$.next({ type: 'dequeue', stats: this.stats });

      try {
        // 🔸 Same as old behavior — each task awaits microtask boundary for async consistency
        await Promise.resolve().then(task);
        this.#processedCount++;
        this.#syncStats();
        this.events$.next({ type: 'processed', stats: this.stats });
      } catch (err) {
        this.events$.next({ type: 'error', stats: this.stats, error: err });
      }
    }

    this.#running = false;
    this.#syncStats();
  }

  /** Internal helper to synchronize live stats */
  #syncStats(): void {
    this.#statsSignal.update((s) => ({
      ...s,
      isRunning: this.#running,
      queued: this.#queue.length,
      enqueuedTotal: this.#enqueueCount,
      processedTotal: this.#processedCount
    }));
  }
}
