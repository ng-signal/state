import { ngVaultDebug } from '@ngvault/core/utils/ngvault-logger.util';
import {
  defineNgVaultBehaviorKey,
  NgVaultBehaviorType,
  NgVaultDataType,
  VaultBehavior,
  VaultBehaviorContext,
  VaultBehaviorFactory,
  VaultBehaviorFactoryContext,
  VaultStateBehavior
} from '@ngvault/shared';
import { isHttpResourceRef } from '../../utils/is-http-resource.util';

class CoreStateBehavior<T> implements VaultStateBehavior<T> {
  readonly type = NgVaultBehaviorType.State;
  readonly critical = true;
  readonly key = defineNgVaultBehaviorKey('Core', 'State');

  constructor(private readonly _injector: VaultBehaviorFactoryContext['injector']) {}

  async computeState(ctx: VaultBehaviorContext<T>): Promise<T | undefined> {
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

export const withCoreStateBehavior = ((context: VaultBehaviorFactoryContext): VaultBehavior => {
  return new CoreStateBehavior(context.injector);
}) as VaultBehaviorFactory;

withCoreStateBehavior.type = NgVaultBehaviorType.State;
withCoreStateBehavior.critical = true;
