import { Component, inject, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ExampleViewerService } from '../services/example-viewer.service';

@Component({
  selector: 'ngvault-example-viewer-header',
  standalone: true,
  imports: [MatIconModule, MatTooltipModule],
  templateUrl: './example-viewer-header.component.html',
  styleUrls: ['./example-viewer-header.component.scss']
})
export class ExampleViewerHeaderComponent {
  readonly title = input<string>('');
  readonly subTitle = input<string>('');
  readonly exampleId = input<string>('');
  private readonly exampleViewer = inject(ExampleViewerService);

  copyLink(): void {
    const url = `${window.location.origin}${window.location.pathname}#${this.exampleId()}`;
    navigator.clipboard.writeText(url);
  }

  toggleSource(): void {
    this.exampleViewer.toggle(this.exampleId());
  }
}
