import { Subject } from 'rxjs';
import { IS_DEV_MODE } from '../constants/env.constants';
import { VaultEventModel } from './models/vault-event.model';

class DevVaultEventBus {
  private _bus = new Subject<VaultEventModel>();

  next(event: VaultEventModel): void {
    if (IS_DEV_MODE) {
      this._bus.next(event);
    }
  }

  asObservable() {
    return this._bus.asObservable();
  }
}

export const VaultEventBus = new DevVaultEventBus();
