import { VaultEventType } from '../types/event-vault.type';

// eslint-disable-next-line
export interface NgVaultEventModel<T = any> {
  id?: string;
  key?: string;
  behaviorId?: string;
  cell?: string;
  type: VaultEventType | string;
  timestamp: number;
  state?: Partial<T>;
  // eslint-disable-next-line
  error?: any;

  payload?: unknown;
}
