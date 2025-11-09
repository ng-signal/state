import { inject } from '@angular/core';
import { NgVaultEventModel } from '@ngvault/dev-tools';
import {
  defineNgVaultBehaviorKey,
  NgVaultDevModeService,
  VaultBehavior,
  VaultBehaviorContext,
  VaultBehaviorFactory,
  VaultBehaviorFactoryContext,
  VaultBehaviorType,
  VaultStateSnapshot
} from '@ngvault/shared';
import { VaultEventType } from '../types/event-vault.type';
import { NgVaultEventBus } from '../utils/ngvault-event-bus';
import { registerNgVault, unregisterNgVault } from '../utils/ngvault-registry';

class DevtoolsBehavior implements VaultBehavior {
  #devModeService = inject(NgVaultDevModeService);
  #registered = new Set<string>();
  #eventBus = inject(NgVaultEventBus);
  #initialized = new Set<string>();
  public readonly key = defineNgVaultBehaviorKey('DevTools', 'Telemetry');

  constructor(
    readonly behaviorId: string,
    readonly type: VaultBehaviorType,
    private readonly _injector: VaultBehaviorFactoryContext['injector']
  ) {}

  onInit<T>(vaultKey: string, serviceName: string, ctx: Readonly<VaultBehaviorContext<T>>): void {
    if (!this.#devModeService.isDevMode || this.#registered.has(vaultKey)) return;
    this.#registered.add(vaultKey);

    this.#initialized.add(vaultKey);

    registerNgVault({ key: vaultKey, service: serviceName, state: ctx });
    this.#emitEvent(vaultKey, ctx.state, 'init');
  }

  onLoad<T>(key: string, ctx: Readonly<VaultBehaviorContext<T>>): void {
    this.#emitEvent(key, ctx.state, 'load');
  }

  onSet<T>(key: string, ctx: Readonly<VaultBehaviorContext<T>>): void {
    this.#emitEvent(key, ctx.state, 'set');
  }

  onPatch<T>(key: string, ctx: Readonly<VaultBehaviorContext<T>>): void {
    this.#emitEvent(key, ctx.state, 'patch');
  }

  onReset<T>(key: string, ctx: Readonly<VaultBehaviorContext<T>>): void {
    this.#emitEvent(key, ctx.state, 'reset');
  }

  onError<T>(key: string, ctx: Readonly<VaultBehaviorContext<T>>): void {
    this.#emitEvent(key, ctx.state, 'error', ctx.message);
  }

  onDestroy<T>(key: string, ctx: Readonly<VaultBehaviorContext<T>>): void {
    this.#emitEvent(key, ctx.state, 'destroy');
    if (this.#registered.has(key)) {
      unregisterNgVault(key);
    }
  }

  onDispose<T>(key: string, ctx: Readonly<VaultBehaviorContext<T>>): void {
    this.#emitEvent(key, ctx.state, 'dispose');
  }

  #emitEvent<T>(key: string, ctx: Readonly<VaultStateSnapshot<T>>, type: VaultEventType, error?: string): void {
    if (!this.#initialized.has(key)) {
      throw new Error(`[NgVault] Behavior "${this.constructor.name}" used before onInit() for "${key}".`);
    }

    const event = {
      key,
      type,
      timestamp: Date.now(),
      state: ctx
    } as NgVaultEventModel;

    if (error) {
      event.error = error;
    }

    this.#eventBus.next(event);
  }
}

export const withDevtoolsBehavior: VaultBehaviorFactory = (context: VaultBehaviorFactoryContext): VaultBehavior => {
  return new DevtoolsBehavior(context.behaviorId, context.type, context.injector);
};

withDevtoolsBehavior.type = 'dev-tools';
withDevtoolsBehavior.critical = true;
