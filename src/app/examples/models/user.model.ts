/**
 * Represents a single **user entity** within the NG Signal Store example application.
 *
 * The `UserModel` defines the structure of a user record stored inside the
 * {@link UserStateModel.entities} map. Each user entity is identified by a unique
 * `id` and contains basic user details such as `name`.
 *
 * @remarks
 * - Serves as the base data model for user-related operations in the store.
 * - Can be extended to include additional properties (e.g., `email`, `role`, `avatarUrl`)
 *   as the application grows.
 *
 * @example
 * ```ts
 * const user: UserModel = {
 *   id: '1',
 *   name: 'Ada Lovelace'
 * };
 * ```
 */
export interface UserModel {
  /**
   * Unique identifier for the user.
   *
   * Typically corresponds to the user’s primary key or UUID in the backend system.
   *
   * @example
   * ```ts
   * id: '42'
   * ```
   */
  id: string;

  /**
   * The display name of the user.
   *
   * Used in UI elements, greetings, and lists where the user’s name should appear.
   *
   * @example
   * ```ts
   * name: 'Alan Turing'
   * ```
   */
  name: string;
}
