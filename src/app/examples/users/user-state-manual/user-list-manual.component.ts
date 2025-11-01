import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserListDirective } from '../directive/user-list-base.directive';
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
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatExpansionModule],
  templateUrl: './user-list-manual.component.html',
  styleUrls: ['../scss/example.scss']
})
export class UserListManualComponent extends UserListDirective {
  /** Header title for the view */
  override title = 'Signal Store Manually Persisted - No Cache';

  /** Spinner caption shown during manual load operations */
  override spinnerTitle = 'Manual';

  constructor() {
    super(inject(UserStateManualService));
  }
}
