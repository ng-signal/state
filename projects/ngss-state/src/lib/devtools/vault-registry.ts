import { VaultRegistryItem } from './models/vault-registry-item.model';

export const VaultRegistry = new Map<string, VaultRegistryItem>();

export function registerVault(entry: VaultRegistryItem): void {
  VaultRegistry.set(entry.key, entry);
}

export function unregisterVault(key: string): void {
  VaultRegistry.delete(key);
}

export function listVaults(): VaultRegistryItem[] {
  return Array.from(VaultRegistry.values());
}
