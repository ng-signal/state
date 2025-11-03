import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { NgVaultComponent } from './app/ng-vault/ng-vault.component';

// eslint-disable-next-line
bootstrapApplication(NgVaultComponent, appConfig).catch((err) => console.error(err));
