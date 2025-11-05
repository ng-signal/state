import { isTestEnv } from '../helpers/testing-environment.helper';
import { NgVaultConfigModel } from '../models/ng-vault-config.model';

let _config: Readonly<NgVaultConfigModel> | undefined = undefined;

export function setNgVaultConfig(config: NgVaultConfigModel): void {
  if (_config) {
    throw new Error('[NgVault] Global vault configuration can only be set once.');
  }
  _config = Object.freeze(config);
}

export function getNgVaultConfig(): Readonly<NgVaultConfigModel> {
  return _config ?? { strict: !isTestEnv() }; // default strict in prod, relaxed in tests
}
