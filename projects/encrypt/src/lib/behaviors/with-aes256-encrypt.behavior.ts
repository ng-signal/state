import {
  defineNgVaultBehaviorKey,
  NgVaultBehavior,
  NgVaultBehaviorContext,
  NgVaultBehaviorFactory,
  NgVaultBehaviorFactoryContext,
  NgVaultBehaviorTypes,
  NgVaultEncryptBehavior,
  ngVaultLog
} from '@ngvault/shared';
import { VaultEncryptedEnvelope } from '../interface/ngvault-encrypted-envelope.interface';

const VAULT_CRYPTO_VERSION = 1;

export class Aes256EncryptBehavior<T> implements NgVaultEncryptBehavior<T> {
  readonly type = NgVaultBehaviorTypes.Encrypt;
  readonly key = defineNgVaultBehaviorKey('Core', 'Aes256Encrypt');
  readonly critical = false;

  #cryptoKeyPromise!: Promise<CryptoKey>;

  constructor(private readonly injector: NgVaultBehaviorFactoryContext['injector']) {}

  #abToBase64(buf: ArrayBuffer | ArrayBufferView): string {
    const bytes =
      buf instanceof ArrayBuffer ? new Uint8Array(buf) : new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);

    return btoa(String.fromCharCode(...bytes));
  }

  #base64ToAb(b64: string): ArrayBuffer {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes.buffer;
  }

  async #importKey(secret: string): Promise<CryptoKey> {
    const enc = new TextEncoder();
    return crypto.subtle.importKey(
      'raw',
      enc.encode(secret.padEnd(32).slice(0, 32)), // exactly 32 bytes for AES-256
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async #reloadKey(secret: string) {
    this.#cryptoKeyPromise = this.#importKey(secret);
  }

  extendCellAPI() {
    return {
      setSecret: async (ctx: NgVaultBehaviorContext<T>, newSecret: string): Promise<void> => {
        if (!newSecret || typeof newSecret !== 'string' || !newSecret.trim()) {
          throw new Error('[NgVault] Secret must be a non-empty string');
        }

        try {
          await this.#reloadKey(newSecret);
          ngVaultLog(`[NgVault] AES-256 secret updated for behavior "${this.key}"`);
        } catch (err) {
          /* istanbul ignore next */
          ngVaultLog(`[NgVault] Failed to update AES secret:`, err);
          throw err;
        }
      }
    };
  }

  async encryptState(ctx: NgVaultBehaviorContext<T>, current: T): Promise<T | undefined> {
    try {
      if (current === undefined || current === null) return current;

      const cryptoKey = await this.#cryptoKeyPromise;
      const iv = crypto.getRandomValues(new Uint8Array(12)); // GCM recommended IV size

      const encoded = new TextEncoder().encode(JSON.stringify(current));
      const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, encoded);

      const envelope: VaultEncryptedEnvelope = {
        v: VAULT_CRYPTO_VERSION,
        alg: 'AES-256-GCM',
        iv: this.#abToBase64(iv),
        data: this.#abToBase64(encrypted)
      };

      return envelope as unknown as T;
    } catch (err) {
      ngVaultLog('[NgVault] AES encrypt failed:', err);
      return current;
    }
  }

  async decryptState(ctx: NgVaultBehaviorContext<T>, encrypted: T): Promise<T | undefined> {
    try {
      if (encrypted === undefined || encrypted === null) return encrypted;

      const envelope = encrypted as unknown as VaultEncryptedEnvelope;

      // Must be a valid envelope or skip decryption
      if (typeof envelope !== 'object' || envelope.alg !== 'AES-256-GCM' || !envelope.iv || !envelope.data) {
        return encrypted; // Not encrypted → return raw value
      }

      const cryptoKey = await this.#cryptoKeyPromise;

      // Convert Base64 → bytes
      const iv = this.#base64ToAb(envelope.iv);
      const ciphertext = this.#base64ToAb(envelope.data);

      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(iv) },
        cryptoKey,
        ciphertext
      );

      const decoded = new TextDecoder().decode(decryptedBuffer);
      const parsed = JSON.parse(decoded);

      return parsed as T;
    } catch (err) {
      ngVaultLog('[NgVault] AES decrypt failed:', err);
      return encrypted; // fail-safe: don't destroy user data
    }
  }
}

export const withAes256EncryptBehavior = ((context: NgVaultBehaviorFactoryContext): NgVaultBehavior => {
  return new Aes256EncryptBehavior(context.injector);
}) as NgVaultBehaviorFactory;

withAes256EncryptBehavior.type = NgVaultBehaviorTypes.Encrypt;
withAes256EncryptBehavior.critical = false;
