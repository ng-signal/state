import { Injector, provideZonelessChangeDetection, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgVaultEventBus } from '@ngvault/dev-tools';
import { NgVaultBehaviorTypes, NgVaultFeatureCell } from '@ngvault/shared';
import {
  createTestBehavior,
  createTestEventListener,
  flushMicrotasksZoneless,
  provideVaultTesting
} from '@ngvault/testing';
import { provideFeatureCell } from './provide-feature-cell';

describe('Provider: Feature Cell (core vault functionality)', () => {
  let providers: any[];
  let injector: any;

  const emitted: any[] = [];
  const called: any[] = [];
  let stopListening: any;
  let eventBus: any;

  beforeEach(() => {
    called.length = 0;
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideVaultTesting()]
    });

    injector = TestBed.inject(Injector);

    runInInjectionContext(injector, () => {
      providers = provideFeatureCell(
        class TestService {
          behaviorKey = 'behavior-id';
        },
        { key: 'http', initial: [] }
      );
    });

    eventBus = TestBed.inject(NgVaultEventBus);
    stopListening = createTestEventListener(eventBus, emitted);
  });

  afterEach(() => {
    stopListening();
  });

  describe('replaceState', () => {
    it('should reset state with undefined', async () => {
      const persistBehavior = createTestBehavior(NgVaultBehaviorTypes.Persist, called);
      runInInjectionContext(injector, () => {
        providers = provideFeatureCell(
          class DummyService {},
          { key: 'reset-test', initial: null, insights: { wantsState: true } as any },
          [persistBehavior]
        );
      });
      const provider = providers.find((p: any) => typeof p.useFactory === 'function');
      let vault!: NgVaultFeatureCell<any>;

      runInInjectionContext(injector, () => {
        vault = (provider as any).useFactory();
        vault.initialize();
      });
      await flushMicrotasksZoneless();

      vault.replaceState({ loading: true, error: { message: 'fail' }, value: [1, 2, 3] });
      expect(vault.state.isLoading()).toBeTrue();
      expect(vault.state.error()).toEqual({ message: 'fail' });
      expect(vault.state.value()).toBeUndefined();
      expect(vault.state.hasValue()).toBeFalse();

      await flushMicrotasksZoneless();
      expect(vault.state.isLoading()).toBeTrue();
      expect(vault.state.error()).toEqual({ message: 'fail' });
      expect(vault.state.value()).toEqual([1, 2, 3]);
      expect(vault.state.hasValue()).toBeTrue();

      vault.replaceState(undefined);
      await flushMicrotasksZoneless();

      expect(vault.state.isLoading()).toBeFalse();
      expect(vault.state.error()).toBeNull();
      expect(vault.state.value()).toBeUndefined();
      expect(vault.state.hasValue()).toBeFalse();

      expect(called).toEqual(['load', 'persist']);
      expect(emitted).toEqual([
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'core',
          type: 'lifecycle:start:initialized',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::Test::Persist',
          type: 'stage:start:loadpersist',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::Test::Persist',
          type: 'stage:end:loadpersist',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'core',
          type: 'lifecycle:end:initialized',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'vault-orchestrator',
          type: 'lifecycle:start:replace',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::Core::State',
          type: 'stage:start:state',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::Core::State',
          type: 'stage:end:state',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::CoreHttpResource::State',
          type: 'stage:start:state',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::CoreHttpResource::State',
          type: 'stage:end:state',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::Test::Persist',
          type: 'stage:start:persist',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::Test::Persist',
          type: 'stage:end:persist',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'vault-orchestrator',
          type: 'lifecycle:end:replace',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'core',
          type: 'lifecycle:start:clearvalue',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: [1, 2, 3], error: Object({ message: 'fail' }), hasValue: true })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'core',
          type: 'lifecycle:end:clearvalue',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        })
      ]);
    });

    it('should reset state with null', async () => {
      const persistBehavior = createTestBehavior(NgVaultBehaviorTypes.Persist, called);
      runInInjectionContext(injector, () => {
        providers = provideFeatureCell(
          class DummyService {},
          { key: 'reset-test', initial: null, insights: { wantsState: true } as any },
          [persistBehavior]
        );
      });
      const provider = providers.find((p: any) => typeof p.useFactory === 'function');
      let vault!: NgVaultFeatureCell<any>;

      runInInjectionContext(injector, () => {
        vault = (provider as any).useFactory();
        vault.initialize();
      });
      await flushMicrotasksZoneless();

      vault.replaceState({ loading: true, error: { message: 'fail' }, value: [1, 2, 3] });
      expect(vault.state.isLoading()).toBeTrue();
      expect(vault.state.error()).toEqual({ message: 'fail' });
      expect(vault.state.value()).toBeUndefined();
      expect(vault.state.hasValue()).toBeFalse();

      await flushMicrotasksZoneless();
      expect(vault.state.isLoading()).toBeTrue();
      expect(vault.state.error()).toEqual({ message: 'fail' });
      expect(vault.state.value()).toEqual([1, 2, 3]);
      expect(vault.state.hasValue()).toBeTrue();

      vault.replaceState(null);
      await flushMicrotasksZoneless();
      expect(vault.state.isLoading()).toBeFalse();
      expect(vault.state.error()).toBeNull();
      expect(vault.state.value()).toBeUndefined();
      expect(vault.state.hasValue()).toBeFalse();

      expect(called).toEqual(['load', 'persist']);
      expect(emitted).toEqual([
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'core',
          type: 'lifecycle:start:initialized',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::Test::Persist',
          type: 'stage:start:loadpersist',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::Test::Persist',
          type: 'stage:end:loadpersist',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'core',
          type: 'lifecycle:end:initialized',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'vault-orchestrator',
          type: 'lifecycle:start:replace',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::Core::State',
          type: 'stage:start:state',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::Core::State',
          type: 'stage:end:state',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::CoreHttpResource::State',
          type: 'stage:start:state',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::CoreHttpResource::State',
          type: 'stage:end:state',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::Test::Persist',
          type: 'stage:start:persist',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::Test::Persist',
          type: 'stage:end:persist',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'vault-orchestrator',
          type: 'lifecycle:end:replace',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'core',
          type: 'lifecycle:start:clearvalue',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: [1, 2, 3], error: Object({ message: 'fail' }), hasValue: true })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'core',
          type: 'lifecycle:end:clearvalue',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        })
      ]);
    });

    it('should reset state with reset', async () => {
      const persistBehavior = createTestBehavior(NgVaultBehaviorTypes.Persist, called);
      runInInjectionContext(injector, () => {
        providers = provideFeatureCell(
          class DummyService {},
          { key: 'reset-test', initial: null, insights: { wantsState: true } as any },
          [persistBehavior]
        );
      });
      const provider = providers.find((p: any) => typeof p.useFactory === 'function');
      let vault!: NgVaultFeatureCell<any>;

      runInInjectionContext(injector, () => {
        vault = (provider as any).useFactory();
        vault.initialize();
      });
      await flushMicrotasksZoneless();

      vault.replaceState({ loading: true, error: { message: 'fail' }, value: [1, 2, 3] });
      expect(vault.state.isLoading()).toBeTrue();
      expect(vault.state.error()).toEqual({ message: 'fail' });
      expect(vault.state.value()).toBeUndefined();
      expect(vault.state.hasValue()).toBeFalse();

      await flushMicrotasksZoneless();
      expect(vault.state.isLoading()).toBeTrue();
      expect(vault.state.error()).toEqual({ message: 'fail' });
      expect(vault.state.value()).toEqual([1, 2, 3]);
      expect(vault.state.hasValue()).toBeTrue();

      vault.reset();
      await flushMicrotasksZoneless();

      expect(vault.state.isLoading()).toBeFalse();
      expect(vault.state.error()).toBeNull();
      expect(vault.state.value()).toBeUndefined([]);
      expect(vault.state.hasValue()).toBeFalse();

      expect(called).toEqual(['load', 'persist', 'clear']);
      expect(emitted).toEqual([
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'core',
          type: 'lifecycle:start:initialized',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::Test::Persist',
          type: 'stage:start:loadpersist',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::Test::Persist',
          type: 'stage:end:loadpersist',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'core',
          type: 'lifecycle:end:initialized',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'vault-orchestrator',
          type: 'lifecycle:start:replace',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::Core::State',
          type: 'stage:start:state',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::Core::State',
          type: 'stage:end:state',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::CoreHttpResource::State',
          type: 'stage:start:state',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::CoreHttpResource::State',
          type: 'stage:end:state',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::Test::Persist',
          type: 'stage:start:persist',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::Test::Persist',
          type: 'stage:end:persist',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'vault-orchestrator',
          type: 'lifecycle:end:replace',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'core',
          type: 'lifecycle:start:reset',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: [1, 2, 3], error: Object({ message: 'fail' }), hasValue: true })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::Test::Persist',
          type: 'stage:start:clearpersist',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::Test::Persist',
          type: 'stage:end:clearpersist',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'core',
          type: 'lifecycle:end:reset',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        })
      ]);
    });
  });

  describe('mergeState', () => {
    it('should reset state with undefined', async () => {
      const persistBehavior = createTestBehavior(NgVaultBehaviorTypes.Persist, called);
      runInInjectionContext(injector, () => {
        providers = provideFeatureCell(
          class DummyService {},
          { key: 'reset-test', initial: null, insights: { wantsState: true } as any },
          [persistBehavior]
        );
      });
      const provider = providers.find((p: any) => typeof p.useFactory === 'function');
      let vault!: NgVaultFeatureCell<any>;

      runInInjectionContext(injector, () => {
        vault = (provider as any).useFactory();
        vault.initialize();
      });
      await flushMicrotasksZoneless();

      vault.mergeState({ loading: true, error: { message: 'fail' }, value: [1, 2, 3] });
      expect(vault.state.isLoading()).toBeTrue();
      expect(vault.state.error()).toEqual({ message: 'fail' });
      expect(vault.state.value()).toBeUndefined();
      expect(vault.state.hasValue()).toBeFalse();

      await flushMicrotasksZoneless();
      expect(vault.state.isLoading()).toBeTrue();
      expect(vault.state.error()).toEqual({ message: 'fail' });
      expect(vault.state.value()).toEqual([1, 2, 3]);
      expect(vault.state.hasValue()).toBeTrue();

      vault.mergeState(undefined);
      await flushMicrotasksZoneless();

      expect(vault.state.isLoading()).toBeFalse();
      expect(vault.state.error()).toBeNull();
      expect(vault.state.value()).toBeUndefined();
      expect(vault.state.hasValue()).toBeFalse();

      expect(called).toEqual(['load', 'persist']);
      expect(emitted).toEqual([
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'core',
          type: 'lifecycle:start:initialized',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::Test::Persist',
          type: 'stage:start:loadpersist',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::Test::Persist',
          type: 'stage:end:loadpersist',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'core',
          type: 'lifecycle:end:initialized',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'vault-orchestrator',
          type: 'lifecycle:start:merge',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::Core::State',
          type: 'stage:start:state',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::Core::State',
          type: 'stage:end:state',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::CoreHttpResource::State',
          type: 'stage:start:state',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::CoreHttpResource::State',
          type: 'stage:end:state',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::Test::Persist',
          type: 'stage:start:persist',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::Test::Persist',
          type: 'stage:end:persist',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'vault-orchestrator',
          type: 'lifecycle:end:merge',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'vault-orchestrator',
          type: 'lifecycle:start:merge',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: [1, 2, 3], error: Object({ message: 'fail' }), hasValue: true })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'vault-orchestrator',
          type: 'lifecycle:end:merge',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        })
      ]);
    });

    it('should reset state with null', async () => {
      const persistBehavior = createTestBehavior(NgVaultBehaviorTypes.Persist, called);
      runInInjectionContext(injector, () => {
        providers = provideFeatureCell(
          class DummyService {},
          { key: 'reset-test', initial: null, insights: { wantsState: true } as any },
          [persistBehavior]
        );
      });
      const provider = providers.find((p: any) => typeof p.useFactory === 'function');
      let vault!: NgVaultFeatureCell<any>;

      runInInjectionContext(injector, () => {
        vault = (provider as any).useFactory();
        vault.initialize();
      });
      await flushMicrotasksZoneless();

      vault.mergeState({ loading: true, error: { message: 'fail' }, value: [1, 2, 3] });
      expect(vault.state.isLoading()).toBeTrue();
      expect(vault.state.error()).toEqual({ message: 'fail' });
      expect(vault.state.value()).toBeUndefined();
      expect(vault.state.hasValue()).toBeFalse();

      await flushMicrotasksZoneless();
      expect(vault.state.isLoading()).toBeTrue();
      expect(vault.state.error()).toEqual({ message: 'fail' });
      expect(vault.state.value()).toEqual([1, 2, 3]);
      expect(vault.state.hasValue()).toBeTrue();

      vault.mergeState(null);
      await flushMicrotasksZoneless();
      expect(vault.state.isLoading()).toBeFalse();
      expect(vault.state.error()).toBeNull();
      expect(vault.state.value()).toBeUndefined();
      expect(vault.state.hasValue()).toBeFalse();

      expect(called).toEqual(['load', 'persist']);
      expect(emitted).toEqual([
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'core',
          type: 'lifecycle:start:initialized',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::Test::Persist',
          type: 'stage:start:loadpersist',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::Test::Persist',
          type: 'stage:end:loadpersist',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'core',
          type: 'lifecycle:end:initialized',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'vault-orchestrator',
          type: 'lifecycle:start:merge',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::Core::State',
          type: 'stage:start:state',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::Core::State',
          type: 'stage:end:state',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::CoreHttpResource::State',
          type: 'stage:start:state',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::CoreHttpResource::State',
          type: 'stage:end:state',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::Test::Persist',
          type: 'stage:start:persist',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::Test::Persist',
          type: 'stage:end:persist',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'vault-orchestrator',
          type: 'lifecycle:end:merge',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'vault-orchestrator',
          type: 'lifecycle:start:merge',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: [1, 2, 3], error: Object({ message: 'fail' }), hasValue: true })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'vault-orchestrator',
          type: 'lifecycle:end:merge',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        })
      ]);
    });

    it('should reset state with reset', async () => {
      const persistBehavior = createTestBehavior(NgVaultBehaviorTypes.Persist, called);
      runInInjectionContext(injector, () => {
        providers = provideFeatureCell(
          class DummyService {},
          { key: 'reset-test', initial: null, insights: { wantsState: true } as any },
          [persistBehavior]
        );
      });
      const provider = providers.find((p: any) => typeof p.useFactory === 'function');
      let vault!: NgVaultFeatureCell<any>;

      runInInjectionContext(injector, () => {
        vault = (provider as any).useFactory();
        vault.initialize();
      });

      await flushMicrotasksZoneless();

      vault.mergeState({ loading: true, error: { message: 'fail' }, value: [1, 2, 3] });
      expect(vault.state.isLoading()).toBeTrue();
      expect(vault.state.error()).toEqual({ message: 'fail' });
      expect(vault.state.value()).toBeUndefined();
      expect(vault.state.hasValue()).toBeFalse();

      await flushMicrotasksZoneless();
      expect(vault.state.isLoading()).toBeTrue();
      expect(vault.state.error()).toEqual({ message: 'fail' });
      expect(vault.state.value()).toEqual([1, 2, 3]);
      expect(vault.state.hasValue()).toBeTrue();

      vault.reset();
      await flushMicrotasksZoneless();

      expect(vault.state.isLoading()).toBeFalse();
      expect(vault.state.error()).toBeNull();
      expect(vault.state.value()).toBeUndefined([]);
      expect(vault.state.hasValue()).toBeFalse();

      expect(called).toEqual(['load', 'persist', 'clear']);
      expect(emitted).toEqual([
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'core',
          type: 'lifecycle:start:initialized',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::Test::Persist',
          type: 'stage:start:loadpersist',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::Test::Persist',
          type: 'stage:end:loadpersist',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'core',
          type: 'lifecycle:end:initialized',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'vault-orchestrator',
          type: 'lifecycle:start:merge',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::Core::State',
          type: 'stage:start:state',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::Core::State',
          type: 'stage:end:state',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::CoreHttpResource::State',
          type: 'stage:start:state',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::CoreHttpResource::State',
          type: 'stage:end:state',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::Test::Persist',
          type: 'stage:start:persist',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::Test::Persist',
          type: 'stage:end:persist',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'vault-orchestrator',
          type: 'lifecycle:end:merge',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: undefined, error: Object({ message: 'fail' }), hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'core',
          type: 'lifecycle:start:reset',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: true, value: [1, 2, 3], error: Object({ message: 'fail' }), hasValue: true })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::Test::Persist',
          type: 'stage:start:clearpersist',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'NgVault::Test::Persist',
          type: 'stage:end:clearpersist',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        }),
        Object({
          id: 'id-removed',
          cell: 'reset-test',
          behaviorKey: 'core',
          type: 'lifecycle:end:reset',
          timestamp: 'timestamp-removed',
          state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
        })
      ]);
    });
  });
});
