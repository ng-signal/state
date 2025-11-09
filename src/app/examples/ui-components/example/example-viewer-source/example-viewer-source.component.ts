import { NgTemplateOutlet } from '@angular/common';
import { AfterContentInit, Component, ContentChildren, QueryList, signal } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { ExampleViewerTabComponent } from '../example-viewer-tab/example-viewer-source-tab.component';

@Component({
  selector: 'ngvault-example-viewer-source',
  standalone: true,
  imports: [MatTabsModule, NgTemplateOutlet],
  templateUrl: './example-viewer-source.component.html',
  styleUrls: ['./example-viewer-source.component.scss']
})
export class ExampleViewerSourceComponent implements AfterContentInit {
  @ContentChildren(ExampleViewerTabComponent) tabComponents!: QueryList<ExampleViewerTabComponent>;

  readonly tabs = signal<ExampleViewerTabComponent[]>([]);

  ngAfterContentInit(): void {
    this.tabs.set(this.tabComponents.toArray());
    // react to future changes too
    this.tabComponents.changes.subscribe(() => this.tabs.set(this.tabComponents.toArray()));
  }
}
