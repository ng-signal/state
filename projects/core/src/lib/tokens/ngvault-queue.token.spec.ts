import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgVaultAsyncQueue } from '../services/ngvault-async-queue';
import { NGVAULT_QUEUE } from './ngvault-queue.token';

describe('InjectionToken: NGVAULT_QUEUE', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  it('should throw the correct error when no provider is configured', () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });

    expect(() => TestBed.inject(NGVAULT_QUEUE)).toThrowError(
      '[NgVault] Missing root Vault configuration. Did you forget to call provideVault()?'
    );
  });

  it('should inject successfully when explicitly provided', () => {
    const customQueue = new NgVaultAsyncQueue();

    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), { provide: NGVAULT_QUEUE, useValue: customQueue }]
    });

    const injected = TestBed.inject(NGVAULT_QUEUE);
    expect(injected).toBe(customQueue);
    expect(injected).toBeInstanceOf(NgVaultAsyncQueue);
  });

  it('should support multiple TestBed resets safely', () => {
    const q1 = new NgVaultAsyncQueue();
    const q2 = new NgVaultAsyncQueue();

    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), { provide: NGVAULT_QUEUE, useValue: q1 }]
    });

    const first = TestBed.inject(NGVAULT_QUEUE);
    expect(first).toBe(q1);

    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), { provide: NGVAULT_QUEUE, useValue: q2 }]
    });

    const second = TestBed.inject(NGVAULT_QUEUE);
    expect(second).toBe(q2);
    expect(second).not.toBe(first);
  });
});
