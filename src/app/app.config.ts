import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideState, provideStore } from '@ngss/state';

import { UserStateModel } from './examples/model/user-state.model';
import { UserStateService } from './examples/user-state.service';
import { routes } from './ngss.routes';

/**
 * Root **application configuration** for the NG Signal Store example app.
 *
 * The `appConfig` object defines all top-level Angular providers that
 * configure the runtime environment, routing, error handling, and state
 * management for the application.
 *
 * This configuration is passed directly to Angular’s
 * `bootstrapApplication()` function to initialize the application
 * without using a traditional `AppModule`.
 *
 * @remarks
 * - Uses **zoneless change detection** to take full advantage of
 *   Angular Signals.
 * - Sets up **global error listeners** for browser-level error handling.
 * - Configures the **router** with application routes.
 * - Initializes the **NG Signal Store** root context and registers
 *   the `UserStateService` as a feature.
 *
 * @example
 * ```ts
 * import { bootstrapApplication } from '@angular/platform-browser';
 * import { App } from './app.component';
 * import { appConfig } from './app.config';
 *
 * bootstrapApplication(App, appConfig);
 * ```
 */
const initialUser: UserStateModel = { loading: false, entities: {}, error: null };

/**
 * Global application configuration object.
 *
 * Includes core Angular platform providers and NG Signal Store setup.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    /**
     * Registers global error handlers for browser-level exceptions.
     * Captures unhandled errors and rejections for improved diagnostics.
     */
    provideBrowserGlobalErrorListeners(),

    /**
     * Enables zoneless change detection mode for a signal-driven application.
     * Eliminates Zone.js overhead by relying entirely on Signals reactivity.
     */
    provideZonelessChangeDetection(),

    /**
     * Configures application routing and registers route definitions.
     */
    provideRouter(routes),

    /**
     * Initializes the root NG Signal Store context.
     * Provides the global store registry and root configuration.
     */
    provideStore(),

    /**
     * Registers the 'user' feature state using the UserStateService.
     * Seeds the feature with its initial state object.
     */
    provideState(UserStateService, { key: 'user', initial: initialUser })
  ]
};
