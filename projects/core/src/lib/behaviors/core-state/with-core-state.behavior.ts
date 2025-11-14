import {
  defineNgVaultBehaviorKey,
  NgVaultBehavior,
  NgVaultBehaviorContext,
  NgVaultBehaviorFactory,
  NgVaultBehaviorFactoryContext,
  NgVaultBehaviorTypes,
  NgVaultDataType,
  NgVaultStateBehavior
} from '@ngvault/shared';
import { ngVaultDebug } from '@ngvault/shared/utils/ngvault-logger.util';
import { isHttpResourceRef } from '../../utils/is-http-resource.util';

class CoreStateBehavior<T> implements NgVaultStateBehavior<T> {
  readonly type = NgVaultBehaviorTypes.State;
  readonly critical = true;
  readonly key = defineNgVaultBehaviorKey('Core', 'State');

  constructor(private readonly _injector: NgVaultBehaviorFactoryContext['injector']) {}

  async computeState(ctx: NgVaultBehaviorContext<T>): Promise<T | undefined> {
    ngVaultDebug('core-state');

    const incoming = ctx.incoming;
    if (!incoming || typeof incoming !== 'object' || isHttpResourceRef<T>(incoming)) {
      ngVaultDebug('core-state', 'skipped — not a valid plain state');
      return;
    }

    const { value } = incoming as { value?: NgVaultDataType<T> };
    if (value === undefined) return;

    if (value === null) return null as unknown as T;

    if (Array.isArray(value)) return [...value] as T;
    if (typeof value === 'object') return { ...value } as T;
    return value as T;
  }
}

export const withCoreStateBehavior = ((context: NgVaultBehaviorFactoryContext): NgVaultBehavior => {
  return new CoreStateBehavior(context.injector);
}) as NgVaultBehaviorFactory;

withCoreStateBehavior.type = NgVaultBehaviorTypes.State;
withCoreStateBehavior.critical = true;
