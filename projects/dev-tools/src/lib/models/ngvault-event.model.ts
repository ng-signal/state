import { VaultStateSnapshot } from '@ngvault/shared';
import { VaultEventType } from '../types/event-vault.type';

// eslint-disable-next-line
export interface NgVaultEventModel<T = any> {
  id: string;
  behaviorKey: string;
  cell: string;
  type: VaultEventType | string;
  timestamp: number;
  state?: Partial<VaultStateSnapshot<T>>;
  // eslint-disable-next-line
  error?: any;

  payload?: unknown;
}
