import { Component, computed, inject, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CarModel } from '../../models/car.model';
import { UserModel } from '../../models/user.model';
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
  data = input.required<CarModel | UserModel>();
  disableClick = input<boolean>(false);

  display = computed(() => {
    const userData = this.data() as UserModel;

    if (userData.name) {
      return userData.name;
    }

    const carData = userData as unknown as CarModel;

    if (carData.model) {
      return carData.model;
    }

    return 'unknown';
  });

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
    if (!this.disableClick()) {
      this.infoDialog.open(this.data());
    }
  }
}
