import { NgVaultEventModel } from '../models/ngvault-event.model';

export interface NgVaultDevtoolsMessage {
  type: 'NGVAULT_EVENT';
  event: NgVaultEventModel;
}
