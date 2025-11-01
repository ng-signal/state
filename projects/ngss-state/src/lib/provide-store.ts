import { Provider } from '@angular/core';
import { setNgssStoreConfig } from './config/ngss-store.config';
import { FEATURE_REGISTRY } from './constants/feature-registry.constant';
import { STORE_ROOT } from './constants/store-root.constant';
import { isTestEnv } from './helpers/testing-environment.helper';
import { NgssStoreConfigModel } from './models/ngss-store-config.model';

export function provideStore(config: Partial<NgssStoreConfigModel> = {}): Provider[] {
  setNgssStoreConfig({
    strict: config.strict ?? !isTestEnv()
  });

  return [
    { provide: STORE_ROOT, useValue: true },
    { provide: FEATURE_REGISTRY, multi: true, useValue: [] }
  ];
}
