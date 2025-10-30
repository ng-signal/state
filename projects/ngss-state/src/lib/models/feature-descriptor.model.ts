/**
 * Describes the static configuration for a feature state
 * managed by **@ngss/state**.
 *
 * @template T The shape of the feature’s state model.
 *
 * A `FeatureDescriptorModel<T>` tells the NG Signal Store how to
 * register and initialize a feature when calling `provideState()`.
 */
export interface FeatureDescriptorModel<T> {
  /**
   * Unique identifier for this feature.
   *
   * Used internally for registry look-ups, debugging, and devtools logs.
   * Typically matches the feature or domain name of the state service.
   *
   * @example
   * ```ts
   * key: 'user'
   * key: 'cart'
   * key: 'settings'
   * ```
   */
  key: string;

  /**
   * The initial state snapshot for this feature.
   *
   * Must satisfy the generic type parameter `T`.
   * This value seeds the feature’s signal vault when the store is first created.
   *
   * @example
   * ```ts
   * initial: {
   *   loading: false,
   *   entities: {},
   *   error: null
   * }
   * ```
   */
  initial: T;
}
