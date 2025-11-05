import { Injector, provideZonelessChangeDetection, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgVaultDevModeService } from '@ngvault/shared-models';
import { take } from 'rxjs/operators';
import { VaultEventType } from '../types/event-vault.type';
import { NgVaultEventBus } from '../utils/ngvault-event-bus';
import { useDevtoolsEventEmitter } from './use-devtools-event-emitter.helper';

describe('useDevtoolsEventEmitter', () => {
  let eventBus: NgVaultEventBus;
  let emitted: any[];

  beforeEach(() => {
    emitted = [];
  });

  describe('in dev mode (true)', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          NgVaultEventBus,
          {
            provide: NgVaultDevModeService,
            useValue: { isDevMode: true }
          }
        ]
      });
      eventBus = TestBed.inject(NgVaultEventBus);
    });

    it('should emit an event with correct structure', () => {
      const injector = TestBed.inject(Injector);
      const emitter = runInInjectionContext(injector, () => useDevtoolsEventEmitter());

      eventBus
        .asObservable()
        .pipe(take(1))
        .subscribe((event) => {
          emitted.push(event);
        });

      emitter('users', 'init');

      expect(emitted).toEqual(
        jasmine.objectContaining([
          Object({
            id: jasmine.any(String),
            key: 'users',
            type: 'init' as VaultEventType,
            timestamp: jasmine.any(Number)
          })
        ])
      );
    });
  });

  describe('in production mode (false)', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          NgVaultEventBus,
          {
            provide: NgVaultDevModeService,
            useValue: { isDevMode: false }
          }
        ]
      });
      eventBus = TestBed.inject(NgVaultEventBus);
    });

    it('should not emit anything when not in dev mode', () => {
      const injector = TestBed.inject(Injector);
      const emitter = runInInjectionContext(injector, () => useDevtoolsEventEmitter());
      let emitted = false;

      eventBus
        .asObservable()
        .pipe(take(1))
        .subscribe(() => (emitted = true));

      emitter('cars', 'dispose');

      // Wait a short tick to confirm no emission occurred
      expect(emitted).toBeFalse();
    });
  });
});
