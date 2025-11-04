import { VaultEventSource } from '../types/event-vault-source.type';
import { VaultEventType } from '../types/event-vault.type';

// eslint-disable-next-line
export interface NgVaultEventModel<T = any> {
  id?: string;
  key: string;
  type: VaultEventType;
  source?: VaultEventSource;
  timestamp: number;
  payload?: Partial<T>;
  // eslint-disable-next-line
  error?: any;
}
