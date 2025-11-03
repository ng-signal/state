import { HttpResourceRef } from '@angular/common/http';
import { VaultStateType } from './vault-state.type';

export type VaultStateInput<T> = VaultStateType<T> | HttpResourceRef<T> | undefined | null;
