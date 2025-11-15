import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgVaultInsightService } from '@ngvault/dev-tools';
import { flushMicrotasksZoneless } from '@ngvault/testing';
import { NgVaultEventModel } from '../../../../../dev-tools/src/lib/models/ngvault-event.model';
import { NgVaultEventBus } from '../../../../../dev-tools/src/lib/utils/ngvault-event-bus';
import { NgVaultDevtoolsService } from './ngvault-devtools.service';

describe('Service: NgVaultDevtools', () => {
  let service: NgVaultDevtoolsService;
  let bus: NgVaultEventBus;

  class MockInsightService {
    constructor(private bus: NgVaultEventBus) {}

    listen$() {
      return this.bus.asObservable(); // chrome stream mocked
    }

    listenEventBus$() {
      return this.bus.asObservable(); // local stream mocked
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        NgVaultEventBus,
        {
          provide: NgVaultInsightService,
          useFactory: (bus: NgVaultEventBus) => new MockInsightService(bus),
          deps: [NgVaultEventBus]
        },
        NgVaultDevtoolsService
      ]
    });

    service = TestBed.inject(NgVaultDevtoolsService);

    bus = TestBed.inject(NgVaultEventBus);
  });

  it('should create successfully', () => {
    expect(service.events()).toEqual([]);
  });

  it('should record incoming events from the event bus', async () => {
    const base: NgVaultEventModel = {
      id: '1',
      cell: 'cell',
      behaviorKey: 'behavior-key',
      type: 'set',
      timestamp: Date.now(),
      state: { value: { id: 1 } }
    };

    bus.next(base);
    TestBed.tick();
    await flushMicrotasksZoneless();

    let allEvents = service.events();
    expect(allEvents.length).toBe(1);
    expect(allEvents[0]).toEqual(jasmine.objectContaining(base));
    expect(service.totalEvents()).toBe(1);

    service.clearEvents();
    allEvents = service.events();
    expect(service.totalEvents()).toBe(0);
    expect(allEvents.length).toBe(0);
  });

  it('should cap stored events at 200 entries', () => {
    for (let i = 0; i < 250; i++) {
      bus.next({
        id: `${i}`,
        cell: 'cell-bulk',
        behaviorKey: 'behavior-key',
        type: 'patch',
        timestamp: Date.now(),
        state: { value: i }
      });
    }

    const allEvents = service.events();
    expect(allEvents.length).toBe(200);
    // most recent first
    expect(allEvents[0].id).toBe('249');
    expect(allEvents[199].id).toBe('50');
  });
});
