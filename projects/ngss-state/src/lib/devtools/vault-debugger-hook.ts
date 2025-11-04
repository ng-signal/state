import { Subscription } from 'rxjs';
import { VaultEventModel } from './models/vault-event.model';
import { VaultEventBus } from './vault-event-bus';

export function createVaultDebuggerHook(hook: (event: VaultEventModel) => void): () => void {
  const subscription: Subscription = VaultEventBus.asObservable().subscribe(hook);
  return () => subscription.unsubscribe();
}
