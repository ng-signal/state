import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import { NgVaultEventModel } from '../../../../../dev-tools/src/lib/models/ngvault-event.model';
import { NgVaultInsightService } from '../../../../../dev-tools/src/lib/services/ngvault-insight.service';

@Injectable({ providedIn: 'root' })
export class NgVaultDevtoolsService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly bus = inject(NgVaultInsightService);

  /** Rolling event history (max 200 entries) */
  readonly events = signal<NgVaultEventModel[]>([]);

  readonly totalEvents = computed(() => this.events().length);

  constructor() {
    this.bus
      .listenEventBus$()
      .pipe(
        filter((e): e is NgVaultEventModel => !!e),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event) => {
        this.events.update((prev) => [event, ...prev].slice(0, 200));
      });
  }

  /** Clear the devtools event log */
  clearEvents(): void {
    this.events.set([]);
  }
}
