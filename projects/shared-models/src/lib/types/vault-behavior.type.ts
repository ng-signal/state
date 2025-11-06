export type VaultBehaviorType =
  | 'dev-tools' // Priority 0
  | 'events' // Priority 1
  | 'state' // Priority 2
  | 'persistence' // Priority 3
  | 'encryption'; // Priority 4
