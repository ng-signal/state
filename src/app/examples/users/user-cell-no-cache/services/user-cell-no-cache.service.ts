import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { FeatureCell, injectVault } from '@ngvault/core';
import { VaultSignalRef } from '@ngvault/shared';
import { map } from 'rxjs';
import { UserModel } from '../../../models/user.model';

@FeatureCell<UserModel[]>('userNoCache')
@Injectable({
  providedIn: 'root'
})
export class UserCellNoCacheService {
  private readonly vault = injectVault<UserModel[]>(UserCellNoCacheService);

  private readonly http = inject(HttpClient);

  users(): VaultSignalRef<UserModel[]> {
    this.loadUsers();

    return this.vault.state;
  }

  /** Computed selector that reverses first/last names reactively */
  readonly usersWithNames = computed(() => {
    const users = this.vault.state.value();
    if (!users) return [];

    return users.map((u) => {
      const [firstName, lastName = ''] = u.name.split(' ');
      return {
        ...u,
        firstName,
        lastName
      };
    });
  });

  loadUsers(): void {
    const state = this.vault.state;

    if (!state.value() && !state.isLoading()) {
      const source$ = this.http.get<UserModel[]>('/api/users').pipe(map((list: UserModel[]) => list));
      // TODO
      // this.vault.loadListFrom!(source$);
      this.vault.fromObservable!(source$);
    }
  }

  resetUsers() {
    this.vault.reset();
  }
}
