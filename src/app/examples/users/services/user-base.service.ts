import { HttpClient } from '@angular/common/http';
import { computed, DestroyRef, inject, signal } from '@angular/core';
import { FeatureCell, VaultSignalRef } from '@ngvault/shared';
import { UserModel } from '../../models/user.model';

export abstract class UserService<T> {
  protected readonly destroyRef = inject(DestroyRef);
  private readonly isLoaded = signal(false);
  protected readonly http = inject(HttpClient);

  constructor(protected readonly vault: FeatureCell<T>) {}

  users(): VaultSignalRef<T> {
    if (!this.isLoaded()) {
      this.isLoaded.set(true);
      this.loadUsers();
    }

    return this.vault.state;
  }

  /** Computed selector that reverses first/last names reactively */
  readonly usersWithNames = computed(() => {
    const users = this.vault.state.value() as UserModel[] | undefined;
    if (!users) return [];

    return users.map((user: UserModel) => {
      const [firstName, lastName = ''] = user.name.split(' ');
      return {
        ...user,
        firstName,
        lastName,
        display: firstName
      };
    });
  });

  loadUsers(): void {}

  loadUser(_id: string): void {}

  resetUsers() {
    this.vault.reset();
  }

  reloadUsers(): void {
    this.resetUsers();
    this.loadUsers();
  }

  reactiveReloadUsers(): void {
    this.isLoaded.set(false);
  }
}
