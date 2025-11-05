/* eslint-disable */
export function isTestEnv(): boolean {
  return (
    typeof (globalThis as any).jasmine !== 'undefined' ||
    typeof (globalThis as any).jest !== 'undefined' ||
    typeof (globalThis as any).vitest !== 'undefined'
  );
}
/* eslint-enable */
