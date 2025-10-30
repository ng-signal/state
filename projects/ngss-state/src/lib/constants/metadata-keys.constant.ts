/**
 * Centralized metadata keys used internally by the NGSS library.
 *
 * These keys are used with the `Reflect.defineMetadata()` and
 * `Reflect.getMetadata()` APIs (provided by the `reflect-metadata` polyfill)
 * to store and retrieve NGSS-specific runtime metadata on decorated classes.
 *
 * @remarks
 * Keeping all metadata keys in one place ensures consistency
 * and prevents naming collisions across the library.
 *
 * @example
 * ```ts
 * import { NGSS_METADATA_KEYS } from '@ngss/state';
 *
 * Reflect.defineMetadata(NGSS_METADATA_KEYS.FEATURE_KEY, 'user', UserStateService);
 * const key = Reflect.getMetadata(NGSS_METADATA_KEYS.FEATURE_KEY, UserStateService);
 * console.log(key); // "user"
 * ```
 */
export const NGSS_METADATA_KEYS = {
  /**
   * Metadata key used to associate a service class with its feature key.
   *
   * Applied by the `@FeatureStore()` decorator and read by the
   * `provideState()` function to determine the feature’s unique identifier.
   */
  FEATURE_KEY: 'ngss:feature-key'
} as const;
