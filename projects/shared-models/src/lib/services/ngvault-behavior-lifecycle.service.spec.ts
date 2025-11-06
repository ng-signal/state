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

    coreBehavior.behaviorId = coreId;

    return coreBehavior;
  }

  let vaultRunner: VaultBehaviorRunner;
  let ctx: VaultBehaviorContext<any>;
  const calls: string[] = [];
  let randonUuid: any;
  let injector: any;
  let coreId: string;
  let ids: any = [];

  beforeEach(() => {
    calls.length = 0;
    randonUuid = crypto.randomUUID;
    spyOn(console, 'warn');

    resetTestBehaviorFactoryId();

    ids = ['dev-tools-id', 'events-id', 'core-id', 'state-id', 'persistence-id', 'encryption-id'];
    spyOn(crypto, 'randomUUID').and.callFake(() => ids.shift() as any);

    TestBed.configureTestingModule({
      providers: [NgVaultBehaviorLifecycleService, provideZonelessChangeDetection()]
    });

    injector = TestBed.inject(Injector);

    vaultRunner = NgVaultBehaviorLifecycleService();
    coreId = vaultRunner.initialize();

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

      it('throws an error if a initializeBehaviors is called before initialize', () => {
        vaultRunner = NgVaultBehaviorLifecycleService();

        const parentBehavior = createParenttBehaviorFactory();

        expect(() => vaultRunner.initializeBehaviors(injector, [parentBehavior])).toThrowError(
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
        'onSet:vault1',
        'onSetState:vault1:{"isLoading":false,"value":"initial","error":null,"hasValue":true}',

        'onInit:vault1',

        'onError:vault1',

        'onReset:vault1',

        'onDestroy:vault1',

        'onPatch:vault1',

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
        return {};
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

      vaultRunner = NgVaultBehaviorLifecycleService();
      vaultRunner.initialize();

      vaultRunner.initializeBehaviors(injector, [
        parentBehavior,
        devTools,
        events,
        events,
        state,
        state2,
        persistence,
        encryption
      ]);

      const simpleBehaviorFactory = createTestBehaviorFactory(() => {
        return {
          onSet(key: string) {
            calls.push(`onSet:${key}`);
          }
        };
      }, 'state');

      vaultRunner.initializeBehaviors(injector, [parentBehavior, simpleBehaviorFactory]);
      vaultRunner.onSet('bzkg4lvyuj52bc', 'vault1', ctx);

      expect(calls).toEqual(['onSet:vault1']);
    });

    it('handles no behaviors', () => {
      vaultRunner.initializeBehaviors(injector, []);
      vaultRunner.initializeBehaviors(injector, undefined as any);

      // eslint-disable-next-line
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('handles factory returning non-object gracefully', () => {
      const badBehaviorFactory = createTestBehaviorFactory(() => undefined, 'state');

      vaultRunner.initializeBehaviors(injector, [badBehaviorFactory]);

      // eslint-disable-next-line
      expect(console.warn).toHaveBeenCalledWith(
        '[NgVault] Behavior initialization failed: [NgVault] Behavior did not return an object'
      );
    });

    it('throws an error if a factory does not have a type', () => {
      const badBehaviorFactory = createTestBehaviorFactory(() => undefined, undefined as any);

      expect(() => vaultRunner.initializeBehaviors(injector, [badBehaviorFactory])).toThrowError(
        '[NgVault] Behavior factory missing type metadata.'
      );

      // eslint-disable-next-line
      expect(console.warn).not.toHaveBeenCalled();
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

      // eslint-disable-next-line
      expect(console.warn).toHaveBeenCalledWith('[NgVault] Non-critical behavior initialization failed: boom');
    });

    it('ignores invalid non-function behaviors', () => {
      const invalidBehavior: any = 42;

      expect(() => vaultRunner.initializeBehaviors(injector, [invalidBehavior])).toThrowError(
        '[NgVault] Behavior factory missing type metadata.'
      );

      // eslint-disable-next-line
      expect(console.warn).not.toHaveBeenCalled();
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

      // eslint-disable-next-line
      expect(console.warn).toHaveBeenCalledTimes(2);

      // eslint-disable-next-line
      const call1 = (console.warn as jasmine.Spy).calls.allArgs()[0];
      // eslint-disable-next-line
      const call2 = (console.warn as jasmine.Spy).calls.allArgs()[1];
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

      // eslint-disable-next-line
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('throws an error if a behavior has a bad key', () => {
      const childBehavior = createTestBehaviorFactory(() => ({}), 'state', 'bad-gen');

      expect(() => vaultRunner.initializeBehaviors(injector, [childBehavior])).toThrowError(
        '[NgVault] Behavior missing key for type "state". Every behavior must define a unique "key".'
      );

      // eslint-disable-next-line
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('throws an error if a behavior has a duplicate key', () => {
      const childBehavior = createTestBehaviorFactory(() => ({}), 'state', 'duplicate');
      const childBehaviorDup = createTestBehaviorFactory(() => ({}), 'state', 'duplicate');

      vaultRunner.initializeBehaviors(injector, [childBehavior, childBehaviorDup]);

      // eslint-disable-next-line
      expect(console.warn).toHaveBeenCalledWith(
        '[NgVault] Skipping duplicate behavior with key "NgVault::Testing::Duplicate"'
      );
    });
  });

  describe('initialize', () => {
    beforeEach(() => {
      ids = ['1', '2', 'coreId', '4', '5', '6'];
    });

    it('should get the core id', () => {
      vaultRunner = NgVaultBehaviorLifecycleService();
      const coreId = vaultRunner.initialize();

      expect(coreId).toBe('coreId');
    });

    it('throws an error if the core id is not generated', () => {
      ids = ['1', '2'];
      vaultRunner = NgVaultBehaviorLifecycleService();

      expect(() => vaultRunner.initialize()).toThrowError(
        '[NgVault] Failed to obtain core behavior ID during initialization.'
      );
    });

    it('throws an error if initialized is called twice', () => {
      vaultRunner = NgVaultBehaviorLifecycleService();

      vaultRunner.initialize();

      expect(() => vaultRunner.initialize()).toThrowError(
        '[NgVault] VaultBehaviorRunner already initialized — cannot reissue core behavior ID.'
      );
    });
  });
});
