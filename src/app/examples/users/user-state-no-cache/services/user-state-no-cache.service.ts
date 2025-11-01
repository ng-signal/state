import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { FeatureStore, injectFeatureVault, ResourceSignal } from '@ngss/state';
import { map } from 'rxjs';
import { UserModel } from '../../../models/user.model';

@FeatureStore<UserModel[]>('userNoCache')
@Injectable({
  providedIn: 'root'
})
export class UserStateNoCacheService {
  private readonly vault = injectFeatureVault<UserModel[]>(UserStateNoCacheService);

  private readonly http = inject(HttpClient);

  users(): ResourceSignal<UserModel[]> {
    this.loadUsers();

    return this.vault.state;
  }

  /** Computed selector that reverses first/last names reactively */
  readonly usersWithNames = computed(() => {
    const users = this.vault.state.data();
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

    if (!state.data() && !state.loading()) {
      const source$ = this.http.get<UserModel[]>('/api/users').pipe(map((list: UserModel[]) => list));
      this.vault.loadListFrom!(source$);
    }
  }
}
