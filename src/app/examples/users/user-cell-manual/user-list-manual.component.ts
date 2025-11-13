import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { NgVaultDevtoolsService } from '@ngvault/dev-tools/panel/services/ngvault-devtools.service';
import { ExampleViewerSourceComponent } from '../../ui-components/example/example-viewer-source/example-viewer-source.component';
import { ExampleViewerTabComponent } from '../../ui-components/example/example-viewer-tab/example-viewer-source-tab.component';
import { ExampleViewerComponent } from '../../ui-components/example/example-viewer/example-viewer.component';
import { InfoIconComponent } from '../../ui-components/info-icon/info-icon.component';
import { UserListDirective } from '../directive/user-list-base.directive';
import { UserCellManualService } from './services/user-cell-manual.service';
import { carsWithDescriptionsCodeModel } from './source-code/cars-with-descriptions/cars-with-descriptions.code';
import { userListSourceCodeModel } from './source-code/user-list/user-list.code';

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
    MatTabsModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    InfoIconComponent,
    ExampleViewerComponent,
    ExampleViewerSourceComponent,
    ExampleViewerTabComponent
  ],
  templateUrl: './user-list-manual.component.html',
  styleUrls: ['../scss/example.scss']
})
export class UserListManualComponent extends UserListDirective {
  /** Header title for the view */
  override title = 'Signal Store Manually Persisted - No Cache';

  /** Spinner caption shown during manual load operations */
  override spinnerTitle = 'Manual';

  private readonly ngVaultDevToolsService = inject(NgVaultDevtoolsService);

  readonly totalEvents = this.ngVaultDevToolsService.totalEvents;

  constructor() {
    super(inject(UserCellManualService));
  }

  userListSourceCode = userListSourceCodeModel;
  carsWithDescriptionsSourceCode = carsWithDescriptionsCodeModel;
}
