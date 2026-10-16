/**
 * Integration Test for Report Upload & Forensic Classification Flow
 */

import { analyzeVideoForensics, analyzeAudioForensics } from '../lib/mediaForensics';
import { analyzeImageForensics } from '../lib/crypto';

export async function runReportUploadIntegrationTests() {
  console.log('🧪 Starting Report Upload Forensic Integration Tests...');

  // Test 1: Uploading mixed media files (Image, Video, Audio)
  const imageBuf = new TextEncoder().encode('EXIF Apple iPhone 14 Pro camera').buffer;
  const imageFile = new File(['dummy'], 'evidence1.jpg', { type: 'image/jpeg' });
  const imgStatus = analyzeImageForensics(imageFile, imageBuf);

  const videoBuf = new TextEncoder().encode('sora.openai.com synthetic video').buffer;
  const videoFile = new File(['dummy'], 'evidence2.mp4', { type: 'video/mp4' });
  const vidStatus = analyzeVideoForensics(videoFile, videoBuf);

  const audioBuf = new TextEncoder().encode('elevenlabs synthetic voice').buffer;
  const audioFile = new File(['dummy'], 'evidence3.mp3', { type: 'audio/mpeg' });
  const audStatus = analyzeAudioForensics(audioFile, audioBuf);

  if (imgStatus.status !== 'Original') {
    throw new Error(`Expected Original for iPhone photo, got ${imgStatus.status}`);
  }

  if (vidStatus.status !== 'Manipulated') {
    throw new Error(`Expected Manipulated for Sora video, got ${vidStatus.status}`);
  }

  if (audStatus.status !== 'Manipulated') {
    throw new Error(`Expected Manipulated for ElevenLabs voice, got ${audStatus.status}`);
  }

  console.log('✅ Upload Integration Test Passed: All media files categorized correctly.');
}
