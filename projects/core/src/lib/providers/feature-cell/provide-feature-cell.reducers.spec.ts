import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Injector, provideZonelessChangeDetection, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgVaultEventBus } from '@ngvault/dev-tools';
import { NgVaultFeatureCell } from '@ngvault/shared';
import { createTestEventListener, flushMicrotasksZoneless, provideVaultTesting } from '@ngvault/testing';
import { provideFeatureCell } from './provide-feature-cell';

interface TestModel {
  id: number;
  name: string;
  active: boolean;
}

describe('Provider: Feature Cell: reducers', () => {
  let vault: NgVaultFeatureCell<TestModel[] | TestModel>;
  const calls: any = [];
  const emitted: any[] = [];
  let stopListening: any;
  let eventBus: any;
  let injector: any;

  beforeEach(() => {
    calls.length = 0;

    TestBed.configureTestingModule({
      providers: [
        provideVaultTesting(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection()
      ]
    });

    injector = TestBed.inject(Injector);
    const providers = provideFeatureCell(class TestService {}, { key: 'http', initial: [], insights: {} as any }, []);
    const vaultFactory = (providers[0] as any).useFactory;

    runInInjectionContext(injector, () => {
      vault = vaultFactory();
    });

    eventBus = TestBed.inject(NgVaultEventBus);
    stopListening = createTestEventListener(eventBus, emitted);
  });

  afterEach(() => {
    stopListening();
  });

  it('should apply user-defined reducers in order', async () => {
    const addActiveFlag = (current: TestModel) => ({
      ...current,
      active: true
    });

    const renameUser = (current: TestModel) => ({
      ...current,
      name: 'Grace Hopper'
    });

    // ✔ Attach reducers
    runInInjectionContext(injector, () => {
      vault.initialize([addActiveFlag, renameUser as any]);
    });
    await flushMicrotasksZoneless();

    // Act — run reductions
    vault.replaceState({ value: { id: 1, name: 'Brian', active: true } });
    await flushMicrotasksZoneless();

    // Assert — both reducers applied in order
    expect(vault.state.value()).toEqual({
      id: 1,
      name: 'Grace Hopper',
      active: true
    });

    expect(emitted).toEqual([
      Object({
        id: 'id-removed',
        cell: 'http',
        behaviorKey: 'core',
        type: 'lifecycle:start:initialized',
        timestamp: 'timestamp-removed'
      }),
      Object({
        id: 'id-removed',
        cell: 'http',
        behaviorKey: 'core',
        type: 'lifecycle:end:initialized',
        timestamp: 'timestamp-removed'
      }),
      Object({
        id: 'id-removed',
        cell: 'http',
        behaviorKey: 'vault-orchestrator',
        type: 'lifecycle:start:replace',
        timestamp: 'timestamp-removed'
      }),
      Object({
        id: 'id-removed',
        cell: 'http',
        behaviorKey: 'NgVault::Core::State',
        type: 'stage:start:state',
        timestamp: 'timestamp-removed'
      }),
      Object({
        id: 'id-removed',
        cell: 'http',
        behaviorKey: 'NgVault::Core::State',
        type: 'stage:end:state',
        timestamp: 'timestamp-removed'
      }),
      Object({
        id: 'id-removed',
        cell: 'http',
        behaviorKey: 'NgVault::CoreHttpResource::State',
        type: 'stage:start:state',
        timestamp: 'timestamp-removed'
      }),
      Object({
        id: 'id-removed',
        cell: 'http',
        behaviorKey: 'NgVault::CoreHttpResource::State',
        type: 'stage:end:state',
        timestamp: 'timestamp-removed'
      }),
      Object({
        id: 'id-removed',
        cell: 'http',
        behaviorKey: 'NgVault::Core::Reducer',
        type: 'stage:start:reducer',
        timestamp: 'timestamp-removed'
      }),
      Object({
        id: 'id-removed',
        cell: 'http',
        behaviorKey: 'NgVault::Core::Reducer',
        type: 'stage:end:reducer',
        timestamp: 'timestamp-removed'
      }),
      Object({
        id: 'id-removed',
        cell: 'http',
        behaviorKey: 'NgVault::Core::Reducer',
        type: 'stage:start:reducer',
        timestamp: 'timestamp-removed'
      }),
      Object({
        id: 'id-removed',
        cell: 'http',
        behaviorKey: 'NgVault::Core::Reducer',
        type: 'stage:end:reducer',
        timestamp: 'timestamp-removed'
      }),
      Object({
        id: 'id-removed',
        cell: 'http',
        behaviorKey: 'vault-orchestrator',
        type: 'lifecycle:end:replace',
        timestamp: 'timestamp-removed'
      })
    ]);
  });
});
