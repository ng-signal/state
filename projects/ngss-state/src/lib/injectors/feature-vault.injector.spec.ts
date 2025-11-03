import { effect, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import 'reflect-metadata';
import { of } from 'rxjs';
import { NGVAULT_METADATA_KEYS } from '../constants/metadata-keys.constant';
import { FeatureCellDescriptorModel } from '../models/feature-cell-descriptor.model';
import { provideFeatureCell } from '../provide-feature-cell';
import { getOrCreateFeatureCellToken } from '../tokens/feature-cell-token-registry';
import { injectVault } from './feature-vault.injector';

/** Dummy model and service for testing */
interface TestVault {
  count: number;
  name: string;
}

class TestFeatureCellService {
  vault = injectVault<TestVault>(TestFeatureCellService);
}

/** Decorator simulation (normally done by @FeatureCell) */
Reflect.defineMetadata(NGVAULT_METADATA_KEYS.FEATURE_CELL_KEY, 'testFeature', TestFeatureCellService);

describe('Injector: Vault', () => {
  let desc: FeatureCellDescriptorModel<TestVault>;

  beforeEach(() => {
    desc = {
      key: 'testFeature',
      initial: { count: 1, name: 'Ada' }
    };

    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), ...provideFeatureCell(TestFeatureCellService, desc)]
    });
  });

  it('should inject the correct vault instance for a decorated service', () => {
    const service = TestBed.inject(TestFeatureCellService);

    // Should be a valid vault
    expect(service.vault).toBeTruthy();
    expect(service.vault.state.data()?.count).toBe(1);
  });

  it('should throw an error when called without a @FeatureCell-decorated class', () => {
    expect(() => injectVault()).toThrowError(
      /injectVault\(\) must be called inside a @FeatureCell\(\)-decorated service/
    );
  });

  it('should throw an error if called without a @FeatureCell-decorated class', () => {
    class UndecoratedService {}

    expect(() => injectVault(UndecoratedService)).toThrowError(
      /must be called inside a @FeatureCell\(\)-decorated service/
    );
  });

  it('should retrieve the same vault instance as the one provided by Angular DI', () => {
    const service = TestBed.inject(TestFeatureCellService);

    // Inject vault manually again using token
    const token = getOrCreateFeatureCellToken<TestVault>('testFeature', false);
    const vaultFromToken = TestBed.inject(token);

    expect(vaultFromToken).toBe(service.vault);
  });

  it('should maintain signal reactivity inside the vault via loadListFrom', () => {
    const service = TestBed.inject(TestFeatureCellService);
    const vault = service.vault;

    const observed: (TestVault | null)[] = [];

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
