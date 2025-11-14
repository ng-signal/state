import {
  defineNgVaultBehaviorKey,
  NgVaultBehaviorFactory,
  NgVaultBehaviorFactoryContext,
  NgVaultBehaviorTypes,
  ngVaultLog,
  NgVaultPersistBehavior
} from '@ngvault/shared';
import { defineNgVaultPersistKey } from '../../utils/define-ngvault-persist-key.util';

class LocalStoragePersistBehavior<T> implements NgVaultPersistBehavior<T> {
  readonly type = NgVaultBehaviorTypes.Persist;
  readonly key = defineNgVaultBehaviorKey('Core', 'LocalStoragePersist');
  readonly critical = true;
  readonly #storageKey: string;

  constructor(
    private readonly injector: NgVaultBehaviorFactoryContext['injector'],
    featureCellKey: string
  ) {
    this.#storageKey = defineNgVaultPersistKey('localStorage', featureCellKey);
  }

  persistState(current: T): void {
    try {
      if (current === undefined) {
        localStorage.removeItem(this.#storageKey);
        return;
      }

      const serialized = JSON.stringify(current);
      localStorage.setItem(this.#storageKey, serialized);
    } catch (err) {
      ngVaultLog(`[NgVault] LocalStorage persistence failed for key "${this.#storageKey}":`, err);
    }
  }

  clearState(): void {
    try {
      localStorage.removeItem(this.#storageKey);
    } catch (err) {
      ngVaultLog(`[NgVault] LocalStorage removeState() failed for key "${this.#storageKey}":`, err);
    }
  }

  loadState(): T | undefined {
    try {
      const raw = localStorage.getItem(this.#storageKey);
      if (raw === null) return undefined; // nothing stored

      return JSON.parse(raw) as T;
    } catch (err) {
      ngVaultLog(`[NgVault] LocalStorage load failed for key "${this.#storageKey}":`, err);
      return undefined; // fail safe
    }
  }
}

export const withLocalStoragePersistBehavior = ((context: NgVaultBehaviorFactoryContext) => {
  return new LocalStoragePersistBehavior(context.injector, context.featureCellKey);
}) as unknown as NgVaultBehaviorFactory;

withLocalStoragePersistBehavior.type = NgVaultBehaviorTypes.Persist;
withLocalStoragePersistBehavior.critical = false;
