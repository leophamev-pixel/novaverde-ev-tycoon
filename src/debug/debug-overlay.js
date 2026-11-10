/**
 * src/debug/debug-overlay.js
 * Hệ thống Debug & Developer Test Panel (Bước 0.4 của Báo cáo)
 * - CHỈ KÍCH HOẠT KHI CHẠY LOCALHOST (localhost / 127.0.0.1) — tự động ẩn hoàn toàn trên bản Publish/Store
 * - Cung cấp nút "🛠️ DEV TEST" góc trái trên màn hình & phím tắt Ctrl+D để test nhanh mọi tính năng
 */

import { ENV_CONFIG } from "../config/env.js";

let debugEnabled = false;
let fpsFrames = 0;
let fpsLastTime = performance.now();
let currentFps = 60;
let overlayEl = null;
let statsBoxEl = null;
let togglePillEl = null;

export function isDebugAllowed() {
  if (typeof window === "undefined" || !window.location) return false;
  const host = window.location.hostname || "";
  return host === "localhost" || host === "127.0.0.1";
}

export function runDevTestAction(action) {
  if (!isDebugAllowed() || !globalThis.state) return;
  const st = globalThis.state;

  if (action === "offline_1h") {
    if (typeof globalThis.simulateServerOfflineProgress === "function") {
      globalThis.simulateServerOfflineProgress(3600);
    }
  } else if (action === "offline_2m") {
    if (typeof globalThis.simulateServerOfflineProgress === "function") {
      globalThis.simulateServerOfflineProgress(120);
    }
  } else if (action === "add_money") {
    st.money = (st.money || 0) + 500000000; // +500,000 G$
    if (typeof globalThis.playSfx === "function") globalThis.playSfx("cash");
    if (typeof globalThis.refreshAllUI === "function") globalThis.refreshAllUI();
    if (typeof globalThis.saveGameToStorage === "function") globalThis.saveGameToStorage(false);
    if (typeof globalThis.logEvent === "function") {
      globalThis.logEvent("🛠️ [DEV TEST] Đã cộng +500,000 G$ vào quỹ tiền mặt!");
    }
  } else if (action === "add_gc") {
    st.greenCoins = (st.greenCoins || 0) + 200; // +200 GC
    if (typeof globalThis.playSfx === "function") globalThis.playSfx("cash");
    if (typeof globalThis.updateGreenCoinHUD === "function") globalThis.updateGreenCoinHUD();
    if (typeof globalThis.refreshAllUI === "function") globalThis.refreshAllUI();
    if (typeof globalThis.saveGameToStorage === "function") globalThis.saveGameToStorage(false);
    if (typeof globalThis.logEvent === "function") {
      globalThis.logEvent("🛠️ [DEV TEST] Đã cộng +200 GC vào ví GreenCoin!");
    }
  } else if (action === "next_hour") {
    st.simMinute = (st.simMinute || 0) + 360;
    if (st.simMinute >= 1440) {
      st.simMinute -= 1440;
      if (typeof globalThis.processDailyDebtAndCalendar === "function") {
        globalThis.processDailyDebtAndCalendar();
      }
    }
    if (typeof globalThis.updateWeatherState === "function") globalThis.updateWeatherState();
    if (typeof globalThis.refreshAllUI === "function") globalThis.refreshAllUI();
  } else if (action === "next_month") {
    if (typeof globalThis.processMonthlyBilling === "function") {
      globalThis.processMonthlyBilling();
    }
    if (typeof globalThis.refreshAllUI === "function") globalThis.refreshAllUI();
  } else if (action === "reset") {
    if (typeof globalThis.resetAllSaveData === "function") {
      globalThis.resetAllSaveData();
    }
  }
}

globalThis.runDevTestAction = runDevTestAction;

export function initDebugTools() {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (!isDebugAllowed()) return;

  // Tạo nút tròn nhỏ "🛠️ DEV" ở góc trái dưới thanh HUD để bật/tắt nhanh trên Mac/Mobile
  if (!togglePillEl && document.body) {
    togglePillEl = document.createElement("button");
    togglePillEl.id = "nv-dev-toggle-pill";
    togglePillEl.innerHTML = "🛠️ DEV TEST";
    togglePillEl.style.cssText = [
      "position:fixed",
      "top:76px",
      "left:10px",
      "z-index:99998",
      "background:linear-gradient(135deg,#0f172a,#1e293b)",
      "color:#38bdf8",
      "border:1.5px solid #38bdf8",
      "border-radius:99px",
      "padding:4px 10px",
      "font:800 10px/1.2 system-ui,sans-serif",
      "cursor:pointer",
      "box-shadow:0 4px 12px rgba(0,0,0,0.45)"
    ].join(";");
    togglePillEl.onclick = () => enableDebugOverlay(!debugEnabled);
    document.body.appendChild(togglePillEl);
  }

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("debug") === "1") {
    enableDebugOverlay(true);
  }

  window.addEventListener("keydown", (e) => {
    if (!e.ctrlKey) return;
    const key = (e.key || "").toLowerCase();
    if (key === "d") {
      e.preventDefault();
      enableDebugOverlay(!debugEnabled);
    } else if (debugEnabled && key === "m") {
      e.preventDefault();
      runDevTestAction("add_money");
    } else if (debugEnabled && key === "t") {
      e.preventDefault();
      runDevTestAction("next_hour");
    }
  });
}

