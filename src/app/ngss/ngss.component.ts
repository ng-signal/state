import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';

/**
 * Root **layout component** for the NG Signal Store demo application.
 *
 * The `NGSSComponent` serves as the main shell of the demo app,
 * providing global navigation and consistent layout structure.
 *
 * ### Features
 * - **Top Toolbar:** Displays the library title and optional actions.
 * - **Side Navigation:** Contains navigation links to example pages.
 * - **Main Content Area:** Hosts dynamically rendered routed components.
 *
 * ### Layout Behavior
 * - The side navigation (`mat-sidenav`) can toggle between open and closed states.
 * - The layout is responsive by default and adjusts for smaller screens.
 *
 * ### Example
 * ```html
 * <ngss-root>
 *   <mat-toolbar color="primary">{{ title }}</mat-toolbar>
 *   <mat-sidenav-container>
 *     <mat-sidenav mode="side" [opened]="opened">
 *       <mat-nav-list>
 *         <a mat-list-item routerLink="/examples/users">Users</a>
 *         <a mat-list-item routerLink="/examples/settings">Settings</a>
 *       </mat-nav-list>
 *     </mat-sidenav>
 *     <mat-sidenav-content>
 *       <router-outlet></router-outlet>
 *     </mat-sidenav-content>
 *   </mat-sidenav-container>
 * </ngss-root>
 * ```
 *
 * @remarks
 * This component uses **Angular Material** layout primitives and
 * **Angular Router** for navigation and content projection.
 *
 * @see {@link https://material.angular.io/components/categories|Angular Material Components}
 */
@Component({
  selector: 'ngss-root',
  standalone: true,
  imports: [RouterModule, MatToolbarModule, MatSidenavModule, MatListModule, MatIconModule, MatButtonModule],
  templateUrl: './ngss.component.html',
  styleUrls: ['./ngss.component.scss']
})
export class NGSSComponent {
  /**
   * Application title displayed in the toolbar.
   */
  title = 'NGSS (Signal Store) Demo';

  /**
   * Controls whether the side navigation panel is open.
   *
   * Defaults to `true` for desktop layouts.
   */
  opened = true;
}
