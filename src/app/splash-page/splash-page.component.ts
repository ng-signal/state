import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/**
 * Minimal splash page displayed during application initialization.
 *
 * Centers the NGSS library name both vertically and horizontally.
 * Optionally shows a subtle Material spinner for polish.
 */
@Component({
  selector: 'app-splash-page',
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
