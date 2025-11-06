/**
 * Canonical NgVault behavior key generator.
 * Produces keys in the format: NgVault::<Domain>::<BehaviorName>
 */
export function defineNgVaultBehaviorKey(domain: string, name: string): string {
  const normalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/[^A-Za-z0-9]/g, '');

  return `NgVault::${normalize(domain)}::${normalize(name)}`;
}

/**
 * Validates that a given key matches the canonical NgVault format.
 * Example of a valid key: NgVault::Core::Set
 */
export function validateNgVaultBehaviorKey(key: string): boolean {
  if (typeof key !== 'string') return false;

  const pattern = /^NgVault::[A-Z][A-Za-z0-9]*::[A-Z][A-Za-z0-9]*$/;
  return pattern.test(key);
}
