import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import { NgVaultEventModel } from '../../models/ngvault-event.model';
import { NgVaultEventBus } from '../../utils/ngvault-event-bus';

@Injectable({ providedIn: 'root' })
export class NgVaultDevtoolsService {
  private readonly destroyRef = inject(DestroyRef);

  /** Rolling event history (max 200 entries) */
  readonly events = signal<NgVaultEventModel[]>([]);

  /** Current snapshot of all active vaults */
  readonly vaults = signal<Record<string, NgVaultEventModel['payload']>>({});

  constructor() {
    NgVaultEventBus.asObservable()
      .pipe(
        filter((e) => !!e),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (event) => {
          // Maintain event log
          this.events.update((prev) => [event, ...prev].slice(0, 200));

          // Maintain latest vault state per key
          if (event.key && event.payload) {
            this.vaults.update((map) => ({
              ...map,
              [event.key]: event.payload
            }));
          }
        }
      });
  }

  /** Clear the devtools event log */
  clearEvents(): void {
    this.events.set([]);
  }

  /** Clear the vault state model */
  clearVaults(): void {
    this.vaults.set({});
  }

  /** Clear both (useful when resetting DevTools) */
  clearAll(): void {
    this.clearEvents();
    this.clearVaults();
  }
}
