import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgVaultEventModel } from '../models/ngvault-event.model';
import { NgVaultEventBus } from '../utils/ngvault-event-bus';
import { NgVaultDebuggerService } from './ngvault-debugger.service';

describe('createNgVaultDebuggerHook', () => {
  let bus: NgVaultEventBus;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NgVaultEventBus, provideZonelessChangeDetection()]
    });
    bus = TestBed.inject(NgVaultEventBus);
  });

  it('should subscribe and receive events', (done) => {
    const received: NgVaultEventModel[] = [];
    const hook = TestBed.inject(NgVaultDebuggerService);

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
