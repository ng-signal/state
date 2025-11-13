import { Component } from '@angular/core';
import { NgVaultDevtoolsPanelComponent } from '@ngvault/dev-tools';

@Component({
  selector: 'ngvault-devtools',
  standalone: true,
  imports: [NgVaultDevtoolsPanelComponent],
  template: `<ngvault-devtools-panel />`
})
export class DevToolsComponent {}
