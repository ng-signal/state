import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<'light' | 'dark'>('light');
  readonly direction = signal<'ltr' | 'rtl'>('ltr');

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.applyTheme(this.theme());
    this.applyDirection(this.direction());
  }

  toggleTheme(): void {
    const next = this.theme() === 'light' ? 'dark' : 'light';
    this.theme.set(next);
    this.applyTheme(next);
  }

  toggleDirection(): void {
    const next = this.direction() === 'ltr' ? 'rtl' : 'ltr';
    this.direction.set(next);
    this.applyDirection(next);
  }

  private applyTheme(theme: 'light' | 'dark') {
    const html = this.document.documentElement;
    html.setAttribute('data-theme', theme);
    localStorage.setItem('ngvault-theme', theme);
  }

  private applyDirection(dir: 'ltr' | 'rtl') {
    const html = this.document.documentElement;
    html.setAttribute('dir', dir);
    localStorage.setItem('ngvault-dir', dir);
  }

  restorePreferences(): void {
    const theme = (localStorage.getItem('ngvault-theme') as 'light' | 'dark') || 'light';
    const dir = (localStorage.getItem('ngvault-dir') as 'ltr' | 'rtl') || 'ltr';
    this.theme.set(theme);
    this.direction.set(dir);
    this.applyTheme(theme);
    this.applyDirection(dir);
  }
}
