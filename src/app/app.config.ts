import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngss/state';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { MockApiService } from 'src/testing/mock-api.service';
import { NGSS_STATES } from './inital-states/application-states';
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
    ...NGSS_STATES,

    /**
     * Configures Angular's built-in **HttpClient** with dependency-injected interceptors.
     *
     * - Registers the HttpClient globally for all services and components.
     * - Enables the use of interceptors defined via Angular's DI system.
     * - Required for the in-memory API and for all backend communication.
     *
     * @see https://angular.dev/api/common/http/provideHttpClient
     * @see https://angular.dev/guide/http
     */
    provideHttpClient(withInterceptorsFromDi()),

    /**
     * Sets up the **in-memory web API** to simulate a backend during development.
     *
     * - Intercepts HTTP requests (e.g., `/api/users`) and returns mock data.
     * - Uses the provided `MockApiService` to define mock collections.
     * - Applies a simulated network delay for realistic behavior.
     * - Passes through any unknown URLs to the real backend if needed.
     *
     * @remarks
     * This should only be enabled in **non-production** builds to avoid
     * intercepting real HTTP requests in production environments.
     *
     * @example
     * ```ts
     * importProvidersFrom(
     *   HttpClientInMemoryWebApiModule.forRoot(MockApiService, {
     *     delay: 500,
     *     passThruUnknownUrl: true
     *   })
     * )
     * ```
     *
     * @see https://github.com/angular/in-memory-web-api
     */
    importProvidersFrom(
      HttpClientInMemoryWebApiModule.forRoot(MockApiService, {
        delay: 500,
        passThruUnknownUrl: true
      })
    )
  ]
};
