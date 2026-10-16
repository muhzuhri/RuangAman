// Script pembantu untuk mendiagnosis Bot Telegram RuangAman
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('🔍 Memeriksa konfigurasi Telegram RuangAman...');

  // Baca .env.local
  const envPath = path.resolve(process.cwd(), '.env.local');
  let botToken = '';
  let chatId = '';

  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const tokenMatch = envContent.match(/TELEGRAM_BOT_TOKEN\s*=\s*([^\r\n]+)/);
    const chatMatch = envContent.match(/TELEGRAM_CHAT_ID\s*=\s*([^\r\n]+)/);
    if (tokenMatch) botToken = tokenMatch[1].trim();
    if (chatMatch) chatId = chatMatch[1].trim();
  }

  console.log(`Bot Token: ${botToken ? botToken.slice(0, 10) + '...' : '(KOSONG)'}`);
  console.log(`Chat ID saat ini: ${chatId || '(KOSONG)'}`);

  if (!botToken) {
    console.error('❌ TELEGRAM_BOT_TOKEN belum diisi di .env.local!');
    return;
  }

  // 1. Tes getMe
  console.log('\n[1/3] Menguji keabsahan Bot Token...');
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/getMe`, {
      signal: AbortSignal.timeout(20000),
    });
    const data = await res.json();
    if (data.ok) {
      console.log(`✅ Bot Token VALID!`);
      console.log(`   Nama Bot: ${data.result.first_name}`);
      console.log(`   Username: @${data.result.username}`);
      console.log(`   Link Bot: https://t.me/${data.result.username}`);
    } else {
      console.error(`❌ Bot Token TIDAK VALID: ${data.description}`);
      return;
    }
  } catch (err) {
    console.error('❌ Gagal menghubungi Telegram API:', err.message);
    return;
  }

  // 2. Cek pesan terbaru dari getUpdates
  console.log('\n[2/3] Memeriksa interaksi terbaru via getUpdates...');
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates`, {
      signal: AbortSignal.timeout(20000),
    });
    const data = await res.json();
    if (data.ok && data.result && data.result.length > 0) {
      console.log(`✅ Ditemukan ${data.result.length} riwayat pesan:`);
      const detectedChats = new Map();
      for (const update of data.result) {
        const msg = update.message || update.channel_post || update.my_chat_member;
        if (msg && msg.chat) {
          const c = msg.chat;
          const key = c.id.toString();
          if (!detectedChats.has(key)) {
            detectedChats.set(key, {
              id: c.id,
              type: c.type,
              title: c.title || `${c.first_name || ''} ${c.last_name || ''}`.trim() || c.username || 'Tanpa Nama',
              username: c.username || '-',
            });
          }
        }
      }

      console.log('\n📋 DAFTAR CHAT ID YANG TERDETEKSI:');
      for (const [id, info] of detectedChats.entries()) {
        console.log(`👉 ID: ${info.id}`);
        console.log(`   Nama: ${info.title} (${info.type})`);
        console.log(`   Username: ${info.username}`);
        console.log(`   Rekomendasi di .env.local -> TELEGRAM_CHAT_ID=${info.id}\n`);
      }
    } else {
      console.log('ℹ️ Belum ada pesan/interaksi yang masuk ke bot.');
      console.log('💡 CARA MENDAPATKAN CHAT ID:');
      console.log('   1. Buka Telegram dan cari bot: @ruangaman_alert_bot');
      console.log('   2. Klik START atau kirim pesan "halo"');
      console.log('   3. (Atau) Tambahkan bot ke grup Satgas Anda dan ketik "halo" di grup');
      console.log('   4. Jalankan ulang script ini: node scripts/find-telegram-chat.mjs');
    }
  } catch (err) {
    console.error('❌ Gagal memeriksa getUpdates:', err.message);
  }

  // 3. Tes kirim pesan ke Chat ID saat ini
  if (chatId) {
    console.log(`\n[3/3] Mencoba mengirim pesan tes ke Chat ID: ${chatId}...`);
    try {
      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: '🔔 <b>Tes Notifikasi RuangAman</b>\nKoneksi bot Telegram Satgas berhasil terhubung!',
          parse_mode: 'HTML',
        }),
        signal: AbortSignal.timeout(20000),
      });
      const data = await res.json();
      if (data.ok) {
        console.log('🎉 SUKSES! Pesan tes berhasil terkirim ke Telegram!');
      } else {
        console.error(`⚠️ Gagal mengirim pesan ke Chat ID ${chatId}:`);
        console.error(`   Error: ${data.description}`);
        if (data.description?.includes('chat not found')) {
          console.log('\n💡 PENYEBAB "chat not found":');
          console.log('   - Jika ke akun pribadi: Anda belum menekan START di bot @ruangaman_alert_bot.');
          console.log('   - Jika ke grup: Bot belum dimasukkan ke grup tersebut.');
          console.log('   - Format ID grup supergroup Telegram umumnya diawali -100 (misal: -100' + chatId.replace(/^-/, '') + ')');
        }
      }
    } catch (err) {
      console.error('❌ Gagal saat mengirim pesan tes:', err.message);
    }
  }
}

main().catch(console.error);
