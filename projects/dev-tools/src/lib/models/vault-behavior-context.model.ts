import { Injector } from '@angular/core';
import { VaultStateSnapshot } from '@ngvault/shared-models';

/**
 * Provides lifecycle hooks and contextual access for FeatureCell behaviors.
 * Each FeatureCell creates one context instance, shared by all its behaviors.
 */
export interface VaultBehaviorContext<T> {
  /**
   * Returns the latest immutable snapshot of the vault state.
   * Behaviors must call `state()` to get a fresh snapshot each time.
   */
  state: () => Readonly<VaultStateSnapshot<T>>;

  /**
   * The name of the service or provider backing this vault.
   */
  serviceName: string;

  /**
   * The current Angular injector associated with the FeatureCell.
   * Allows behaviors to access DI-provided utilities, like HttpClient or Storage.
   */
  injector: Injector;
}
