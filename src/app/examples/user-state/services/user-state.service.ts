import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { FeatureStore, injectFeatureVault, ResourceSignal } from '@ngss/state';
import { map } from 'rxjs';
import { UserModel } from '../models/user.model';

@FeatureStore<UserModel[]>('user')
@Injectable({
  providedIn: 'root'
})
export class UserStateService {
  private readonly vault = injectFeatureVault<UserModel[]>(UserStateService);

  private readonly http = inject(HttpClient);

  users(): ResourceSignal<UserModel[]> {
    this.loadUsers();

    return this.vault.state;
  }

  loadUsers(): void {
    const state = this.vault.state;

    if (!state.data() && !state.loading()) {
      const source$ = this.http.get<UserModel[]>('/api/users').pipe(map((list: UserModel[]) => list));
      this.vault.fromResource!(source$);
    }
  }

  /*
  upsert(user: UserModel) {
    const curr = this.vault.state().entities;
    this.vault._patch({ entities: { ...curr, [user.id]: user } });
  }

  remove(id: string) {
    const { entities, ...rest } = this.vault.state();
    const { [id]: _, ...remaining } = entities;
    this.vault._set({ ...rest, entities: remaining });
  }
    */
}
