/**
 * Represents an immutable snapshot of the queue state at a given time.
 */
export interface NgVaultQueueStats {
  /** Unique queue instance ID for tracing/debugging */
  readonly id: string;
  /** Whether the queue is currently executing tasks */
  readonly isRunning: boolean;
  /** How many tasks are waiting in the queue */
  readonly queued: number;
  /** Total number of tasks ever enqueued since creation */
  readonly enqueuedTotal: number;
  /** Total number of tasks processed successfully */
  readonly processedTotal: number;
}
