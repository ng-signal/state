export class NgVaultTestingSyncQueue {
  enqueue(task: () => Promise<void> | void): void {
    task();
  }
}
