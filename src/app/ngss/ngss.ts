import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Root component of the NG Signal Store demonstration application.
 *
 * The `App` component serves as the top-level shell for routing
 * and layout. It initializes the application’s main view, provides
 * the router outlet for feature modules, and defines reactive
 * metadata such as the application title.
 *
 * @remarks
 * - Uses Angular’s **standalone component** API (`imports` array)
 *   to include the router outlet directly.
 * - The `title` signal demonstrates how reactive primitives can be
 *   used within a component template.
 *
 * @example
 * ```html
 * <!-- ngss.html -->
 * <header>{{ title() }}</header>
 * <router-outlet></router-outlet>
 * ```
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './ngss.html',
  styleUrl: './ngss.scss'
})
export class App {
  /**
   * Reactive title signal for the application.
   *
   * Represents the current name of the app and can be bound
   * directly in templates using signal syntax:
   *
   * ```html
   * <h1>{{ title() }}</h1>
   * ```
   *
   * @defaultValue `'angular-signal-state-management'`
   */
  protected readonly title = signal('angular-signal-state-management');
}
