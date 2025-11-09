import { Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FeatureCell, injectVault } from '@ngvault/core';
import { VaultSignalRef } from '@ngvault/shared';
import { take } from 'rxjs';
import { UserModel } from '../../../models/user.model';
import { UserService } from '../../services/user-base.service';

@FeatureCell<UserModel[]>('userManual')
@Injectable({
  providedIn: 'root'
})
export class UserCellManualService extends UserService<UserModel[]> {
  constructor() {
    super(injectVault<UserModel[]>(UserCellManualService));
  }

  override loadUsers(): void {
    const state = this.vault.state;

    if (!state.hasValue() && !state.isLoading()) {
      this.vault.setState({ loading: true, error: null });

      const source$ = this.http.get<UserModel[]>('/api/users');

      this.vault.fromObservable!(source$)
        .pipe(take(1), takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (state: VaultSignalRef<UserModel[]>) => {
            this.vault.setState({
              loading: false,
              value: state.value(),
              error: null
            });
          },
          error: (err) => {
            this.vault.setState({ loading: false, error: err });
          }
        });
    }
  }
}
