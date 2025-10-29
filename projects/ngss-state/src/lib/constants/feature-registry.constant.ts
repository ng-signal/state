import { InjectionToken } from '@angular/core';

/**
 * Injection token that stores metadata for all registered **feature states**
 * within the NG Signal Store.
 *
 * The `FEATURE_REGISTRY` token holds an array of feature descriptors,
 * where each descriptor contains:
 * - A unique `key` identifying the feature.
 * - The `token` (usually the feature service type) that owns that feature’s state.
 *
 * This registry is populated automatically when you register features using
 * {@link provideState}. It allows tooling such as **devtools**, **hydration**, or
 * **debugging utilities** to discover which features are active in the current
 * store scope.
 *
 * @example
 * ```ts
 * import { inject } from '@angular/core';
 * import { FEATURE_REGISTRY } from '@ngss/state';
 *
 * const registry = inject(FEATURE_REGISTRY);
 * console.log(registry);
 * // [
 * //   { key: 'user', token: UserStateService },
 * //   { key: 'cart', token: CartStateService }
 * // ]
 * ```
 *
 * @remarks
 * - The registry is initialized as an empty array in {@link provideStore}.
 * - Each call to {@link provideState} appends a new feature entry.
 * - The token uses `multi: true`, so multiple features can contribute values.
 *
 * @see {@link provideStore}
 * @see {@link provideState}
 */
export const FEATURE_REGISTRY = new InjectionToken<Array<{ key: string; token: unknown }>>('NGSS_FEATURE_REGISTRY');
