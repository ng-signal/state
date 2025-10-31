import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserStateService } from './services/user-state.service';

/**
 * Example component that demonstrates how to consume the
 * {@link UserStateService} feature store in a reactive, signal-driven way.
 *
 * Displays:
 * - A loading spinner while users are being fetched.
 * - A list of user cards once data is available.
 * - An error message if the HTTP request fails.
 *
 * @example
 * ```html
 * <app-user-list></app-user-list>
 * ```
 *
 * @remarks
 * This component is standalone and uses Angular Material components for layout.
 * It serves as a live example of the NG Signal Store pattern.
 */
@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent {
  /**
   * Injected instance of the user feature store service.
   */
  private readonly userState = inject(UserStateService);

  /**
   * Reactive list of users derived from the store.
   *
   * - Automatically triggers load when empty.
   * - Reactively updates as state changes.
   */
  readonly userList = this.userState.users();

  /**
   * Retry handler for re-fetching users after an error.
   */
  retry() {
    this.userState.loadUsers();
  }
}
