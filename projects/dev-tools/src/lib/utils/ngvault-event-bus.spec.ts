import { take } from 'rxjs/operators';
import { NgVaultEventBus } from './ngvault-event-bus';

describe('VaultEventBus', () => {
  it('should emit and complete properly in dev mode', (done) => {
    (globalThis as any).ngDevMode = true;

    NgVaultEventBus.asObservable()
      .pipe(take(1))
      .subscribe((event) => {
        expect(event.key).toBe('test');
        expect(event.type).toBe('set');
        done();
      });

    NgVaultEventBus.next({
      key: 'test',
      type: 'set',
      timestamp: Date.now(),
      state: { id: 1 }
    });
  });
});
