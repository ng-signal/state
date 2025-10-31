import { Signal } from '@angular/core';
import { Observable } from 'rxjs';
import { FeatureVaultModel } from './feature-vault.model';
import { NormalizedError } from './resource-signal.normalized-error.model';

export interface ResourceVaultModel<T> extends FeatureVaultModel<T> {
  readonly state: {
    loading: Signal<boolean>;
    data: Signal<T | null>;
    error: Signal<NormalizedError | null>;
  };

  fromResource?(source$: Observable<T>): void;
}
