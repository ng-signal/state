import { NgVaultDataType } from '@ngvault/shared';

export function applyNgVaultValueMerge<T>(
  curr: NgVaultDataType<T> | undefined | null,
  next: NgVaultDataType<T> | undefined | null
): NgVaultDataType<T> | undefined {
  // Nothing to merge if next is undefined → preserve current
  if (next === undefined) {
    return curr ?? undefined;
  }

  // Arrays – replace instead of merge
  if (Array.isArray(curr) && Array.isArray(next)) {
    return [...next] as NgVaultDataType<T>;
  }

  // Objects – shallow merge with null guards
  if (
    curr != null &&
    next != null &&
    typeof curr === 'object' &&
    typeof next === 'object' &&
    !Array.isArray(curr) &&
    !Array.isArray(next)
  ) {
    return { ...curr, ...next } as NgVaultDataType<T>;
  }

  // Everything else – assign directly
  return next as NgVaultDataType<T>;
}
