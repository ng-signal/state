import { Signal } from '@angular/core';
import { Subject } from 'rxjs';
import { NgVaultQueueEvent } from '../models/ngvault-queue-event.model';
import { NgVaultQueueStats } from '../models/ngvault-queue-stats.model';
import { NgVaultQueue } from './ngvault-queue.interface';

export interface NgVaultInspectableQueue extends NgVaultQueue {
  readonly events$: Subject<NgVaultQueueEvent>;

  readonly stats$: Signal<NgVaultQueueStats>;

  readonly stats: Readonly<NgVaultQueueStats>;
}
