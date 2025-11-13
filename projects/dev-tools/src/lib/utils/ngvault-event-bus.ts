// projects/dev-tools/src/lib/utils/ngvault-event-bus.ts
import { inject, Injectable } from '@angular/core';
import { NgVaultDevModeService } from '@ngvault/shared';
import { Subject } from 'rxjs';
import { NgVaultEventModel } from '../models/ngvault-event.model';

@Injectable({ providedIn: 'root' })
export class NgVaultEventBus {
  #bus = new Subject<NgVaultEventModel>();
  #devModeService = inject(NgVaultDevModeService);

  next(event: NgVaultEventModel): void {
    if (!this.#devModeService.isDevMode || !event) return;
    this.#bus.next(event);
  }

  asObservable() {
    return this.#bus.asObservable();
  }
}
