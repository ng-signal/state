import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserListDirective } from '../directive/user-list-base.directive';
import { UserCellNoCacheService } from './services/user-cell-no-cache.service';

/**
 * @component UserListManualComponent
 *
 * @description
 * The **UserListNoCacheComponent** is a standalone Angular component
 * responsible for displaying a list of users managed via a **automatic signal store**.
 */
@Component({
  selector: 'ngvault-user-list-no-cache',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: '../html/user-list.component.html',
  styleUrls: ['../scss/example.scss']
})
export class UserListNoCacheComponent extends UserListDirective {
  /** Header title for the view */
  override title = 'Signal Store Automatically Persisted - No Cache';

  /** Spinner caption shown during manual load operations */
  override spinnerTitle = 'Reactive';

  constructor() {
    super(inject(UserCellNoCacheService));
  }
}
