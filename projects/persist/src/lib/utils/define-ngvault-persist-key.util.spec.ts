import { defineNgVaultPersistKey } from './define-ngvault-persist-key.util';

describe('defineNgVaultPersistKey', () => {
  // ──────────────────────────────────────────
  // VALID CASES
  // ──────────────────────────────────────────

  it('should generate a properly formatted persistence key', () => {
    const result = defineNgVaultPersistKey('session', 'user');
    expect(result).toBe('ngvault::session::user');
  });

  it('should lowercase and trim the persistType', () => {
    const result = defineNgVaultPersistKey('  Local  ', 'cart');
    expect(result).toBe('ngvault::local::cart');
  });

  it('should trim the featureCellKey but preserve casing', () => {
    const result = defineNgVaultPersistKey('session', '  UserData  ');
    expect(result).toBe('ngvault::session::UserData');
  });

  // ──────────────────────────────────────────
  // ERROR CASES
  // ──────────────────────────────────────────

  it('should throw an error if featureCellKey is missing', () => {
    expect(() => defineNgVaultPersistKey('session', '')).toThrowError(
      '[NgVault] Invalid featureCellKey for persistence: ""'
    );
  });

  it('should throw an error if featureCellKey is undefined', () => {
    expect(() => defineNgVaultPersistKey('session', undefined as any)).toThrowError(
      '[NgVault] Invalid featureCellKey for persistence: "undefined"'
    );
  });

  it('should throw an error if persistType is missing', () => {
    expect(() => defineNgVaultPersistKey('', 'user')).toThrowError('[NgVault] Invalid persistType for persistence: ""');
  });

  it('should throw an error if persistType is undefined', () => {
    expect(() => defineNgVaultPersistKey(undefined as any, 'user')).toThrowError(
      '[NgVault] Invalid persistType for persistence: "undefined"'
    );
  });

  // ──────────────────────────────────────────
  // EDGE CASES
  // ──────────────────────────────────────────

  it('should throw an error if persistType is not a string', () => {
    expect(() => defineNgVaultPersistKey(123 as any, 'user')).toThrowError(
      '[NgVault] Invalid persistType for persistence: "123"'
    );
  });

  it('should throw an error if featureCellKey is not a string', () => {
    expect(() => defineNgVaultPersistKey('session', 42 as any)).toThrowError(
      '[NgVault] Invalid featureCellKey for persistence: "42"'
    );
  });

  it('should handle featureCellKey containing spaces and keep it intact', () => {
    const result = defineNgVaultPersistKey('session', ' user data ');
    expect(result).toBe('ngvault::session::user data');
  });
});
