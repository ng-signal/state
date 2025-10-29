import { InjectionToken } from '@angular/core';

/**
 * Injection token that identifies the **root store context** for NG Signal Store.
 *
 * The `STORE_ROOT` token is used internally by `@ngss/state` to mark the
 * presence of a root store instance within an Angular injector.
 *
 * When `provideStore()` is called, it registers this token with a value of `true`,
 * indicating that the injector scope has been configured as a **store root**.
 *
 * Subsequent calls to `provideState()` can use this token to determine whether
 * the root store already exists — allowing automatic or manual root initialization
 * without duplicate setup.
 *
 * @example
 * ```ts
 * import { inject } from '@angular/core';
 * import { STORE_ROOT } from '@ngss/state';
 *
 * const hasRoot = inject(STORE_ROOT, { optional: true });
 *
 * if (hasRoot) {
 *   console.log('Root store already configured');
 * }
 * ```
 *
 * @see {@link provideStore} for registering the store root
 */
export const STORE_ROOT = new InjectionToken<true>('NGSS_STORE_ROOT');
