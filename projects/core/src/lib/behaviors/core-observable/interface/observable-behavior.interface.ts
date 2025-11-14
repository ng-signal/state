import { NgVaultBehaviorContext, VaultSignalRef } from '@ngvault/shared';
import { Observable } from 'rxjs';

export interface ObservableBehaviorExtension<T> {
  // eslint-disable-next-line
  [key: string]: (...args: any[]) => unknown;

  fromObservable: (
    key: string,
    ctx: NgVaultBehaviorContext<T>,
    source$: Observable<T>
  ) => Observable<VaultSignalRef<T>>;
}
