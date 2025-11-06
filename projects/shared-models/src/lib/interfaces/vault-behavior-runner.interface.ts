import { VaultBehaviorContext } from '@ngvault/shared-models';
import { VaultBehavior } from './vault-behavior.interface';

// eslint-disable-next-line
export interface VaultBehaviorRunner<T = any> {
  getRunLevelId(type: VaultBehavior['type']): string | undefined;

  onInit(
    runLevelId: string,
    vaultKey: string,
    serviceName: string,
    ctx: VaultBehaviorContext<T>,
    behaviors: VaultBehavior<T>[]
  ): void;

  onSet(runLevelId: string, vaultKey: string, ctx: VaultBehaviorContext<T>, behaviors: VaultBehavior<T>[]): void;
}
