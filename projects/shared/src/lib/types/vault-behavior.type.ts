// shared/vault-behavior-type.ts

/**
 * Runtime-safe enum-like object.
 * No JS enum bloat and works with tree-shaking.
 */
export const VaultBehaviorType = {
  DevTools: 'dev-tools',
  Insights: 'insights',
  Core: 'core',
  State: 'state',
  Persistence: 'persistence',
  Encryption: 'encryption',
  Reduce: 'reduce',
  Events: 'events'
} as const;

/**
 * Literal union type inferred from the const object.
 */
export type VaultBehaviorType = (typeof VaultBehaviorType)[keyof typeof VaultBehaviorType];

/**
 * Optional ordering for orchestration
 * (this uses the *values* of the enum-like object)
 */
export const VaultBehaviorTypeOrder: readonly VaultBehaviorType[] = [
  VaultBehaviorType.DevTools,
  VaultBehaviorType.Insights,
  VaultBehaviorType.Core,
  VaultBehaviorType.State,
  VaultBehaviorType.Persistence,
  VaultBehaviorType.Encryption,
  VaultBehaviorType.Reduce,
  VaultBehaviorType.Events
] as const;
