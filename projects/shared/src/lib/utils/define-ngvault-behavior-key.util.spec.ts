import { defineNgVaultBehaviorKey, validateNgVaultBehaviorKey } from './define-ngvault-behavior-key.util';

describe('defineVaultBehaviorKey', () => {
  it('should generate a valid key in the canonical format', () => {
    const key = defineNgVaultBehaviorKey('Core', 'State');
    expect(key).toBe('NgVault::Core::State');
  });

  it('should work with other domains and names', () => {
    const key = defineNgVaultBehaviorKey('Persistence', 'LocalStorage');
    expect(key).toBe('NgVault::Persistence::LocalStorage');
  });

  it('should be deterministic for the same input', () => {
    const keyA = defineNgVaultBehaviorKey('DevTools', 'Telemetry');
    const keyB = defineNgVaultBehaviorKey('DevTools', 'Telemetry');
    expect(keyA).toBe(keyB);
  });
});

describe('validateVaultBehaviorKey', () => {
  it('should accept valid NgVault keys', () => {
    const validKeys = [
      'NgVault::Core::State',
      'NgVault::Persistence::LocalStorage',
      'NgVault::DevTools::Telemetry',
      'NgVault::Encryption::AES256',
      'NgVault::Test::MockBehavior'
    ];

    validKeys.forEach((key) => {
      expect(validateNgVaultBehaviorKey(key)).withContext(`Key ${key} should be valid`).toBeTrue();
    });
  });

  it('should reject keys missing the NgVault prefix', () => {
    expect(validateNgVaultBehaviorKey('Vault::Core::State')).toBeFalse();
  });

  it('should reject keys missing domain or behavior', () => {
    expect(validateNgVaultBehaviorKey('NgVault::Core')).toBeFalse();
    expect(validateNgVaultBehaviorKey('NgVault::::Set')).toBeFalse();
  });

  it('should reject lowercase or malformed domain/behavior segments', () => {
    expect(validateNgVaultBehaviorKey('NgVault::core::state')).toBeFalse();
    expect(validateNgVaultBehaviorKey('NgVault::core::State')).toBeFalse();
    expect(validateNgVaultBehaviorKey('NgVault::Core::state')).toBeFalse();
  });

  it('should reject non-string input', () => {
    expect(validateNgVaultBehaviorKey(null as any)).toBeFalse();
    expect(validateNgVaultBehaviorKey(undefined as any)).toBeFalse();
    expect(validateNgVaultBehaviorKey(42 as any)).toBeFalse();
  });
});
