import { Injectable, NgZone } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { NgVaultEventModel } from '../models/ngvault-event.model';
import { NgVaultDevtoolsMessage } from '../types/devtools-message.type';
import { NgVaultEventBus } from '../utils/ngvault-event-bus';

@Injectable({ providedIn: 'root' })
export class NgVaultInsightService {
  readonly #event$ = new Subject<NgVaultEventModel>();

  constructor(
    private readonly zone: NgZone,
    private readonly eventBus: NgVaultEventBus
  ) {
    /** ✔ Only available inside Chrome extension */
    const isChromeExtension = typeof chrome !== 'undefined' && !!chrome?.runtime?.onMessage;

    if (isChromeExtension) {
      chrome.runtime.onMessage.addListener((msg: NgVaultDevtoolsMessage) => {
        if (msg?.type === 'NGVAULT_EVENT') {
          // Execute inside Angular Zone so signals update
          this.zone.run(() => this.#event$.next(msg.event));
        }
      });
    }
  }

  /** Legacy listener for app-side testing */
  listenEventBus$() {
    return this.eventBus.asObservable();
  }

  /** Same — for older unit tests */
  listen(hook: (event: NgVaultEventModel) => void): () => void {
    const subscription: Subscription = this.eventBus.asObservable().subscribe(hook);
    return () => subscription.unsubscribe();
  }

  /** DevTools Chrome events → Angular signals */
  listen$() {
    return this.#event$.asObservable();
  }
}
