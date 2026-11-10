/**
 * src/main.js — ENTRY POINT CHÍNH CỦA NOVAVERDE EV TYCOON (KIẾN TRÚC MODULAR)
 * Nạp tuần tự các tầng: Config -> Data -> Lang -> State -> Systems -> Render -> UI -> Net -> Debug
 */

import "./config/env.js";
import "./data/balance.js";
import "./data/amenity-catalog.js";
import "./data/charger-tiers.js";
import "./data/vehicle-models.js";
import "./data/events-catalog.js";
import "./data/map-data.js";
import "./data/lot-blueprints.js";
import "./data/skin-catalog.js";
import "./data/b2b-contracts.js";
import "./data/unlock-tree.js";

import "./lang/lang-pack.js";

import "./state/game-state.js";
import "./state/ui-state.js";
import "./state/calendar-state.js";
import "./state/network-state.js";

import "./systems/save-load.js";
import "./systems/calendar.js";
import "./systems/tax.js";
import "./systems/weather.js";
import "./systems/vehicle-spawn.js";
import "./systems/vehicle-physics.js";
import "./systems/economy.js";
import "./systems/offline-earnings.js";
import "./systems/lot-actions.js";
import "./systems/progression.js";
import "./systems/quest.js";

import "./render/iso-utils.js";
import "./render/camera.js";
import "./render/draw-ground.js";
import "./render/draw-environment.js";
import "./render/draw-buildings.js";
import "./render/draw-charger.js";
import "./render/draw-station.js";
import "./render/draw-vehicles.js";
import "./render/draw-minimap.js";
import "./render/render-loop.js";

import "./ui/hud.js";
import "./ui/lot-panel.js";
import "./ui/lot-list.js";
import "./ui/finance-tab.js";
import "./ui/multiplayer-tab.js";
import "./ui/shop-modal.js";
import "./ui/offline-modal.js";
import "./ui/progression-panel.js";

import "./net/leaderboard.js";
import "./net/websocket.js";

import { initDebugTools, tickDebugOverlay } from "./debug/debug-overlay.js";
globalThis.tickDebugOverlay = tickDebugOverlay;

function initGame() {
  resizeCanvas();
  let restored = false;
  try {
    const raw = localStorage.getItem(SAVE_STORAGE_KEY);
    if (raw) {
      const snap = JSON.parse(raw);
      if (applyLoadedSnapshot(snap)) {
        restored = true;
        const elapsedSec = Math.max(0, (Date.now() - (snap.lastSavedAt || Date.now())) / 1000);
        if (elapsedSec >= 25) {
          state.unclaimedOfflineRealSec = Math.max(state.unclaimedOfflineRealSec || 0, elapsedSec);
          const isOnTitle = Boolean(window.NovaVerdeMobileSDK && window.NovaVerdeMobileSDK.state && window.NovaVerdeMobileSDK.state.inTitleScreen);
          if (!isOnTitle) {
            setTimeout(() => {
              if (state.unclaimedOfflineRealSec >= 25) {
                const secToRun = state.unclaimedOfflineRealSec;
                state.unclaimedOfflineRealSec = 0;
                simulateServerOfflineProgress(secToRun);
              }
            }, 350);
          }
        }
      }
    }
  } catch (e) {
    console.warn("Load save error:", e);
  }

  state.isoView = true;
  const isoBtn = document.getElementById("btn-toggle-iso");
  if (isoBtn) isoBtn.classList.add("active-tool");
  updateWeatherState();
  applyLanguageStaticDOM();
  applySheetModeUI();
  zoomToLot(state.selectedLotId);
  refreshAllUI();

  // Kết nối WebSocket Multiplayer Server (hoặc kích hoạt Hybrid Room)
  connectMultiplayerWebSocket();

  // Đăng ký PWA Service Worker để hỗ trợ cài đặt App Mobile
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }

  logEvent(L("🌐 Chào mừng đến với Đại Đô Thị NovaVerde EV Tycoon (5.400 Lô • Tốc độ thực 1x • Đua Top BXH & Sàn Giao Dịch BĐS)!", "🌐 Welcome to NovaVerde Metropolis EV Tycoon (5,400 Lots • 1x Real-Time • Leaderboard & Dynamic Real Estate Market)!"));

  for (let i = 0; i < 8; i++) spawnEVOnMap();

  let lastTime = performance.now();
  function loop(now) {
    const dt = Math.min(0.1, (now - lastTime) / 1000);
    lastTime = now;
    updateSimulation(dt);
    drawCartoonMap();
        if (typeof tickDebugOverlay === 'function') tickDebugOverlay();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

window.addEventListener("beforeunload", () => {
  if (state.pendingOfflineReward && state.pendingOfflineReward > 0) {
    claimOfflineModal(false);
  } else {
    saveGameToStorage(false);
  }
});
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    state._lastHiddenAtMs = Date.now();
    if (state.pendingOfflineReward && state.pendingOfflineReward > 0) {
      claimOfflineModal(false);
    } else {
      saveGameToStorage(false);
    }
    // SEC-03: Tự động tạm dừng quảng cáo khi có cuộc gọi đến / thu nhỏ app / khóa màn hình
    if (activeAdWatchSession && !activeAdWatchSession.completed) {
      activeAdWatchSession.pausedByVisibility = true;
    }
  } else if (document.visibilityState === "visible") {
    if (activeAdWatchSession && activeAdWatchSession.pausedByVisibility) {
      activeAdWatchSession.pausedByVisibility = false;
      updateRewardedAdModalUI();
    }
    const nowMs = Date.now();
    const refMs = state._lastHiddenAtMs || state.lastSavedAt || nowMs;
    state._lastHiddenAtMs = 0;
    const awaySec = Math.max(0, (nowMs - refMs) / 1000);
    if (awaySec >= 25) {
      const isOnTitle = Boolean(window.NovaVerdeMobileSDK && window.NovaVerdeMobileSDK.state && window.NovaVerdeMobileSDK.state.inTitleScreen);
      if (isOnTitle) {
        state.unclaimedOfflineRealSec = Math.max(state.unclaimedOfflineRealSec || 0, awaySec);
      } else {
        simulateServerOfflineProgress(awaySec);
      }
    }
  }
});

globalThis.initGame = initGame;
initDebugTools();

// Trên Localhost Dev Server: tự động gỡ Service Worker cũ & xóa Cache để luôn nạp module mới nhất
if (typeof navigator !== "undefined" && "serviceWorker" in navigator && (location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
  navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister())).catch(() => {});
  if (typeof caches !== "undefined") {
    caches.keys().then(keys => keys.forEach(k => caches.delete(k))).catch(() => {});
  }
}

import("./net/mobile-sdk-bridge.js").catch((err) => {
  console.warn("[NovaVerde] Mobile SDK Bridge load warning:", err);
});
