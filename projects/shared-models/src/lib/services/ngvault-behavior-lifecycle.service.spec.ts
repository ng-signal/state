// projects/core/src/lib/services/vault-behavior-lifecycle.service.spec.ts
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VaultBehavior, VaultBehaviorContext, VaultBehaviorRunner } from '@ngvault/shared-models';
import { NgVaultBehaviorLifecycleService } from './ngvault-behavior-lifecycle.service';

describe('VaultBehaviorLifecycleService', () => {
  let service: VaultBehaviorRunner;
  let ctx: VaultBehaviorContext<any>;
  const calls: string[] = [];
  let randonUuid: any;
  let devToolsId: string;

  beforeEach(() => {
    calls.length = 0;
    randonUuid = crypto.randomUUID;

    TestBed.configureTestingModule({
      providers: [NgVaultBehaviorLifecycleService, provideZonelessChangeDetection()]
    });

    service = NgVaultBehaviorLifecycleService();
    devToolsId = service.getRunLevelId('dev-tools') || '';

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
    it('should call onInit on a single behavior', () => {
      const behavior: VaultBehavior = {
        type: 'dev-tools',
        runLevelId: devToolsId,
        onInit: (key, serviceName, ctx) => {
          calls.push(`${key}:${serviceName}:${ctx.state.value}`);
        }
      };

      service.onInit(devToolsId!, 'vault1', 'TestService', ctx, [behavior]);

      expect(calls).toEqual(['vault1:TestService:initial']);
    });

    describe('invalid ids', () => {
      it('should not call onInit with a not equal id', () => {
        const behavior: VaultBehavior = {
          type: 'dev-tools',
          runLevelId: devToolsId,
          onInit: (key, serviceName, ctx) => {
            calls.push(`${key}:${serviceName}:${ctx.state.value}`);
          }
        };

        service.onInit('22', 'vault1', 'TestService', ctx, [behavior]);

        expect(calls).toEqual([]);
      });

      it('should not call onInit with a not defined behavior id', () => {
        const behavior: VaultBehavior = {
          type: 'dev-tools',
          onInit: (key, serviceName, ctx) => {
            calls.push(`${key}:${serviceName}:${ctx.state.value}`);
          }
        };

        service.onInit('22', 'vault1', 'TestService', ctx, [behavior]);

        expect(calls).toEqual([]);
      });

      it('should not call onInit with a not defined caller id', () => {
        const behavior: VaultBehavior = {
          type: 'dev-tools',
          runLevelId: '22',
          onInit: (key, serviceName, ctx) => {
            calls.push(`${key}:${serviceName}:${ctx.state.value}`);
          }
        };

        service.onInit(undefined as any, 'vault1', 'TestService', ctx, [behavior]);

        expect(calls).toEqual([]);
      });
    });

    it('should not call onInit when a behavior does not have a type', () => {
      const behavior: VaultBehavior = {
        runLevelId: devToolsId,
        onInit: (key, serviceName, ctx) => {
          calls.push(`${key}:${serviceName}:${ctx.state.value}`);
        }
      };

      service.onInit(devToolsId, 'vault1', 'TestService', ctx, [behavior]);

      expect(calls).toEqual([]);
    });

    it('should call onInit on all behavior types in deterministic order', () => {
      const devToolsBehavior: VaultBehavior = {
        runLevelId: devToolsId,
        type: 'dev-tools',
        onInit: () => calls.push('dev-tools')
      };

      const eventBehavior: VaultBehavior = {
        type: 'events',
        onInit: () => calls.push('events')
      };

      const stateBehavior: VaultBehavior = {
        type: 'state',
        onInit: () => calls.push('state')
      };

      const persistenceBehavior: VaultBehavior = {
        type: 'persistence',
        onInit: () => calls.push('persistence')
      };

      const encryptionBehavior: VaultBehavior = {
        type: 'encryption',
        onInit: () => calls.push('encryption')
      };

      // 🔀 Randomized input order (simulates non-deterministic registration)
      const randomBehaviors = [encryptionBehavior, stateBehavior, devToolsBehavior, persistenceBehavior, eventBehavior];

      service.onInit(devToolsId, 'vault-test', 'LifecycleService', ctx, randomBehaviors);

      // ✅ Expect deterministic output regardless of input order
      expect(calls).toEqual([
        'dev-tools', // Priority 0
        'events', // Priority 1
        'state', // Priority 2
        'persistence', // Priority 3
        'encryption' // Priority 4
      ]);
    });

    it('should get id per run level with crypto', () => {
      const ids = ['1', '2', '3', '4', '5'];
      spyOn(crypto, 'randomUUID').and.callFake(() => ids.shift() as any);

      service = NgVaultBehaviorLifecycleService();

      expect(service.getRunLevelId('dev-tools')).toBe('1');
      expect(service.getRunLevelId('events')).toBe('2');
      expect(service.getRunLevelId('state')).toBe('3');
      expect(service.getRunLevelId('persistence')).toBe('4');
      expect(service.getRunLevelId('encryption')).toBe('5');
    });

    it('should get id per run level without crypto', () => {
      const math = ['1', '2', '3', '4', '5'];
      const dates = ['1', '2', '3', '4', '5'];
      spyOn(Math, 'random').and.callFake(() => math.shift() as any);
      spyOn(Date, 'now').and.callFake(() => dates.pop() as any);
      crypto.randomUUID = undefined as any;

      service = NgVaultBehaviorLifecycleService();

      expect(service.getRunLevelId('dev-tools')).toBe('5');
      expect(service.getRunLevelId('events')).toBe('4');
      expect(service.getRunLevelId('state')).toBe('3');
      expect(service.getRunLevelId('persistence')).toBe('2');
      expect(service.getRunLevelId('encryption')).toBe('1');
    });

    it('should handle behaviors without onInit gracefully', () => {
      const behaviorWithoutOnInit: VaultBehavior = {};
      expect(() => service.onInit(devToolsId, 'vault3', 'NoInitService', ctx, [behaviorWithoutOnInit])).not.toThrow();
    });

    it('should do nothing when behaviors array is empty', () => {
      service.onInit(devToolsId, 'vault4', 'EmptyService', ctx, []);
      expect(calls.length).toBe(0);
    });

    it('should do nothing when behaviors is null or undefined', () => {
      service.onInit(devToolsId, 'vault5', 'NullService', ctx, null as any);
      service.onInit(devToolsId, 'vault6', 'UndefinedService', ctx, undefined as any);
      expect(calls.length).toBe(0);
    });
  });

  describe('All Other life cycles', () => {
    it('should call onSet on a single behavior', () => {
      const behavior: VaultBehavior = {
        type: 'dev-tools',
        runLevelId: devToolsId,
        onSet: (key, ctx) => {
          calls.push(`${key}:${ctx.state.value}`);
        }
      };

      service.onSet(devToolsId, 'vault1', ctx, [behavior]);

      expect(calls).toEqual(['vault1:initial']);
    });
  });
});
