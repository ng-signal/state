// projects/core/src/lib/services/vault-behavior-lifecycle.service.spec.ts
import { Injector, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VaultBehaviorContext, VaultBehaviorRunner } from '@ngvault/shared-models';
import { NgVaultBehaviorLifecycleService } from './ngvault-behavior-lifecycle.service';

describe('VaultBehaviorLifecycleService', () => {
  function createTestBehaviorFactory(factory: (...args: any[]) => any, type?: string, critical: boolean = false): any {
    const wrappedFactory = (context: any) => {
      const behavior = factory(context);

      if (!behavior || typeof behavior !== 'object') {
        return behavior; // Let the runner handle the error path
      }

      const behaviorId = context.behaviorId;

      Object.defineProperty(behavior, 'behaviorId', {
        value: behaviorId,
        enumerable: false,
        writable: true
      });

      if (type) {
        Object.defineProperty(behavior, 'type', {
          value: type,
          enumerable: true,
          writable: true
        });
      }

      return behavior;
    };

    (wrappedFactory as any).type = type;
    (wrappedFactory as any).critical = critical;

    return wrappedFactory as any;
  }

  function createParenttBehaviorFactory(): any {
    return createTestBehaviorFactory(() => {
      return {
        onInit(key: string) {
          calls.push(`parentOnInit:${key}`);
        }
      };
    }, 'state');
  }

  let vaultRunner: VaultBehaviorRunner;
  let ctx: VaultBehaviorContext<any>;
  const calls: string[] = [];
  let randonUuid: any;
  let injector: any;

  beforeEach(() => {
    calls.length = 0;
    randonUuid = crypto.randomUUID;
    spyOn(console, 'warn');

    TestBed.configureTestingModule({
      providers: [NgVaultBehaviorLifecycleService, provideZonelessChangeDetection()]
    });

    injector = TestBed.inject(Injector);

    vaultRunner = NgVaultBehaviorLifecycleService();
    vaultRunner.initialize();

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
      vaultRunner = NgVaultBehaviorLifecycleService();
      const coreId = vaultRunner.initialize();
      const parentBehavior = createParenttBehaviorFactory();
      const childBehavior = createTestBehaviorFactory(() => {
        return {
          onInit(key: string) {
            calls.push(`onInit:${key}`);
          }
        };
      }, 'state');

      const providers = vaultRunner.initializeBehaviors(injector, [parentBehavior, childBehavior]);
      const provider = providers[0] as any;
      provider.behaviorId = coreId;
      provider.type = 'core';

      vaultRunner.onInit(provider.behaviorId, 'vault1', 'service-name', ctx, providers);

      expect(calls).toEqual(['parentOnInit:vault1', 'onInit:vault1']);
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

      const providers = vaultRunner.initializeBehaviors(injector, [parentBehavior, childBehavior]);
      const provider = providers.shift() || ({} as any);
      vaultRunner.onInit(provider.behaviorId, 'vault1', 'service-name', ctx, providers);

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

        const providers = vaultRunner.initializeBehaviors(injector, [parentBehavior, childBehavior]);
        vaultRunner.onInit('22', 'vault1', 'service-name', ctx, providers);

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

        const providers = vaultRunner.initializeBehaviors(injector, [parentBehavior, childBehavior]);
        vaultRunner.onInit(undefined as any, 'vault1', 'service-name', ctx, providers);

        expect(calls).toEqual([]);
      });
    });

    it('should call onInit on all behavior types in deterministic order', () => {
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

      const randomBehaviors = [
        parentBehavior,
        encryptionBehavior,
        unknownBehavior,
        stateBehavior,
        devToolsBehavior,
        persistenceBehavior,
        eventBehavior
      ];

      const providers = vaultRunner.initializeBehaviors(injector, randomBehaviors);
      const provider = providers[0] as any;

      vaultRunner.onInit(provider.behaviorId, 'vault1', 'service-name', ctx, providers);

      expect(calls).toEqual([
        'dev-tools', // Priority 0
        'events', // Priority 1
        'parentOnInit:vault1', // Priority 2
        'state', // Priority 2
        'persistence', // Priority 3
        'encryption' // Priority 4
      ]);
    });

    it('should handle behaviors without onInit gracefully', () => {
      const parentBehavior = createParenttBehaviorFactory();
      const behaviorWithoutOnInit = createTestBehaviorFactory(() => {}, 'state');

      const providers = vaultRunner.initializeBehaviors(injector, [parentBehavior, behaviorWithoutOnInit]);
      const provider = providers[0] as any;

      vaultRunner.onInit(provider.behaviorId, 'vault1', 'service-name', ctx, providers);

      expect(calls).toEqual(['parentOnInit:vault1']);
    });

    it('should do nothing when behaviors array is empty', () => {
      const parentBehavior = createParenttBehaviorFactory();

      const providers = vaultRunner.initializeBehaviors(injector, [parentBehavior]);
      const provider = providers[0] as any;

      vaultRunner.onInit(provider.behaviorId, 'vault1', 'service-name', ctx, []);

      expect(calls).toEqual([]);
    });

    it('should do nothing when behaviors is null or undefined', () => {
      const parentBehavior = createParenttBehaviorFactory();

      const providers = vaultRunner.initializeBehaviors(injector, [parentBehavior]);
      const provider = providers[0] as any;

      vaultRunner.onInit(provider.behaviorId, 'vault1', 'service-name', ctx, null as any);
      vaultRunner.onInit(provider.behaviorId, 'vault1', 'service-name', ctx, undefined as any);

      expect(calls).toEqual([]);
    });

    it('throws an error if a lifecycle hook is called before initialize', () => {
      vaultRunner = NgVaultBehaviorLifecycleService();

      //const parentBehavior = createParenttBehaviorFactory();

      // const providers = vaultRunner.initializeBehaviors(injector, [parentBehavior]);
      // const provider = providers[0] as any;

      expect(() => vaultRunner.onInit('22', 'vault1', 'service-name', ctx, [])).toThrowError(
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

  describe('All Other life cycles', () => {
    it('should call onSet on a single behavior', () => {
      const parentBehavior = createParenttBehaviorFactory();
      const simpleBehaviorFactory = createTestBehaviorFactory(() => {
        return {
          onSet(key: string) {
            calls.push(`onSet:${key}`);
          }
        };
      }, 'state');

      const providers = vaultRunner.initializeBehaviors(injector, [parentBehavior, simpleBehaviorFactory]);
      const provider = providers[0] as any;

      vaultRunner.onSet(provider.behaviorId, 'vault1', ctx, providers);

      expect(calls).toEqual(['onSet:vault1']);

      calls.length = 0;

      vaultRunner.onSet(provider.behaviorId, 'vault1', ctx, []);

      expect(calls).toEqual([]);
    });
  });

  describe('initializeBehaviors', () => {
    it('should get id per run level with crypto', () => {
      const ids = ['1', '2', '3', '4', '5', '6'];
      spyOn(crypto, 'randomUUID').and.callFake(() => ids.shift() as any);

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
      const coreId = vaultRunner.initialize();

      const providers = vaultRunner.initializeBehaviors(injector, [
        parentBehavior,
        devTools,
        events,
        state,
        state2,
        persistence,
        encryption
      ]);

      (providers[0] as any).behaviorId = coreId;
      (providers[0] as any).type = 'core';

      expect(providers[0].behaviorId).toBe('3');
      expect(providers[1].behaviorId).toBe('1');
      expect(providers[2].behaviorId).toBe('2');
      expect(providers[3].behaviorId).toBe('4');
      expect(providers[4].behaviorId).toBe('4');
      expect(providers[5].behaviorId).toBe('5');
      expect(providers[6].behaviorId).toBe('6');
      expect(providers[7]).toBeUndefined();
    });

    it('should get id per run level without crypto', () => {
      const math = ['1', '2', '3', '4', '5', '6'];
      const dates = ['a', 'b', 'c', 'd', 'e', 'f'];
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
      const coreId = vaultRunner.initialize();

      const providers = vaultRunner.initializeBehaviors(injector, [
        parentBehavior,
        devTools,
        events,
        state,
        state2,
        persistence,
        encryption
      ]);

      (providers[0] as any).behaviorId = coreId;
      (providers[0] as any).type = 'core';

      expect(providers[0].behaviorId).toBe('c');
      expect(providers[1].behaviorId).toBe('a');
      expect(providers[2].behaviorId).toBe('b');
      expect(providers[3].behaviorId).toBe('d');
      expect(providers[4].behaviorId).toBe('d');
      expect(providers[5].behaviorId).toBe('e');
      expect(providers[6].behaviorId).toBe('f');
      expect(providers[7]).toBeUndefined();
    });

    it('handles no behaviors', () => {
      expect(vaultRunner.initializeBehaviors(injector, [])).toEqual([]);
      expect(vaultRunner.initializeBehaviors(injector, undefined as any)).toEqual([]);

      // eslint-disable-next-line
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('creates valid behaviors from factory functions', () => {
      const callOrder: string[] = [];

      // A real, minimal behavior implementation
      const simpleBehaviorFactory = createTestBehaviorFactory(() => {
        callOrder.push('factory-called');
        return {
          onInit(key: string) {
            callOrder.push(`onInit:${key}`);
          },
          onSet(key: string) {
            callOrder.push(`onSet:${key}`);
          }
        };
      }, 'state');

      const providers = vaultRunner.initializeBehaviors(injector, [simpleBehaviorFactory]);
      const provider = providers.pop() as any;

      provider?.onInit?.('key');
      provider?.onSet?.('key');

      expect(callOrder).toEqual(['factory-called', 'onInit:key', 'onSet:key']);
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
      const badBehaviorFactory = createTestBehaviorFactory(() => undefined, 'state', true);

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
      const undefinedFactory = createTestBehaviorFactory(() => undefined as any, 'state', true);
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
  });

  describe('initialize', () => {
    let ids: any = [];
    beforeEach(() => {
      ids = ['1', '2', 'coreId', '4', '5', '6'];
      spyOn(crypto, 'randomUUID').and.callFake(() => ids.shift() as any);
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
