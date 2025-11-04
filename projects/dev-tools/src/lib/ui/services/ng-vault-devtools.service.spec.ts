import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgVaultEventModel } from '../../models/ngvault-event.model';
import { VaultEventSource } from '../../types/event-vault-source.type';
import { VaultEventType } from '../../types/event-vault.type';
import { NgVaultEventBus } from '../../utils/ngvault-event-bus';
import { NgVaultDevtoolsService } from './ngvault-devtools.service';

describe('Service: NgVaultDevtools', () => {
  let service: NgVaultDevtoolsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NgVaultDevtoolsService, provideZonelessChangeDetection()]
    });
    service = TestBed.inject(NgVaultDevtoolsService);
  });

  afterEach(() => {
    service.clear();
  });

  it('should push new events to the events signal', () => {
    const testEvent: NgVaultEventModel = {
      key: 'test-key',
      type: 'set' as VaultEventType,
      source: 'manual' as VaultEventSource,
      timestamp: Date.now(),
      payload: { data: 123 }
    };

    NgVaultEventBus.next(testEvent);

    const currentEvents = service.events();
    expect(currentEvents.length).toBe(1);
    expect(currentEvents[0]).toEqual(testEvent);
  });

  it('should prepend new events (most recent first)', () => {
    const firstEvent: NgVaultEventModel = {
      key: 'a',
      type: 'init' as VaultEventType,
      source: 'system' as VaultEventSource,
      timestamp: Date.now(),
      payload: { id: 1 }
    };
    const secondEvent: NgVaultEventModel = {
      key: 'b',
      type: 'patch' as VaultEventType,
      source: 'manual' as VaultEventSource,
      timestamp: Date.now() + 1,
      payload: { id: 2 }
    };

    NgVaultEventBus.next(firstEvent);
    NgVaultEventBus.next(secondEvent);

    const currentEvents = service.events();
    expect(currentEvents.length).toBe(2);
    // secondEvent should be first
    expect(currentEvents[0]).toEqual(secondEvent);
    expect(currentEvents[1]).toEqual(firstEvent);
  });

  it('should cap stored events to 200 entries', () => {
    const baseEvent: Partial<NgVaultEventModel> = {
      key: 'overflow',
      type: 'set' as VaultEventType,
      source: 'manual' as VaultEventSource
    };

    // push 210 events
    for (let i = 0; i < 210; i++) {
      NgVaultEventBus.next({
        ...baseEvent,
        timestamp: Date.now() + i,
        payload: { index: i }
      } as NgVaultEventModel);
    }

    const events = service.events();
    expect(events.length).toBe(200);
    // Ensure most recent event is first
    expect(events[0].payload).toEqual({ index: 209 });
    expect(events[199].payload).toEqual({ index: 10 });
  });

  it('should clear all events when clear() is called', () => {
    const testEvent: NgVaultEventModel = {
      key: 'clear-test',
      type: 'init' as VaultEventType,
      source: 'system' as VaultEventSource,
      timestamp: Date.now(),
      payload: { foo: 'bar' }
    };

    NgVaultEventBus.next(testEvent);
    expect(service.events().length).toBeGreaterThan(0);

    service.clear();
    expect(service.events()).toEqual([]);
  });

  it('should ignore falsy events safely', () => {
    // Simulate internal unsafe emission
    NgVaultEventBus.next(undefined as any);
    expect(service.events().length).toBe(0);
  });
});
