import 'reflect-metadata';
import { NGVAULT_METADATA_KEYS } from '../constants/metadata-keys.constant';
import { FeatureCell } from './feature-cell.decorator';

/**
 * Test model for demonstration
 */
interface MockState {
  id: string;
}

/**
 * Minimal class to decorate dynamically within tests
 */
class MockFeatureService {}

describe('Decorator: Feature Cell', () => {
  beforeEach(() => {
    // Clean up metadata before each test
    Reflect.deleteMetadata(NGVAULT_METADATA_KEYS.FEATURE_CELL_KEY, MockFeatureService);
  });

  it('should define metadata on the target class', () => {
    FeatureCell<MockState>('user')(MockFeatureService);

    const meta = Reflect.getMetadata(NGVAULT_METADATA_KEYS.FEATURE_CELL_KEY, MockFeatureService);

    expect(meta).toBe('user');
  });

  it('should override existing metadata if decorator is applied again', () => {
    FeatureCell<MockState>('first')(MockFeatureService);
    FeatureCell<MockState>('second')(MockFeatureService);

    const meta = Reflect.getMetadata(NGVAULT_METADATA_KEYS.FEATURE_CELL_KEY, MockFeatureService);

    expect(meta).toBe('second');
  });

  it('should not define metadata if decorator is never applied', () => {
    const meta = Reflect.getMetadata(NGVAULT_METADATA_KEYS.FEATURE_CELL_KEY, MockFeatureService);

    expect(meta).toBeUndefined();
  });

  it('should work when decorator is used as a class decorator', () => {
    @FeatureCell<MockState>('profile')
    class ProfileStore {}

    const key = Reflect.getMetadata(NGVAULT_METADATA_KEYS.FEATURE_CELL_KEY, ProfileStore);

    expect(key).toBe('profile');
  });

  it('should store the key under the correct NgVault metadata constant', () => {
    FeatureCell<MockState>('audit')(MockFeatureService);

    // Ensure metadata exists for the expected constant key
    const allKeys = Reflect.getMetadataKeys(MockFeatureService);
    expect(allKeys).toContain(NGVAULT_METADATA_KEYS.FEATURE_CELL_KEY);
  });
});
