import { NgTemplateOutlet } from '@angular/common';
import {
  AfterContentInit,
  Component,
  ContentChildren,
  ElementRef,
  QueryList,
  ViewChildren,
  effect,
  inject,
  input,
  signal
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ExampleViewerTabComponent } from '../example-viewer-tab/example-viewer-source-tab.component';
import { ExampleViewerService } from '../services/example-viewer.service';

@Component({
  selector: 'ngvault-example-viewer-source',
  standalone: true,
  imports: [MatTabsModule, NgTemplateOutlet, MatTooltipModule, MatIconModule],
  templateUrl: './example-viewer-source.component.html',
  styleUrls: ['./example-viewer-source.component.scss']
})
export class ExampleViewerSourceComponent implements AfterContentInit {
  @ContentChildren(ExampleViewerTabComponent) tabComponents!: QueryList<ExampleViewerTabComponent>;
  @ViewChildren('codeBlock', { read: ElementRef }) codeBlocks!: QueryList<ElementRef>;
  readonly displayExamples = input<boolean>(false);
  readonly exampleId = input<string>('');
  #exampleService = inject(ExampleViewerService);

  constructor() {
    effect(() => {
      const id = this.exampleId();
      const visible = this.displayExamples();

      if (id) {
        this.#exampleService.setDefaultVisibility(id, visible);
      }
    });
  }

  readonly tabs = signal<ExampleViewerTabComponent[]>([]);
  private readonly snackBar = inject(MatSnackBar);

  ngAfterContentInit(): void {
    this.tabs.set(this.tabComponents.toArray());
    this.tabComponents.changes.subscribe(() => this.tabs.set(this.tabComponents.toArray()));
  }

  copyCode(index: number): void {
    const codeElement = this.codeBlocks.get(index)?.nativeElement as HTMLElement | undefined;
    const textToCopy = codeElement?.innerText?.trim() ?? '';

    if (!textToCopy) {
      this.snackBar.open('Nothing to copy!', '', { duration: 1500 });
      return;
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
      this.snackBar.open('Source copied!', '', { duration: 2000 });
    });
  }
}
