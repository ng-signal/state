/**
 * Represents a unified error shape used throughout the NGSS state system.
 *
 * The `NormalizedError` interface provides a consistent structure for
 * error handling across different sources — such as `HttpErrorResponse`,
 * standard `Error` objects, or custom error payloads.
 *
 * This allows stores, effects, and components to handle errors in a
 * predictable, framework-agnostic way without needing to discriminate
 * between multiple error types.
 *
 * @example
 * ```ts
 * // Example: Derived from HttpErrorResponse
 * const err: NormalizedError = {
 *   message: 'Not Found',
 *   status: 404,
 *   statusText: 'Not Found',
 *   details: { endpoint: '/api/users' }
 * };
 * ```
 *
 * @remarks
 * - The `status` and `statusText` fields are typically used for HTTP responses.
 * - The `details` field may contain raw error payloads or stack traces.
 * - Always prefer `message` for displaying user-facing error text.
 */
export interface NormalizedError {
  /**
   * A human-readable description of the error.
   * Usually derived from an `Error.message` or HTTP status text.
   */
  message: string;

  /**
   * The numeric HTTP status code if available.
   * Present only for HTTP or protocol-based errors.
   */
  status?: number;

  /**
   * The textual status message associated with the HTTP response.
   * Common examples: `'Not Found'`, `'Internal Server Error'`.
   */
  statusText?: string;

  /**
   * Arbitrary metadata or additional context about the error.
   * Can include raw error payloads, stack traces, or custom debug info.
   */
  details?: unknown;
}
