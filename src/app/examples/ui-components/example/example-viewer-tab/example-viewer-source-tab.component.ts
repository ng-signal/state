import { Component, TemplateRef, ViewChild, input } from '@angular/core';

@Component({
  selector: 'ngvault-example-viewer-tab',
  standalone: true,
  templateUrl: './example-viewer-source-tab.component.html',
  styleUrls: ['./example-viewer-source-tab.component.scss']
})
export class ExampleViewerTabComponent {
  readonly label = input<string>('Untitled');

  // ✅ Correct for templates declared inside this component
  @ViewChild('tpl', { static: true }) template!: TemplateRef<unknown>;
}
