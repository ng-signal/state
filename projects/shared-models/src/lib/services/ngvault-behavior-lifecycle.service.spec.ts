// projects/core/src/lib/services/vault-behavior-lifecycle.service.spec.ts
import { Injector, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  createTestBehaviorFactory,
  getTestBehavior,
  resetTestBehaviorFactoryId,
  withTestBehavior
} from '@ngvault/testing';
import { VaultBehaviorContext } from '../contexts/vault-behavior.context';
import { VaultBehaviorRunner } from '../interfaces/vault-behavior-runner.interface';
import { NgVaultBehaviorLifecycleService } from './ngvault-behavior-lifecycle.service';

describe('VaultBehaviorLifecycleService', () => {
  function createParenttBehaviorFactory(): any {
    const coreBehavior = createTestBehaviorFactory(() => {
      return {
        onInit(key: string) {
          calls.push(`parentOnInit:${key}`);
        }
      };
    }, 'core');

    coreBehavior.behaviorId = 'core-id';

    return coreBehavior;
  }

  let vaultRunner: VaultBehaviorRunner;
  let ctx: VaultBehaviorContext<any>;
  const calls: string[] = [];
  let randonUuid: any;
  let injector: any;
  let ids: any = [];
  let warnSpy: any;

  beforeEach(() => {
    warnSpy = spyOn(console, 'warn');
    calls.length = 0;
    randonUuid = crypto.randomUUID;

    resetTestBehaviorFactoryId();

    ids = ['dev-tools-id', 'events-id', 'core-id', 'state-id', 'persistence-id', 'encryption-id'];
    spyOn(crypto, 'randomUUID').and.callFake(() => ids.shift() as any);

    TestBed.configureTestingModule({
      providers: [NgVaultBehaviorLifecycleService, provideZonelessChangeDetection()]
    });

    injector = TestBed.inject(Injector);

    vaultRunner = NgVaultBehaviorLifecycleService();

    // minimal fake context
    ctx = {
      state: {
        isLoading: false,
        value: 'initial',
        error: null,
        hasValue: true
      }
    } as any;
  });

  afterEach(() => {
    crypto.randomUUID = randonUuid;
  });

  describe('onInit', () => {
    it('should call onInit on the non-core behavior', () => {
      const parentBehavior = createParenttBehaviorFactory();
      const childBehavior = createTestBehaviorFactory(() => {
        return {
          onInit(key: string) {
            calls.push(`onInit:${key}`);
          }
        };
      }, 'state');

      vaultRunner.initializeBehaviors(injector, [parentBehavior, childBehavior]);

      vaultRunner.onInit('core-id', 'vault1', 'service-name', ctx);

      expect(calls).toEqual(['onInit:vault1']);
    });

    it('should call onInit on a single behavior', () => {
      const parentBehavior = createParenttBehaviorFactory();
      const childBehavior = createTestBehaviorFactory(() => {
        return {
          onInit(key: string) {
            calls.push(`onInit:${key}`);
          }
        };
      }, 'state');

      vaultRunner.initializeBehaviors(injector, [parentBehavior, childBehavior]);
      vaultRunner.onInit('core-id', 'vault1', 'service-name', ctx);

      expect(calls).toEqual(['onInit:vault1']);
    });

    describe('invalid ids', () => {
      it('should not call onInit with a not equal id', () => {
        const parentBehavior = createParenttBehaviorFactory();
        const childBehavior = createTestBehaviorFactory(() => {
          return {
            onInit(key: string) {
              calls.push(`onInit:${key}`);
            }
          };
        }, 'state');

        vaultRunner.initializeBehaviors(injector, [parentBehavior, childBehavior]);
        vaultRunner.onInit('22', 'vault1', 'service-name', ctx);

        expect(calls).toEqual([]);
      });

      it('should not call onInit with a not defined caller id', () => {
        const parentBehavior = createParenttBehaviorFactory();
        const childBehavior = createTestBehaviorFactory(() => {
          return {
            onInit(key: string) {
              calls.push(`onInit:${key}`);
            }
          };
        }, 'state');

        vaultRunner.initializeBehaviors(injector, [parentBehavior, childBehavior]);
        vaultRunner.onInit('undefined', 'vault1', 'service-name', ctx);

        expect(calls).toEqual([]);
      });
    });

    describe('N+1 Lifescycle runs', () => {
      let randomBehaviors: any = [];

      beforeEach(() => {
        const parentBehavior = createParenttBehaviorFactory();

        const devToolsBehavior = createTestBehaviorFactory(() => {
          return {
            onInit: () => calls.push('dev-tools')
          };
        }, 'dev-tools');

        const eventBehavior = createTestBehaviorFactory(() => {
          return {
            onInit: () => {
              calls.push('events');
            }
          };
        }, 'events');

        const stateBehavior = createTestBehaviorFactory(() => {
          return {
            onInit: () => calls.push('state')
          };
        }, 'state');

        const persistenceBehavior = createTestBehaviorFactory(() => {
          return {
            onInit: () => calls.push('persistence')
          };
        }, 'persistence');

        const encryptionBehavior = createTestBehaviorFactory(() => {
          return {
            onInit: () => calls.push('encryption')
          };
        }, 'encryption');

        const unknownBehavior = createTestBehaviorFactory(() => {
          return {
            onInit: () => {
              calls.push('unknown');
            }
          };
        }, 'unknown');

        randomBehaviors = [
          parentBehavior,
          parentBehavior,
          encryptionBehavior,
          encryptionBehavior,
          unknownBehavior,
          unknownBehavior,
          stateBehavior,
          stateBehavior,
          devToolsBehavior,
          devToolsBehavior,
          persistenceBehavior,
          persistenceBehavior,
          eventBehavior,
          eventBehavior
        ];
      });

      it('should call onInit on all behavior types in deterministic order from core', () => {
        vaultRunner.initializeBehaviors(injector, randomBehaviors);
        vaultRunner.onInit('core-id', 'vault1', 'service-name', ctx);
        expect(calls).toEqual(['dev-tools', 'dev-tools', 'events', 'events', 'state', 'state']);
      });

      it('should call onInit on all behavior types in deterministic order from state', () => {
        vaultRunner.initializeBehaviors(injector, randomBehaviors);
        vaultRunner.onInit('state-id', 'vault1', 'service-name', ctx);
        expect(calls).toEqual(['dev-tools', 'dev-tools', 'events', 'events', 'persistence', 'persistence']);
      });

      it('should call onInit on all behavior types in deterministic order from persistence', () => {
        vaultRunner.initializeBehaviors(injector, randomBehaviors);
        vaultRunner.onInit('persistence-id', 'vault1', 'service-name', ctx);
        expect(calls).toEqual(['dev-tools', 'dev-tools', 'events', 'events', 'encryption', 'encryption']);
      });

      it('should call onInit on all behavior types in deterministic order from encryption', () => {
        vaultRunner.initializeBehaviors(injector, randomBehaviors);
        vaultRunner.onInit('encryption-id', 'vault1', 'service-name', ctx);
        expect(calls).toEqual(['dev-tools', 'dev-tools', 'events', 'events']);
      });
    });

    describe('No runs', () => {
      it('should call onInit on a single behavior', () => {
        const parentBehavior = createParenttBehaviorFactory();
        const childBehavior = createTestBehaviorFactory(() => {
          return {
            onInit(key: string) {
              calls.push(`onInit:${key}`);
            }
          };
        }, 'state');

        vaultRunner.initializeBehaviors(injector, [parentBehavior, childBehavior]);
        vaultRunner.onInit('core-id', 'vault1', 'service-name', ctx);

        expect(calls).toEqual(['onInit:vault1']);
      });

      it('should handle behaviors without onInit gracefully', () => {
        const parentBehavior = createParenttBehaviorFactory();
        const behaviorWithoutOnInit = createTestBehaviorFactory(() => {}, 'state');

        vaultRunner.initializeBehaviors(injector, [parentBehavior, behaviorWithoutOnInit]);
        vaultRunner.onInit('core-id', 'vault1', 'service-name', ctx);

        expect(calls).toEqual([]);
      });

      it('throws an error if a lifecycle hook is called before initialize', () => {
        vaultRunner = NgVaultBehaviorLifecycleService();

        expect(() => vaultRunner.onInit('22', 'vault1', 'service-name', ctx)).toThrowError(
          '[NgVault] VaultBehaviorRunner has not been initialized. Call initialize() before invoking lifecycle methods.'
        );
      });
    });
  });

  describe('All Other life cycles', () => {
    it('should call onSet on a single behavior', () => {
      const parentBehavior = createParenttBehaviorFactory();

      vaultRunner.initializeBehaviors(injector, [parentBehavior, withTestBehavior]);
      vaultRunner.onSet('core-id', 'vault1', ctx);
      vaultRunner.onInit('core-id', 'vault1', 'service-name', ctx);
      vaultRunner.onError('core-id', 'vault1', ctx);
      vaultRunner.onReset('core-id', 'vault1', ctx);
      vaultRunner.onDestroy('core-id', 'vault1', ctx);
      vaultRunner.onPatch('core-id', 'vault1', ctx);
      vaultRunner.onLoad('core-id', 'vault1', ctx);
      vaultRunner.onDispose('core-id', 'vault1', ctx);

      expect(getTestBehavior().getEvents()).toEqual([
        'onSet:vault1:{"isLoading":false,"value":"initial","error":null,"hasValue":true}',

        'onInit:vault1',

        'onError:vault1',

        'onReset:vault1',

        'onDestroy:vault1',

        'onPatch:vault1:{"isLoading":false,"value":"initial","error":null,"hasValue":true}',

        'onLoad:vault1',

        'onDispose:vault1'
      ]);
    });
  });

  describe('initializeBehaviors', () => {
    it('should get id per run level without crypto', () => {
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

      const dates = [1000, 2000, 3000, 4000, 5000, 6000];

      spyOn(Math, 'random').and.callFake(() => math.shift() as any);
      spyOn(Date, 'now').and.callFake(() => dates.shift() as any);
      crypto.randomUUID = undefined as any;

      const parentBehavior = createParenttBehaviorFactory();
      const devTools = createTestBehaviorFactory(() => {
        return {
          onSet(key: string) {
            calls.push(`onSet:${key}`);
          }
        };
      }, 'dev-tools');
      const events = createTestBehaviorFactory(() => {
        return {};
      }, 'events');
      const state = createTestBehaviorFactory(() => {
        return {};
      }, 'state');
      const state2 = createTestBehaviorFactory(() => {
        return {};
      }, 'state');
      const persistence = createTestBehaviorFactory(() => {
        return {};
      }, 'persistence');
      const encryption = createTestBehaviorFactory(() => {
        return {};
      }, 'encryption');

      vaultRunner = NgVaultBehaviorLifecycleService();

      const coreId = vaultRunner.initializeBehaviors(injector, [
        parentBehavior,
        devTools,
        events,
        events,
        state,
        state2,
        persistence,
        encryption
      ]);

      vaultRunner.onSet(coreId!, 'vault1', ctx);

      vaultRunner.onSet('missing', 'vault1', ctx);

      expect(calls).toEqual(['onSet:vault1']);
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
      const badBehaviorFactory = createTestBehaviorFactory(() => undefined, 'state');

      vaultRunner.initializeBehaviors(injector, [badBehaviorFactory]);

      expect(warnSpy).toHaveBeenCalledWith(
        '[NgVault] Behavior initialization failed: [NgVault] Behavior did not return an object'
      );
    });

    it('throws an error if a factory does not have a type', () => {
      const badBehaviorFactory = createTestBehaviorFactory(() => undefined, undefined as any);

      expect(() => vaultRunner.initializeBehaviors(injector, [badBehaviorFactory])).toThrowError(
        '[NgVault] Behavior factory missing type metadata.'
      );

      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('throws an error if a critical factory returns a non-object', () => {
      const badBehaviorFactory = createTestBehaviorFactory(() => undefined, 'state', 'key', true);

      expect(() => vaultRunner.initializeBehaviors(injector, [badBehaviorFactory])).toThrowError(
        '[NgVault] Behavior did not return an object'
      );
    });

    it('continues execution when a factory throws', () => {
      const throwingFactory = createTestBehaviorFactory(() => {
        throw new Error('boom');
      }, 'state');
      const workingFactory = createTestBehaviorFactory(
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
      const nullFactory = createTestBehaviorFactory(() => null as any, 'state');
      const undefinedFactory = createTestBehaviorFactory(() => undefined as any, 'state');
      const validFactory = createTestBehaviorFactory(
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
      const nullFactory = createTestBehaviorFactory(() => null as any, 'state');
      const undefinedFactory = createTestBehaviorFactory(() => undefined as any, 'state', 'key', true);
      const validFactory = createTestBehaviorFactory(
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
      const childBehavior = createTestBehaviorFactory(() => ({}), 'state', 'no-gen');

      expect(() => vaultRunner.initializeBehaviors(injector, [childBehavior])).toThrowError(
        '[NgVault] Behavior missing key for type "state". Every behavior must define a unique "key".'
      );

      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('throws an error if a behavior has a bad key', () => {
      const childBehavior = createTestBehaviorFactory(() => ({}), 'state', 'bad-gen');

      expect(() => vaultRunner.initializeBehaviors(injector, [childBehavior])).toThrowError(
        '[NgVault] Behavior missing key for type "state". Every behavior must define a unique "key".'
      );

      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('throws an error if a behavior has a duplicate key', () => {
      const childBehavior = createTestBehaviorFactory(() => ({}), 'state', 'duplicate');
      const childBehaviorDup = createTestBehaviorFactory(() => ({}), 'state', 'duplicate');

      vaultRunner.initializeBehaviors(injector, [childBehavior, childBehaviorDup]);

      expect(warnSpy).toHaveBeenCalledWith(
        '[NgVault] Skipping duplicate behavior with key "NgVault::Testing::Duplicate"'
      );
    });
  });

  describe('initialize', () => {
    beforeEach(() => {
      ids = ['1', '2', 'core-id', '4', '5', '6'];
    });

    it('should get the core id', () => {
      const parentBehavior = createParenttBehaviorFactory();
      const coreId = vaultRunner.initializeBehaviors(injector, [parentBehavior]);

      expect(coreId).toBe('core-id');
    });

    it('should get the core id', () => {
      const coreId = vaultRunner.initializeBehaviors(injector, []);

      expect(coreId).toBe('core-id');
    });

    it('throws an error if the core id is not generated', () => {
      ids = ['1', '2'];
      const parentBehavior = createParenttBehaviorFactory();

      expect(() => vaultRunner.initializeBehaviors(injector, [parentBehavior])).toThrowError(
        '[NgVault] Failed to obtain core behavior ID during initialization.'
      );
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

      vaultRunner = NgVaultBehaviorLifecycleService();
    });

    it('should attach new methods from extendCellAPI to the FeatureCell', () => {
      const extendBehavior = createTestBehaviorFactory(
        () => ({
          extendCellAPI: () => ({
            customMethod: (key: string, ctx: any, ...args: any) => `${key}:${ctx}:${args.toString()}`
          })
        }),
        'state'
      );

      vaultRunner.initializeBehaviors(injector, [extendBehavior]);

      vaultRunner.applyBehaviorExtensions(mockCell);

      expect(typeof mockCell.customMethod).toBe('function');
      expect(mockCell.customMethod('arg1', 'arg2')).toBe('mock-key:mock-ctx:arg1,arg2');
      expect(mockCell.customMethod()).toBe('mock-key:mock-ctx:');
    });

    it('should throw if a behavior tries to overwrite a protected key', () => {
      const dangerousBehavior = createTestBehaviorFactory(
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
      const redefineBehavior = createTestBehaviorFactory(
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
      const noOpBehavior = createTestBehaviorFactory(
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
      const defineBehavior = createTestBehaviorFactory(
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

      const redefineBehavior = createTestBehaviorFactory(
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
      const consoleSpy = spyOn(console, 'error');

      // Mock behavior that throws when called
      const throwingBehavior = createTestBehaviorFactory(
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

      expect(consoleSpy).toHaveBeenCalledWith(
        `[NgVault] Behavior extension "boomMethod" threw an error:`,
        jasmine.any(Error)
      );
    });

    it('should throw when multiple behaviors define the same method name without allowOverride', () => {
      // Behavior A adds two custom methods
      const behaviorA = createTestBehaviorFactory(
        () => ({
          extendCellAPI: () => ({
            methodA: (key: string) => `A:${key}`,
            shared: (key: string) => `shared-from-A:${key}`
          })
        }),
        'state'
      );

      // Behavior B tries to redefine `shared` without allowOverride
      const behaviorB = createTestBehaviorFactory(
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
      const protectedBehavior = createTestBehaviorFactory(
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
      const noExtensionBehavior = createTestBehaviorFactory(
        () => ({
          extendCellAPI: () => undefined
        }),
        'state'
      );

      const emptyExtensionBehavior = createTestBehaviorFactory(
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
      const behaviorA = createTestBehaviorFactory(
        () => ({
          extendCellAPI: () => ({
            logKey: (key: string, ctx: any) => `A:${key}:${ctx.id}`
          })
        }),
        'state'
      );

      const behaviorB = createTestBehaviorFactory(
        () => ({
          extendCellAPI: () => ({
            logValue: (key: string, ctx: any, val: string) => `B:${key}:${ctx.id}:${val}`
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
      expect(mockCell.logKey()).toBe('A:NgVault::Feature::TestCell:ctx-123');
      expect(mockCell.logValue('foo')).toBe('B:NgVault::Feature::TestCell:ctx-123:foo');

      // Ensure both methods are non-enumerable (hidden API surface)
      const keys = Object.keys(mockCell);
      expect(keys).not.toContain('logKey');
      expect(keys).not.toContain('logValue');
    });

    it('should throw if two behaviors define the same method name without allowOverride', () => {
      const behaviorA = createTestBehaviorFactory(
        () => ({
          extendCellAPI: () => ({
            shared: () => 'A'
          })
        }),
        'state'
      );

      const behaviorB = createTestBehaviorFactory(
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
      const behaviorA = createTestBehaviorFactory(
        () => ({
          extendCellAPI: () => ({
            shared: () => 'A'
          })
        }),
        'state'
      );

      const behaviorB = createTestBehaviorFactory(
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
