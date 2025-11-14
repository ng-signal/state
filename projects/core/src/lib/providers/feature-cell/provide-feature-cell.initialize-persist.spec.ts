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

describe('Provider: Feature Cell - initialize perist', () => {
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

  it('should load default values from storage', async () => {
    const persistBehavior = createTestBehavior(NgVaultBehaviorTypes.Persist, called, Object({ data: true }));
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

    expect(called).toEqual(['load']);
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
        state: Object({ isLoading: false, value: Object({ data: true }), error: null, hasValue: true })
      })
    ]);
  });

  it('should not load default values from storage', async () => {
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

    expect(called).toEqual(['load']);
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
      })
    ]);
  });
});
