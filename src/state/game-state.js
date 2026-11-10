/**
 * src/state/game-state.js
 * Quản lý trạng thái gốc của Game, Tiền tệ, Danh sách 150 Lô đất & Event Bus
 */
import { createInitialLots } from "../data/lot-blueprints.js";
import { STATION_SKINS_CATALOG } from "../data/skin-catalog.js";

export function createDefaultState() {
  return {
    money: 65000000, // 65,000 GreenDollar (G$)
    greenCoins: 250, // 250 GreenCoin (GC) khởi đầu để sử dụng Tools, mua Vật phẩm & Skin
    ownedItems: {},
    ownedSkins: { skin_emerald: true },
    equippedSkin: "skin_emerald",
    year: 1,
    month: 1,
    dayOfMonth: 1,
    totalDaysElapsed: 1,
    simMinute: 8 * 60,
    gameSpeed: 1,
    isoView: true, // Mặc định bật góc chiếu Isometric 2.5D Xoay Nghiêng như ảnh mẫu!
    weatherMode: "auto",
    isRaining: false,
    businessMode: "franchise",
    selectedLotId: 1,
    lotZoneFilter: "ALL",
    lotListPage: 0,
    sheetMode: "normal",
    totalRevenueAllTime: 0,
    totalProfitAllTime: 0,
    totalRentAndTaxPaid: 0,
    yearlyGrossRevenue: 0,
    yearlyOperatingProfit: 0,
    yearlyPrepaidTax: 0,
    lastSavedAt: Date.now(),
    lots: createInitialLots()
  };
}

globalThis.state = createDefaultState();

export function getActiveStationSkin() {
  const eq = (state && state.equippedSkin) || "skin_emerald";
  return STATION_SKINS_CATALOG.find(s => s.id === eq) || STATION_SKINS_CATALOG[0];
}

globalThis.roadCars = [];
globalThis.floatTexts = [];
globalThis.rainDrops = [];
globalThis.spawnAccumulator = 0;
globalThis.carIdSeq = 1;
globalThis.autoSaveAccumSec = 0;
globalThis.uiRefreshAccumSec = 0;
globalThis.trafficLightTimer = 0;


// Hệ thống Event Bus & State Accessors chuẩn hóa (Bước 1.3 & 3.3 của Báo Cáo)
export const stateListeners = new Set();

export function getState() {
  return globalThis.state;
}

export function setState(updater) {
  if (typeof updater === "function") {
    const next = updater(globalThis.state);
    if (next && typeof next === "object") globalThis.state = next;
  } else if (updater && typeof updater === "object") {
    Object.assign(globalThis.state, updater);
  }
  notifyStateListeners();
  return globalThis.state;
}

export function subscribeStateChange(listenerFn) {
  if (typeof listenerFn === "function") stateListeners.add(listenerFn);
  return () => stateListeners.delete(listenerFn);
}

export function notifyStateListeners(topic = "all") {
  for (const fn of stateListeners) {
    try { fn(globalThis.state, topic); } catch (e) {}
  }
}


// Đăng ký vào globalThis để tương thích ngược với HTML event handlers & các module liên kết
Object.assign(globalThis, {
  createDefaultState,
  getActiveStationSkin,
  stateListeners,
  getState,
  setState,
  subscribeStateChange,
  notifyStateListeners
});
