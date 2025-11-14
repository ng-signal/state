import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgVaultEventModel } from '@ngvault/dev-tools';
import { NgVaultDevModeService } from '@ngvault/shared';
import { take } from 'rxjs';
import { NgVaultEventBus } from './ngvault-event-bus';

describe('Utils: NgVaultEventBus)', () => {
  let bus: NgVaultEventBus;

  describe('dev mode', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [NgVaultEventBus, provideZonelessChangeDetection()]
      }).overrideProvider(NgVaultDevModeService, {
        useValue: { isDevMode: true }
      });
      bus = TestBed.inject(NgVaultEventBus);
    });

    it('should emit an event with a generated ID', () => {
      const inputEvent: NgVaultEventModel = {
        cell: 'vault-1',
        type: 'init',
        timestamp: Date.now(),
        state: { isLoading: false, value: [], error: null, hasValue: true }
      } as any;

      let event;

      bus
        .asObservable()
        .pipe(take(1))
        .subscribe((result: any) => {
          event = result;
        });

      bus.next(inputEvent);

      expect(event).toEqual(
        Object({
          cell: 'vault-1',
          type: 'init',
          timestamp: jasmine.any(Number),
          state: Object({ isLoading: false, value: [], error: null, hasValue: true })
        })
      );
    });

    it('should generate unique IDs for multiple events', () => {
      const events: any = [];
      const total = 3;

      bus
        .asObservable()
        .pipe(take(total))
        .subscribe((event) => {
          events.push(event);
        });

      for (let i = 0; i < total; i++) {
        bus.next({
          cell: `vault-${i}`,
          type: 'patch',
          timestamp: Date.now(),
          state: { isLoading: false, value: i, error: null, hasValue: true }
        } as any);
      }

      expect(events).toEqual([
        Object({
          cell: 'vault-0',
          type: 'patch',
          timestamp: jasmine.any(Number),
          state: Object({ isLoading: false, value: 0, error: null, hasValue: true })
        }),
        Object({
          cell: 'vault-1',
          type: 'patch',
          timestamp: jasmine.any(Number),
          state: Object({ isLoading: false, value: 1, error: null, hasValue: true })
        }),
        Object({
          cell: 'vault-2',
          type: 'patch',
          timestamp: jasmine.any(Number),
          state: Object({ isLoading: false, value: 2, error: null, hasValue: true })
        })
      ]);
    });

    it('should not emit and empty event', () => {
      let emitted = false;
      bus
        .asObservable()
        .pipe(take(1))
        .subscribe(() => (emitted = true));

      bus.next(undefined as any);
      bus.next(null as any);

      expect(emitted).toBeFalse();
    });
  });

  describe('production mode - false', () => {
    beforeEach(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [NgVaultEventBus, provideZonelessChangeDetection()]
      }).overrideProvider(NgVaultDevModeService, {
        useValue: { isDevMode: false }
      });
      bus = TestBed.inject(NgVaultEventBus);
    });

    it('should not emit anything when isDevMode() returns false', () => {
      const inputEvent: NgVaultEventModel = {
        cell: 'vault2',
        type: 'dispose',
        timestamp: Date.now(),
        state: { isLoading: true, value: [], error: null, hasValue: () => false }
      } as any;

      let emitted = false;
      bus
        .asObservable()
        .pipe(take(1))
        .subscribe(() => (emitted = true));

      bus.next(inputEvent);

      expect(emitted).toBeFalse();
    });
  });

  describe('production mode - undefined', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [NgVaultEventBus, provideZonelessChangeDetection()]
      }).overrideProvider(NgVaultDevModeService, {
        useValue: { isDevMode: false }
      });
      bus = TestBed.inject(NgVaultEventBus);
    });

    it('should not emit when event is null or undefined', () => {
      let emitted = false;
      const inputEvent: NgVaultEventModel = {
        cell: 'vault2',
        type: 'dispose',
        timestamp: Date.now(),
        state: { isLoading: true, value: [], error: null, hasValue: false }
      } as any;
      bus
        .asObservable()
        .pipe(take(1))
        .subscribe(() => (emitted = true));

      bus.next(inputEvent);

      expect(emitted).toBeFalse();
    });
  });
});
