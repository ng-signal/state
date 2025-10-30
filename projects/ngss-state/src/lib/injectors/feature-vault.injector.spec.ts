import { provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import 'reflect-metadata';
import { NGSS_METADATA_KEYS } from '../constants/metadata-keys.constant';
import { FeatureStore } from '../decorators/feature-store.decorator';
import { FeatureVaultModel } from '../models/feature-vault.model';
import { getOrCreateFeatureVaultToken } from '../tokens/feature-token-registry';
import { injectFeatureVault } from './feature-vault.injector';

interface MockState {
  count: number;
}

function createMockVault(initial: MockState): FeatureVaultModel<MockState> {
  const s = signal(initial);
  return {
    _set: jasmine.createSpy('_set').and.callFake((next: MockState) => s.set(next)),
    _patch: jasmine.createSpy('_patch').and.callFake((partial: Partial<MockState>) => s.set({ ...s(), ...partial })),
    state: s.asReadonly()
  };
}

describe('injectFeatureVault (Jasmine)', () => {
  const featureKey = 'mockFeature';
  const vaultToken = getOrCreateFeatureVaultToken<MockState>(featureKey);
  const initialState: MockState = { count: 0 };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), { provide: vaultToken, useValue: createMockVault(initialState) }]
    });
  });

  it('should inject the correct vault inside a @FeatureStore-decorated service', () => {
    @FeatureStore<MockState>(featureKey)
    class DecoratedService {
      vault = injectFeatureVault<MockState>(DecoratedService);
    }

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: vaultToken, useValue: createMockVault(initialState) },
        DecoratedService
      ]
    });

    const service = TestBed.inject(DecoratedService);
    expect(service.vault).toBeTruthy();
    expect(service.vault.state().count).toBe(0);

    service.vault._patch({ count: 5 });
    expect(service.vault.state().count).toBe(5);
  });

  it('should throw an error if used outside a decorated service', () => {
    class NonDecoratedService {
      vault = injectFeatureVault<MockState>(NonDecoratedService);
    }

    expect(() => new NonDecoratedService()).toThrowError(
      /injectFeatureVault\(\) must be called inside a @FeatureStore\(\)-decorated service/
    );
  });

  it('should read metadata key set by the @FeatureStore decorator', () => {
    @FeatureStore<MockState>('anotherFeature')
    class AnotherService {}

    const meta = Reflect.getMetadata(NGSS_METADATA_KEYS.FEATURE_KEY, AnotherService);
    expect(meta).toBe('anotherFeature');
  });

  it('should use getOrCreateFeatureVaultToken to resolve InjectionToken', () => {
    const newKey = 'resolveFeature';
    const token = getOrCreateFeatureVaultToken<MockState>(newKey);
    expect(token.toString()).toContain(`NGSS_FEATURE_VAULT:${newKey}`);
  });
});
