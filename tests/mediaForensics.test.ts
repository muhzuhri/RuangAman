/**
 * Unit Tests for Video & Audio Digital Forensics & Metadata Stripping
 */

import {
  analyzeVideoForensics,
  analyzeAudioForensics,
  stripMetadataFromVideo,
  stripMetadataFromAudio,
} from '../lib/mediaForensics';

export async function runMediaForensicTests() {
  console.log('🧪 Starting Media Forensic Unit Tests...');

  // Test 1: Video with Sora AI synthetic marker
  const fakeSoraBuffer = new TextEncoder().encode(
    'ftypmp42... sora.openai.com generated_video metadata...'
  ).buffer;
  const soraFile = new File(['dummy'], 'sora_sample.mp4', { type: 'video/mp4' });
  const soraResult = analyzeVideoForensics(soraFile, fakeSoraBuffer);

  if (soraResult.status !== 'Manipulated') {
    throw new Error(`Expected 'Manipulated' for Sora video, got ${soraResult.status}`);
  }
  console.log('✅ Test 1 Passed: AI Video (Sora) correctly flagged as Manipulated.');

  // Test 2: Clean Video Header
  const cleanVideoBuf = new TextEncoder().encode(
    'ftypisom avc1 Apple iPhone 15 Pro H.264 video stream'
  ).buffer;
  const cleanVideoFile = new File(['dummy'], 'normal_video.mp4', { type: 'video/mp4' });
  const cleanVideoResult = analyzeVideoForensics(cleanVideoFile, cleanVideoBuf);

  if (cleanVideoResult.status !== 'Original') {
    throw new Error(`Expected 'Original' for clean video, got ${cleanVideoResult.status}`);
  }
  console.log('✅ Test 2 Passed: Clean video stream recognized as Original.');

  // Test 3: Audio with ElevenLabs synthetic voice marker
  const fakeElevenLabsBuf = new TextEncoder().encode(
    'ID3... elevenlabs voice_clone synthetic_audio output'
  ).buffer;
  const elevenLabsFile = new File(['dummy'], 'voice_elevenlabs.mp3', { type: 'audio/mpeg' });
  const elevenLabsResult = analyzeAudioForensics(elevenLabsFile, fakeElevenLabsBuf);

  if (elevenLabsResult.status !== 'Manipulated') {
    throw new Error(`Expected 'Manipulated' for ElevenLabs audio, got ${elevenLabsResult.status}`);
  }
  console.log('✅ Test 3 Passed: AI Voice (ElevenLabs) correctly flagged as Manipulated.');

  // Test 4: Clean Audio Stream
  const cleanAudioBuf = new TextEncoder().encode('RIFF....WAVEfmt ....data...').buffer;
  const cleanAudioFile = new File(['dummy'], 'recording.wav', { type: 'audio/wav' });
  const cleanAudioResult = analyzeAudioForensics(cleanAudioFile, cleanAudioBuf);

  if (cleanAudioResult.status !== 'Original') {
    throw new Error(`Expected 'Original' for clean audio, got ${cleanAudioResult.status}`);
  }
  console.log('✅ Test 4 Passed: Clean audio recording recognized as Original.');

  // Test 5: Metadata Stripping for Video & Audio
  const videoStrip = await stripMetadataFromVideo(soraFile);
  if (!videoStrip.cleanFile || !videoStrip.stripped) {
    throw new Error('Video metadata stripping failed.');
  }
  console.log('✅ Test 5 Passed: Video metadata stripping returned cleaned file.');

  const audioStrip = await stripMetadataFromAudio(elevenLabsFile);
  if (!audioStrip.cleanFile || !audioStrip.stripped) {
    throw new Error('Audio metadata stripping failed.');
  }
  console.log('✅ Test 6 Passed: Audio ID3 metadata stripping returned cleaned file.');

  console.log('🎉 All 6 Media Forensic Unit Tests Passed Successfully!');
}
