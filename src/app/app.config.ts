import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideState, provideStore } from '@ngss/state';

import { routes } from './app.routes';
import { UserState, UserStateService } from './examples/user-state.service';

const initialUser: UserState = { loading: false, entities: {}, error: null };

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideStore(),
    provideState(UserStateService, { key: 'user', initial: initialUser })
  ]
};
