import { inject } from '@angular/core';
import { NgVaultDevModeService } from '@ngvault/shared-models';
import { VaultEventType } from '../types/event-vault.type';
import { NgVaultEventBus } from '../utils/ngvault-event-bus';

export function useDevtoolsEventEmitter() {
  const _isDevMode = inject(NgVaultDevModeService);
  const _eventBus = inject(NgVaultEventBus);

  return (key: string, type: VaultEventType) => {
    if (!_isDevMode.isDevMode) return;
    _eventBus.next({ key, type, timestamp: Date.now() });
  };
}
