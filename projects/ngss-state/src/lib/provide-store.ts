import { Provider } from '@angular/core';
import { FEATURE_REGISTRY, STORE_ROOT } from './tokens';

export function provideStore(): Provider[] {
  return [
    { provide: STORE_ROOT, useValue: true },
    { provide: FEATURE_REGISTRY, multi: true, useValue: [] }
  ];
}
