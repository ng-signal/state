import { NgVaultQueueStats } from './ngvault-queue-stats.model';

/**
 * Represents diagnostic events emitted by the queue for dev tools.
 */
export interface NgVaultQueueEvent {
  readonly type: 'enqueue' | 'dequeue' | 'processed' | 'clear' | 'error';
  readonly stats: Readonly<NgVaultQueueStats>;
  readonly error?: unknown;
}
