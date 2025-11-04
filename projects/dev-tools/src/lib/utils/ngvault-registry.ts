import { NgVaultRegistryItem } from '../models/ngvault-registry-item.model';

export const NgVaultRegistry = new Map<string, NgVaultRegistryItem>();

export function registerNgVault(entry: NgVaultRegistryItem): void {
  NgVaultRegistry.set(entry.key, entry);
}

export function unregisterNgVault(key: string): void {
  NgVaultRegistry.delete(key);
}

export function listNgVaults(): NgVaultRegistryItem[] {
  return Array.from(NgVaultRegistry.values());
}
