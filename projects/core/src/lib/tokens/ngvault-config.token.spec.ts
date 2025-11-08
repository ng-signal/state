import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NGVAULT_CONFIG } from './ngvault-config.token';

describe('InjectionToken: NGVAULT_CONFIG', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  it('should throw the correct error when no provider is configured', () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });

    expect(() => TestBed.inject(NGVAULT_CONFIG)).toThrowError(
      '[NgVault] Missing root Vault configuration. Did you forget to call provideVault()?'
    );
  });

  it('should inject successfully when explicitly provided', () => {
    const mockConfig = { strict: true, devMode: false };

    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), { provide: NGVAULT_CONFIG, useValue: mockConfig }]
    });

    const injected = TestBed.inject(NGVAULT_CONFIG);
    expect(injected).toEqual(mockConfig);
    expect(injected.strict).toBeTrue();
    expect(injected.devMode).toBeFalse();
  });

  it('should isolate configuration across TestBed resets', () => {
    const config1 = { strict: false };
    const config2 = { strict: true };

    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), { provide: NGVAULT_CONFIG, useValue: config1 }]
    });

    const first = TestBed.inject(NGVAULT_CONFIG);
    expect(first).toBe(config1);
    expect(first.strict).toBeFalse();

    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), { provide: NGVAULT_CONFIG, useValue: config2 }]
    });

    const second = TestBed.inject(NGVAULT_CONFIG);
    expect(second).toBe(config2);
    expect(second.strict).toBeTrue();
  });
});
