/**
 * RuangAman Master Test Runner
 * Menjalankan seluruh pengujian integrasi forensik, kriptografi, Telegram dispatch, dan keamanan server.
 */

import { runMediaForensicTests } from './mediaForensics.test';
import { runReportUploadIntegrationTests } from './reportUpload.test';
import { runSecurityAndAuthTests } from './securityAndAuth.test';

async function main() {
  console.log('====================================================');
  console.log('   RUANGAMAN AUTOMATED TEST & VERIFICATION SUITE    ');
  console.log('====================================================\n');

  try {
    await runSecurityAndAuthTests();
    await runMediaForensicTests();
    await runReportUploadIntegrationTests();

    console.log('\n====================================================');
    console.log('🎉 100% ALL INTEGRATION & SECURITY TESTS PASSED!    ');
    console.log('====================================================');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ TEST FAILED:', error?.message || error);
    process.exit(1);
  }
}

main();
