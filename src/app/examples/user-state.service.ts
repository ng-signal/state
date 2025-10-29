import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject } from '@angular/core';
import { FEATURE_VAULT_TOKEN } from '@ngss/state';

export interface User {
  id: string;
  name: string;
}
export interface UserState {
  loading: boolean;
  entities: Record<string, User>;
  error: string | null;
}

@Injectable()
export class UserStateService {
  private readonly vault = inject(FEATURE_VAULT_TOKEN<UserState>('user'));
  private readonly http = inject(HttpClient);

  readonly state = this.vault.state;
  readonly users = computed(() => Object.values(this.state().entities));
  readonly isLoading = computed(() => this.state().loading);

  loadUsers() {
    this.vault._patch({ loading: true, error: null });
    this.http.get<User[]>('/api/users').subscribe({
      next: (list) => {
        const entities = Object.fromEntries(list.map((u) => [u.id, u]));
        this.vault._patch({ loading: false, entities });
      },
      error: (err) => this.vault._patch({ loading: false, error: String(err) })
    });
  }

  upsert(user: User) {
    const curr = this.state().entities;
    this.vault._patch({ entities: { ...curr, [user.id]: user } });
  }

  remove(id: string) {
    const { entities, ...rest } = this.state();
    const { [id]: _, ...remaining } = entities;
    this.vault._set({ ...rest, entities: remaining });
  }
}
