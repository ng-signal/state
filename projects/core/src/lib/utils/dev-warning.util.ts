import { inject } from '@angular/core';
import { NGVAULT_IS_DEV_MODE } from '@ngvault/shared-models';

let warned = false;

export function devWarnExperimentalHttpResource(): void {
  const _isDevMode = inject(NGVAULT_IS_DEV_MODE);

  if (warned || !_isDevMode) return;
  // eslint-disable-next-line
  console.warn('[NgVault] Experimental HttpResource support enabled — may change in Angular 21+.');
  warned = true;
}
