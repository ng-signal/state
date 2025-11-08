import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideVault } from '@ngvault/core';
import { FEATURE_CELL_REGISTRY } from './feature-cell-registry.token';

// Sanity check to confirm import is valid
describe('FEATURE_CELL_REGISTRY InjectionToken', () => {
  it('should throw if injected without calling provideVault()', () => {
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });

    expect(() => TestBed.inject(FEATURE_CELL_REGISTRY)).toThrowError(
      '[NgVault] Missing root Vault configuration. Did you forget to call provideVault()?'
    );
  });

  it('should not throw when provided via provideVault()', () => {
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideVault()]
    });

    const registry = TestBed.inject(FEATURE_CELL_REGISTRY);

    // should be defined and an array (multi provider base)
    expect(registry).toBeDefined();
    expect(Array.isArray(registry)).toBeTrue();
  });

  it('should accumulate multiple registry entries (multi provider)', () => {
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideVault(),
        { provide: FEATURE_CELL_REGISTRY, multi: true, useValue: { key: 'users', token: class {} } },

        { provide: FEATURE_CELL_REGISTRY, multi: true, useValue: { key: 'cars', token: class {} } }
      ]
    });

    const registry = TestBed.inject(FEATURE_CELL_REGISTRY);
    expect(registry.length).toBe(3);
    expect(registry[0].key).toBeUndefined(); // this is the default registry of []
    expect(registry[1].key).toBe('users');
    expect(registry[2].key).toBe('cars');
  });
});
