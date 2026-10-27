/**
 * Server-Side Cryptographic Authentication & Token Verification
 * Menggunakan Web Crypto API (HMAC-SHA256) yang kompatibel penuh dengan Next.js Edge Middleware & Node.js Runtime.
 */

const TOKEN_SECRET = process.env.ADMIN_JWT_SECRET || 'ruangaman-satgas-secure-hmac-key-2026-very-confidential';
const TOKEN_MAX_AGE_SECONDS = 8 * 60 * 60; // 8 Jam Sesi Aktif

export interface AdminTokenPayload {
  sub: string;
  role: 'satgas_admin';
  iat: number;
  exp: number;
}

// Helper base64url encode/decode
function base64UrlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(base64Url: string): string {
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

async function getHmacKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(TOKEN_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/**
 * Buat Signed Admin Token dengan masa berlaku 8 jam
 */
export async function createAdminToken(username: string = 'admin'): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: AdminTokenPayload = {
    sub: username,
    role: 'satgas_admin',
    iat: now,
    exp: now + TOKEN_MAX_AGE_SECONDS,
  };

  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const key = await getHmacKey();
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(dataToSign));

  let signatureBinary = '';
  const signatureBytes = new Uint8Array(signatureBuffer);
  for (let i = 0; i < signatureBytes.byteLength; i++) {
    signatureBinary += String.fromCharCode(signatureBytes[i]);
  }
  const encodedSignature = btoa(signatureBinary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  return `${dataToSign}.${encodedSignature}`;
}

/**
 * Verifikasi Integritas Kriptografis Token & Validitas Waktu Kedaluwarsa
 */
export async function verifyAdminToken(token?: string | null): Promise<AdminTokenPayload | null> {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const dataToVerify = `${encodedHeader}.${encodedPayload}`;

  try {
    const key = await getHmacKey();

    let sigBase64 = encodedSignature.replace(/-/g, '+').replace(/_/g, '/');
    while (sigBase64.length % 4) {
      sigBase64 += '=';
    }
    const sigBinary = atob(sigBase64);
    const sigBytes = new Uint8Array(sigBinary.length);
    for (let i = 0; i < sigBinary.length; i++) {
      sigBytes[i] = sigBinary.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      new TextEncoder().encode(dataToVerify)
    );

    if (!isValid) return null;

    const payloadJson = base64UrlDecode(encodedPayload);
    const payload: AdminTokenPayload = JSON.parse(payloadJson);

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      // Token expired
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
