import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserStateService } from './services/user-state-no-cache.service';

@Component({
  selector: 'ngss-user-list-no-cache',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './user-list-no-cache.component.html',
  styleUrls: ['../scss/user-list.scss']
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
