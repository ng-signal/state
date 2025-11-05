// projects/core/src/lib/behaviors/with-core-set.behavior.ts
import { Injector } from '@angular/core';
import {
  VaultBehavior,
  VaultBehaviorContext,
  VaultBehaviorFactoryContext,
  VaultDataType
} from '@ngvault/shared-models';
import { isHttpResource } from '../utils/is-http-resource.util';

/**
 * Core behavior responsible for replacing state values.
 * No HTTP logic, no devtools hooks — pure synchronous state mutation.
 */
class CoreSetBehavior<T> implements VaultBehavior<T> {
  public critical = true;

  constructor(private readonly _injector: Injector) {}

  onSet(key: string, ctx: VaultBehaviorContext<T>): void {
    if (ctx.next && typeof ctx.next === 'object' && !isHttpResource<T>(ctx.next)) {
      const { isLoading, error, value, next } = ctx;

      // Update basic flags if provided
      if (next.loading !== undefined) isLoading?.set(next.loading);
      if (next.error !== undefined) error?.set(next.error);

      if (next.value !== undefined) {
        const val = next.value;

        if (Array.isArray(val)) {
          value?.set([...val] as VaultDataType<T>);
        } else if (val && typeof val === 'object') {
          value?.set({ ...val } as VaultDataType<T>);
        } else {
          value?.set(val as VaultDataType<T>);
        }
      }
    }
  }
}

export function withCoreSetBehavior(context: VaultBehaviorFactoryContext): VaultBehavior {
  return new CoreSetBehavior(context.injector);
}
