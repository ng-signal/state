import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ExampleViewerSourceComponent } from '../examples/ui-components/example/example-viewer-source/example-viewer-source.component';
import { ExampleViewerTabComponent } from '../examples/ui-components/example/example-viewer-tab/example-viewer-source-tab.component';
import { ExampleViewerComponent } from '../examples/ui-components/example/example-viewer/example-viewer.component';
import { InfoIconComponent } from '../examples/ui-components/info-icon/info-icon.component';
import { UserListDirective } from '../examples/users/directive/user-list-base.directive';
import { UserCellManualService } from '../examples/users/user-cell-manual/services/user-cell-manual.service';
import { userListSourceCodeModel } from '../examples/users/user-cell-manual/source-code/user-list/user-list.code';
import { NgvaultLogoComponent } from '../helpers/logo/logo.component';

@Component({
  selector: 'ngvault-splash-page',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    ExampleViewerComponent,
    ExampleViewerSourceComponent,
    ExampleViewerTabComponent,
    NgvaultLogoComponent,
    InfoIconComponent
  ],
  templateUrl: './splash-page.component.html',
  styleUrls: ['./splash-page.component.scss']
})
export class SplashPageComponent extends UserListDirective {
  userListSourceCode = userListSourceCodeModel;

  constructor() {
    super(inject(UserCellManualService));
  }
}
