import { Injector, provideZonelessChangeDetection, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { defineNgVaultBehaviorKey, NgVaultBehaviorLifecycleService, NgVaultBehaviorTypes } from '@ngvault/shared';
import { provideVaultTesting } from '@ngvault/testing';
import { Aes256EncryptBehavior, withAes256EncryptBehavior } from './with-aes256-encrypt.behavior';

describe('Behavior: AES-256 Encrypt', () => {
  let behavior: Aes256EncryptBehavior<any>;
  let injector: Injector;
  let cell: any;

  const SECRET = 'my-test-secret';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideVaultTesting(), provideZonelessChangeDetection()]
    });

    injector = TestBed.inject(Injector);

    const ngVaultBehaviorLifecycleService = NgVaultBehaviorLifecycleService('cell key');
    cell = {};

    runInInjectionContext(injector, () => {
      cell.behaviors = ngVaultBehaviorLifecycleService.initializeBehaviors(injector, [
        withAes256EncryptBehavior as any
      ]);
      ngVaultBehaviorLifecycleService.applyBehaviorExtensions(cell);
      behavior = cell.behaviors[0];
    });
  });

  it('should expose correct metadata', () => {
    expect(behavior.type).toBe(NgVaultBehaviorTypes.Encrypt);
    expect(behavior.key).toBe(defineNgVaultBehaviorKey('Core', 'Aes256Encrypt'));
    expect(behavior.critical).toBeFalse();
  });

  describe('invalid secrets', () => {
    it('should reject if secret is invalid', async () => {
      await expectAsync(cell.setSecret(undefined as any)).toBeRejectedWithError(
        '[NgVault] Secret must be a non-empty string.'
      );
    });

    it('should reject if secret is invalid', async () => {
      await expectAsync(cell.setSecret('  \t\n\r   ')).toBeRejectedWithError(
        '[NgVault] Secret must be a non-empty string.'
      );
    });
  });

  describe('encrypt', () => {
    beforeEach(() => {
      cell.setSecret(SECRET);
    });

    it('should encrypt a plain object into an envelope', async () => {
      spyOn(crypto, 'getRandomValues').and.returnValue(new Uint8Array(12).fill(7));

      const data = { name: 'Ada' };
      const encrypted = await behavior.encryptState({} as any, data).catch((error: any) => {
        expect(error.message).toBe('this is an error');
      });

      expect(typeof encrypted).toBe('object');
      const env = encrypted as any;

      expect(env.alg).toBe('AES-256-GCM');
      expect(env.iv).toBeTruthy();
      expect(env.data).toBeTruthy();
      expect(env.v).toBe(1);

      // should NOT mutate input
      expect(data).toEqual({ name: 'Ada' });
    });

    it('should return raw value when encrypting undefined or null', async () => {
      expect(await behavior.encryptState({} as any, undefined)).toBeUndefined();
      expect(await behavior.encryptState({} as any, null)).toBeNull();
    });

    it('should fail-safe if encryption throws and return original value', async () => {
      spyOn(crypto.subtle, 'encrypt').and.throwError('boom');

      const input = { x: 1 };

      await expectAsync(behavior.encryptState({} as any, input)).toBeRejectedWithError('boom');
    });
  });

  describe('encrypt - no setSecret', () => {
    it('should throw if encryptState is called before setSecret', async () => {
      const data = { name: 'Ada' };

      await expectAsync(behavior.encryptState({} as any, data)).toBeRejectedWithError(
        '[NgVault] Cannot encrypt: AES secret not set. Call vault.setSecret("your secret") before state operations.'
      );
    });
  });

  describe('Decrypt', () => {
    beforeEach(() => {
      cell.setSecret(SECRET);
    });

    it('should decrypt an encrypted envelope back to original object', async () => {
      const source = { id: 3, name: 'Grace' };

      const encrypted = await behavior.encryptState({} as any, source).catch((error: any) => {
        expect(error.message).toBe('this is an error');
      });
      const decrypted = await behavior.decryptState({} as any, encrypted!).catch((error: any) => {
        expect(error.message).toBe('this is an error');
      });

      expect(decrypted).toEqual(source);
    });

    it('should skip decryption if value is undefined or null', async () => {
      expect(await behavior.decryptState({} as any, undefined)).toBeUndefined();
      expect(await behavior.decryptState({} as any, null)).toBeNull();
    });

    it('should skip decryption if payload is not an AES envelope', async () => {
      const raw = { not: 'encrypted' };
      await expectAsync(behavior.decryptState({} as any, raw)).toBeRejectedWithError(
        '[NgVault] Invalid encrypted envelope. Expected shape { v, alg: "AES-256-GCM", iv, data }.'
      );
    });

    it('should fail-safe and return encrypted value when decryption fails', async () => {
      // encrypted envelope, but decrypt throws
      spyOn(crypto.subtle, 'decrypt').and.throwError('bad decrypt');

      const fakeEnvelope = {
        v: 1,
        alg: 'AES-256-GCM',
        iv: 'AA==',
        data: 'BB=='
      };

      await expectAsync(behavior.decryptState({} as any, fakeEnvelope as any)).toBeRejectedWithError('bad decrypt');
    });

    it('should not throw on malformed Base64', async () => {
      const malformed = {
        v: 1,
        alg: 'AES-256-GCM',
        iv: '###FAIL###',
        data: '???'
      };

      await expectAsync(behavior.decryptState({} as any, malformed as any)).toBeRejectedWithError(
        `Failed to execute 'atob' on 'Window': The string to be decoded is not correctly encoded.`
      );
    });
  });

  describe('decrypt - no setSecret', () => {
    it('should throw if decryptState is called before setSecret', async () => {
      const data = { name: 'Ada' };

      await expectAsync(behavior.decryptState({} as any, data)).toBeRejectedWithError(
        '[NgVault] Cannot decrypt: AES secret not set. Call vault.setSecret("your secret") before state operations.'
      );
    });
  });

  describe('encrypt and decrypt', () => {
    beforeEach(() => {
      spyOn(crypto, 'getRandomValues').and.callFake(<T extends ArrayBufferView>(array: T): T => {
        const u8 = new Uint8Array(array.buffer, array.byteOffset, array.byteLength);
        u8.fill(9); // deterministic bytes
        return array;
      });
    });

    it('should round-trip encrypt → decrypt for a variety of values', async () => {
      cell.setSecret('mysecret');
      const testValues = [{ a: 1 }, [1, 2, 3], 'hello world', 12345, { deep: { nested: { value: true } } }];

      for (const val of testValues) {
        const enc = await behavior.encryptState({} as any, val as any).catch((error: any) => {
          expect(error.message).toBe('this is an error');
        });
        const dec = await behavior.decryptState({} as any, enc as any).catch((error: any) => {
          expect(error.message).toBe('this is an error');
        });

        expect(dec).toEqual(val);
      }
    });
  });
});
