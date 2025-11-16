import { Component } from '@angular/core';
import { SplashPageComponent } from '@ngvault/dev-tools-ui';

@Component({
  selector: 'ngvault-devtools',
  standalone: true,
  imports: [SplashPageComponent],
  template: `<ngvault-splash-page />`
})
export class DevToolsComponent {}
