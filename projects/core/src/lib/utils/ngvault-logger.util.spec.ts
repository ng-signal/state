import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideVault } from '@ngvault/core';
import { ngVaultDebug, ngVaultError, ngVaultLog, ngVaultWarn } from './ngvault-logger.util';

describe('Util: ngVaultLog', () => {
  let consoleLogSpy: jasmine.Spy;
  let consoleWarnSpy: jasmine.Spy;
  let consoleErrorSpy: jasmine.Spy;
  let consoleDebugSpy: jasmine.Spy;

  beforeEach(() => {
    // fresh spies before each test
    consoleLogSpy = spyOn(console, 'log');
    consoleWarnSpy = spyOn(console, 'warn');
    consoleErrorSpy = spyOn(console, 'error');
    consoleDebugSpy = spyOn(console, 'debug');
  });

  describe('LogLevel: log enabled', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [provideZonelessChangeDetection(), provideVault({ logLevel: 'log' })]
      });
    });

    afterEach(() => {
      // let any queued microtasks flush before next test
      return Promise.resolve();
    });

    it('should log ', async () => {
      ngVaultLog('message');
      await Promise.resolve();
      // no console, no queue scheduled
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).toHaveBeenCalledTimes(0);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
      expect(consoleDebugSpy).toHaveBeenCalledTimes(0);
    });

    it('should log a single message when enabled via logging flag', async () => {
      ngVaultLog('Hello', 'World');

      // Wait for microtask queue to flush
      await Promise.resolve();

      expect(consoleLogSpy).toHaveBeenCalledWith('[NgVault]', 'Hello', 'World');
      expect(consoleWarnSpy).toHaveBeenCalledTimes(0);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
      expect(consoleDebugSpy).toHaveBeenCalledTimes(0);
    });

    it('should batch multiple logs in one flush', async () => {
      for (let i = 0; i < 5; i++) {
        ngVaultLog('msg', i);
      }

      // Still queued until microtask flush
      expect(consoleLogSpy).not.toHaveBeenCalled();

      await Promise.resolve(); // flush queue

      // Each message logged in one microtask cycle
      expect(consoleLogSpy.calls.count()).toBe(5);
      expect(consoleLogSpy.calls.allArgs()[0][0]).toBe('[NgVault]');
      expect(consoleWarnSpy).toHaveBeenCalledTimes(0);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
      expect(consoleDebugSpy).toHaveBeenCalledTimes(0);
    });

    it('should drop excess logs after reaching 200 messages', async () => {
      for (let i = 0; i < 210; i++) {
        ngVaultLog('msg', i);
      }

      await Promise.resolve(); // flush

      // 200 messages printed + 1 warning
      expect(consoleLogSpy.calls.count()).toBe(200);
      expect(consoleWarnSpy).toHaveBeenCalledOnceWith(jasmine.stringMatching(/messages dropped/));
      expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
      expect(consoleDebugSpy).toHaveBeenCalledTimes(0);
    });

    it('should resume logging after previous flush', async () => {
      // First round fills limit
      for (let i = 0; i < 205; i++) ngVaultLog('A', i);
      await Promise.resolve();

      expect(consoleLogSpy.calls.count()).toBe(200);
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
      expect(consoleDebugSpy).toHaveBeenCalledTimes(0);

      // New logs after flush should work again
      consoleLogSpy.calls.reset();
      consoleWarnSpy.calls.reset();

      for (let i = 0; i < 3; i++) ngVaultLog('Next', i);
      await Promise.resolve();

      expect(consoleLogSpy.calls.count()).toBe(3);
      expect(consoleWarnSpy).toHaveBeenCalledTimes(0);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
      expect(consoleDebugSpy).toHaveBeenCalledTimes(0);
    });

    it('should not throw if called before microtask context ready', () => {
      expect(() => ngVaultLog('Early')).not.toThrow();
      expect(consoleLogSpy).toHaveBeenCalledTimes(0);
      expect(consoleWarnSpy).toHaveBeenCalledTimes(0);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
      expect(consoleDebugSpy).toHaveBeenCalledTimes(0);
    });
  });

  describe('LogLevel: error enabled', () => {
    beforeEach(() => {
      // fresh spies before each test
      TestBed.configureTestingModule({
        providers: [provideZonelessChangeDetection(), provideVault({ logLevel: 'error' })]
      });
    });

    afterEach(() => {
      // let any queued microtasks flush before next test
      return Promise.resolve();
    });

    it('should log error', async () => {
      ngVaultError('error');
      ngVaultWarn('warn');
      ngVaultLog('log');
      ngVaultDebug('debug');
      await Promise.resolve();
      expect(consoleErrorSpy).toHaveBeenCalledWith('[NgVault]', 'error');
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleDebugSpy).not.toHaveBeenCalled();
    });
  });

  describe('LogLevel: warn enabled', () => {
    beforeEach(() => {
      // fresh spies before each test
      TestBed.configureTestingModule({
        providers: [provideZonelessChangeDetection(), provideVault({ logLevel: 'warn' })]
      });
    });

    afterEach(() => {
      // let any queued microtasks flush before next test
      return Promise.resolve();
    });

    it('should debug and log', async () => {
      ngVaultError('error');
      ngVaultWarn('warn');
      ngVaultLog('log');
      ngVaultDebug('debug');
      await Promise.resolve();
      expect(consoleErrorSpy).toHaveBeenCalledWith('[NgVault]', 'error');
      expect(consoleWarnSpy).toHaveBeenCalledWith('[NgVault]', 'warn');
      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleDebugSpy).not.toHaveBeenCalled();
    });
  });

  describe('LogLevel: log enabled', () => {
    beforeEach(() => {
      // fresh spies before each test
      TestBed.configureTestingModule({
        providers: [provideZonelessChangeDetection(), provideVault({ logLevel: 'log' })]
      });
    });

    afterEach(() => {
      // let any queued microtasks flush before next test
      return Promise.resolve();
    });

    it('should debug and log', async () => {
      ngVaultError('error');
      ngVaultWarn('warn');
      ngVaultLog('log');
      ngVaultDebug('debug');
      await Promise.resolve();
      expect(consoleErrorSpy).toHaveBeenCalledWith('[NgVault]', 'error');
      expect(consoleWarnSpy).toHaveBeenCalledWith('[NgVault]', 'warn');
      expect(consoleLogSpy).toHaveBeenCalledWith('[NgVault]', 'log');
      expect(consoleDebugSpy).not.toHaveBeenCalled();
    });
  });

  describe('LogLevel: debug enabled', () => {
    beforeEach(() => {
      // fresh spies before each test
      TestBed.configureTestingModule({
        providers: [provideZonelessChangeDetection(), provideVault({ logLevel: 'debug' })]
      });
    });

    afterEach(() => {
      // let any queued microtasks flush before next test
      return Promise.resolve();
    });

    it('should debug and log', async () => {
      ngVaultError('error');
      ngVaultWarn('warn');
      ngVaultLog('log');
      ngVaultDebug('debug');
      await Promise.resolve();
      expect(consoleErrorSpy).toHaveBeenCalledWith('[NgVault]', 'error');
      expect(consoleWarnSpy).toHaveBeenCalledWith('[NgVault]', 'warn');
      expect(consoleLogSpy).toHaveBeenCalledWith('[NgVault]', 'log');
      expect(consoleDebugSpy).toHaveBeenCalledWith('[NgVault]', 'debug');
    });
  });

  describe('Logging disabled - Explicit', () => {
    beforeEach(() => {
      // fresh spies before each test
      TestBed.configureTestingModule({
        providers: [provideZonelessChangeDetection(), provideVault({ logLevel: 'off' })]
      });
    });

    afterEach(() => {
      // let any queued microtasks flush before next test
      return Promise.resolve();
    });

    it('should not log when both logging and devMode are false', async () => {
      ngVaultLog('message');
      await Promise.resolve();
      // no console, no queue scheduled
      expect(consoleLogSpy).toHaveBeenCalledTimes(0);
      expect(consoleWarnSpy).toHaveBeenCalledTimes(0);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
      expect(consoleDebugSpy).toHaveBeenCalledTimes(0);
    });
  });

  describe('Logging disabled - Implicit', () => {
    beforeEach(() => {
      // fresh spies before each test
      TestBed.configureTestingModule({
        providers: [provideZonelessChangeDetection(), provideVault()]
      });
    });

    afterEach(() => {
      // let any queued microtasks flush before next test
      return Promise.resolve();
    });

    it('should not log when both logging and devMode are false', async () => {
      ngVaultLog('message');
      await Promise.resolve();
      // no console, no queue scheduled
      expect(consoleLogSpy).toHaveBeenCalledTimes(0);
      expect(consoleWarnSpy).toHaveBeenCalledTimes(0);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
      expect(consoleDebugSpy).toHaveBeenCalledTimes(0);
    });
  });
});
