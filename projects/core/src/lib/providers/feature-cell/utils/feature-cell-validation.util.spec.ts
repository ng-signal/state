import { FeatureCellDescriptorModel } from '../../../models/feature-cell-descriptor.model';
import { featureCellValidation } from './feature-cell-validation.util';

describe('Util: featureCellValidation', () => {
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
});
