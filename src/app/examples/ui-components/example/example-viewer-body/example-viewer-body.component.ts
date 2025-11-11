import { Component, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { VaultSignalRef } from '@ngvault/shared';

@Component({
  selector: 'ngvault-example-viewer-body',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  templateUrl: './example-viewer-body.component.html',
  styleUrls: ['./example-viewer-body.component.scss']
})
export class ExampleViewerBodyComponent {
  // eslint-disable-next-line
  readonly state = input.required<VaultSignalRef<any>>();
}
