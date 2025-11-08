import { VaultBehaviorContext, VaultDataType } from '@ngvault/shared';

export function applyNgVaultValueMerge<T>(
  ctx: VaultBehaviorContext<T>,
  curr: VaultDataType<T> | undefined,
  next: VaultDataType<T> | undefined
): void {
  if (!ctx?.value || next === undefined) return;

  if (Array.isArray(curr) && Array.isArray(next)) {
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
    ctx.value.set({ ...curr, ...next } as VaultDataType<T>);
    return;
  }

  ctx.value.set(next as VaultDataType<T>);
}
