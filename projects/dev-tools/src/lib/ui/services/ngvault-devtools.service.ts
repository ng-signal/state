import { Injectable, signal } from '@angular/core';
import { filter } from 'rxjs/operators';
import { NgVaultEventModel } from '../../models/ngvault-event.model';
import { NgVaultEventBus } from '../../utils/ngvault-event-bus';

@Injectable({ providedIn: 'root' })
export class NgVaultDevtoolsService {
  readonly events = signal<NgVaultEventModel[]>([]);

  constructor() {
    NgVaultEventBus.asObservable()
      .pipe(filter((e) => !!e)) // optional filter for safety
      .subscribe((event) => {
        this.events.update((prev) => [event, ...prev].slice(0, 200)); // cap to 200 for perf
      });
  }

  clear() {
    this.events.set([]);
  }
}
