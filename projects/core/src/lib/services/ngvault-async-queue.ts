import { NgVaultQueue } from '@ngvault/shared';

/**
 * Lightweight asynchronous queue for basic use cases.
 *
 * - Runs tasks in FIFO order
 * - Executes each task in a resolved Promise to preserve async consistency
 * - Does not emit diagnostics or stats
 */
export class NgVaultAsyncQueue implements NgVaultQueue {
  #queue: (() => Promise<void> | void)[] = [];
  #running = false;

  enqueue(task: () => Promise<void> | void): void {
    this.#queue.push(task);
    if (!this.#running) {
      this.#running = true;
      this.#dequeue();
    }
  }

  async #dequeue(): Promise<void> {
    while (this.#queue.length > 0) {
      const task = this.#queue.shift()!;
      try {
        await Promise.resolve().then(task);
      } catch {
        // TODO: optional global error hook (future behavior integration)
      }
    }
    this.#running = false;
  }
}
