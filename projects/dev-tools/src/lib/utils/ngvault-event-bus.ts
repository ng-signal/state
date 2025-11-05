// projects/dev-tools/src/lib/utils/ngvault-event-bus.ts
import { inject, Injectable } from '@angular/core';
import { NgVaultDevModeService } from '@ngvault/shared-models';
import { Subject } from 'rxjs';
import { NgVaultEventModel } from '../models/ngvault-event.model';

@Injectable({ providedIn: 'root' })
export class NgVaultEventBus {
  #bus = new Subject<NgVaultEventModel>();
  #devModeService = inject(NgVaultDevModeService);

  #generateGuid(): string {
    return 'xxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  next(event: NgVaultEventModel): void {
    if (!this.#devModeService.isDevMode || !event) return;
    this.#bus.next({ id: this.#generateGuid(), ...event });
  }

  asObservable() {
    return this.#bus.asObservable();
  }
}
