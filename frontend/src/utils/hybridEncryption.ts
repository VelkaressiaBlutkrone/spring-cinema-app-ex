/**
 * Hybrid Encryption (RSA-OAEP + AES-256-GCM)
 * - 클라이언트 → 서버 민감 데이터 암호화 (비밀번호, 개인정보 등)
 * - 서버 공개키(/api/public-key)로 AES 키 암호화, AES-GCM으로 payload 암호화
 */

const RSA_ALG = 'RSA-OAEP';
const AES_ALG = 'AES-GCM';
const AES_KEY_LEN = 256;
const GCM_IV_LEN = 12;
const GCM_TAG_LEN = 128;

export interface EncryptedPayload {
  encryptedKey: string;
  iv: string;
  encryptedData: string;
}

/**
 * PEM 공개키 문자열 → CryptoKey (SPKI)
 */
async function importPublicKeyFromPem(pem: string): Promise<CryptoKey> {
  const stripped = pem
    .replaceAll('-----BEGIN PUBLIC KEY-----', '')
    .replaceAll('-----END PUBLIC KEY-----', '')
    .replaceAll(/\s/g, '');
  const s = atob(stripped);
  const bin = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) bin[i] = (s.codePointAt(i) ?? 0) & 0xff;
  return crypto.subtle.importKey('spki', bin, { name: RSA_ALG, hash: 'SHA-1' }, false, ['encrypt']);
}

/**
 * 무작위 바이트 배열 생성
 */
function randomBytes(len: number): Uint8Array {
  const buf = new Uint8Array(len);
  crypto.getRandomValues(buf);
  return buf;
}

/**
 * ArrayBuffer | Uint8Array → Base64
 */
function toBase64(buf: ArrayBuffer | Uint8Array): string {
  const u = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let b = '';
  for (const x of u) b += String.fromCodePoint(x);
  return btoa(b);
}

/**
 * 평문(UTF-8) JSON 객체를 EncryptedPayload로 암호화
 * - publicKeyPem: /api/public-key 응답의 publicKeyPem
 */
export async function encryptPayload(
  publicKeyPem: string,
  plain: Record<string, unknown>
): Promise<EncryptedPayload> {
  const publicKey = await importPublicKeyFromPem(publicKeyPem);
  const rawAesKey = randomBytes(AES_KEY_LEN / 8);
  const iv = randomBytes(GCM_IV_LEN);

  const plainText = new TextEncoder().encode(JSON.stringify(plain));
  const plainBuffer = new Uint8Array(plainText).buffer;
  const ivBuffer = new Uint8Array(iv).buffer;
  const rawAesKeyBuffer = new Uint8Array(rawAesKey).buffer;

  const aesKey = await crypto.subtle.importKey(
    'raw',
    rawAesKeyBuffer,
    { name: AES_ALG, length: AES_KEY_LEN },
    false,
    ['encrypt']
  );

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: AES_ALG,
      iv: ivBuffer,
      tagLength: GCM_TAG_LEN,
    },
    aesKey,
    plainBuffer
  );

  const encryptedKey = await crypto.subtle.encrypt(
    { name: RSA_ALG },
    publicKey,
    rawAesKeyBuffer
  );

  return {
    encryptedKey: toBase64(encryptedKey),
    iv: toBase64(iv),
    encryptedData: toBase64(ciphertext),
  };
}
