import { take } from 'rxjs/operators';
import { VaultEventBus } from './vault-event-bus';

describe('VaultEventBus', () => {
  it('should emit and complete properly in dev mode', (done) => {
    (globalThis as any).ngDevMode = true;

    VaultEventBus.asObservable()
      .pipe(take(1))
      .subscribe((event) => {
        expect(event.key).toBe('test');
        expect(event.type).toBe('set');
        done();
      });

    VaultEventBus.next({
      key: 'test',
      type: 'set',
      timestamp: Date.now(),
      payload: { id: 1 }
    });
  });
});
