import { Subject } from 'rxjs';
import { IS_DEV_MODE } from '../constants/env.constants';
import { NgVaultEventModel } from '../models/ngvault-event.model';

class DevNgVaultEventBus {
  private _bus = new Subject<NgVaultEventModel>();

  #generateGuid(): string {
    return 'xxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  next(event: NgVaultEventModel): void {
    if (IS_DEV_MODE && event) {
      this._bus.next({ id: this.#generateGuid(), ...event });
    }
  }

  asObservable() {
    return this._bus.asObservable();
  }
}

export const NgVaultEventBus = new DevNgVaultEventBus();
