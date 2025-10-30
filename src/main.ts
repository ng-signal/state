import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { NGSSComponent } from './app/ngss/ngss.component';

bootstrapApplication(NGSSComponent, appConfig).catch((err) => console.error(err));
