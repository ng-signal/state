import { InjectionToken } from '@angular/core';

export const FEATURE_CELL_REGISTRY = new InjectionToken<Array<{ key: string; token: unknown }>>(
  'NGVAULT_FEATURE_CELL_REGISTRY'
);
