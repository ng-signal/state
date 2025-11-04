import { NgVaultEventBus } from './ngvault-event-bus';
import { listNgVaults, NgVaultRegistry, registerNgVault, unregisterNgVault } from './ngvault-registry';

describe('DevTools Hooks', () => {
  it('should register and unregister vaults', () => {
    const entry = { key: 'user', service: 'UserService', state: {} as any };
    registerNgVault(entry);
    expect(NgVaultRegistry.has('user')).toBeTrue();
    unregisterNgVault('user');
    expect(NgVaultRegistry.has('user')).toBeFalse();
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

    const sub = NgVaultEventBus.asObservable().subscribe((e) => {
      expect(e.key).toBe('user');
      expect(e.type).toBe('set');
      sub.unsubscribe();
      done();
    });

    NgVaultEventBus.next(event);
  });

  it('should allow listing vaults', () => {
    const entry = { key: 'abc', service: 'MockService', state: {} as any };
    registerNgVault(entry);
    const result = listNgVaults();
    expect(result.length).toBeGreaterThan(0);
    unregisterNgVault('abc');
  });
});
