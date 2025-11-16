import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/devtools.app.config';
import { NgVaultDevToolsApp } from './app/devtools/devtools.app.component';

bootstrapApplication(NgVaultDevToolsApp, appConfig)
  // eslint-disable-next-line
  .catch((err) => console.error(err));
