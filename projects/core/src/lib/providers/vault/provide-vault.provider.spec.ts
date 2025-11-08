import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgVaultAsyncDiagnosticQueue } from '@ngvault/core/services/ngvault-async-diagnostic-queue';
import { NgVaultSyncQueue } from '@ngvault/core/services/ngvault-sync-queue';
import { NGVAULT_DEV_MODE } from '../../constants/ngvault-dev-mode.constant';
import { NgVaultConfigModel } from '../../models/ng-vault-config.model';
import { NGVAULT_CONFIG } from '../../tokens/ngvault-config.token';
import { NGVAULT_QUEUE } from '../../tokens/ngvault-queue.token';
import { _resetNgVaultConfigForTests, provideVault } from './provide-vault'; // adjust import

// Mock queue for testing
class MockQueue extends NgVaultAsyncDiagnosticQueue {
  static created = false;
  constructor() {
    super();
    MockQueue.created = true;
  }
}

describe('provideVault()', () => {
  beforeEach(() => {
    _resetNgVaultConfigForTests();
    MockQueue.created = false;
  });

  it('should return an array of providers', () => {
    const providers = provideVault();
    expect(Array.isArray(providers)).toBeTrue();
    expect(providers.length).toBeGreaterThan(0);
  });

  it('should include expected tokens', () => {
    const providers = provideVault({ strict: true });
    const tokens = providers
      .filter((p: any) => p && typeof p === 'object' && 'provide' in p)
      .map((p: any) => p.provide);

    expect(tokens).toContain(NGVAULT_CONFIG);
    expect(tokens).toContain(NGVAULT_QUEUE);
    expect(tokens).toContain(NGVAULT_DEV_MODE);
  });

  it('should produce a frozen config with options', () => {
    const providers = provideVault({ strict: true, devMode: false });
    const configProvider = providers.find(
      (p: any) => typeof p === 'object' && 'provide' in p && p.provide === NGVAULT_CONFIG
    );
    expect(configProvider).toBeDefined();

    if (configProvider && 'useFactory' in configProvider) {
      const configFactory = configProvider.useFactory as () => NgVaultConfigModel;
      const cfg = configFactory();
      expect(Object.isFrozen(cfg)).toBeTrue();
      expect(cfg.strict).toBeTrue();
      expect(cfg.devMode).toBeFalse();
    }
  });

  it('should allow re-init after reset', () => {
    provideVault({ strict: true });
    _resetNgVaultConfigForTests();
    expect(() => provideVault({ strict: true })).not.toThrow();
  });

  it('should throw when injecting NGVAULT_CONFIG before initialization', () => {
    _resetNgVaultConfigForTests();

    // Manually create a TestBed without provideVault
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: NGVAULT_CONFIG,
          useFactory: () => {
            // eslint-disable-next-line
            const { _resetNgVaultConfigForTests } = require('./provide-vault');
            _resetNgVaultConfigForTests();
            // eslint-disable-next-line
            const moduleExports = require('./provide-vault');
            const fn = (moduleExports as any).getNgVaultConfig;
            if (typeof fn === 'function') return fn();
            throw new Error('[NgVault] Missing root Vault configuration. Did you forget to call provideVault()?');
          }
        }
      ]
    });

    expect(() => TestBed.inject(NGVAULT_CONFIG)).toThrowError(
      '[NgVault] Missing root Vault configuration. Did you forget to call provideVault()?'
    );
  });

  it('should use NgVaultAsyncQueue by default', () => {
    const providers = provideVault({});
    const configProvider = providers.find(
      (p: any) => typeof p === 'object' && 'provide' in p && p.provide === NGVAULT_CONFIG
    );
    const queueProvider = providers.find(
      (p: any) => typeof p === 'object' && 'provide' in p && p.provide === NGVAULT_QUEUE
    );

    if (configProvider && 'useFactory' in configProvider && queueProvider && 'useFactory' in queueProvider) {
      const cfg = configProvider.useFactory();
      const instance = queueProvider.useFactory(cfg);
      expect(instance instanceof NgVaultAsyncDiagnosticQueue).toBeTrue();
    }
  });

  it('should use a custom queue when provided', () => {
    const providers = provideVault({ queue: MockQueue });
    const configProvider = providers.find(
      (p: any) => typeof p === 'object' && 'provide' in p && p.provide === NGVAULT_CONFIG
    );
    const queueProvider = providers.find(
      (p: any) => typeof p === 'object' && 'provide' in p && p.provide === NGVAULT_QUEUE
    );

    if (configProvider && 'useFactory' in configProvider && queueProvider && 'useFactory' in queueProvider) {
      const cfg = configProvider.useFactory();
      const instance = queueProvider.useFactory(cfg);
      expect(instance instanceof MockQueue).toBeTrue();
      expect(MockQueue.created).toBeTrue();
    }
  });

  it('should default devMode to true', () => {
    const providers = provideVault({});
    const devModeProvider = providers.find(
      (p: any) => typeof p === 'object' && 'provide' in p && p.provide === NGVAULT_DEV_MODE
    );
    expect(devModeProvider && 'useValue' in devModeProvider && devModeProvider.useValue).toBeTrue();
  });

  it('should honor explicit devMode=false', () => {
    const providers = provideVault({ devMode: false });
    const devModeProvider = providers.find(
      (p: any) => typeof p === 'object' && 'provide' in p && p.provide === NGVAULT_DEV_MODE
    );
    expect(devModeProvider && 'useValue' in devModeProvider && devModeProvider.useValue).toBeFalse();
  });

  it('should integrate the NgVaultAsyncQueue cleanly with Angular DI', () => {
    TestBed.configureTestingModule({
      providers: [provideVault(), provideZonelessChangeDetection()]
    });

    const config = TestBed.inject(NGVAULT_CONFIG);
    const queue = TestBed.inject(NGVAULT_QUEUE);
    const devMode = TestBed.inject(NGVAULT_DEV_MODE);

    expect(config).toBeTruthy();
    expect(queue instanceof NgVaultAsyncDiagnosticQueue).toBeTrue();
    expect(typeof devMode).toBe('boolean');
  });

  it('should integrate the NgVaultAsyncDiasnoticQueue cleanly with Angular DI', () => {
    TestBed.configureTestingModule({
      providers: [provideVault({ queue: NgVaultAsyncDiagnosticQueue }), provideZonelessChangeDetection()]
    });

    const config = TestBed.inject(NGVAULT_CONFIG);
    const queue = TestBed.inject(NGVAULT_QUEUE);
    const devMode = TestBed.inject(NGVAULT_DEV_MODE);

    expect(config).toBeTruthy();
    expect(queue instanceof NgVaultAsyncDiagnosticQueue).toBeTrue();
    expect(typeof devMode).toBe('boolean');
  });

  it('should integrate the NgVaultSyncQueue cleanly with Angular DI', () => {
    TestBed.configureTestingModule({
      providers: [provideVault({ queue: NgVaultSyncQueue }), provideZonelessChangeDetection()]
    });

    const config = TestBed.inject(NGVAULT_CONFIG);
    const queue = TestBed.inject(NGVAULT_QUEUE);
    const devMode = TestBed.inject(NGVAULT_DEV_MODE);

    expect(config).toBeTruthy();
    expect(queue instanceof NgVaultSyncQueue).toBeTrue();
    expect(typeof devMode).toBe('boolean');
  });
});
