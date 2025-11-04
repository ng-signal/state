import { NgVaultEventModel } from './ngvault-event.model';

export interface NgVaultDevToolsHookModel {
  emit(event: NgVaultEventModel): void;
  // eslint-disable-next-line
  snapshot?(): Record<string, any>;
}
