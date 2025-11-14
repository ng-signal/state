import { Injector, provideZonelessChangeDetection, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgVaultBehaviorFactoryContext, NgVaultBehaviorTypes } from '@ngvault/shared';
import { provideVaultTesting } from '@ngvault/testing';
import { defineNgVaultPersistKey } from '../../utils/define-ngvault-persist-key.util';
import { withSessionStoragePersistBehavior } from './with-session-storage-persist.behavior';

describe('SessionStoragePersistBehavior', () => {
  let behavior: any;
  let context: NgVaultBehaviorFactoryContext;
  let injector: any;

  beforeEach(() => {
    spyOn(sessionStorage, 'setItem');
    spyOn(sessionStorage, 'removeItem');

    TestBed.configureTestingModule({
      providers: [provideVaultTesting(), provideZonelessChangeDetection()]
    });

    injector = TestBed.inject(Injector);

    context = {
      injector: {} as any,
      type: NgVaultBehaviorTypes.Persist,
      featureCellKey: 'userCell'
    };

    runInInjectionContext(injector, () => {
      behavior = withSessionStoragePersistBehavior(context);
    });
  });

  describe('peristState', () => {
    it('should have default properties', () => {
      expect(behavior.critical).toBeTrue();
      expect(behavior.type).toBe('persist');
      expect(behavior.key).toBe('NgVault::Core::SessionStoragePersist');
    });

    it('should persist a serializable object to sessionStorage', () => {
      const state = { id: 1, name: 'Ada' };

      behavior.persistState(state);

      const expectedKey = defineNgVaultPersistKey('sessionStorage', 'userCell');
      expect(sessionStorage.setItem).toHaveBeenCalledOnceWith(expectedKey, JSON.stringify(state));
      expect(sessionStorage.removeItem).not.toHaveBeenCalled();
    });

    it('should remove the item when state is undefined', () => {
      behavior.persistState(undefined);

      const expectedKey = defineNgVaultPersistKey('sessionStorage', 'userCell');
      expect(sessionStorage.removeItem).toHaveBeenCalledOnceWith(expectedKey);
      expect(sessionStorage.setItem).not.toHaveBeenCalled();
    });

    it('should persist primitives', () => {
      behavior.persistState(123 as any);

      const expectedKey = defineNgVaultPersistKey('sessionStorage', 'userCell');
      expect(sessionStorage.setItem).toHaveBeenCalledOnceWith(expectedKey, '123');
    });

    it('should persist null explicitly', () => {
      behavior.persistState(null as any);

      const expectedKey = defineNgVaultPersistKey('sessionStorage', 'userCell');
      expect(sessionStorage.setItem).toHaveBeenCalledOnceWith(expectedKey, 'null');
    });

    it('should catch JSON stringify errors and NOT throw', () => {
      const circular: any = {};
      circular.self = circular;

      expect(() => behavior.persistState(circular)).not.toThrow();

      expect(sessionStorage.setItem).not.toHaveBeenCalled();
      expect(sessionStorage.removeItem).not.toHaveBeenCalled();
    });

    it('should catch sessionStorage.setItem errors and NOT throw', () => {
      sessionStorage.setItem = () => undefined;
      spyOn(sessionStorage, 'setItem').and.throwError('Storage full');

      expect(() => behavior.persistState({ ok: true })).not.toThrow();
    });
  });

  describe('removeState', () => {
    it('should remove storage key on removeState()', () => {
      runInInjectionContext(injector, () => {
        behavior.removeState();
      });

      const expectedKey = defineNgVaultPersistKey('sessionStorage', 'userCell');
      expect(sessionStorage.removeItem).toHaveBeenCalledTimes(1);
      expect(sessionStorage.removeItem).toHaveBeenCalledWith(expectedKey);
    });

    it('should catch and swallow errors during removeState()', () => {
      // force an exception
      sessionStorage.removeItem = () => {
        throw new Error('storage permission denied');
      };
      spyOn(sessionStorage, 'removeItem').and.callThrough();

      expect(() => behavior.removeState()).not.toThrow();
    });
  });
});
