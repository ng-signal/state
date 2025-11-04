import { Subscription } from 'rxjs';
import { VaultEventModel } from '../models/vault-event.model';
import { NgVaultEventBus } from './ngvault-event-bus';

export function createNgVaultDebuggerHook(hook: (event: VaultEventModel) => void): () => void {
  const subscription: Subscription = NgVaultEventBus.asObservable().subscribe(hook);
  return () => subscription.unsubscribe();
}
