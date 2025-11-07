import { VaultBehaviorContext, VaultSignalRef } from '@ngvault/shared-models';
import { Observable } from 'rxjs';

export interface ObservableBehaviorExtension<T> {
  // eslint-disable-next-line
  [key: string]: (...args: any[]) => unknown;

  fromObservable: (key: string, ctx: VaultBehaviorContext<T>, source$: Observable<T>) => Observable<VaultSignalRef<T>>;
}
