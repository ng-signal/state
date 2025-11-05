import { HttpResourceRef } from '@angular/common/http';
import { VaultStateType } from './vault-state.type';

export type VaultStateInputType<T> = VaultStateType<T> | HttpResourceRef<T> | undefined | null;
