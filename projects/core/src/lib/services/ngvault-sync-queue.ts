export class NgVaultSyncQueue {
  enqueue(task: () => Promise<void> | void): void {
    try {
      task();
    } catch {}
  }
}
