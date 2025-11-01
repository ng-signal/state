import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserStateManualService } from './services/user-state-manual.service';

/**
 * @component UserListManualComponent
 *
 * @description
 * The **UserListManualComponent** is a standalone Angular component
 * responsible for displaying a list of users managed via a **manual signal store**.
 */
@Component({
  selector: 'ngss-user-list-manual',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './user-list-manual.component.html',
  styleUrls: ['../scss/user-list.scss']
})
export class UserListManualComponent {
  /** Header title for the view */
  title = 'Signal Store Manually Persisted - No Cache';

  /** Spinner caption shown during manual load operations */
  spinnerTitle = 'Manual';
  /**
   * Injected instance of the user feature store service.
   */
  private readonly userState = inject(UserStateManualService);

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
