import { Component, signal } from '@angular/core';
import { NgVaultDevtoolsPanelComponent } from './panel/ngvault-devtools-panel.component';

@Component({
  selector: 'ngvault-root',
  imports: [NgVaultDevtoolsPanelComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('dev-tools-ui');
}
