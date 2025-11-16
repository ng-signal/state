import { Component, computed, inject } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { NgVaultDevtoolsPanelComponent } from '../display-panel/ngvault-devtools-panel.component';
import { NgVaultDevtoolsService } from '../display-panel/services/ngvault-devtools.service';

@Component({
  selector: 'ngvault-splash-page',
  standalone: true,
  imports: [MatTabsModule, NgVaultDevtoolsPanelComponent],
  templateUrl: './splash-page.component.html',
  styleUrl: './splash-page.component.scss'
})
export class SplashPageComponent {
  private devtools = inject(NgVaultDevtoolsService);

  readonly events = computed(() => this.devtools.events());
  readonly totalEvents = computed(() => this.events().length);

  clearEvents() {
    this.devtools.clearEvents();
  }
}
