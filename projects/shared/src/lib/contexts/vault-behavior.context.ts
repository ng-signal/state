import { Signal } from '@angular/core';
import { VaultBehaviorRunner, VaultStateInputType } from '@ngvault/shared';
import { Observable } from 'rxjs';
import { ResourceStateError } from '../models/resource-state-error.model';
import { VaultStateSnapshot } from '../models/vault-state-snapshot.model';
import { VaultDataType } from '../types/vault-data.type';
import { VaultStateType } from '../types/vault-state.type';

export interface VaultBehaviorContext<T> {
  isLoading?: Signal<boolean> & { set(value: boolean): void };
  error?: Signal<ResourceStateError | null> & { set(value: ResourceStateError | null): void };
  value?: Signal<VaultDataType<T>> & { set(value: VaultDataType<T>): void };

  next?: Readonly<VaultStateType<T>> | null;
  patch?: Readonly<VaultStateType<T>> | null;
  incoming?: VaultStateInputType<T>;
  state: Readonly<VaultStateSnapshot<T>>;
  behaviorRunner?: VaultBehaviorRunner<T>;

  operation?: 'replace' | 'merge';

  destroyed$?: Observable<void>;
  reset$?: Observable<void>;

  message?: string;
}
