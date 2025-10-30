import 'reflect-metadata';
import { NGSS_METADATA_KEYS } from '../constants/metadata-keys.constant';
import { FeatureStore } from './feature-store.decorator';

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

describe('FeatureStore Decorator (Jasmine)', () => {
  beforeEach(() => {
    // Clean up metadata before each test
    Reflect.deleteMetadata(NGSS_METADATA_KEYS.FEATURE_KEY, MockFeatureService);
  });

  it('should define metadata on the target class', () => {
    FeatureStore<MockState>('user')(MockFeatureService);

    const meta = Reflect.getMetadata(NGSS_METADATA_KEYS.FEATURE_KEY, MockFeatureService);

    expect(meta).toBe('user');
  });

  it('should override existing metadata if decorator is applied again', () => {
    FeatureStore<MockState>('first')(MockFeatureService);
    FeatureStore<MockState>('second')(MockFeatureService);

    const meta = Reflect.getMetadata(NGSS_METADATA_KEYS.FEATURE_KEY, MockFeatureService);

    expect(meta).toBe('second');
  });

  it('should not define metadata if decorator is never applied', () => {
    const meta = Reflect.getMetadata(NGSS_METADATA_KEYS.FEATURE_KEY, MockFeatureService);

    expect(meta).toBeUndefined();
  });

  it('should work when decorator is used as a class decorator', () => {
    @FeatureStore<MockState>('profile')
    class ProfileStore {}

    const key = Reflect.getMetadata(NGSS_METADATA_KEYS.FEATURE_KEY, ProfileStore);

    expect(key).toBe('profile');
  });

  it('should store the key under the correct NGSS metadata constant', () => {
    FeatureStore<MockState>('audit')(MockFeatureService);

    // Ensure metadata exists for the expected constant key
    const allKeys = Reflect.getMetadataKeys(MockFeatureService);
    expect(allKeys).toContain(NGSS_METADATA_KEYS.FEATURE_KEY);
  });
});
