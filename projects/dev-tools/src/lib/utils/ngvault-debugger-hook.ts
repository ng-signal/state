import { Subscription } from 'rxjs';
import { NgVaultEventModel } from '../models/ngvault-event.model';
import { NgVaultEventBus } from './ngvault-event-bus';

export function createNgVaultDebuggerHook(hook: (event: NgVaultEventModel) => void): () => void {
  const subscription: Subscription = NgVaultEventBus.asObservable().subscribe(hook);
  return () => subscription.unsubscribe();
}
