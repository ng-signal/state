import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FeatureCell, injectVault } from '@ngvault/core';
import { map, take } from 'rxjs';
import { UserModel } from '../../../models/user.model';
import { UserService } from '../../services/user-base.service';

@FeatureCell<UserModel[]>('userNoCache')
@Injectable({
  providedIn: 'root'
})
export class UserCellNoCacheService extends UserService<UserModel[]> {
  readonly #destroyRef = inject(DestroyRef);

  constructor() {
    const vault = injectVault<UserModel[]>(UserCellNoCacheService);
    vault.initialize();
    super(vault);
  }

  override loadUsers(): void {
    const state = this.vault.state;

    if (!state.value() && !state.isLoading()) {
      const source$ = this.http.get<UserModel[]>('/api/users').pipe(
        take(1),
        takeUntilDestroyed(this.#destroyRef),
        map((list: UserModel[]) => list)
      );
      // TODO
      // this.vault.loadListFrom!(source$);
      this.vault.fromObservable!(source$);
    }
  }
}
