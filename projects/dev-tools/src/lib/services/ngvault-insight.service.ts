import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { NgVaultEventModel } from '../models/ngvault-event.model';
import { NgVaultEventBus } from '../utils/ngvault-event-bus';

@Injectable({ providedIn: 'root' })
export class NgVaultInsightService {
  constructor(private readonly eventBus: NgVaultEventBus) {}

  listen$() {
    return this.eventBus.asObservable();
  }

  listen(hook: (event: NgVaultEventModel) => void): () => void {
    const subscription: Subscription = this.eventBus.asObservable().subscribe(hook);
    return () => subscription.unsubscribe();
  }
}
