export function defineNgVaultPersistKey(persistType: string, featureCellKey: string): string {
  if (!featureCellKey || typeof featureCellKey !== 'string') {
    throw new Error(`[NgVault] Invalid featureCellKey for persistence: "${featureCellKey}"`);
  }

  if (!persistType || typeof persistType !== 'string') {
    throw new Error(`[NgVault] Invalid persistType for persistence: "${persistType}"`);
  }

  const cleanType = persistType.trim().toLowerCase();
  const cleanKey = featureCellKey.trim();

  // Avoid collisions with user storage
  return `ngvault::${cleanType}::${cleanKey}`;
}
