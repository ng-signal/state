// shared/vault-behavior-type.ts

export const VaultBehaviorTypeOrder = Object.freeze([
  'dev-tools', // 0
  'events', // 1
  'core', // 2
  'state', // 3
  'reduce',
  'persistence', // 4
  'encryption' // 5
] as const);

export type VaultBehaviorType = (typeof VaultBehaviorTypeOrder)[number];
