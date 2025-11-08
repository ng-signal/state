export class NgVaultAsyncQueue {
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
      } catch {}
    }

    this.#running = false;
  }
}
