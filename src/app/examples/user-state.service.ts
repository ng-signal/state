import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject } from '@angular/core';
import { FeatureStore, injectFeatureVault } from '@ngss/state';
import { UserStateModel } from './models/user-state.model';
import { UserModel } from './models/user.model';

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
 * - Registered via {@link provideState} — no need to pass the feature key.
 *
 * @example
 * ```ts
 * @Component({
 *   selector: 'user-list',
 *   template: `
 *     <ul>
 *       <li *ngFor="let user of users()">{{ user.name }}</li>
 *     </ul>
 *   `,
 *   providers: [
 *     provideStore(),
 *     provideState(UserStateService, { initial: initialUser })
 *   ]
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
@FeatureStore<UserStateModel>('user')
@Injectable()
export class UserStateService {
  /**
   * The feature vault that stores and manages the `UserStateModel`.
   *
   * Injected automatically using the `@FeatureStore()` metadata
   * and resolved via `injectFeatureVault(UserStateService)`.
   */
  private readonly vault = injectFeatureVault<UserStateModel>(UserStateService);

  /**
   * Angular HTTP client used to fetch user data from the API.
   */
  private readonly http = inject(HttpClient);

  /**
   * The read-only signal representing the current user state snapshot.
   */
  readonly state = this.vault.state;

  /**
   * Computed signal that returns an array of all user entities.
   */
  readonly users = computed(() => Object.values(this.state().entities));

  /**
   * Computed signal indicating whether a user operation is currently loading.
   */
  readonly isLoading = computed(() => this.state().loading);

  /**
   * Loads all users from the backend API.
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
   */
  upsert(user: UserModel) {
    const curr = this.state().entities;
    this.vault._patch({ entities: { ...curr, [user.id]: user } });
  }

  /**
   * Removes a user entity from the state by its ID.
   */
  remove(id: string) {
    const { entities, ...rest } = this.state();
    const { [id]: _, ...remaining } = entities;
    this.vault._set({ ...rest, entities: remaining });
  }
}
