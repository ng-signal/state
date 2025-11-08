import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgVaultDebuggerService, NgVaultEventModel } from '@ngvault/dev-tools';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class NgVaultDevtoolsService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly bus = inject(NgVaultDebuggerService);

  /** Rolling event history (max 200 entries) */
  readonly events = signal<NgVaultEventModel[]>([]);

  /** Current snapshot of all active vaults */
  readonly vaults = signal<Record<string, NgVaultEventModel['state']>>({});

  constructor() {
    this.bus
      .listen$()
      .pipe(
        filter((e): e is NgVaultEventModel => !!e),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event) => {
        this.events.update((prev) => [event, ...prev].slice(0, 200));
        if (event.key && event.state) {
          this.vaults.update((map) => ({ ...map, [event.key]: event.state }));
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
