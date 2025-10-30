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
 *   details: { endpoint: '/api/users' }
 * };
 *
 * // Example: Derived from a general Error
 * const err2: NormalizedError = {
 *   message: 'Unexpected failure',
 *   details: new Error('Something went wrong').stack
 * };
 * ```
 *
 * @remarks
 * - The `status` field is typically used for HTTP responses.
 * - The `details` field may contain any raw or structured context data.
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
   * Arbitrary metadata or additional context about the error.
   * Can include raw error payloads, stack traces, or custom debug info.
   */
  details?: unknown;
}
