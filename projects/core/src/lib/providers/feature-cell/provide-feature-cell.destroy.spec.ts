import { Injector, provideZonelessChangeDetection, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgVaultEventBus } from '@ngvault/dev-tools';
import { NgVaultFeatureCell } from '@ngvault/shared';
import { createTestEventListener, flushMicrotasksZoneless, provideVaultTesting } from '@ngvault/testing';
import { FEATURE_CELL_REGISTRY } from '../../tokens/feature-cell-registry.token';
import { provideFeatureCell } from './provide-feature-cell';

describe('Provider: Feature Cell - destroy', () => {
  let providers: any[];
  let injector: any;

  const emitted: any[] = [];
  let stopListening: any;
  let eventBus: any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideVaultTesting(),
        { provide: FEATURE_CELL_REGISTRY, multi: true, useValue: { key: 'user', token: {}, insights: {} as any } }
      ]
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

  it('should fully destroy and reset signals on destroy()', async () => {
    runInInjectionContext(injector, () => {
      providers = provideFeatureCell(class TestService {}, {
        key: 'destroy-test',
        initial: [],
        insights: { wantsState: true } as any
      });
    });

    const vaultFactory = (providers[0] as any).useFactory;

    let vault!: NgVaultFeatureCell<any>;
    runInInjectionContext(injector, () => {
      vault = vaultFactory();
      vault.initialize();
    });

    vault.replaceState({ loading: true, value: [1, 2, 3], error: { message: 'oops' } as any });

    expect(vault.state.isLoading()).toBeTrue();
    await flushMicrotasksZoneless();
    expect(vault.state.isLoading()).toBeTrue();
    expect(vault.state.value()).toEqual([1, 2, 3]);
    expect(vault.state.error()).toEqual(Object({ message: 'oops' }));

    vault.destroy();
    await flushMicrotasksZoneless();

    expect(vault.state.isLoading()).toBeFalse();
    expect(vault.state.value()).toBeUndefined();
    expect(vault.state.error()).toBeNull();

    let completed = false;
    vault.destroyed$?.subscribe({ complete: () => (completed = true) });
    expect(completed).toBeTrue();

    expect(emitted).toEqual([
      Object({
        id: 'id-removed',
        cell: 'destroy-test',
        behaviorKey: 'core',
        type: 'lifecycle:start:initialized',
        timestamp: 'timestamp-removed',
        state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
      }),
      Object({
        id: 'id-removed',
        cell: 'destroy-test',
        behaviorKey: 'core',
        type: 'lifecycle:end:initialized',
        timestamp: 'timestamp-removed',
        state: Object({ isLoading: false, value: [], error: null, hasValue: true })
      }),
      Object({
        id: 'id-removed',
        cell: 'destroy-test',
        behaviorKey: 'vault-orchestrator',
        type: 'lifecycle:start:replace',
        timestamp: 'timestamp-removed',
        state: Object({ isLoading: true, value: [], error: Object({ message: 'oops' }), hasValue: true })
      }),
      Object({
        id: 'id-removed',
        cell: 'destroy-test',
        behaviorKey: 'NgVault::Core::State',
        type: 'stage:start:state',
        timestamp: 'timestamp-removed',
        state: Object({ isLoading: true, value: [], error: Object({ message: 'oops' }), hasValue: true })
      }),
      Object({
        id: 'id-removed',
        cell: 'destroy-test',
        behaviorKey: 'NgVault::Core::State',
        type: 'stage:end:state',
        timestamp: 'timestamp-removed',
        state: Object({ isLoading: true, value: [], error: Object({ message: 'oops' }), hasValue: true })
      }),
      Object({
        id: 'id-removed',
        cell: 'destroy-test',
        behaviorKey: 'NgVault::CoreHttpResource::State',
        type: 'stage:start:state',
        timestamp: 'timestamp-removed',
        state: Object({ isLoading: true, value: [], error: Object({ message: 'oops' }), hasValue: true })
      }),
      Object({
        id: 'id-removed',
        cell: 'destroy-test',
        behaviorKey: 'NgVault::CoreHttpResource::State',
        type: 'stage:end:state',
        timestamp: 'timestamp-removed',
        state: Object({ isLoading: true, value: [], error: Object({ message: 'oops' }), hasValue: true })
      }),
      Object({
        id: 'id-removed',
        cell: 'destroy-test',
        behaviorKey: 'vault-orchestrator',
        type: 'lifecycle:end:replace',
        timestamp: 'timestamp-removed',
        state: Object({ isLoading: true, value: [], error: Object({ message: 'oops' }), hasValue: true })
      }),
      Object({
        id: 'id-removed',
        cell: 'destroy-test',
        behaviorKey: 'core',
        type: 'lifecycle:end:destroy',
        timestamp: 'timestamp-removed',
        state: Object({ isLoading: true, value: [1, 2, 3], error: Object({ message: 'oops' }), hasValue: true })
      }),
      Object({
        id: 'id-removed',
        cell: 'destroy-test',
        behaviorKey: 'core',
        type: 'lifecycle:end:destroy',
        timestamp: 'timestamp-removed',
        state: Object({ isLoading: false, value: undefined, error: null, hasValue: false })
      })
    ]);
  });
});
