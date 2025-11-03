import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ngvault-splash-page',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './splash-page.component.html',
  styleUrls: ['./splash-page.component.scss']
})
export class SplashPageComponent {
  /**
   * The app name
   */
  readonly appName = 'NG Signal Store';
}
