import { Injectable, NgZone } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { NgVaultEventModel } from '../models/ngvault-event.model';
import { NgVaultDevtoolsMessage } from '../types/devtools-message.type';
import { NgVaultEventBus } from '../utils/ngvault-event-bus';

@Injectable({ providedIn: 'root' })
export class NgVaultInsightService {
  readonly #event$ = new Subject<NgVaultEventModel>();
  readonly isChromeExtension;

  constructor(
    private readonly zone: NgZone,
    private readonly eventBus: NgVaultEventBus
  ) {
    /** ✔ Only available inside Chrome extension */
    this.isChromeExtension = typeof chrome !== 'undefined' && !!chrome?.runtime?.onMessage;

    if (this.isChromeExtension) {
      chrome.runtime.onMessage.addListener((msg: NgVaultDevtoolsMessage) => {
        if (msg?.type === 'NGVAULT_EVENT') {
          // Execute inside Angular Zone so signals update
          this.zone.run(() => this.#event$.next(msg.event));
        }
      });
    }
  }

  /** Same — for older unit tests */
  listen(hook: (event: NgVaultEventModel) => void): () => void {
    const subscription: Subscription = this.eventBus.asObservable().subscribe(hook);
    return () => subscription.unsubscribe();
  }

  /** DevTools Chrome events → Angular signals */
  listen$() {
    if (this.isChromeExtension) {
      return this.#event$.asObservable();
    } else {
      return this.eventBus.asObservable();
    }
  }
}
