import { Routes } from '@angular/router';
import { DevToolsComponent } from './examples/dev-tools/dev-tools.component';
import { UserListManualComponent } from './examples/users/user-cell-manual/user-list-manual.component';
import { UserListNoCacheComponent } from './examples/users/user-cell-no-cache/user-list-no-cache.component';
import { SplashPageComponent } from './splash-page/splash-page.component';

export const routes: Routes = [
  { path: 'users/no-cache', component: UserListNoCacheComponent },
  { path: 'users/manual', component: UserListManualComponent },
  { path: 'dev-tools', component: DevToolsComponent },
  { path: '', component: SplashPageComponent },
  { path: 'about', component: SplashPageComponent },
  { path: '**', redirectTo: '' }
];
