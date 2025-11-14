import {
  defineNgVaultBehaviorKey,
  NgVaultBehaviorFactory,
  NgVaultBehaviorFactoryContext,
  NgVaultBehaviorTypes,
  ngVaultLog,
  NgVaultPersistBehavior
} from '@ngvault/shared';
import { defineNgVaultPersistKey } from '../../utils/define-ngvault-persist-key.util';

class SessionStoragePersistBehavior<T> implements NgVaultPersistBehavior<T> {
  readonly type = NgVaultBehaviorTypes.Persist;
  readonly key = defineNgVaultBehaviorKey('Core', 'SessionStoragePersist');
  readonly #storageKey: string;

  constructor(
    private readonly injector: NgVaultBehaviorFactoryContext['injector'],
    featureCellKey: string
  ) {
    this.#storageKey = defineNgVaultPersistKey('sessionStorage', featureCellKey);
  }

  persistState(current: T): void {
    try {
      if (current === undefined) {
        // Explicit wipe
        sessionStorage.removeItem(this.#storageKey);
        return;
      }

      const serialized = JSON.stringify(current);
      sessionStorage.setItem(this.#storageKey, serialized);
    } catch (err) {
      ngVaultLog(`[NgVault] SessionStorage persistence failed for key "${this.#storageKey}":`, err);
    }
  }

  clearState(): void {
    try {
      sessionStorage.removeItem(this.#storageKey);
    } catch (err) {
      ngVaultLog(`[NgVault] SessionStorage removeState() failed for key "${this.#storageKey}":`, err);
    }
  }

  loadState(): T | undefined {
    try {
      const raw = sessionStorage.getItem(this.#storageKey);
      if (raw === null) return undefined; // nothing stored

      return JSON.parse(raw) as T;
    } catch (err) {
      ngVaultLog(`[NgVault] SessionStorage load failed for key "${this.#storageKey}":`, err);
      return undefined; // fail safe
    }
  }
}

export const withSessionStoragePersistBehavior = ((context: NgVaultBehaviorFactoryContext) => {
  return new SessionStoragePersistBehavior(context.injector, context.featureCellKey);
}) as unknown as NgVaultBehaviorFactory;

withSessionStoragePersistBehavior.type = NgVaultBehaviorTypes.Persist;
withSessionStoragePersistBehavior.critical = false;
