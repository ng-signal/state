import { Signal } from '@angular/core';
import { NgVaultStateInputType } from '@ngvault/shared';
import { Observable } from 'rxjs';
import { NgVaultResourceStateError } from '../models/ngvault-resource-state-error.model';
import { VaultStateSnapshot } from '../models/vault-state-snapshot.model';
import { NgVaultDataType } from '../types/ngvault-data.type';

export interface NgVaultBehaviorContext<T> {
  isLoading?: Signal<boolean> & { set(value: boolean): void };
  error?: Signal<NgVaultResourceStateError | null> & { set(value: NgVaultResourceStateError | null): void };
  value?: Signal<NgVaultDataType<T>> & { set(value: NgVaultDataType<T>): void };

  incoming?: NgVaultStateInputType<T>;
  state: Readonly<VaultStateSnapshot<T>>;

  operation?: 'replace' | 'merge';

  destroyed$?: Observable<void>;
  reset$?: Observable<void>;

  message?: string;
}
