import { effect, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import 'reflect-metadata';
import { of } from 'rxjs';
import { NGSS_METADATA_KEYS } from '../constants/metadata-keys.constant';
import { FeatureDescriptorModel } from '../models/feature-descriptor.model';
import { provideState } from '../provide-state';
import { getOrCreateFeatureVaultToken } from '../tokens/feature-token-registry';
import { injectFeatureVault } from './feature-vault.injector';

/** Dummy model and service for testing */
interface TestState {
  count: number;
  name: string;
}

class TestFeatureService {
  vault = injectFeatureVault<TestState>(TestFeatureService);
}

/** Decorator simulation (normally done by @FeatureStore) */
Reflect.defineMetadata(NGSS_METADATA_KEYS.FEATURE_KEY, 'testFeature', TestFeatureService);

describe('injectFeatureVault', () => {
  let desc: FeatureDescriptorModel<TestState>;

  beforeEach(() => {
    desc = {
      key: 'testFeature',
      initial: { count: 1, name: 'Ada' }
    };

    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), ...provideState(TestFeatureService, desc)]
    });
  });

  it('should inject the correct vault instance for a decorated service', () => {
    const service = TestBed.inject(TestFeatureService);

    // Should be a valid vault
    expect(service.vault).toBeTruthy();
    expect(service.vault.state.data()?.count).toBe(1);
  });

  it('should throw an error when called without a @FeatureStore-decorated class', () => {
    expect(() => injectFeatureVault()).toThrowError(
      /injectFeatureVault\(\) must be called inside a @FeatureStore\(\)-decorated service/
    );
  });

  it('should throw an error if called without a @FeatureStore-decorated class', () => {
    class UndecoratedService {}

    expect(() => injectFeatureVault(UndecoratedService)).toThrowError(
      /must be called inside a @FeatureStore\(\)-decorated service/
    );
  });

  it('should retrieve the same vault instance as the one provided by Angular DI', () => {
    const service = TestBed.inject(TestFeatureService);

    // Inject vault manually again using token
    const token = getOrCreateFeatureVaultToken<TestState>('testFeature');
    const vaultFromToken = TestBed.inject(token);

    expect(vaultFromToken).toBe(service.vault);
  });

  it('should maintain signal reactivity inside the vault via loadListFrom', () => {
    const service = TestBed.inject(TestFeatureService);
    const vault = service.vault;

    const observed: (TestState | null)[] = [];

    // Watch for changes in vault.state.data()
    TestBed.runInInjectionContext(() => {
      effect(() => {
        const value = vault.state.data();
        if (value) {
          observed.push(value);
        }
      });
    });

    // Simulate an observable emitting new state
    const source$ = of({ count: 2, name: 'Updated' });
    vault.loadListFrom!(source$);

    TestBed.tick();

    // Assertions
    expect(observed.length).toBe(1);
    expect(observed[0]).toEqual({ count: 2, name: 'Updated' });

    // Verify reactive signal values
    expect(vault.state.loading()).toBeFalse();
    expect(vault.state.error()).toBeNull();
  });
});
