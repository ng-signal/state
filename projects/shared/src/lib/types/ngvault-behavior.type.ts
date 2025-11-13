// shared/vault-behavior-type.ts

/**
 * Runtime-safe enum-like object.
 * No JS enum bloat and works with tree-shaking.
 */
export const NgVaultBehaviorType = {
  Insights: 'insights',
  State: 'state',
  Persistence: 'persistence',
  Encryption: 'encryption',
  Reduce: 'reduce',
  Events: 'events'
} as const;

/**
 * Literal union type inferred from the const object.
 */
export type NgVaultBehaviorType = (typeof NgVaultBehaviorType)[keyof typeof NgVaultBehaviorType];

/**
 * Optional ordering for orchestration
 * (this uses the *values* of the enum-like object)
 */
export const NgVaultBehaviorTypeOrder: readonly NgVaultBehaviorType[] = [
  NgVaultBehaviorType.Insights,
  NgVaultBehaviorType.State,
  NgVaultBehaviorType.Persistence,
  NgVaultBehaviorType.Encryption,
  NgVaultBehaviorType.Reduce,
  NgVaultBehaviorType.Events
] as const;
