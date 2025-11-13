export interface VaultInsightDefinition {
  /**
   * Unique identifier for the insight definition.
   * Example: "manual-insights"
   */
  id: string;

  /**
   * If true, include the full state snapshot in events.
   */
  wantsState?: boolean;

  /**
   * If true, include payload data (reducers, patches, operations).
   */
  wantsPayload?: boolean;

  /**
   * If true, include error messages.
   */
  wantsErrors?: boolean;
}
