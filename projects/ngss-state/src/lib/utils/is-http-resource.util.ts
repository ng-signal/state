/**
 * Type guard for Angular's experimental HttpResource<T> API.
 * Detects presence of signal fields: data(), loading(), error().
 */
// eslint-disable-next-line
export function isHttpResource<T>(obj: any): obj is {
  value: () => T | null;
  isLoading: () => boolean;
  error: () => unknown;
} {
  return !!(
    obj &&
    typeof obj === 'object' &&
    typeof obj.value === 'function' &&
    typeof obj.isLoading === 'function' &&
    typeof obj.error === 'function'
  );
}
