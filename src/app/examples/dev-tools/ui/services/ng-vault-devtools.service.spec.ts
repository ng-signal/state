import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgVaultEventModel } from '../../models/ngvault-event.model';
import { NgVaultEventBus } from '../../utils/ngvault-event-bus';
import { NgVaultDevtoolsService } from './ngvault-devtools.service';

describe('NgVaultDevtoolsService (integration)', () => {
  let service: NgVaultDevtoolsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NgVaultDevtoolsService, provideZonelessChangeDetection()]
    });

    service = TestBed.inject(NgVaultDevtoolsService);
  });

  it('should create successfully', () => {
    expect(service).toBeTruthy();
    expect(service.events()).toEqual([]);
    expect(service.vaults()).toEqual({});
  });

  it('should record incoming events from the event bus', () => {
    const base: NgVaultEventModel = {
      id: '1',
      key: 'demo',
      type: 'set',
      timestamp: Date.now(),
      state: { value: { id: 1 } }
    };

    NgVaultEventBus.next(base);

    const allEvents = service.events();
    expect(allEvents.length).toBe(1);
    expect(allEvents[0]).toEqual(jasmine.objectContaining(base));
  });

  it('should cap stored events at 200 entries', () => {
    for (let i = 0; i < 250; i++) {
      NgVaultEventBus.next({
        id: `${i}`,
        key: 'bulk',
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

  it('should clear all events and vaults when clearAll() is called', () => {
    NgVaultEventBus.next({
      id: 'x',
      key: 'temp',
      type: 'set',
      timestamp: Date.now(),
      state: { value: 1 }
    });

    expect(service.events().length).toBeGreaterThan(0);

    service.clearAll();

    expect(service.events()).toEqual([]);
    expect(service.vaults()).toEqual({});
  });
});
