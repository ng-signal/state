// shared/vault-behavior-type.ts

/**
 * Runtime-safe enum-like object.
 * No JS enum bloat and works with tree-shaking.
 */
export const NgVaultBehaviorTypes = {
  Insights: 'insights',
  State: 'state',
  Persist: 'persist',
  Encrypt: 'encryption',
  Reduce: 'reduce',
  Events: 'events'
} as const;

/**
 * Literal union type inferred from the const object.
 */
export type NgVaultBehaviorTypes = (typeof NgVaultBehaviorTypes)[keyof typeof NgVaultBehaviorTypes];

/**
 * Optional ordering for orchestration
 * (this uses the *values* of the enum-like object)
 */
export const NgVaultBehaviorTypeOrder: readonly NgVaultBehaviorTypes[] = [
  NgVaultBehaviorTypes.Insights,
  NgVaultBehaviorTypes.State,
  NgVaultBehaviorTypes.Persist,
  NgVaultBehaviorTypes.Encrypt,
  NgVaultBehaviorTypes.Reduce,
  NgVaultBehaviorTypes.Events
] as const;
