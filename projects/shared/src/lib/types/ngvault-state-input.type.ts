import { HttpResourceRef } from '@angular/common/http';
import { NrVaultStateType } from './ngvault-state.type';

export type NgVaultStateInputType<T> = NrVaultStateType<T> | HttpResourceRef<T> | undefined | null;
