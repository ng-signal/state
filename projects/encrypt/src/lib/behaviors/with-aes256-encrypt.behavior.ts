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
  #isSecretSet = false;

  constructor(private readonly injector: NgVaultBehaviorFactoryContext['injector']) {}

  async #reloadKey(secret: string) {
    this.#cryptoKeyPromise = this.#importKey(secret);
    this.#isSecretSet = true;
  }

  extendCellAPI() {
    return {
      setSecret: async (ctx: NgVaultBehaviorContext<T> | undefined, newSecret: string): Promise<void> => {
        if (!newSecret || typeof newSecret !== 'string' || !newSecret.trim()) {
          throw new Error('[NgVault] Secret must be a non-empty string.');
        }

        try {
          await this.#reloadKey(newSecret);
          ngVaultLog(`[NgVault] AES-256 secret updated for behavior "${this.key}"`);
        } catch (err) {
          /* istanbul ignore next */
          ngVaultLog(`[NgVault] Failed to update AES secret:`, err);
          /* istanbul ignore next */
          throw err;
        }
      }
    };
  }

  async encryptState(ctx: NgVaultBehaviorContext<T>, current: T): Promise<T | undefined> {
    try {
      if (current === undefined || current === null) return current;

      if (!this.#isSecretSet) {
        throw new Error(
          `[NgVault] Cannot encrypt: AES secret not set. Call vault.setSecret("your secret") before state operations.`
        );
      }

      const cryptoKey = await this.#cryptoKeyPromise;
      const iv = crypto.getRandomValues(new Uint8Array(12));

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
      throw err;
    }
  }

  async decryptState(ctx: NgVaultBehaviorContext<T>, encrypted: T): Promise<T | undefined> {
    try {
      if (encrypted === undefined || encrypted === null) return encrypted;

      if (!this.#isSecretSet) {
        throw new Error(
          `[NgVault] Cannot decrypt: AES secret not set. Call vault.setSecret("your secret") before state operations.`
        );
      }

      const envelope = encrypted as unknown as VaultEncryptedEnvelope;

      if (typeof envelope !== 'object' || envelope.alg !== 'AES-256-GCM' || !envelope.iv || !envelope.data) {
        throw new Error('[NgVault] Invalid encrypted envelope. Expected shape { v, alg: "AES-256-GCM", iv, data }.');
      }

      const cryptoKey = await this.#cryptoKeyPromise;

      const iv = this.#base64ToAb(envelope.iv);
      const ciphertext = this.#base64ToAb(envelope.data);

      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(iv) },
        cryptoKey,
        ciphertext
      );

      const decoded = new TextDecoder().decode(decryptedBuffer);

      return JSON.parse(decoded) as T;
    } catch (err) {
      ngVaultLog('[NgVault] AES decrypt failed:', err);
      throw err;
    }
  }

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
    // This is safe, correct, and predictable
    const enc = new TextEncoder();
    const bytes = enc.encode(secret.padEnd(32).slice(0, 32));

    return crypto.subtle.importKey('raw', bytes, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
  }
}

export const withAes256EncryptBehavior = ((context: NgVaultBehaviorFactoryContext): NgVaultBehavior => {
  return new Aes256EncryptBehavior(context.injector);
}) as NgVaultBehaviorFactory;

withAes256EncryptBehavior.type = NgVaultBehaviorTypes.Encrypt;
withAes256EncryptBehavior.critical = false;
