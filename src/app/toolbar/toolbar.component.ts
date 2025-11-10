import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { NgvaultLogoComponent } from '../helpers/logo/logo.component';
import { ThemeService } from '../theme/theme.service';

/**
 * Toolbar component for global app actions like theme & direction toggles.
 */
@Component({
  selector: 'ngvault-toolbar',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, MatMenuModule, MatButtonModule, NgvaultLogoComponent, RouterLink],
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {
  #themeService = inject(ThemeService);

  // Reactive computed signals for UI state
  readonly theme = computed(() => this.#themeService.theme());
  readonly direction = computed(() => this.#themeService.direction());

  // Derived signals for icon and label toggles
  readonly themeIcon = computed(() => (this.theme() === 'light' ? 'dark_mode' : 'light_mode'));
  readonly themeLabel = computed(() => (this.theme() === 'light' ? 'Dark Mode' : 'Light Mode'));

  readonly dirIcon = computed(() =>
    this.direction() === 'ltr' ? 'format_textdirection_r_to_l' : 'format_textdirection_l_to_r'
  );
  readonly dirLabel = computed(() => (this.direction() === 'ltr' ? 'Switch to RTL' : 'Switch to LTR'));

  toggleTheme(): void {
    this.#themeService.toggleTheme();
  }

  toggleDirection(): void {
    this.#themeService.toggleDirection();
  }
}
