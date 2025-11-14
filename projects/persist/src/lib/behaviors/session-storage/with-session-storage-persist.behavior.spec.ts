import { Injector, provideZonelessChangeDetection, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgVaultBehaviorFactoryContext, NgVaultBehaviorTypes } from '@ngvault/shared';
import { provideVaultTesting } from '@ngvault/testing';
import { defineNgVaultPersistKey } from '../../utils/define-ngvault-persist-key.util';
import { withSessionStoragePersistBehavior } from './with-session-storage-persist.behavior';

describe('Behavior: Session Storage Persist Behavior', () => {
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
      expect(behavior.critical).toBeUndefined();
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
      (sessionStorage.setItem as jasmine.Spy).and.callFake(() => {
        throw new Error('Storage full');
      });

      expect(() => behavior.persistState({ ok: true })).not.toThrow();
    });
  });

  describe('clearState', () => {
    it('should clear storage key on clearState()', () => {
      behavior.clearState();

      const expectedKey = defineNgVaultPersistKey('sessionStorage', 'userCell');
      expect(sessionStorage.removeItem).toHaveBeenCalledTimes(1);
      expect(sessionStorage.removeItem).toHaveBeenCalledWith(expectedKey);
    });

    it('should catch and swallow errors during clearState()', () => {
      // force an exception
      sessionStorage.removeItem = () => {
        throw new Error('storage permission denied');
      };
      spyOn(sessionStorage, 'removeItem').and.callThrough();

      expect(() => behavior.clearState()).not.toThrow();
    });
  });

  describe('loadState', () => {
    it('should return undefined when no state exists', () => {
      sessionStorage.getItem = jasmine.createSpy().and.returnValue(null);

      const result = behavior.loadState();

      expect(sessionStorage.getItem).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });

    it('should load and parse stored JSON into an object', () => {
      const stored = { id: 1, name: 'Ada' };
      sessionStorage.getItem = jasmine.createSpy().and.returnValue(JSON.stringify(stored));

      const result = behavior.loadState();

      expect(sessionStorage.getItem).toHaveBeenCalledTimes(1);
      expect(result).toEqual(stored);
    });

    it('should load primitives correctly', () => {
      sessionStorage.getItem = jasmine.createSpy().and.returnValue('123');

      const result = behavior.loadState();

      expect(result).toBe(123);
    });

    it('should load null explicitly', () => {
      sessionStorage.getItem = jasmine.createSpy().and.returnValue('null');

      const result = behavior.loadState();

      expect(result).toBeNull();
    });

    it('should catch JSON.parse errors and return undefined', () => {
      sessionStorage.getItem = jasmine.createSpy().and.returnValue('{ bad json');

      const result = behavior.loadState();

      expect(result).toBeUndefined();
    });

    it('should catch sessionStorage.getItem errors and NOT throw', () => {
      sessionStorage.getItem = jasmine.createSpy().and.throwError('access denied');

      expect(() => behavior.loadState()).not.toThrow();
      const result = behavior.loadState();
      expect(result).toBeUndefined();
    });
  });
});
