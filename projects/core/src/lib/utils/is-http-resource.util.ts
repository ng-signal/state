import { HttpResourceRef } from '@angular/common/http';

// eslint-disable-next-line
export function isHttpResourceRef<T>(obj: any): obj is HttpResourceRef<T> {
  return obj && typeof obj === 'object' && 'value' in obj && 'isLoading' in obj && 'error' in obj && 'hasValue' in obj;
}
