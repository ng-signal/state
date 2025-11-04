import { VaultEventModel } from './vault-event.model';

export interface NgVaultDevToolsHookModel {
  emit(event: VaultEventModel): void;
  // eslint-disable-next-line
  snapshot?(): Record<string, any>;
}
