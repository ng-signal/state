import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';

/**
 * The Toolbar Component used for navigation
 */
@Component({
  selector: 'ngvault-toolbar',
  imports: [MatToolbarModule, MatIconModule, MatMenuModule, MatButtonModule],
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {}
