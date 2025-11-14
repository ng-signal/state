import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideVaultTesting } from '@ngvault/testing';
import 'reflect-metadata';
import { NGVAULT_METADATA_KEYS } from '../constants/metadata-keys.constant';
import { FeatureCellDescriptorModel } from '../models/feature-cell-descriptor.model';
import { provideFeatureCell } from '../providers/feature-cell/provide-feature-cell';
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
      providers: [
        provideVaultTesting(),
        provideZonelessChangeDetection(),
        provideFeatureCell(TestFeatureCellService, desc)
      ]
    });
  });

  it('should inject the correct vault instance for a decorated service', () => {
    const service = TestBed.inject(TestFeatureCellService);

    // Should be a valid vault
    expect(service.vault).toBeTruthy();
    expect(service.vault.state.value()).toBeUndefined();
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
    const token = getOrCreateFeatureCellToken<TestVault>('testFeature', true);
    const vaultFromToken = TestBed.inject(token);

    expect(vaultFromToken).toBe(service.vault);
  });
});
