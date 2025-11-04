import { Component } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { NavigationComponent } from '../navigation/navigation.component';
import { LoadingSpinnerComponent } from '../spinner/loading-spinner.component';
import { ToolbarComponent } from '../toolbar/toolbar.component';

@Component({
  selector: 'ngvault-root',
  standalone: true,
  imports: [ToolbarComponent, NavigationComponent, FooterComponent, LoadingSpinnerComponent],
  templateUrl: './ng-vault.component.html',
  styleUrls: ['./ng-vault.component.scss']
})
export class NgVaultComponent {
  /**
   * Application title displayed in the toolbar.
   */
  title = 'NgVault (Signal Service Storage) Demo';

  /**
   * Controls whether the side navigation panel is open.
   *
   * Defaults to `true` for desktop layouts.
   */
  opened = true;
}
