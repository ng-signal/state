import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject } from '@angular/core';
import { FEATURE_VAULT_TOKEN } from '@ngss/state';
import { UserStateModel } from './model/user-state.model';
import { UserModel } from './model/user.model';

/**
 * Feature service that manages **user-related state** in the NG Signal Store.
 *
 * The `UserStateService` encapsulates all state logic, actions, and selectors
 * for the `user` feature. It interacts with the `FeatureVaultModel<UserStateModel>`
 * to perform state updates and exposes computed signals for UI consumption.
 *
 * @remarks
 * - Acts as the **action**, **reducer**, and **selector** layer for this feature.
 * - Uses Angular’s `signal()` API to provide reactive, zoneless state management.
 * - Consumes backend data through Angular’s `HttpClient`.
 * - Registered via {@link provideState} with the feature key `'user'`.
 *
 * @example
 * ```ts
 * import { inject } from '@angular/core';
 * import { UserStateService } from './examples/user-state.service';
 *
 * @Component({
 *   selector: 'user-list',
 *   template: `
 *     <ul>
 *       <li *ngFor="let user of users()">{{ user.name }}</li>
 *     </ul>
 *   `,
 *   providers: [provideState(UserStateService, { key: 'user', initial: initialUser })]
 * })
 * export class UserListComponent {
 *   readonly users = inject(UserStateService).users;
 *   readonly loading = inject(UserStateService).isLoading;
 *
 *   ngOnInit() {
 *     inject(UserStateService).loadUsers();
 *   }
 * }
 * ```
 */
@Injectable()
export class UserStateService {
  /**
   * The feature vault that stores and manages the `UserStateModel`.
   *
   * Injected using the feature-specific {@link FEATURE_VAULT_TOKEN} for the `'user'` key.
   * Provides internal state mutation methods (`_set`, `_patch`) and the reactive `state` signal.
   */
  private readonly vault = inject(FEATURE_VAULT_TOKEN<UserStateModel>('user'));

  /**
   * Angular HTTP client used to fetch user data from the API.
   */
  private readonly http = inject(HttpClient);

  /**
   * The read-only signal representing the current user state snapshot.
   *
   * Exposed to allow components and computed signals to observe state changes.
   */
  readonly state = this.vault.state;

  /**
   * Computed signal that returns an array of all user entities.
   *
   * Derived from the `entities` map in the current state.
   *
   * @example
   * ```ts
   * const users = userStateService.users();
   * ```
   */
  readonly users = computed(() => Object.values(this.state().entities));

  /**
   * Computed signal indicating whether a user operation is currently loading.
   *
   * Useful for displaying loading spinners or disabling UI interactions during requests.
   */
  readonly isLoading = computed(() => this.state().loading);

  /**
   * Loads all users from the backend API.
   *
   * Dispatches a state update to set `loading` to `true` before making the request,
   * then merges the results into the store on success or logs the error on failure.
   *
   * @example
   * ```ts
   * userStateService.loadUsers();
   * ```
   */
  loadUsers() {
    this.vault._patch({ loading: true, error: null });
    this.http.get<UserModel[]>('/api/users').subscribe({
      next: (list) => {
        const entities = Object.fromEntries(list.map((u) => [u.id, u]));
        this.vault._patch({ loading: false, entities });
      },
      error: (err) => this.vault._patch({ loading: false, error: String(err) })
    });
  }

  /**
   * Inserts or updates a user entity in the current state.
   *
   * If a user with the same `id` already exists, it is replaced; otherwise, it is added.
   *
   * @param user The user entity to upsert.
   *
   * @example
   * ```ts
   * userStateService.upsert({ id: '1', name: 'Ada Lovelace' });
   * ```
   */
  upsert(user: UserModel) {
    const curr = this.state().entities;
    this.vault._patch({ entities: { ...curr, [user.id]: user } });
  }

  /**
   * Removes a user entity from the state by its ID.
   *
   * @param id The unique identifier of the user to remove.
   *
   * @example
   * ```ts
   * userStateService.remove('1');
   * ```
   */
  remove(id: string) {
    const { entities, ...rest } = this.state();
    const { [id]: _, ...remaining } = entities;
    this.vault._set({ ...rest, entities: remaining });
  }
}
