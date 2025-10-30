import { UserModel } from './user.model';

/**
 * Represents the **feature state model** for user-related data
 * within the NG Signal Store example application.
 *
 * The `UserStateModel` defines the structure of the user feature’s
 * reactive state, which is managed by the {@link UserStateService}.
 *
 * @remarks
 * - Used as the generic type parameter for `FeatureDescriptorModel<UserStateModel>`.
 * - Stored inside the feature vault created by `provideState(UserStateService, ...)`.
 * - Provides a predictable shape for selectors, actions, and computed signals.
 *
 * @example
 * ```ts
 * const initialUserState: UserStateModel = {
 *   loading: false,
 *   entities: {},
 *   error: null
 * };
 * ```
 */
export interface UserStateModel {
  /**
   * Indicates whether a user-related asynchronous operation
   * (such as a fetch or update) is currently in progress.
   *
   * Commonly used to control loading indicators in the UI.
   *
   * @example
   * ```ts
   * if (userState.loading) {
   *   showSpinner();
   * }
   * ```
   */
  loading: boolean;

  /**
   * A dictionary of user entities indexed by their unique identifiers.
   *
   * This map stores all users currently loaded into the application state.
   * Keys are user IDs, and values are {@link UserModel} instances.
   *
   * @example
   * ```ts
   * {
   *   '1': { id: '1', name: 'Ada Lovelace' },
   *   '2': { id: '2', name: 'Alan Turing' }
   * }
   * ```
   */
  entities: Record<string, UserModel>;

  /**
   * Holds an error message if a user-related operation fails.
   *
   * Set to `null` when there are no active errors.
   *
   * @example
   * ```ts
   * if (userState.error) {
   *   displayError(userState.error);
   * }
   * ```
   */
  error: string | null;
}
