import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideVault } from '@ngvault/core';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { MockApiService } from 'src/testing/mock-api.service';
import { NGVAULT_CELLS } from './inital-cells/application-cells';
import { routes } from './ngvault.routes';

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
    ...provideVault({ logLevel: 'log' }),

    /**
     * Registers the 'user' feature state using the UserStateService.
     * Seeds the feature with its initial state object.
     */
    ...NGVAULT_CELLS,

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
