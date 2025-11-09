import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgvaultCodeEscapeDirective } from '../../ui-components/directives/ngvault-code-escape.directive';
import { ExampleViewerSourceComponent } from '../../ui-components/example/example-viewer-source/example-viewer-source.component';
import { ExampleViewerTabComponent } from '../../ui-components/example/example-viewer-tab/example-viewer-source-tab.component';
import { ExampleViewerComponent } from '../../ui-components/example/example-viewer/example-viewer.component';
import { InfoIconComponent } from '../../ui-components/info-icon/info-icon.component';
import { UserListDirective } from '../directive/user-list-base.directive';
import { UserCellManualService } from './services/user-cell-manual.service';

/**
 * @component UserListManualComponent
 *
 * @description
 * The **UserListManualComponent** is a standalone Angular component
 * responsible for displaying a list of users managed via a **manual signal store**.
 */
@Component({
  selector: 'ngvault-user-list-manual',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    InfoIconComponent,
    ExampleViewerComponent,
    ExampleViewerSourceComponent,
    ExampleViewerTabComponent,
    NgvaultCodeEscapeDirective
  ],
  templateUrl: './user-list-manual.component.html',
  styleUrls: ['../scss/example.scss']
})
export class UserListManualComponent extends UserListDirective {
  /** Header title for the view */
  override title = 'Signal Store Manually Persisted - No Cache';

  /** Spinner caption shown during manual load operations */
  override spinnerTitle = 'Manual';

  constructor() {
    super(inject(UserCellManualService));
  }
}
