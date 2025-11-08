// projects/testing/provide-vault-testing.ts
import { Provider } from '@angular/core';
import { _resetNgVaultConfigForTests, provideVault, setGetOrCreateFeatureCellTokenDevMode } from '@ngvault/core';
import { NgVaultTestingSyncQueue } from '../service/ngvault-sync-queue.service';

/**
 * Testing-safe variant of provideVault().
 *
 * - Always resets existing global config
 * - Uses a synchronous test queue
 * - Defaults to strict = true and devMode = true
 */
export function provideVaultTesting(strict = false, devMode = true): Provider[] {
  _resetNgVaultConfigForTests();
  setGetOrCreateFeatureCellTokenDevMode();

  return provideVault({
    strict,
    devMode,
    // Cast because provideVault expects a constructor, not an instance
    queue: NgVaultTestingSyncQueue as unknown as new () => NgVaultTestingSyncQueue as any
  });
}
