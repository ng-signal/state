export interface VaultInsightDefinition {
  /**
   * Unique identifier for the insight behavior.
   */
  id: string;

  /**
   * Human-friendly display name (DevTools, Analytics, Sentry, Datadog…)
   */
  label?: string;

  /**
   * If true, NgVaultMonitor must include full VaultStateSnapshot<T> in events.
   */
  wantsState?: boolean;

  /**
   * If true, NgVaultMonitor will attach payloads (reducers, encryption info, etc.)
   */
  wantsPayload?: boolean;

  /**
   * If true, NgVaultMonitor will attach error messages.
   */
  wantsErrors?: boolean;

  /**
   * Called when the cell is created.
   */
  onCellRegistered?(cellKey: string): void;

  /**
   * Called when the cell is destroyed.
   */
  onCellDestroyed?(cellKey: string): void;

  /**
   * Optional lifecycle event filter:
   * Return false to ignore certain event types.
   */
  filterEventType?(type: string): boolean;
}
