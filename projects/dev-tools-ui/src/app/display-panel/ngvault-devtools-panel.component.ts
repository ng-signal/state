import { DatePipe, DecimalPipe, JsonPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { NgVaultDevtoolsService } from './services/ngvault-devtools.service';

@Component({
  selector: 'ngvault-devtools-panel',
  standalone: true,
  imports: [JsonPipe, DatePipe, DecimalPipe],
  templateUrl: './ngvault-devtools-panel.component.html',
  styleUrl: './ngvault-devtools-panel.component.scss'
})
export class NgVaultDevtoolsPanelComponent {
  private devtools = inject(NgVaultDevtoolsService);
  readonly events = computed(() => this.devtools.events());

  readonly totalEvents = this.devtools.totalEvents;

  clearEvents(): void {
    this.devtools.clearEvents();
  }
}
