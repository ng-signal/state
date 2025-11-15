import { Injector, provideZonelessChangeDetection, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgVaultBehaviorTypes } from '@ngvault/shared';
import { provideVaultTesting } from '@ngvault/testing';
import { FeatureCellDescriptorModel } from '../../../models/feature-cell-descriptor.model';
import { provideFeatureCell } from '../provide-feature-cell';
import { featureCellValidation } from './feature-cell-validation.util';

describe('Util: featureCellValidation', () => {
  let providers: any[];
  let injector: any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideVaultTesting()]
    });

    injector = TestBed.inject(Injector);
  });

  describe('descriptor', () => {
    it('should not throw for primitive initial values', () => {
      const validCases: FeatureCellDescriptorModel<any>[] = [
        { key: 'test', initial: null },
        { key: 'test', initial: undefined },
        { key: 'test', initial: 123 },
        { key: 'test', initial: 'hello' },
        { key: 'test', initial: true },
        { key: 'test', initial: false }
      ];

      validCases.forEach((descriptor) => {
        expect(() => featureCellValidation(descriptor)).not.toThrow();
      });
    });

    it('should not throw for plain objects', () => {
      const descriptor: FeatureCellDescriptorModel<any> = {
        key: 'plain',
        initial: { a: 1, b: 2 }
      };

      expect(() => featureCellValidation(descriptor)).not.toThrow();
    });

    it('should not throw for arrays', () => {
      const descriptor: FeatureCellDescriptorModel<any> = {
        key: 'arr',
        initial: [1, 2, 3]
      };

      expect(() => featureCellValidation(descriptor)).not.toThrow();
    });

    it('should throw when initial looks like a NgVaultResourceState (has data)', () => {
      const descriptor: FeatureCellDescriptorModel<any> = {
        key: 'bad',
        initial: {
          loading: false,
          data: [1, 2, 3],
          error: null
        }
      };

      expect(() => featureCellValidation(descriptor)).toThrowError(
        `[NgVault] Invalid FeatureCellDescriptorModel.initial for feature "bad". ` +
          `Expected raw data (e.g., [] or {}), but received an object with resource fields { loading, data, error }. ` +
          `Pass plain data to avoid double-wrapping.`
      );
    });

    it('should throw even if data is present with other fields missing', () => {
      const descriptor: FeatureCellDescriptorModel<any> = {
        key: 'partial',
        initial: {
          data: 123
        }
      };

      expect(() => featureCellValidation(descriptor)).toThrowError(
        `[NgVault] Invalid FeatureCellDescriptorModel.initial for feature "partial". ` +
          `Expected raw data (e.g., [] or {}), but received an object with resource fields { loading, data, error }. ` +
          `Pass plain data to avoid double-wrapping.`
      );
    });

    it('should not throw for objects that have similar keys but not "data"', () => {
      const descriptor: FeatureCellDescriptorModel<any> = {
        key: 'similar',
        initial: {
          datum: 123,
          dataset: []
        }
      };

      expect(() => featureCellValidation(descriptor)).not.toThrow();
    });
  });

  describe('behaviors', () => {
    it('should throw if more than one encryption behavior is registered', async () => {
      // --- Behavior A (Encrypt)
      // eslint-disable-next-line
      const EncryptA = (ctx: any) => ({
        type: NgVaultBehaviorTypes.Encrypt,
        key: 'EncryptA',
        extendCellAPI: () => ({})
      });
      (EncryptA as any).type = NgVaultBehaviorTypes.Encrypt;
      (EncryptA as any).critical = false;

      // --- Behavior B (Encrypt)
      // eslint-disable-next-line
      const EncryptB = (ctx: any) => ({
        type: NgVaultBehaviorTypes.Encrypt,
        key: 'EncryptB',
        extendCellAPI: () => ({})
      });
      (EncryptB as any).type = NgVaultBehaviorTypes.Encrypt;
      (EncryptB as any).critical = false;

      // Register FeatureCell with BOTH encryption behaviors

      runInInjectionContext(injector, () => {
        providers = provideFeatureCell(
          class Dummy {},
          { key: 'enc-test', initial: [] },
          [EncryptA as any, EncryptB as any] // <- ERROR CONDITION
        );
      });

      const provider = providers.find((p: any) => typeof p.useFactory === 'function');

      // The error is thrown inside initialize()
      await expectAsync(
        (async () => {
          return runInInjectionContext(injector, async () => {
            const vault = provider.useFactory();
            await vault.initialize(); // <-- should throw
          });
        })()
      ).toBeRejectedWithError(`[NgVault] FeatureCell cannot register multiple encryption behaviors.`);
    });
  });
});
