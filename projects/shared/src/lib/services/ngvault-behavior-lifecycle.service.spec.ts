// projects/core/src/lib/services/vault-behavior-lifecycle.service.spec.ts
import { Injector, provideZonelessChangeDetection, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgVaultEventBus } from '@ngvault/dev-tools';
import {
  createCustomTestBehavior,
  createTestEventListener,
  provideVaultTesting,
  resetTestBehaviorFactoryId
} from '@ngvault/testing';
import { NgVaultBehaviorRunner } from '../interfaces/ngvault-behavior-runner.interface';
import { NgVaultBehaviorTypes } from '../types/ngvault-behavior.type';
import { NgVaultBehaviorLifecycleService } from './ngvault-behavior-lifecycle.service';

describe('Service: VaultBehaviorLifecycle', () => {
  function createParenttBehaviorFactory(): any {
    const coreBehavior = createCustomTestBehavior(() => {
      return {};
    }, 'core');

    coreBehavior.behaviorId = 'core-id';

    return coreBehavior;
  }

  let vaultRunner: NgVaultBehaviorRunner;
  let randonUuid: any;
  let injector: any;
  let ids: any = [];
  let warnSpy: any;
  const emitted: any[] = [];
  let stopListening: any;
  let eventBus: any;

  beforeEach(() => {
    warnSpy = spyOn(console, 'warn');
    randonUuid = crypto.randomUUID;

    resetTestBehaviorFactoryId();

    ids = ['dev-tools-id', 'events-id', 'core-id', 'state-id', 'persistence-id', 'encryption-id'];
    spyOn(crypto, 'randomUUID').and.callFake(() => ids.shift() as any);

    TestBed.configureTestingModule({
      providers: [provideVaultTesting(), provideZonelessChangeDetection()]
    });

    injector = TestBed.inject(Injector);
    const vaultService = NgVaultBehaviorLifecycleService('cell key');
    vaultRunner = vaultService;

    eventBus = TestBed.inject(NgVaultEventBus);
    stopListening = createTestEventListener(eventBus, emitted);
  });

  afterEach(() => {
    stopListening();
    crypto.randomUUID = randonUuid;
  });

  describe('initializeBehaviors', () => {
    it('should get id per run level without crypto', async () => {
      const math = [
        0.28, // → starts with 'a'
        0.31, // → 'b'
        0.333, // → 'c' (your fixed third value)
        0.34, // → 'c'
        0.4, // → 'e'
        0.45, // → 'g'
        0.55, // → 'j'
        0.62, // → 'l'
        0.73, // → 'p'
        0.81, // → 'r'
        0.88, // → 'v'
        0.92, // → 'w'
        0.96, // → 'y'
        0.98, // → 'z'
        0.99, // → 'z'
        0.85, // → 't'
        0.79, // → 's'
        0.67 // → 'n'
      ];

      const dates: any = [];
      for (let i = 1; i < 20; i++) {
        dates.push(i * 1000);
      }

      spyOn(Math, 'random').and.callFake(() => math.shift() as any);
      spyOn(Date, 'now').and.callFake(() => dates.shift() as any);
      crypto.randomUUID = undefined as any;

      const parentBehavior = createParenttBehaviorFactory();
      const devTools = createCustomTestBehavior(() => {
        return {};
      }, 'dev-tools');
      const events = createCustomTestBehavior(() => {
        return {};
      }, 'events');
      const state = createCustomTestBehavior(() => {
        return {};
      }, 'state');
      const state2 = createCustomTestBehavior(() => {
        return {};
      }, 'state');
      const persistence = createCustomTestBehavior(() => {
        return {};
      }, NgVaultBehaviorTypes.Persist);
      const encryption = createCustomTestBehavior(() => {
        return {};
      }, 'encrypt');

      runInInjectionContext(injector, () => {
        vaultRunner = NgVaultBehaviorLifecycleService('cell key');
      });

      const behaviors = vaultRunner.initializeBehaviors(injector, [
        parentBehavior,
        devTools,
        events,
        events,
        state,
        state2,
        persistence,
        encryption
      ]);

      expect(behaviors).toEqual([
        Object({ type: 'core' }),
        Object({ type: 'dev-tools' }),
        Object({ type: 'events' }),
        Object({ type: 'events' }),
        Object({ type: 'state' }),
        Object({ type: 'state' }),
        Object({ type: NgVaultBehaviorTypes.Persist }),
        Object({ type: 'encrypt' })
      ]);
      expect(emitted).toEqual([]);
    });

    it('handles empty behaviors', () => {
      vaultRunner.initializeBehaviors(injector, []);

      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('handles undefined behaviors', () => {
      vaultRunner.initializeBehaviors(injector, undefined as any);

      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('handles factory returning non-object gracefully', () => {
      const badBehaviorFactory = createCustomTestBehavior(() => undefined, 'state');

      vaultRunner.initializeBehaviors(injector, [badBehaviorFactory]);

      expect(warnSpy).toHaveBeenCalledWith(
        '[NgVault] Behavior initialization failed: [NgVault] Behavior did not return an object'
      );
    });

    it('throws an error if a factory does not have a type', () => {
      const badBehaviorFactory = createCustomTestBehavior(() => undefined, undefined as any);

      expect(() => vaultRunner.initializeBehaviors(injector, [badBehaviorFactory])).toThrowError(
        '[NgVault] Behavior factory missing type metadata.'
      );

      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('throws an error if a critical factory returns a non-object', () => {
      const badBehaviorFactory = createCustomTestBehavior(() => undefined, 'state', 'key', true);

      expect(() => vaultRunner.initializeBehaviors(injector, [badBehaviorFactory])).toThrowError(
        '[NgVault] Behavior did not return an object'
      );
    });

    it('continues execution when a factory throws', () => {
      const throwingFactory = createCustomTestBehavior(() => {
        throw new Error('boom');
      }, 'state');
      const workingFactory = createCustomTestBehavior(
        () => ({
          onInit() {},
          onDestroy() {}
        }),
        'state'
      );

      vaultRunner.initializeBehaviors(injector, [throwingFactory, workingFactory]);

      expect(warnSpy).toHaveBeenCalledWith('[NgVault] Non-critical behavior initialization failed: boom');
    });

    it('ignores invalid non-function behaviors', () => {
      const invalidBehavior: any = 42;

      expect(() => vaultRunner.initializeBehaviors(injector, [invalidBehavior])).toThrowError(
        '[NgVault] Behavior factory missing type metadata.'
      );

      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('filters null and undefined factories but retains valid ones', () => {
      const nullFactory = createCustomTestBehavior(() => null as any, 'state');
      const undefinedFactory = createCustomTestBehavior(() => undefined as any, 'state');
      const validFactory = createCustomTestBehavior(
        () => ({
          onInit() {},
          onDestroy() {}
        }),
        'state'
      );

      vaultRunner.initializeBehaviors(injector, [nullFactory, undefinedFactory, validFactory]);

      expect(warnSpy).toHaveBeenCalledTimes(2);

      const call1 = (warnSpy as jasmine.Spy).calls.allArgs()[0];
      const call2 = (warnSpy as jasmine.Spy).calls.allArgs()[1];
      expect(call1).toEqual(['[NgVault] Behavior initialization failed: [NgVault] Behavior did not return an object']);
      expect(call2).toEqual(['[NgVault] Behavior initialization failed: [NgVault] Behavior did not return an object']);
    });

    it('throws an error if a critical factory returns a non-object', () => {
      const nullFactory = createCustomTestBehavior(() => null as any, 'state');
      const undefinedFactory = createCustomTestBehavior(() => undefined as any, 'state', 'key', true);
      const validFactory = createCustomTestBehavior(
        () => ({
          onInit() {},
          onDestroy() {}
        }),
        'state'
      );

      expect(() =>
        vaultRunner.initializeBehaviors(injector, [nullFactory, undefinedFactory, validFactory])
      ).toThrowError('[NgVault] Behavior did not return an object');
    });

    it('throws an error if a behavior has no key', () => {
      const childBehavior = createCustomTestBehavior(() => ({}), 'state', 'no-gen');

      expect(() => vaultRunner.initializeBehaviors(injector, [childBehavior])).toThrowError(
        '[NgVault] Behavior missing key for type "state". Every behavior must define a unique "key".'
      );

      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('throws an error if a behavior has a bad key', () => {
      const childBehavior = createCustomTestBehavior(() => ({}), 'state', 'bad-gen');

      expect(() => vaultRunner.initializeBehaviors(injector, [childBehavior])).toThrowError(
        '[NgVault] Behavior key "bad-gen" not valid format for "state" behavior.'
      );

      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('throws an error if a behavior has a duplicate key', () => {
      const childBehavior = createCustomTestBehavior(() => ({}), 'state', 'duplicate');
      const childBehaviorDup = createCustomTestBehavior(() => ({}), 'state', 'duplicate');

      vaultRunner.initializeBehaviors(injector, [childBehavior, childBehaviorDup]);

      expect(warnSpy).toHaveBeenCalledWith(
        '[NgVault] Skipping duplicate behavior with key "NgVault::Testing::Duplicate"'
      );
    });
  });

  describe('initialize', () => {
    it('should get the core id', () => {
      const parentBehavior = createParenttBehaviorFactory();
      const coreId = vaultRunner.initializeBehaviors(injector, [parentBehavior]);

      expect(coreId).toEqual([Object({ type: 'core' })]);
    });

    it('should get the core id', () => {
      const coreId = vaultRunner.initializeBehaviors(injector, []);

      expect(coreId).toEqual([]);
    });

    it('throws an error if initialized is called twice', () => {
      const parentBehavior = createParenttBehaviorFactory();
      vaultRunner.initializeBehaviors(injector, [parentBehavior]);

      expect(() => vaultRunner.initializeBehaviors(injector, [parentBehavior])).toThrowError(
        '[NgVault] VaultBehaviorRunner already initialized — cannot reissue core behavior ID.'
      );
    });
  });

  describe('applyBehaviorExtensions', () => {
    let mockCell: any;

    beforeEach(() => {
      mockCell = {
        setState: () => {},
        patchState: () => {},
        reset: () => {},
        destroy: () => {},
        state: {},
        destroyed$: {},
        key: 'mock-key',
        ctx: 'mock-ctx'
      };

      runInInjectionContext(injector, () => {
        vaultRunner = NgVaultBehaviorLifecycleService('cell key');
      });
    });

    it('should return if the new method is not a function', () => {
      const extendBehavior = createCustomTestBehavior(
        () => ({
          extendCellAPI: () => ({
            customMethod: 'noop'
          })
        }),
        'state'
      );

      vaultRunner.initializeBehaviors(injector, [extendBehavior]);

      vaultRunner.applyBehaviorExtensions(mockCell);

      expect(typeof mockCell.customMethod).toBe('function');
      expect(mockCell.customMethod()).toBeUndefined();
    });

    it('should attach new methods from extendCellAPI to the FeatureCell', () => {
      const extendBehavior = createCustomTestBehavior(
        () => ({
          extendCellAPI: () => ({
            customMethod: (ctx: any, ...args: any) => `no-key:${ctx}:${args.toString()}`
          })
        }),
        'state'
      );

      vaultRunner.initializeBehaviors(injector, [extendBehavior]);

      vaultRunner.applyBehaviorExtensions(mockCell);

      expect(typeof mockCell.customMethod).toBe('function');
      expect(mockCell.customMethod('arg1', 'arg2')).toBe('no-key:mock-ctx:arg1,arg2');
      expect(mockCell.customMethod()).toBe('no-key:mock-ctx:');
    });

    it('should throw if a behavior tries to overwrite a protected key', () => {
      const dangerousBehavior = createCustomTestBehavior(
        () => ({
          key: 'NgVault::Testing::Overwrite',
          extendCellAPI: () => ({
            reset: () => {}
          })
        }),
        'state'
      );

      vaultRunner.initializeBehaviors(injector, [dangerousBehavior]);

      expect(() => vaultRunner.applyBehaviorExtensions(mockCell)).toThrowError(
        '[NgVault] Behavior "NgVault::Testing::Id0" attempted to overwrite core FeatureCell method "reset".'
      );
    });

    it('should warn and skip redefining an existing method', () => {
      const redefineBehavior = createCustomTestBehavior(
        () => ({
          key: 'NgVault::Testing::Redefine',
          extendCellAPI: () => ({
            setState: () => {}
          })
        }),
        'state'
      );

      vaultRunner.initializeBehaviors(injector, [redefineBehavior]);

      expect(() => vaultRunner.applyBehaviorExtensions(mockCell)).toThrowError(
        '[NgVault] Behavior "NgVault::Testing::Id0" attempted to overwrite core FeatureCell method "setState".'
      );
    });

    it('should skip if extendCellAPI returns null or non-object', () => {
      const noOpBehavior = createCustomTestBehavior(
        () => ({
          key: 'NgVault::Testing::NoOp',
          extendCellAPI: () => null
        }),
        'state'
      );

      vaultRunner.initializeBehaviors(injector, [noOpBehavior]);

      // should not throw or modify
      expect(() => vaultRunner.applyBehaviorExtensions(mockCell)).not.toThrow();
      expect(Object.keys(mockCell)).not.toContain('customMethod');
    });

    it('should define new methods as non-enumerable and read-only', () => {
      const defineBehavior = createCustomTestBehavior(
        () => ({
          extendCellAPI: () => ({
            extra: () => 'immutable'
          })
        }),
        'state'
      );

      vaultRunner.initializeBehaviors(injector, [defineBehavior]);
      vaultRunner.applyBehaviorExtensions(mockCell);

      const descriptor = Object.getOwnPropertyDescriptor(mockCell, 'extra')!;
      expect(descriptor.enumerable).toBeFalse();
      expect(descriptor.writable).toBeFalse();
      expect(descriptor.configurable).toBeTrue();
    });

    it('should throw when a behavior attempts to redefine an existing FeatureCell method without allowOverride', () => {
      const mockCell = {
        existingCustom: jasmine.createSpy('existingCustom').and.returnValue('original')
      } as any;

      const redefineBehavior = createCustomTestBehavior(
        () => ({
          key: 'NgVault::Testing::Redefine',
          extendCellAPI: () => ({
            existingCustom: () => 'new'
          })
        }),
        'state'
      );

      vaultRunner.initializeBehaviors(injector, [redefineBehavior]);

      // Expect an explicit error instead of a warning
      expect(() => vaultRunner.applyBehaviorExtensions(mockCell)).toThrowError(
        '[NgVault] Behavior "NgVault::Testing::Id0" attempted to redefine method "existingCustom" already provided by another behavior.'
      );

      // Original method remains intact
      expect(mockCell.existingCustom()).toBe('original');
    });

    it('should catch and log errors thrown inside behavior extension methods', () => {
      // Mock behavior that throws when called
      const throwingBehavior = createCustomTestBehavior(
        () => ({
          extendCellAPI: () => ({
            boomMethod: () => {
              throw new Error('Boom!');
            }
          })
        }),
        'state'
      );

      // Initialize with our single throwing behavior
      vaultRunner.initializeBehaviors(injector, [throwingBehavior]);

      // Mock cell that has key + ctx (like a real FeatureCell)
      const mockCell: any = { key: 'feature-key', ctx: { id: 'mock-ctx' } };

      // Apply extensions
      vaultRunner.applyBehaviorExtensions(mockCell);

      // Verify method was attached
      expect(typeof mockCell.boomMethod).toBe('function');

      // Expect thrown error is logged and rethrown
      expect(() => mockCell.boomMethod()).toThrowError('Boom!');
    });

    it('should throw when multiple behaviors define the same method name without allowOverride', () => {
      // Behavior A adds two custom methods
      const behaviorA = createCustomTestBehavior(
        () => ({
          extendCellAPI: () => ({
            methodA: (key: string) => `A:${key}`,
            shared: (key: string) => `shared-from-A:${key}`
          })
        }),
        'state'
      );

      // Behavior B tries to redefine `shared` without allowOverride
      const behaviorB = createCustomTestBehavior(
        () => ({
          extendCellAPI: () => ({
            methodB: (key: string) => `B:${key}`,
            shared: (key: string) => `shared-from-B:${key}`
          })
        }),
        'state'
      );

      vaultRunner.initializeBehaviors(injector, [behaviorA, behaviorB]);

      const mockCell: any = { key: 'cell-key', ctx: { id: 'mock-ctx' } };

      expect(() => vaultRunner.applyBehaviorExtensions(mockCell)).toThrowError(
        `[NgVault] Behavior "NgVault::Testing::Id1" attempted to redefine method "shared" already provided by another behavior.`
      );
    });

    it('should throw if a behavior tries to overwrite a protected FeatureCell method', () => {
      // Behavior attempts to overwrite a protected method ("reset")
      const protectedBehavior = createCustomTestBehavior(
        () => ({
          extendCellAPI: () => ({
            reset: () => 'hacked'
          })
        }),
        'state'
      );

      vaultRunner.initializeBehaviors(injector, [protectedBehavior]);

      const mockCell: any = {
        key: 'cell-key',
        ctx: { id: 'mock-ctx' },
        reset: () => 'original-reset'
      };

      // Expect the applyBehaviorExtensions call to throw
      expect(() => vaultRunner.applyBehaviorExtensions(mockCell)).toThrowError(
        `[NgVault] Behavior "NgVault::Testing::Id0" attempted to overwrite core FeatureCell method "reset".`
      );

      // Ensure original method remains intact
      expect(mockCell.reset()).toBe('original-reset');
    });

    it('should handle behaviors with no or empty extensions gracefully', () => {
      const noExtensionBehavior = createCustomTestBehavior(
        () => ({
          extendCellAPI: () => undefined
        }),
        'state'
      );

      const emptyExtensionBehavior = createCustomTestBehavior(
        () => ({
          extendCellAPI: () => ({})
        }),
        'state'
      );

      vaultRunner.initializeBehaviors(injector, [noExtensionBehavior, emptyExtensionBehavior]);

      const mockCell: any = { key: 'cell-key', ctx: { id: 'mock-ctx' } };

      expect(() => vaultRunner.applyBehaviorExtensions(mockCell)).not.toThrow();

      // No new properties should be added
      expect(Object.keys(mockCell)).toEqual(['key', 'ctx']);

      // No warnings or errors
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('should compose multiple behavior extensions that access ctx and key', () => {
      const behaviorA = createCustomTestBehavior(
        () => ({
          extendCellAPI: () => ({
            logKey: (ctx: any) => `A:${ctx.id}`
          })
        }),
        'state'
      );

      const behaviorB = createCustomTestBehavior(
        () => ({
          extendCellAPI: () => ({
            logValue: (ctx: any, val: string) => `B:${ctx.id}:${val}`
          })
        }),
        'state'
      );

      vaultRunner.initializeBehaviors(injector, [behaviorA, behaviorB]);

      const mockCell: any = {
        key: 'NgVault::Feature::TestCell',
        ctx: { id: 'ctx-123', value: 42 }
      };

      // Apply all behavior extensions
      vaultRunner.applyBehaviorExtensions(mockCell);

      // Verify both new methods exist
      expect(typeof mockCell.logKey).toBe('function');
      expect(typeof mockCell.logValue).toBe('function');

      // Ensure they received the correct injected args automatically
      expect(mockCell.logKey()).toBe('A:ctx-123');
      expect(mockCell.logValue('foo')).toBe('B:ctx-123:foo');

      // Ensure both methods are non-enumerable (hidden API surface)
      const keys = Object.keys(mockCell);
      expect(keys).not.toContain('logKey');
      expect(keys).not.toContain('logValue');
    });

    it('should throw if two behaviors define the same method name without allowOverride', () => {
      const behaviorA = createCustomTestBehavior(
        () => ({
          extendCellAPI: () => ({
            shared: () => 'A'
          })
        }),
        'state'
      );

      const behaviorB = createCustomTestBehavior(
        () => ({
          extendCellAPI: () => ({
            shared: () => 'B'
          })
        }),
        'state'
      );

      vaultRunner.initializeBehaviors(injector, [behaviorA, behaviorB]);

      const mockCell: any = { key: 'cell-key', ctx: {} };

      expect(() => vaultRunner.applyBehaviorExtensions(mockCell)).toThrowError(
        `[NgVault] Behavior "NgVault::Testing::Id1" attempted to redefine method "shared" already provided by another behavior.`
      );
    });

    it('should allow overriding when allowOverride explicitly includes the method name', () => {
      const behaviorA = createCustomTestBehavior(
        () => ({
          extendCellAPI: () => ({
            shared: () => 'A'
          })
        }),
        'state'
      );

      const behaviorB = createCustomTestBehavior(
        () => ({
          extendCellAPI: () => ({
            shared: () => 'B'
          }),
          allowOverride: ['shared']
        }),
        'state'
      );

      vaultRunner.initializeBehaviors(injector, [behaviorA, behaviorB]);

      const mockCell: any = { key: 'cell-key', ctx: {} };

      vaultRunner.applyBehaviorExtensions(mockCell);

      // allowed override
      expect(mockCell.shared()).toBe('B');
    });
  });
});
