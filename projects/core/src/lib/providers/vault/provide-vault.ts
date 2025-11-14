import { Provider } from '@angular/core';
import { NgVaultAsyncDiagnosticQueue } from '@ngvault/core/services/ngvault-async-diagnostic-queue';
import { isTestEnv } from '../../../../../shared/src/lib/helpers/testing-environment.helper';
import { NGVAULT_DEV_MODE } from '../../constants/ngvault-dev-mode.constant';
import { VAULT_ROOT as NGVAULT_ROOT } from '../../constants/ngvault-root.constant';
import { NgVaultConfigModel } from '../../models/ng-vault-config.model';
import { FEATURE_CELL_REGISTRY } from '../../tokens/feature-cell-registry.token';
import { NGVAULT_CONFIG } from '../../tokens/ngvault-config.token';
import { NGVAULT_QUEUE } from '../../tokens/ngvault-queue.token';

let _config: Readonly<NgVaultConfigModel> | undefined;
let _initialized = false;

function setNgVaultConfig(config: NgVaultConfigModel): void {
  const testMode = isTestEnv();

  /* istanbul ignore next */
  if (_initialized && _config?.strict && !testMode) {
    throw new Error('[NgVault] Global vault configuration can only be set once when strict mode is enabled.');
  }

  _config = Object.freeze({
    strict: config.strict ?? !testMode,
    devMode: config.devMode ?? false,
    queue: config.queue,
    logLevel: config.logLevel ?? 'off'
  });

  _initialized = true;
}

export function getNgVaultConfig(): Readonly<NgVaultConfigModel> {
  if (!_initialized || !_config) {
    throw new Error('[NgVault] Missing root Vault configuration. Did you forget to call provideVault()?');
  }
  return _config;
}

export function _resetNgVaultConfigForTests(): void {
  _config = undefined;
  _initialized = false;
}

export function provideVault(options: NgVaultConfigModel = {}): Provider[] {
  setNgVaultConfig(options);

  return [
    { provide: NGVAULT_ROOT, useValue: true },
    { provide: FEATURE_CELL_REGISTRY, multi: true, useValue: [] },

    { provide: NGVAULT_CONFIG, useFactory: getNgVaultConfig },

    {
      provide: NGVAULT_QUEUE,
      useFactory: (cfg: Readonly<NgVaultConfigModel>) => {
        const QueueCtor = (cfg.queue ?? NgVaultAsyncDiagnosticQueue) as new () => NgVaultAsyncDiagnosticQueue;
        const instance = new QueueCtor();
        return instance;
      },
      deps: [NGVAULT_CONFIG]
    },

    { provide: NGVAULT_DEV_MODE, useValue: options.devMode ?? true }
  ];
}
