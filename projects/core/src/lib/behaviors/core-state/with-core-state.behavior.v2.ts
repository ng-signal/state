import {
  defineNgVaultBehaviorKey,
  VaultBehavior,
  VaultBehaviorContext,
  VaultBehaviorFactory,
  VaultBehaviorFactoryContext,
  VaultDataType,
  VaultStateBehavior
} from '@ngvault/shared';
import { isHttpResourceRef } from '../../utils/is-http-resource.util';
import { ngVaultDebug } from '../../utils/ngvault-logger.util';

export class CoreStateBehaviorV2<T> implements VaultStateBehavior<T> {
  readonly type = 'state';
  readonly critical = true;
  readonly key = defineNgVaultBehaviorKey('Core', 'StateV2');

  constructor(private readonly _injector: VaultBehaviorFactoryContext['injector']) {}

  async computeState(ctx: VaultBehaviorContext<T>): Promise<T | undefined> {
    ngVaultDebug('core-state');

    const incoming = ctx.incoming;
    if (!incoming || typeof incoming !== 'object' || isHttpResourceRef<T>(incoming)) {
      ngVaultDebug('core-state', 'skipped — not a valid plain state');
      return;
    }

    const { value } = incoming as { value?: VaultDataType<T> };
    if (value === undefined) return;

    if (value === null) return null as unknown as T;

    if (Array.isArray(value)) return [...value] as T;
    if (typeof value === 'object') return { ...value } as T;
    return value as T;
  }
}

export const withCoreStateBehaviorV2 = ((context: VaultBehaviorFactoryContext): VaultBehavior => {
  return new CoreStateBehaviorV2(context.injector);
}) as VaultBehaviorFactory;

withCoreStateBehaviorV2.type = 'state';
withCoreStateBehaviorV2.critical = true;
