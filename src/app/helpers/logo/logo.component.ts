import { CommonModule } from '@angular/common';
import { Component, computed, input, OnDestroy, signal } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'ngvault-logo',
  standalone: true,
  imports: [CommonModule, MatTooltipModule],
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.scss']
})
export class NgvaultLogoComponent implements OnDestroy {
  /** Base logo filename (e.g. 'ngvault.svg') */
  readonly logo = input.required<string>();

  /** Tooltip text for the logo */
  readonly tooltip = input<string>('ngVault');

  /** Optional image width */
  readonly width = input<number | string>('auto');

  /** Optional image height */
  readonly height = input<number | string>('auto');

  /** Alt text for accessibility */
  readonly altText = computed(() => this.tooltip() || 'ngVault Logo');

  private readonly theme = signal<'light' | 'dark'>(this.getTheme());
  // private readonly media = window.matchMedia('(prefers-color-scheme: dark)');
  private media: MediaQueryList | null = null;
  private observer?: MutationObserver;

  constructor() {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      this.media = window.matchMedia('(prefers-color-scheme: dark)');
      this.media.addEventListener('change', this.syncTheme);
      this.observer = new MutationObserver(this.syncTheme);
      this.observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
      });
    }
  }

  ngOnDestroy(): void {
    this.media?.removeEventListener('change', this.syncTheme);
    this.observer?.disconnect();
  }

  private syncTheme = () => {
    this.theme.set(this.getTheme());
  };

  private getTheme(): 'light' | 'dark' {
    // istanbul ignore next
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      return 'light'; // default fallback for SSR/tests
    }

    const attr = document.documentElement.getAttribute('data-theme');
    if (attr === 'dark') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  readonly resolvedLogo = computed(() => {
    const base = this.logo();
    const theme = this.theme();
    const ext = base.split('.').pop()!;
    const name = base.replace('.' + ext, theme === 'dark' && !base.includes('-dark') ? `-dark.${ext}` : `.${ext}`);
    return `assets/brand/${name}`;
  });
}
