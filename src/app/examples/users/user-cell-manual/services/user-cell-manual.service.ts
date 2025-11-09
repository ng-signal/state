import { HttpClient } from '@angular/common/http';
import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FeatureCell, injectVault } from '@ngvault/core';
import { VaultSignalRef } from '@ngvault/shared';
import { take } from 'rxjs';
import { UserModel } from '../../../models/user.model';

@FeatureCell<UserModel[]>('userManual')
@Injectable({
  providedIn: 'root'
})
export class UserCellManualService {
  private readonly vault = injectVault<UserModel[]>(UserCellManualService);
  readonly #destroyRef = inject(DestroyRef);
  private isLoaded = signal(false);

  private readonly http = inject(HttpClient);

  resetUsers(): void {
    this.isLoaded.set(false);
    this.vault.reset();
  }

  /** Computed selector that reverses first/last names reactively */
  readonly usersWithNames = computed(() => {
    const users = this.vault.state.value();
    if (!users) return [];

    return users.map((u) => {
      const [firstName, lastName = ''] = u.name.split(' ');
      return {
        ...u,
        firstName: lastName,
        lastName: firstName
      };
    });
  });

  users(): VaultSignalRef<UserModel[]> {
    if (!this.isLoaded()) {
      this.isLoaded.set(true);
      this.loadUsers();
    }

    return this.vault.state;
  }

  loadUsers(): void {
    const state = this.vault.state;

    if (!state.value() && !state.isLoading()) {
      this.vault.setState({ loading: true, error: null });

      const source$ = this.http.get<UserModel[]>('/api/users');

      this.vault.fromObservable!(source$)
        .pipe(
          take(1), // keep
          takeUntilDestroyed(this.#destroyRef) // 👈 ties it to Angular DI lifecycle
        )
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
