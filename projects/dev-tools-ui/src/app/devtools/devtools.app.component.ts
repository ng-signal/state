import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'ngvault-devtools-root',
  imports: [RouterOutlet],
  templateUrl: './devtools.app.component.html',
  styleUrl: './devtools.app.component.scss'
})
export class NgVaultDevToolsApp {
  protected readonly title = signal('dev-tools-ui');
}
