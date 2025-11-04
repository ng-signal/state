import { DatePipe, JsonPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { NgVaultDevtoolsService } from './services/ngvault-devtools.service';

@Component({
  selector: 'ngvault-devtools-panel',
  standalone: true,
  imports: [JsonPipe, DatePipe],
  templateUrl: './ngvault-devtools-panel.component.html',
  styleUrl: './ngvault-devtools-panel.component.scss'
})
export class NgVaultDevtoolsPanelComponent {
  readonly events = computed(() => this.devtools.events());

  private devtools = inject(NgVaultDevtoolsService);
}
