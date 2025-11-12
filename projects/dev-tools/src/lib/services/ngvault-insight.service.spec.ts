import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgVaultEventModel } from '../models/ngvault-event.model';
import { NgVaultEventBus } from '../utils/ngvault-event-bus';
import { NgVaultInsightService } from './ngvault-insight.service';

describe('Service: NgVaultInsightService', () => {
  let bus: NgVaultEventBus;
  const received: NgVaultEventModel[] = [];
  let hook: NgVaultInsightService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NgVaultEventBus, provideZonelessChangeDetection()]
    });
    bus = TestBed.inject(NgVaultEventBus);
    hook = TestBed.inject(NgVaultInsightService);
  });

  describe('listen', () => {
    it('should subscribe and receive events', (done) => {
      const stop = hook.listen((event: any) => {
        received.push(event);
        stop(); // unsubscribe after first event
        expect(received.length).toBe(1);
        done();
      });

      bus.next({
        key: 'debug-test',
        type: 'init',
        timestamp: Date.now(),
        state: { isLoading: false, value: [], error: null, hasValue: true }
      });
    });
  });

  describe('listen$', () => {
    it('should emit events through the listen$ observable', (done) => {
      const expected: NgVaultEventModel = {
        key: 'stream-test',
        type: 'init',
        timestamp: Date.now(),
        state: { isLoading: false, value: [], error: null, hasValue: true }
      };

      const received: NgVaultEventModel[] = [];

      hook.listen$().subscribe({
        next: (event) => {
          received.push(event);
          expect(event.key).toBe(expected.key);
          expect(event.type).toBe(expected.type);
          expect(event.state).toEqual(expected.state);
          expect(received.length).toBe(1);
          done();
        }
      });

      // Push a single event
      bus.next(expected);
    });

    it('should support multiple subscribers independently', (done) => {
      const event: NgVaultEventModel = {
        key: 'multi-test',
        type: 'load',
        timestamp: Date.now(),
        state: { isLoading: true, value: [1], error: null, hasValue: true }
      };

      const resultsA: NgVaultEventModel[] = [];
      const resultsB: NgVaultEventModel[] = [];

      const subA = hook.listen$().subscribe((e) => resultsA.push(e));
      const subB = hook.listen$().subscribe((e) => resultsB.push(e));

      // Emit one event
      bus.next(event);

      setTimeout(() => {
        expect(resultsA).toEqual([jasmine.objectContaining({ key: 'multi-test', type: 'load' })]);
        expect(resultsB).toEqual([jasmine.objectContaining({ key: 'multi-test', type: 'load' })]);

        subA.unsubscribe();
        subB.unsubscribe();
        done();
      }, 0);
    });
  });
});
