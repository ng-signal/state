import { inject } from '@angular/core';
import {
  NgVaultDevModeService,
  VaultBehavior,
  VaultBehaviorFactoryContext,
  VaultStateSnapshot
} from '@ngvault/shared-models';
import { VaultEventType } from '../types/event-vault.type';
import { NgVaultEventBus } from '../utils/ngvault-event-bus';
import { registerNgVault, unregisterNgVault } from '../utils/ngvault-registry';

class DevtoolsBehavior implements VaultBehavior {
  #devModeService = inject(NgVaultDevModeService);
  #registered = new Set<string>();
  #eventBus = inject(NgVaultEventBus);
  #initialized = new Set<string>();

  constructor(private readonly _injector: VaultBehaviorFactoryContext['injector']) {}

  onInit<T>(vaultKey: string, serviceName: string, ctx: Readonly<VaultStateSnapshot<T>>): void {
    if (!this.#devModeService.isDevMode || this.#registered.has(vaultKey)) return;
    this.#registered.add(vaultKey);

    this.#initialized.add(vaultKey);

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
    if (!this.#initialized.has(key)) {
      throw new Error(`[NgVault] Behavior "${this.constructor.name}" used before onInit() for "${key}".`);
    }

    this.#eventBus.next({
      key,
      type,
      timestamp: Date.now(),
      state: ctx
    });
  }
}

export function withDevtoolsBehavior(context: VaultBehaviorFactoryContext): VaultBehavior {
  return new DevtoolsBehavior(context.injector);
}
