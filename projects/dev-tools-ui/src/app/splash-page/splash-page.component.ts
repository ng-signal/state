import { Component, computed, inject, signal } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { NgVaultEventModel } from '@ngvault/dev-tools';
import { NgVaultDevtoolsPanelComponent } from '../display-panel/ngvault-devtools-panel.component';
import { NgVaultDevtoolsService } from '../display-panel/services/ngvault-devtools.service';

type TabId = 'All' | 'State' | 'Errors';

@Component({
  selector: 'ngvault-splash-page',
  standalone: true,
  imports: [MatTabsModule, NgVaultDevtoolsPanelComponent],
  templateUrl: './splash-page.component.html',
  styleUrl: './splash-page.component.scss'
})
export class SplashPageComponent {
  private devtools = inject(NgVaultDevtoolsService);

  readonly tabs: TabId[] = ['All', 'State', 'Errors'];
  readonly selectedIndex = signal(0);

  readonly events = computed(() => this.devtools.events());
  readonly totalEvents = computed(() => this.events().length);

  /** Map mat-tab index → filtered events */
  filteredEventsFor(index: number): NgVaultEventModel[] {
    const tab = this.tabs[index];
    const events = this.events();

    switch (tab) {
      case 'State':
        return events.filter((e) => !!e.state);
      case 'Errors':
        return events.filter((e) => !!e.error);
      default:
        return events;
    }
  }

  onTabChange(idx: number) {
    this.selectedIndex.set(idx);
  }

  clearEvents() {
    this.devtools.clearEvents();
  }
}
