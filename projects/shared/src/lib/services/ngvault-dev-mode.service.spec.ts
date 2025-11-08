import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgVaultDevModeService } from './ngvault-dev-mode.service';

describe('Service: NgVaultDevMode', () => {
  let service: NgVaultDevModeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NgVaultDevModeService, provideZonelessChangeDetection()]
    });
    service = TestBed.inject(NgVaultDevModeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should expose a boolean isDevMode getter', () => {
    const result = service.isDevMode;
    expect(typeof result).toBe('boolean');
  });

  it('should call Angular’s isDevMode() internally without throwing', () => {
    // Just ensure it executes safely
    expect(() => service.isDevMode).not.toThrow();
  });
});
