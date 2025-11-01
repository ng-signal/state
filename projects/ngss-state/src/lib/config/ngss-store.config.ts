import { isTestEnv } from '../helpers/testing-environment.helper';
import { NgssStoreConfigModel } from '../models/ngss-store-config.model';

let _config: Readonly<NgssStoreConfigModel> | null = null;

export function setNgssStoreConfig(config: NgssStoreConfigModel): void {
  if (_config) {
    throw new Error('[NGSS] Global store configuration can only be set once.');
  }
  _config = Object.freeze(config);
}

export function getNgssStoreConfig(): Readonly<NgssStoreConfigModel> {
  return _config ?? { strict: !isTestEnv() }; // default strict in prod, relaxed in tests
}
