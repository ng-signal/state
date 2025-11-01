import { InjectionToken } from '@angular/core';
import { ResourceVaultModel } from '../models/resource-vault.model';
import { FEATURE_VAULT_TOKEN } from './feature-vault-token';

describe('FEATURE_VAULT_TOKEN', () => {
  it('should create an instance of InjectionToken', () => {
    const token = FEATURE_VAULT_TOKEN<{ foo: string }>('example');
    expect(token instanceof InjectionToken).toBeTrue();
  });

  it('should include the feature key in the token description', () => {
    const key = 'user';
    const token = FEATURE_VAULT_TOKEN<{ loading: boolean }>(key);
    expect(token.toString()).toContain(`NGSS_FEATURE_VAULT:${key}`);
  });

  it('should produce unique tokens for different keys', () => {
    const tokenA = FEATURE_VAULT_TOKEN<{ a: number }>('alpha');
    const tokenB = FEATURE_VAULT_TOKEN<{ b: number }>('beta');

    expect(tokenA).not.toBe(tokenB);
    expect(tokenA.toString()).toContain('NGSS_FEATURE_VAULT:alpha');
    expect(tokenB.toString()).toContain('NGSS_FEATURE_VAULT:beta');
  });

  it('should produce distinct tokens even for the same key (by design)', () => {
    const token1 = FEATURE_VAULT_TOKEN<ResourceVaultModel<any>>('duplicate');
    const token2 = FEATURE_VAULT_TOKEN<ResourceVaultModel<any>>('duplicate');

    // Same key, but different instances
    expect(token1).not.toBe(token2);
    expect(token1.toString()).toBe(token2.toString());
  });

  it('should have the correct generic type structure', () => {
    // Type-only test (ensures the function returns InjectionToken<FeatureVaultModel<T>>)
    type TestModel = { count: number };
    const token = FEATURE_VAULT_TOKEN<TestModel>('counter');

    // Runtime shape check
    expect(token.toString()).toContain('NGSS_FEATURE_VAULT:counter');
    // TypeScript should infer correctly; this ensures compile-time safety.
    const assign: InjectionToken<ResourceVaultModel<TestModel>> = token;
    expect(assign).toBe(token);
  });
});
