import { Provider } from '@angular/core';
import { FEATURE_REGISTRY } from './constants/feature-registry.constant';
import { STORE_ROOT } from './constants/store-root.constant';

/**
 * Initializes the root **NG Signal Store** environment.
 *
 * The `provideStore()` function sets up the base-level providers
 * required for all feature states registered through `provideState()`.
 *
 * It is typically called once at the application’s root configuration
 * (or within a specific feature module when creating isolated stores).
 *
 * This provider performs two main tasks:
 *
 * 1. **Marks the root store context**
 *    - Provides the `STORE_ROOT` token to identify that a root store
 *      has been established for this injector scope.
 *
 * 2. **Creates a shared feature registry**
 *    - Provides an empty array under the `FEATURE_REGISTRY` token.
 *    - As features register themselves through `provideState()`,
 *      they add entries into this registry for devtools, hydration,
 *      or debugging purposes.
 *
 * @example
 * ```ts
 * import { bootstrapApplication } from '@angular/platform-browser';
 * import { provideStore } from '@ngss/state';
 * import { AppComponent } from './app.component';
 *
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideStore() // Initialize the NG Signal Store root
 *   ]
 * });
 * ```
 *
 * @returns An array of Angular providers that configure the root
 *          signal store and feature registry for the current injector.
 */
export function provideStore(): Provider[] {
  return [
    /**
     * Marks this injector scope as the NG Signal Store root.
     * Used internally to prevent multiple root initializations.
     */
    { provide: STORE_ROOT, useValue: true },

    /**
     * Initializes an empty feature registry that tracks all
     * registered feature services and their associated keys.
     */
    { provide: FEATURE_REGISTRY, multi: true, useValue: [] }
  ];
}
