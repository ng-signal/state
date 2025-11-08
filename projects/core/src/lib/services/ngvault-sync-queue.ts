import { NgVaultQueue } from '@ngvault/shared-models';

/**
 * Synchronous queue that executes tasks immediately.
 *
 * - Ideal for testing or deterministic environments
 * - Tasks run in the caller’s stack (no microtasks)
 * - Should never be used in production (may block the UI thread)
 */
export class NgVaultSyncQueue implements NgVaultQueue {
  enqueue(task: () => Promise<void> | void): void {
    try {
      task();
    } catch {
      // swallow errors to preserve test stability
    }
  }
}
