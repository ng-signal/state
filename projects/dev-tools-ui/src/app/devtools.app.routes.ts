import { Routes } from '@angular/router';
import { SplashPageComponent } from './splash-page/splash-page.component';

export const routes: Routes = [
  { path: '', component: SplashPageComponent },
  { path: '**', redirectTo: '' }
];
