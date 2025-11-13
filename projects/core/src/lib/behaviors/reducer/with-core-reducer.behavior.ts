import {
  defineNgVaultBehaviorKey,
  NgVaultBehaviorType,
  NgVaultReducerFunction,
  VaultBehaviorFactory,
  VaultBehaviorFactoryContext,
  VaultReducerBehavior
} from '@ngvault/shared';

export class CoreReducerBehavior<T> implements VaultReducerBehavior<T> {
  readonly type = NgVaultBehaviorType.Reduce;
  readonly key = defineNgVaultBehaviorKey('Core', 'Reducer');

  constructor(private readonly injector: VaultBehaviorFactoryContext['injector']) {}

  applyReducer(current: T, reducer: NgVaultReducerFunction<T>): T {
    if (typeof reducer !== 'function') return current;
    return reducer(current);
  }
}

export const withCoreReducerBehavior = ((context: VaultBehaviorFactoryContext) => {
  return new CoreReducerBehavior(context.injector);
}) as unknown as VaultBehaviorFactory;

withCoreReducerBehavior.type = NgVaultBehaviorType.Reduce;
withCoreReducerBehavior.critical = true;
