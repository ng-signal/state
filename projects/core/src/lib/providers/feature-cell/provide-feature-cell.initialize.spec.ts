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
import { FEATURE_CELL_REGISTRY } from '../../tokens/feature-cell-registry.token';
import { provideFeatureCell } from './provide-feature-cell';

describe('Provider: Feature Cell - initialize', () => {
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

  it('should throw an error if there are two encrypt behaviors', async () => {
    runInInjectionContext(injector, () => {
      providers = provideFeatureCell(class DummyService {}, { key: 'double-init', initial: [], insights: {} as any }, [
        createTestBehavior(NgVaultBehaviorTypes.Encrypt, []),
        createTestBehavior(NgVaultBehaviorTypes.Encrypt, [])
      ]);
    });
    await flushMicrotasksZoneless();
    const provider = providers.find((p: any) => typeof p.useFactory === 'function');

    await expectAsync(
      runInInjectionContext(injector, async () => {
        const vault = (provider as any).useFactory();
        await vault.initialize(); // error thrown inside here
      })
    ).toBeRejectedWithError('[NgVault] FeatureCell cannot register multiple encryption behaviors.');
  });

  it('should throw an error if the initialized is called twice', async () => {
    runInInjectionContext(injector, () => {
      providers = provideFeatureCell(class DummyService {}, { key: 'double-init', initial: [], insights: {} as any });
    });
    await flushMicrotasksZoneless();
    const provider = providers.find((p: any) => typeof p.useFactory === 'function');

    await expectAsync(
      runInInjectionContext(injector, async () => {
        const vault = (provider as any).useFactory();
        await vault.initialize(); // error thrown inside here
        await vault.initialize(); // error thrown inside here
      })
    ).toBeRejectedWithError('[NgVault] FeatureCell "double-init" already initialized.');

    await flushMicrotasksZoneless();

    expect(emitted).toEqual([
      Object({
        id: 'id-removed',
        cell: 'double-init',
        behaviorKey: 'core',
        type: 'lifecycle:start:initialized',
        timestamp: 'timestamp-removed'
      }),
      Object({
        id: 'id-removed',
        cell: 'double-init',
        behaviorKey: 'core',
        type: 'lifecycle:end:initialized',
        timestamp: 'timestamp-removed'
      }),
      Object({
        id: 'id-removed',
        cell: 'double-init',
        behaviorKey: 'core',
        type: 'lifecycle:start:initialized',
        timestamp: 'timestamp-removed'
      }),
      Object({
        id: 'id-removed',
        cell: 'double-init',
        behaviorKey: 'core',
        type: 'error',
        timestamp: 'timestamp-removed'
      })
    ]);
  });

  it('should throw an error if anything is called before initialized', async () => {
    runInInjectionContext(injector, () => {
      providers = provideFeatureCell(class DummyService {}, { key: 'double-init', initial: [], insights: {} as any });
    });
    const provider = providers.find((p: any) => typeof p.useFactory === 'function');
    let vault!: NgVaultFeatureCell<any>;

    runInInjectionContext(injector, () => {
      vault = (provider as any).useFactory();
    });

    await flushMicrotasksZoneless();

    expect(() => vault.reset()).toThrowError(
      '[NgVault] FeatureCell "double-init" has not been initialized. You must call cell.initialize() before using state methods.'
    );

    expect(emitted).toEqual([]);
  });

  it('should throw an error if desc.initial contains a "data" field (resource-like object)', async () => {
    const invalidInitial = {
      loading: false,
      data: [],
      error: null
    };

    await expectAsync(
      (async () => {
        return runInInjectionContext(injector, async () => {
          providers = provideFeatureCell(class DummyService {}, {
            key: 'invalid-initial',
            initial: invalidInitial
          });

          const provider = providers.find((p: any) => typeof p.useFactory === 'function');
          const vault = (provider as any).useFactory();

          await vault.initialize(); // <-- This should throw
        });
      })()
    ).toBeRejectedWithError(
      `[NgVault] Invalid FeatureCellDescriptorModel.initial for feature "invalid-initial". ` +
        `Expected raw data (e.g., [] or {}), but received an object with resource fields { loading, data, error }. ` +
        `Pass plain data to avoid double-wrapping.`
    );
  });
});
