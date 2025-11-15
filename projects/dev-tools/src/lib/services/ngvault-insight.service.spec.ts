import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgVaultEventModel } from '../models/ngvault-event.model';
import { NgVaultEventBus } from '../utils/ngvault-event-bus';
import { NgVaultInsightService } from './ngvault-insight.service';

describe('Service: NgVaultInsightService', () => {
  let bus: NgVaultEventBus;
  const received: NgVaultEventModel[] = [];
  let hook: NgVaultInsightService;

  describe('Angular Application', () => {
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
          cell: 'debug-test',
          type: 'init',
          timestamp: Date.now(),
          state: { isLoading: false, value: [], error: null, hasValue: true }
        } as any);
      });
    });

    describe('listenEventBus$', () => {
      it('should emit events through the listen$ observable', (done) => {
        const expected: NgVaultEventModel = {
          cell: 'stream-test',
          type: 'init',
          timestamp: Date.now(),
          state: { isLoading: false, value: [], error: null, hasValue: true }
        } as any;

        const received: NgVaultEventModel[] = [];

        hook.listenEventBus$().subscribe({
          next: (event) => {
            received.push(event);
            expect(event.cell).toBe(expected.cell);
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
          cell: 'multi-test',
          type: 'load',
          timestamp: Date.now(),
          state: { isLoading: true, value: [1], error: null, hasValue: true }
        } as any;

        const resultsA: NgVaultEventModel[] = [];
        const resultsB: NgVaultEventModel[] = [];

        const subA = hook.listenEventBus$().subscribe((e) => resultsA.push(e));
        const subB = hook.listenEventBus$().subscribe((e) => resultsB.push(e));

        // Emit one event
        bus.next(event);

        setTimeout(() => {
          expect(resultsA).toEqual([jasmine.objectContaining({ cell: 'multi-test', type: 'load' })]);
          expect(resultsB).toEqual([jasmine.objectContaining({ cell: 'multi-test', type: 'load' })]);

          subA.unsubscribe();
          subB.unsubscribe();
          done();
        }, 0);
      });
    });
  });

  describe('chrome runtime message handling', () => {
    let originalRuntime: any;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [NgVaultInsightService, provideZonelessChangeDetection()]
      });

      originalRuntime = (globalThis as any).chrome.runtime;

      // Patch runtime to include onMessage API
      (globalThis as any).chrome.runtime = {
        onMessage: {
          listeners: [] as any[],
          addListener(fn: any) {
            this.listeners.push(fn);
          },
          removeListener() {}
        }
      };

      // Recreate service AFTER chrome is mocked
      hook = TestBed.inject(NgVaultInsightService);
    });

    afterEach(() => {
      // Restore whatever runtime existed originally
      (globalThis as any).chrome.runtime = originalRuntime;
    });

    it('should emit events when receiving NGVAULT_EVENT messages', (done) => {
      const mockEvent: NgVaultEventModel = {
        cell: 'chrome-test',
        type: 'stage:start',
        timestamp: Date.now(),
        state: { isLoading: false, value: 'abc', error: null, hasValue: true }
      } as any;

      hook.listen$().subscribe((e) => {
        expect(e.cell).toBe('chrome-test');
        expect(e?.state?.['value']).toBe('abc');
        done();
      });

      const listener = (globalThis as any).chrome.runtime.onMessage.listeners[0];

      expect(typeof listener).toBe('function');

      listener({ type: 'NGVAULT_EVENT', event: mockEvent });
    });

    it('should ignore non-NGVAULT_EVENT messages', (done) => {
      const received: NgVaultEventModel[] = [];

      hook.listen$().subscribe((e) => received.push(e));

      const listener = (globalThis as any).chrome.runtime.onMessage.listeners[0];

      listener({ type: 'OTHER_EVENT', foo: 123 });

      setTimeout(() => {
        expect(received.length).toBe(0);
        done();
      }, 0);
    });
  });
});
