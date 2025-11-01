import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { FeatureStore, injectFeatureVault, ResourceSignal } from '@ngss/state';
import { map, take } from 'rxjs';
import { UserModel } from '../../models/user.model';

@FeatureStore<UserModel[]>('userManual')
@Injectable({
  providedIn: 'root'
})
export class UserStateManualService {
  private readonly vault = injectFeatureVault<UserModel[]>(UserStateManualService);

  private readonly http = inject(HttpClient);

  users(): ResourceSignal<UserModel[]> {
    this.loadUsers();

    return this.vault.state;
  }

  loadUsers(): void {
    const state = this.vault.state;

    if (!state.data() && !state.loading()) {
      this.vault.setState({
        loading: true,
        error: null
      });
      const source$ = this.http.get<UserModel[]>('/api/users').pipe(map((list: UserModel[]) => list));
      this.vault.fromResource!(source$)
        .pipe(take(1))
        .subscribe({
          next: (state: ResourceSignal<UserModel[]>) => {
            this.vault.setState({
              loading: false,
              data: state.data(),
              error: null
            });
          },
          error: (err) => {
            this.vault.setState({
              loading: false,
              error: err
            });
          }
        });
    }
  }
}
