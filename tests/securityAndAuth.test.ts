/**
 * Unit Test: Server-Side Cryptographic Token & Rate Limiter Security
 */

import { createAdminToken, verifyAdminToken } from '../lib/serverAuth';
import { checkServerRateLimit } from '../lib/serverRateLimit';

export async function runSecurityAndAuthTests() {
  console.log('🧪 Starting Security, HMAC-SHA256 Token & Rate Limiter Tests...');

  // Test 1: Generate valid admin token
  const token = await createAdminToken('admin');
  if (!token || token.split('.').length !== 3) {
    throw new Error('Token generation failed format check');
  }
  console.log('  ✅ Admin token successfully created with HS256 signature.');

  // Test 2: Verify valid token
  const verified = await verifyAdminToken(token);
  if (!verified || verified.sub !== 'admin' || verified.role !== 'satgas_admin') {
    throw new Error('Valid token verification failed');
  }
  console.log('  ✅ Token cryptographically verified (HMAC-SHA256 intact).');

  // Test 3: Tampered Token Detection (Anti-Spoofing)
  const tamperedToken = token.slice(0, -6) + 'XXXXXX';
  const tamperedResult = await verifyAdminToken(tamperedToken);
  if (tamperedResult !== null) {
    throw new Error('Security flaw: Tampered token was accepted!');
  }
  console.log('  ✅ Tampered token successfully rejected (Signature mismatch detected).');

  // Test 4: Rate Limiter Enforcement
  const testKey = `test_rate_key_${Date.now()}`;
  for (let i = 0; i < 3; i++) {
    const res = checkServerRateLimit(testKey, 3, 5000);
    if (!res.success) throw new Error(`Request ${i} should be permitted`);
  }

  // 4th request must be blocked
  const blockedRes = checkServerRateLimit(testKey, 3, 5000);
  if (blockedRes.success || blockedRes.remaining !== 0) {
    throw new Error('Rate limiter failed to block excessive requests');
  }
  console.log('  ✅ Rate limiter correctly throttled excessive requests (429 Protection active).');

  console.log('🛡️ All Security & Cryptographic Token Tests Passed!\n');
}