export function enableDebugOverlay(show) {
  debugEnabled = Boolean(show);
  if (!overlayEl && typeof document !== "undefined" && document.body) {
    overlayEl = document.createElement("div");
    overlayEl.id = "nv-debug-overlay";
    overlayEl.style.cssText = [
      "position:fixed",
      "top:106px",
      "left:10px",
      "z-index:99999",
      "width:250px",
      "background:rgba(15,23,42,0.95)",
      "color:#e2e8f0",
      "border:1.5px solid #38bdf8",
      "border-radius:12px",
      "padding:10px",
      "font:600 11px/1.45 monospace",
      "box-shadow:0 12px 28px rgba(0,0,0,0.55)",
      "display:none"
    ].join(";");

    overlayEl.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;border-bottom:1px solid #334155;padding-bottom:4px;">
        <span style="color:#facc15;font-weight:900;">🛠️ BẢNG TEST DEV (LOCAL)</span>
        <span style="cursor:pointer;color:#94a3b8;font-weight:900;padding:0 4px;" onclick="document.getElementById('nv-debug-overlay').style.display='none'">✕</span>
      </div>
      <div id="nv-debug-stats-box" style="margin-bottom:8px;color:#38bdf8;font-size:10.5px;"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;">
        <button onclick="window.runDevTestAction('offline_1h')" style="background:#059669;color:#fff;border:1px solid #34d399;border-radius:6px;padding:5px 4px;font:800 9.5px system-ui;cursor:pointer;">⏱️ Test Offline 1h</button>
        <button onclick="window.runDevTestAction('offline_2m')" style="background:#0d9488;color:#fff;border:1px solid #5eead4;border-radius:6px;padding:5px 4px;font:800 9.5px system-ui;cursor:pointer;">⏱️ Test Offline 2p</button>
        <button onclick="window.runDevTestAction('add_money')" style="background:#2563eb;color:#fff;border:1px solid #60a5fa;border-radius:6px;padding:5px 4px;font:800 9.5px system-ui;cursor:pointer;">💵 +500,000 G$</button>
        <button onclick="window.runDevTestAction('add_gc')" style="background:#7c3aed;color:#fff;border:1px solid #c084fc;border-radius:6px;padding:5px 4px;font:800 9.5px system-ui;cursor:pointer;">🪙 +200 GC</button>
        <button onclick="window.runDevTestAction('next_hour')" style="background:#d97706;color:#fff;border:1px solid #fcd34d;border-radius:6px;padding:5px 4px;font:800 9.5px system-ui;cursor:pointer;">☀️ Tua +6 Giờ</button>
        <button onclick="window.runDevTestAction('next_month')" style="background:#e11d48;color:#fff;border:1px solid #fda4af;border-radius:6px;padding:5px 4px;font:800 9.5px system-ui;cursor:pointer;">📅 Quyết toán Tháng</button>
      </div>
    `;
    document.body.appendChild(overlayEl);
    statsBoxEl = document.getElementById("nv-debug-stats-box");
  }
  if (overlayEl) {
    overlayEl.style.display = debugEnabled ? "block" : "none";
  }
}

export function tickDebugOverlay() {
  if (!debugEnabled || !statsBoxEl) return;
  fpsFrames++;
  const now = performance.now();
  if (now - fpsLastTime >= 400) {
    currentFps = Math.round((fpsFrames * 1000) / (now - fpsLastTime));
    fpsFrames = 0;
    fpsLastTime = now;

    const st = globalThis.state || {};
    const cars = Array.isArray(globalThis.roadCars) ? globalThis.roadCars.length : 0;
    const lots = Array.isArray(st.lots) ? st.lots : [];
    let ownedCount = 0;
    let chargingBays = 0;
    let totalBays = 0;
    for (const l of lots) {
      if (l.owned) {
        ownedCount++;
        for (const b of l.bays || []) {
          totalBays++;
          if (b.car) chargingBays++;
        }
      }
    }
    const cam = globalThis.camera || { x: 0, y: 0, zoom: 1 };
    const moneyG = Math.round((st.money || 0) / 1000);

    statsBoxEl.innerHTML = [
      `<div>• FPS: <b style="color:#4ade80">${currentFps}</b> | Số dư: <b style="color:#fde047">${moneyG.toLocaleString()} G$</b></div>`,
      `<div>• Xe đang chạy: <b>${cars}</b> | Đang sạc: <b>${chargingBays}/${totalBays} trụ</b></div>`,
      `<div>• Lô sở hữu: <b>${ownedCount}/5400</b> | Lô chọn: <b>#${st.selectedLotId || 1}</b></div>`,
      `<div>• Camera: <b>x=${Math.round(cam.x)}, y=${Math.round(cam.y)}, z=${(cam.zoom || 1).toFixed(2)}</b></div>`
    ].join("");
  }
}
