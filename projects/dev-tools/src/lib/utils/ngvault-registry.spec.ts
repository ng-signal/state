import { listNgVaults, NgVaultRegistry, registerNgVault, unregisterNgVault } from './ngvault-registry';

describe('DevTools Hooks', () => {
  it('should register and unregister vaults', () => {
    const entry = { key: 'user', service: 'UserService', state: {} as any };
    registerNgVault(entry);
    expect(NgVaultRegistry.has('user')).toBeTrue();
    unregisterNgVault('user');
    expect(NgVaultRegistry.has('user')).toBeFalse();
  });

  it('should allow listing vaults', () => {
    const entry = { key: 'abc', service: 'MockService', state: {} as any };
    registerNgVault(entry);
    const result = listNgVaults();
    expect(result.length).toBeGreaterThan(0);
    unregisterNgVault('abc');
  });
});
