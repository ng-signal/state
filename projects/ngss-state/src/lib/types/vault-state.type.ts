import { ResourceStateError } from '../models/resource-state-error.model';
import { VaultDataType } from './vault-data.type';

/**
 * Represents the shape of a vault state update or partial mutation.
 *
 * This type is used by both `setState()` and `patchState()` and may
 * include any combination of `loading`, `data`, or `error` updates.
 *
 * Example:
 * ```ts
 * vault.setState({ loading: true });
 * vault.patchState({ data: [...existing, newItem] });
 * ```
 */
export type VaultStateType<T> = Partial<{
  loading: boolean;
  value: VaultDataType<T | undefined>;
  error: ResourceStateError | null;
}>;
