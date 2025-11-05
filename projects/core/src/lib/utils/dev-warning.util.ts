import { isDevMode } from '@angular/core';

let warned = false;

export function devWarnExperimentalHttpResource(): void {
  if (warned || !isDevMode) return;
  // eslint-disable-next-line
  console.warn('[NgVault] Experimental HttpResource support enabled — may change in Angular 21+.');
  warned = true;
}
