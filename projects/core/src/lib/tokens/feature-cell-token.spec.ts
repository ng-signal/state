import { InjectionToken } from '@angular/core';
import { FeatureCell } from '@ngvault/shared';
import { FEATURE_CELL_TOKEN } from './feature-cell-token';

describe('Token: Feature Cell', () => {
  it('should create an instance of InjectionToken', () => {
    const token = FEATURE_CELL_TOKEN<{ foo: string }>('example');
    expect(token instanceof InjectionToken).toBeTrue();
  });

  it('should include the feature cell key in the token description', () => {
    const key = 'user';
    const token = FEATURE_CELL_TOKEN<{ loading: boolean }>(key);
    expect(token.toString()).toContain(`NGVAULT_FEATURE_CELL:${key}`);
  });

  it('should produce unique tokens for different keys', () => {
    const tokenA = FEATURE_CELL_TOKEN<{ a: number }>('alpha');
    const tokenB = FEATURE_CELL_TOKEN<{ b: number }>('beta');

    expect(tokenA).not.toBe(tokenB);
    expect(tokenA.toString()).toContain('NGVAULT_FEATURE_CELL:alpha');
    expect(tokenB.toString()).toContain('NGVAULT_FEATURE_CELL:beta');
  });

  it('should produce distinct tokens even for the same key (by design)', () => {
    const token1 = FEATURE_CELL_TOKEN<FeatureCell<any>>('duplicate');
    const token2 = FEATURE_CELL_TOKEN<FeatureCell<any>>('duplicate');

    // Same key, but different instances
    expect(token1).not.toBe(token2);
    expect(token1.toString()).toBe(token2.toString());
  });

  it('should have the correct generic type structure', () => {
    // Type-only test (ensures the function returns InjectionToken<FeatureVaultModel<T>>)
    type TestModel = { count: number };
    const token = FEATURE_CELL_TOKEN<TestModel>('counter');

    // Runtime shape check
    expect(token.toString()).toContain('NGVAULT_FEATURE_CELL:counter');
    // TypeScript should infer correctly; this ensures compile-time safety.
    const assign: InjectionToken<FeatureCell<TestModel>> = token;
    expect(assign).toBe(token);
  });
});
