import { InjectionToken } from '@angular/core';
import { getOrCreateFeatureCellToken } from './feature-cell-token-registry';

describe('token: getOrCreateFeatureVaultToken', () => {
  beforeEach(() => {
    (getOrCreateFeatureCellToken as any)._featureVaultTokens?.clear?.();
  });

  it('should create a new token when missing', () => {
    const token = getOrCreateFeatureCellToken('user', true);
    expect(token instanceof InjectionToken).toBeTrue();
    expect(token.toString()).toContain('NGVAULT_FEATURE_CELL:user');
  });

  it('should return the same token for repeated calls (cached)', () => {
    const first = getOrCreateFeatureCellToken('settings', true);
    const second = getOrCreateFeatureCellToken('settings', true);
    expect(first).toBe(second);
  });

  it('should create unique tokens for different keys', () => {
    const a = getOrCreateFeatureCellToken('alpha', true);
    const b = getOrCreateFeatureCellToken('beta', true);
    expect(a).not.toBe(b);
  });

  it('should behave as if FEATURE_VAULT_TOKEN is called once per key', () => {
    // first call populates cache
    const first = getOrCreateFeatureCellToken('profile', true);
    // second call hits cache (no new token)
    const second = getOrCreateFeatureCellToken('profile', true);

    // Behaviorally identical: same instance proves factory not re-invoked
    expect(first).toBe(second);
  });

  it('should cache created tokens internally (verified by identity)', () => {
    const key = 'audit';
    const t1 = getOrCreateFeatureCellToken(key, true);
    const t2 = getOrCreateFeatureCellToken(key, true);
    expect(t1).toBe(t2);
  });
});
