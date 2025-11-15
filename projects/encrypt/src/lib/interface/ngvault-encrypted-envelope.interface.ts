export interface VaultEncryptedEnvelope {
  v: number; // version
  iv: string; // base64 IV
  data: string; // base64 ciphertext
  alg: 'AES-256-GCM';
}
