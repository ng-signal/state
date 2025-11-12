// table-basic-code.ts

import { getUserData } from 'src/testing/data/user.data';
import { SourceCodeModel } from '../models/source-code.model';
import { USER_MODEL } from '../models/user.model';

const HTML = `
<div example>
  @for (user of userList.value(); track user.id) {
      <ngvault-info-icon [data]="user" [icon]="'person'" class="info-icon" />
  }
</div>
`;

const COMPONENT = `
import { VaultSignalRef } from '@ngvault/shared';
import { UserService } from 'user.service';
import { UserModel } from 'user.model';

export class UserListComponent {
  protected readonly userService: UserService;
  readonly userList: VaultSignalRef<UserModel[]>;

  constructor() {
    this.userList = this.userService.users();
  }
}
`;

const SERVICE = `
import { HttpClient } from '@angular/common/http';
import { DestroyRef, inject, signal } from '@angular/core';

import { Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FeatureCell, injectVault } from '@ngvault/core';
import { VaultSignalRef } from '@ngvault/shared';
import { take } from 'rxjs';
import { UserModel } from 'user.model';


@FeatureCell<UserModel[]>('userManual')
@Injectable({
  providedIn: 'root'
})
export abstract class UserService<T> {
  protected readonly destroyRef = inject(DestroyRef);
  private readonly isLoaded = signal(false);
  protected readonly http = inject(HttpClient);
  private vault = injectVault<UserModel[]>(UserService);

  users(): VaultSignalRef<T> {
    if (!this.isLoaded() && !this.vault.state.hasValue()) {
      this.isLoaded.set(true);
      this.loadUsers();
    }

    return this.vault.state;
  }


 loadUsers(): void {
    const state = this.vault.state;

    if (!state.hasValue() && !state.isLoading()) {
      this.vault.replaceState({ loading: true, error: null });

      const source$ = this.http.get<UserModel[]>('/api/users');

      this.vault.fromObservable!(source$)
        .pipe(take(1), takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (state: VaultSignalRef<UserModel[]>) => {
            this.vault.replaceState({
              loading: false,
              value: state.value(),
              error: null
            });
          },
          error: (err) => {
            this.vault.replaceState({ loading: false, error: err });
          }
        });
    }
  }
}
`;

const DATA = `
${JSON.stringify(getUserData(), null, 2)}
`;

export const userListSourceCodeModel: SourceCodeModel[] = [
  {
    type: 'html',
    label: 'HTML',
    code: HTML
  },
  {
    type: 'component',
    label: 'COMPONENT',
    code: COMPONENT
  },
  {
    type: 'service',
    label: 'SERVICE',
    code: SERVICE
  },
  {
    type: 'model',
    label: 'MODEL',
    code: USER_MODEL
  },
  {
    type: 'data',
    label: 'DATA',
    code: DATA
  }
];
