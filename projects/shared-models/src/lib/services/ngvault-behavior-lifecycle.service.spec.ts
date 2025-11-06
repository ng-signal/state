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
      const simpleBehaviorFactory = createTestBehaviorFactory(() => {
        return {
          onSet(key: string) {
            calls.push(`onSet:${key}`);
          }
        };
      }, 'state');

      vaultRunner.initializeBehaviors(injector, [parentBehavior, simpleBehaviorFactory]);
      vaultRunner.onSet('core-id', 'vault1', ctx);

      expect(calls).toEqual(['onSet:vault1']);
    });
  });

  describe('initializeBehaviors', () => {
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
      vaultRunner.initialize();

      vaultRunner.initializeBehaviors(injector, [
        parentBehavior,
        devTools,
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
      vaultRunner.onSet('c', 'vault1', ctx);

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
