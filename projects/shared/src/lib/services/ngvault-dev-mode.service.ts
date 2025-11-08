import { Injectable, isDevMode } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NgVaultDevModeService {
  get isDevMode(): boolean {
    return isDevMode();
  }
}
