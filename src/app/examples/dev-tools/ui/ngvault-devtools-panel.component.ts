import { DatePipe, JsonPipe, KeyValuePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { NgVaultDevtoolsService } from './services/ngvault-devtools.service';

@Component({
  selector: 'ngvault-devtools-panel',
  standalone: true,
  imports: [JsonPipe, DatePipe, KeyValuePipe],
  templateUrl: './ngvault-devtools-panel.component.html',
  styleUrl: './ngvault-devtools-panel.component.scss'
})
export class NgVaultDevtoolsPanelComponent {
  readonly events = computed(() => this.devtools.events());
  readonly vaults = computed(() => this.devtools.vaults());

  private devtools = inject(NgVaultDevtoolsService);

  clearEvents(): void {
    this.devtools.clearEvents();
  }

  clearVaults(): void {
    this.devtools.clearVaults();
  }

  clearAll(): void {
    this.devtools.clearAll();
  }
}
