import { VaultEventBus } from './vault-event-bus';
import { listVaults, registerVault, unregisterVault, VaultRegistry } from './vault-registry';

describe('DevTools Hooks', () => {
  it('should register and unregister vaults', () => {
    const entry = { key: 'user', service: 'UserService', state: {} as any };
    registerVault(entry);
    expect(VaultRegistry.has('user')).toBeTrue();
    unregisterVault('user');
    expect(VaultRegistry.has('user')).toBeFalse();
  });

  it('should emit events in dev mode', (done) => {
    // Force dev mode
    (globalThis as any).ngDevMode = true;

    const event = {
      key: 'user',
      type: 'set',
      timestamp: Date.now(),
      payload: { id: 1 }
    } as const;

    const sub = VaultEventBus.asObservable().subscribe((e) => {
      expect(e.key).toBe('user');
      expect(e.type).toBe('set');
      sub.unsubscribe();
      done();
    });

    VaultEventBus.next(event);
  });

  it('should allow listing vaults', () => {
    const entry = { key: 'abc', service: 'MockService', state: {} as any };
    registerVault(entry);
    const result = listVaults();
    expect(result.length).toBeGreaterThan(0);
    unregisterVault('abc');
  });
});
