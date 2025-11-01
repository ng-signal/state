import { InjectionToken } from '@angular/core';
import { getOrCreateFeatureVaultToken } from './feature-token-registry';

describe('token: getOrCreateFeatureVaultToken', () => {
  beforeEach(() => {
    (getOrCreateFeatureVaultToken as any)._featureVaultTokens?.clear?.();
  });

  it('should create a new token when missing', () => {
    const token = getOrCreateFeatureVaultToken('user', true);
    expect(token instanceof InjectionToken).toBeTrue();
    expect(token.toString()).toContain('NGSS_FEATURE_VAULT:user');
  });

  it('should return the same token for repeated calls (cached)', () => {
    const first = getOrCreateFeatureVaultToken('settings', true);
    const second = getOrCreateFeatureVaultToken('settings', true);
    expect(first).toBe(second);
  });

  it('should create unique tokens for different keys', () => {
    const a = getOrCreateFeatureVaultToken('alpha', true);
    const b = getOrCreateFeatureVaultToken('beta', true);
    expect(a).not.toBe(b);
  });

  it('should behave as if FEATURE_VAULT_TOKEN is called once per key', () => {
    // first call populates cache
    const first = getOrCreateFeatureVaultToken('profile', true);
    // second call hits cache (no new token)
    const second = getOrCreateFeatureVaultToken('profile', true);

    // Behaviorally identical: same instance proves factory not re-invoked
    expect(first).toBe(second);
  });

  it('should cache created tokens internally (verified by identity)', () => {
    const key = 'audit';
    const t1 = getOrCreateFeatureVaultToken(key, true);
    const t2 = getOrCreateFeatureVaultToken(key, true);
    expect(t1).toBe(t2);
  });
});
