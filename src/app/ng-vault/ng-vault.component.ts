import { Component, inject } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { NavigationComponent } from '../navigation/navigation.component';
import { LoadingSpinnerComponent } from '../spinner/loading-spinner.component';
import { ThemeService } from '../theme/theme.service';
import { ToolbarComponent } from '../toolbar/toolbar.component';

@Component({
  selector: 'ngvault-root',
  standalone: true,
  imports: [ToolbarComponent, NavigationComponent, FooterComponent, LoadingSpinnerComponent],
  templateUrl: './ng-vault.component.html',
  styleUrls: ['./ng-vault.component.scss']
})
export class NgVaultComponent {
  #themeService = inject(ThemeService);

  constructor() {
    this.#themeService.restorePreferences();
  }
}
