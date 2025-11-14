import {
  defineNgVaultBehaviorKey,
  NgVaultBehaviorFactory,
  NgVaultBehaviorFactoryContext,
  NgVaultBehaviorTypes,
  NgVaultPersistBehavior
} from '@ngvault/shared';

/**
 * Core sessionStorage persistence behavior.
 * Stores the FINAL state emitted by the orchestrator into sessionStorage.
 */
export class SessionStoragePersistBehavior<T> implements NgVaultPersistBehavior<T> {
  readonly type = NgVaultBehaviorTypes.Persist;
  readonly key = defineNgVaultBehaviorKey('Core', 'SessionStoragePersist');

  private readonly storageKey: string;

  constructor(
    private readonly injector: NgVaultBehaviorFactoryContext['injector'],
    featureCellKey: string
  ) {
    // Namespace for safety: ngvault::{cellKey}
    this.storageKey = `ngvault::${featureCellKey}`;
  }

  persistState(current: T): void {
    try {
      if (current === undefined) {
        // Explicit wipe
        sessionStorage.removeItem(this.storageKey);
        return;
      }

      const serialized = JSON.stringify(current);
      sessionStorage.setItem(this.storageKey, serialized);
    } catch (err) {
      // eslint-disable-next-line
      console.error(`[NgVault] SessionStorage persistence failed for key "${this.storageKey}":`, err);
    }
  }
}

/**
 * Factory wrapper — matches the exact shape of other behaviors
 */
export const withSessionStoragePersistBehavior = ((context: NgVaultBehaviorFactoryContext, featureCellKey: string) => {
  return new SessionStoragePersistBehavior(context.injector, featureCellKey);
}) as unknown as NgVaultBehaviorFactory;

// Metadata matching pattern of all NgVault behaviors
withSessionStoragePersistBehavior.type = NgVaultBehaviorTypes.Persist;
withSessionStoragePersistBehavior.critical = false;
