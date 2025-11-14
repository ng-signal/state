import {
  defineNgVaultBehaviorKey,
  NgVaultBehaviorFactory,
  NgVaultBehaviorFactoryContext,
  NgVaultBehaviorType,
  NgVaultReduceBehavior,
  NgVaultReducerFunction
} from '@ngvault/shared';

class CoreReducerBehavior<T> implements NgVaultReduceBehavior<T> {
  readonly critical = true;
  readonly type = NgVaultBehaviorType.Reduce;
  readonly key = defineNgVaultBehaviorKey('Core', 'Reducer');

  constructor(private readonly injector: NgVaultBehaviorFactoryContext['injector']) {}

  applyReducer(current: T, reducer: NgVaultReducerFunction<T>): T {
    if (typeof reducer !== 'function') return current;
    return reducer(current);
  }
}

export const withCoreReducerBehavior = ((context: NgVaultBehaviorFactoryContext) => {
  return new CoreReducerBehavior(context.injector);
}) as unknown as NgVaultBehaviorFactory;

withCoreReducerBehavior.type = NgVaultBehaviorType.Reduce;
withCoreReducerBehavior.critical = true;
