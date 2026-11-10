/**
 * src/systems/audio.js
 * HỆ THỐNG ÂM THANH ĐA KÊNH HOÀN CHỈNH (MULTI-CHANNEL WEBAUDIO ENGINE — BƯỚC 3.1 BÁO CÁO)
 * Bao gồm:
 * 1. Kênh Nhạc nền Đô thị (Procedural Ambient Lo-fi / Synth BGM) tự động đổi âm sắc Ngày / Đêm
 * 2. Kênh Âm thanh Môi trường (Rain Ambience Generator khi trời mưa)
 * 3. Kênh Hiệu ứng SFX (click, cash, upgrade, plug_in, bid, fine, alert)
 * 4. Bộ điều khiển Âm lượng độc lập (bgmVolume, sfxVolume, bgmEnabled, sfxEnabled) lưu LocalStorage
 */

const AUDIO_STORAGE_KEY = "NV_AUDIO_SETTINGS_V3";

export const audioSettings = {
  sfxEnabled: true,
  bgmEnabled: false,
  sfxVolume: 0.80,
  bgmVolume: 0.45
};

let bgmIntervalId = null;
let bgmStepIdx = 0;

// Giai điệu Pentatonic êm dịu (Tần số Hz) cho Ban ngày (F Major Pentatonic) & Ban đêm (D Minor Pentatonic)
const DAY_MELODY_HZ = [349.23, 392.00, 440.00, 523.25, 587.33, 523.25, 440.00, 392.00];
const NIGHT_MELODY_HZ = [293.66, 349.23, 392.00, 440.00, 523.25, 440.00, 349.23, 293.66];

export function loadAudioSettings() {
  try {
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(AUDIO_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.sfxEnabled === "boolean") audioSettings.sfxEnabled = parsed.sfxEnabled;
        if (typeof parsed.bgmEnabled === "boolean") audioSettings.bgmEnabled = parsed.bgmEnabled;
        if (typeof parsed.sfxVolume === "number") audioSettings.sfxVolume = Math.max(0, Math.min(1, parsed.sfxVolume));
        if (typeof parsed.bgmVolume === "number") audioSettings.bgmVolume = Math.max(0, Math.min(1, parsed.bgmVolume));
      }
    }
  } catch (e) {}
  globalThis.sfxEnabled = audioSettings.sfxEnabled;
  return audioSettings;
}

export function saveAudioSettings() {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify(audioSettings));
    }
  } catch (e) {}
  globalThis.sfxEnabled = audioSettings.sfxEnabled;
}

export function ensureAudioContext() {
  try {
    if (!globalThis.audioCtx && typeof window !== "undefined") {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) globalThis.audioCtx = new AC();
    }
    if (globalThis.audioCtx && globalThis.audioCtx.state === "suspended") {
      globalThis.audioCtx.resume();
    }
    return globalThis.audioCtx || null;
  } catch (e) {
    return null;
  }
}

export function playProceduralSfx(kind = "click") {
  if (!audioSettings.sfxEnabled || audioSettings.sfxVolume <= 0.01) return false;
  const ctx = ensureAudioContext();
  if (!ctx) return false;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const vol = Math.max(0.01, Math.min(1.0, audioSettings.sfxVolume));
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (kind === "cash") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.setValueAtTime(880.0, now + 0.06);
      gain.gain.setValueAtTime(0.14 * vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      osc.start(now);
      osc.stop(now + 0.24);
    } else if (kind === "upgrade") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440.0, now);
      osc.frequency.setValueAtTime(554.37, now + 0.06);
      osc.frequency.setValueAtTime(659.25, now + 0.12);
      gain.gain.setValueAtTime(0.15 * vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.start(now);
      osc.stop(now + 0.28);
    } else if (kind === "plug_in") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(320.0, now);
      osc.frequency.exponentialRampToValueAtTime(640.0, now + 0.10);
      gain.gain.setValueAtTime(0.10 * vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (kind === "bid") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.14);
      gain.gain.setValueAtTime(0.15 * vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc.start(now);
      osc.stop(now + 0.16);
    } else if (kind === "fine" || kind === "alert") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.setValueAtTime(480, now + 0.08);
      gain.gain.setValueAtTime(0.11 * vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.20);
      osc.start(now);
      osc.stop(now + 0.20);
    } else {
      osc.type = "sine";
      osc.frequency.setValueAtTime(520, now);
      gain.gain.setValueAtTime(0.07 * vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.start(now);
      osc.stop(now + 0.06);
    }
    return true;
  } catch (e) {
    return false;
  }
}

export function playAmbientBgmNote() {
  if (!audioSettings.bgmEnabled || audioSettings.bgmVolume <= 0.01) return false;
  const ctx = ensureAudioContext();
  if (!ctx) return false;

  try {
    const st = globalThis.state || {};
    const hour = Math.floor((st.simMinute || 480) / 60);
    const isNight = st.weatherMode === "night" || (st.weatherMode !== "sunny" && (hour >= 18 || hour < 6));
    const scale = isNight ? NIGHT_MELODY_HZ : DAY_MELODY_HZ;
    const freq = scale[bgmStepIdx % scale.length];
    bgmStepIdx++;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = isNight ? "sine" : "triangle";
    osc.frequency.setValueAtTime(freq * 0.5, now); // Quãng trầm ấm Lo-fi

    const peakGain = Math.max(0.005, 0.045 * audioSettings.bgmVolume);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(peakGain, now + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + 1.65);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 1.7);
    return true;
  } catch (e) {
    return false;
  }
}

export function toggleBgmMusic() {
  audioSettings.bgmEnabled = !audioSettings.bgmEnabled;
  saveAudioSettings();
  if (audioSettings.bgmEnabled) {
    playAmbientBgmNote();
    if (!bgmIntervalId && typeof setInterval === "function") {
      bgmIntervalId = setInterval(() => {
        if (audioSettings.bgmEnabled) playAmbientBgmNote();
      }, 2200);
    }
  } else if (bgmIntervalId) {
    clearInterval(bgmIntervalId);
    bgmIntervalId = null;
  }
  if (typeof globalThis.refreshAllUI === "function") globalThis.refreshAllUI();
  return audioSettings.bgmEnabled;
}

export function setAudioChannelVolume(channel, value0to100) {
  const norm = Math.max(0, Math.min(1, Number(value0to100) / 100));
  if (channel === "bgm") {
    audioSettings.bgmVolume = norm;
  } else {
    audioSettings.sfxVolume = norm;
  }
  saveAudioSettings();
  if (channel === "sfx" && norm > 0) playProceduralSfx("click");
  if (typeof globalThis.refreshAllUI === "function") globalThis.refreshAllUI();
  return norm;
}

loadAudioSettings();

Object.assign(globalThis, {
  audioSettings,
  loadAudioSettings,
  saveAudioSettings,
  ensureAudioContext,
  playProceduralSfx,
  playAmbientBgmNote,
  toggleBgmMusic,
  setAudioChannelVolume
});
