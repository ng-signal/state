import { inject } from '@angular/core';
import { NgVaultDevModeService } from '@ngvault/shared';
import { VaultEventType } from '../types/event-vault.type';
import { NgVaultEventBus } from '../utils/ngvault-event-bus';

export function useDevtoolsEventEmitter() {
  const _isDevMode = inject(NgVaultDevModeService);
  const _eventBus = inject(NgVaultEventBus);

  return (cell: string, type: VaultEventType) => {
    if (!_isDevMode.isDevMode) return;
    _eventBus.next({
      id: crypto.randomUUID(),
      behaviorKey: 'dev-tools',
      cell,
      type,
      timestamp: Date.now()
    });
  };
}
