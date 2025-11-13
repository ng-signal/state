import { VaultBehaviorContext, VaultDataType } from '@ngvault/shared';

export function applyNgVaultValueMerge<T>(
  ctx: VaultBehaviorContext<T>,
  curr: VaultDataType<T> | undefined | null,
  next: VaultDataType<T> | undefined | null
): VaultDataType<T> {
  if (!ctx?.value) return;

  // Nothing to merge if next is undefined
  if (next === undefined) return;

  // Arrays – replace instead of merge
  if (Array.isArray(curr) && Array.isArray(next)) {
    return [...next] as VaultDataType<T>;
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
    return { ...curr, ...next } as VaultDataType<T>;
  }

  // Everything else – assign directly
  return next as VaultDataType<T>;
}
