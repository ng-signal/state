import { Component, computed, inject, input } from '@angular/core';
import { VaultSignalRef } from '@ngvault/shared';
import { ExampleViewerBodyComponent } from '../example-viewer-body/example-viewer-body.component';
import { ExampleViewerHeaderComponent } from '../example-viewer-header/example-viewer-header.component';
import { ExampleViewerService } from '../services/example-viewer.service';

@Component({
  selector: 'ngvault-example-viewer',
  standalone: true,
  imports: [ExampleViewerBodyComponent, ExampleViewerHeaderComponent],
  templateUrl: './example-viewer.component.html',
  styleUrls: ['./example-viewer.component.scss']
})
export class ExampleViewerComponent {
  readonly title = input<string>('');
  readonly subTitle = input<string>('');
  readonly exampleId = input<string>('');
  // eslint-disable-next-line
  readonly state = input.required<VaultSignalRef<any>>();

  private readonly service = inject(ExampleViewerService);

  readonly sourceVisible = computed(() => {
    if (!this.exampleId()) return false;
    return this.service.getVisibilitySignal(this.exampleId())();
  });
}
