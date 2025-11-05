import { Component } from '@angular/core';
import { NgVaultDevtoolsPanelComponent } from './ui/ngvault-devtools-panel.component';

@Component({
  selector: 'ngvault-devtools',
  standalone: true,
  imports: [NgVaultDevtoolsPanelComponent],
  template: ` <ngvault-devtools-panel /> `
})
export class DevToolsComponent {}
