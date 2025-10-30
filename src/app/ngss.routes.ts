import { Routes } from '@angular/router';
import { UserListComponent } from './examples/user-state/user-list.component';
import { SplashPageComponent } from './splash-page/splash-page.component';

/**
 * Root routing configuration for the NG Signal Store example application.
 *
 * The `routes` constant defines the top-level Angular route definitions
 * used by the application’s `RouterOutlet`. Routes determine which
 * components or feature modules are rendered for specific URL paths.
 *
 * @remarks
 * - Currently defined as an empty array (`[]`).
 * - As the application grows, feature routes (such as `/users`, `/cart`, etc.)
 *   will be added here or imported from dedicated routing modules.
 * - The `routes` array is provided to Angular via `provideRouter(routes)`
 *   in {@link appConfig}.
 *
 * @example
 * ```ts
 * import { Routes } from '@angular/router';
 * import { UsersComponent } from './examples/users.component';
 *
 * export const routes: Routes = [
 *   { path: 'users', component: UsersComponent },
 *   { path: '', redirectTo: 'users', pathMatch: 'full' }
 * ];
 * ```
 *
 * @see {@link appConfig} for how this routing configuration is registered.
 */
export const routes: Routes = [
  { path: 'users', component: UserListComponent },
  { path: '', component: SplashPageComponent },
  { path: '**', redirectTo: '' }
];
