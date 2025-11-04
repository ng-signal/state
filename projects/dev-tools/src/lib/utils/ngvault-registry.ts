import { VaultRegistryItem } from '../models/vault-registry-item.model';

export const NgVaultRegistry = new Map<string, VaultRegistryItem>();

export function registerNgVault(entry: VaultRegistryItem): void {
  NgVaultRegistry.set(entry.key, entry);
}

export function unregisterNgVault(key: string): void {
  NgVaultRegistry.delete(key);
}

export function listNgVaults(): VaultRegistryItem[] {
  return Array.from(NgVaultRegistry.values());
}
