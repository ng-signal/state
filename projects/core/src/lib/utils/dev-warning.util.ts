import { IS_DEV_MODE } from '@ngvault/dev-tools';

let warned = false;

export function devWarnExperimentalHttpResource(): void {
  if (warned || !IS_DEV_MODE) return;
  // eslint-disable-next-line
  console.warn('[NgVault] Experimental HttpResource support enabled — may change in Angular 21+.');
  warned = true;
}
