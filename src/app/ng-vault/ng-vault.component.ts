import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'ngvault-root',
  standalone: true,
  imports: [RouterModule, MatToolbarModule, MatSidenavModule, MatListModule, MatIconModule, MatButtonModule],
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
