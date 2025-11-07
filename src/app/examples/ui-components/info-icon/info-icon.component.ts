import { Component, computed, inject, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { InfoDialogService } from '../services/info-dialog.service';

@Component({
  selector: 'ngvault-info-icon',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './info-icon.component.html',
  styleUrls: ['./info-icon.component.scss']
})
export class InfoIconComponent {
  icon = input<string>('info');
  data = input.required();

  displayClass = computed(() => {
    const name = this.icon();
    switch (name) {
      case 'no_cars_custom':
        return 'icon-class overlay';
      default:
        return 'icon-class';
    }
  });

  displayOverlay = computed(() => {
    const name = this.icon();
    switch (name) {
      case 'no_cars_custom':
        return true;
      default:
        return false;
    }
  });

  displayIcon = computed(() => {
    const name = this.icon();
    switch (name) {
      case 'no_cars_custom':
        return 'directions_car';
      default:
        return name;
    }
  });

  private infoDialog = inject(InfoDialogService);

  open() {
    this.infoDialog.open(this.data());
  }
}
