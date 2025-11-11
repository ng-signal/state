import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { Component, HostListener, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'ngvault-navigation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
    MatTooltipModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    ScrollingModule
  ],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent {
  /** Controls sidenav open/closed state */
  isExpanded = signal<boolean>(this.restoreSidenavState());

  constructor() {
    // Initialize based on window size if no saved state
    if (localStorage.getItem('ngvault-sidenav') === null) {
      this.isExpanded.set(window.innerWidth >= 1200);
    }
  }

  /** Toggles the sidenav and persists the setting */
  toggleSidenav(): void {
    this.isExpanded.update((value) => {
      const next = !value;
      localStorage.setItem('ngvault-sidenav', JSON.stringify(next));
      return next;
    });
  }

  /** Handle window resize */
  @HostListener('window:resize')
  /* istanbul ignore next */
  onResize(): void {
    /* istanbul ignore next */
    if (localStorage.getItem('ngvault-sidenav') === null) {
      this.isExpanded.set(window.innerWidth >= 1200);
    }
  }

  /** Retrieve persisted sidenav state */
  private restoreSidenavState(): boolean {
    const saved = localStorage.getItem('ngvault-sidenav');
    return saved ? JSON.parse(saved) : window.innerWidth >= 1200;
  }
}
