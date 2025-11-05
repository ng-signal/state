// projects/dev-tools/src/lib/behaviors/with-devtools.behavior.ts
import { VaultStateSnapshot } from '@ngvault/shared-models';
import { IS_DEV_MODE } from '../constants/env.constants';
import { VaultEventType } from '../types/event-vault.type';
import { NgVaultEventBus } from '../utils/ngvault-event-bus';
import { registerNgVault, unregisterNgVault } from '../utils/ngvault-registry';

class DevtoolsBehavior {
  #registered = new Set<string>();

  #isProdMode(): boolean {
    return !IS_DEV_MODE;
  }

  onInit<T>(vaultKey: string, serviceName: string, ctx: Readonly<VaultStateSnapshot<T>>): void {
    if (this.#isProdMode() || this.#registered.has(vaultKey)) return;
    this.#registered.add(vaultKey);

    registerNgVault({ key: vaultKey, service: serviceName, state: ctx });
    this.#emitEvent(vaultKey, ctx, 'init');
  }

  onLoad<T>(key: string, ctx: Readonly<VaultStateSnapshot<T>>): void {
    this.#emitEvent(key, ctx, 'load');
  }

  onPatch<T>(key: string, ctx: Readonly<VaultStateSnapshot<T>>): void {
    this.#emitEvent(key, ctx, 'patch');
  }

  onReset<T>(key: string, ctx: Readonly<VaultStateSnapshot<T>>): void {
    this.#emitEvent(key, ctx, 'reset');
  }

  onSet<T>(key: string, ctx: Readonly<VaultStateSnapshot<T>>): void {
    this.#emitEvent(key, ctx, 'set');
  }

  onDestroy<T>(key: string, ctx: Readonly<VaultStateSnapshot<T>>): void {
    this.#emitEvent(key, ctx, 'dispose');
    if (this.#registered.has(key)) {
      unregisterNgVault(key);
    }
  }

  #emitEvent<T>(key: string, ctx: Readonly<VaultStateSnapshot<T>>, type: VaultEventType): void {
    if (this.#isProdMode()) return;

    NgVaultEventBus.next({
      key,
      type,
      timestamp: Date.now(),
      state: ctx
    });
  }
}

export function withDevtoolsLoggingBehavior() {
  return new DevtoolsBehavior();
}
