import { VaultBehaviorContext, VaultDataType } from '@ngvault/shared';
import { ngVaultDebug } from './ngvault-logger.util';

export function applyNgVaultValueMerge<T>(
  ctx: VaultBehaviorContext<T>,
  curr: VaultDataType<T> | undefined,
  next: VaultDataType<T> | undefined
): void {
  ngVaultDebug('apply', 1);
  if (!ctx?.value || next === undefined) return;
  ngVaultDebug('apply', 2);

  if (Array.isArray(curr) && Array.isArray(next)) {
    ngVaultDebug('apply', 3);
    ctx.value.set([...next] as VaultDataType<T>);
    return;
  }

  if (
    curr &&
    next &&
    typeof curr === 'object' &&
    typeof next === 'object' &&
    !Array.isArray(curr) &&
    !Array.isArray(next)
  ) {
    ngVaultDebug('apply', 4);
    ctx.value.set({ ...curr, ...next } as VaultDataType<T>);
    return;
  }
  ngVaultDebug('apply', 5);

  ctx.value.set(next as VaultDataType<T>);
}

/*
import { VaultBehaviorContext, VaultDataType } from '@ngvault/shared';

export function applyNgVaultValueMerge<T>(
  ctx: VaultBehaviorContext<T>,
  curr: VaultDataType<T> | undefined | null,
  next: VaultDataType<T> | undefined | null
): void {
  if (!ctx?.value) return;

  // Nothing to merge if next is undefined
  if (next === undefined) return;

  // Arrays – replace instead of merge
  if (Array.isArray(curr) && Array.isArray(next)) {
    ctx.value.set([...next] as VaultDataType<T>);
    return;
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
    ctx.value.set({ ...(curr || {}), ...(next || {}) } as VaultDataType<T>);
    return;
  }

  // Everything else – assign directly
  ctx.value.set(next as VaultDataType<T>);
}
  */
