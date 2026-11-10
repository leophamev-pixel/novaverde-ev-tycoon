/**
 * src/systems/save-load.js
 * Hệ thống Lưu/Đọc dữ liệu tập trung, Chữ ký Anti-Cheat Hash & Xuất/Nhập Base64 Snapshot
 */
// Hàm quản lý LocalStorage tập trung (Thay thế các lệnh gọi lẻ tẻ)
export function storageGetItem(key, fallback = null) {
  try {
    const val = localStorage.getItem(key);
    return val !== null ? val : fallback;
  } catch (e) {
    return fallback;
  }
}

export function storageSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    return false;
  }
}

export function storageRemoveItem(key) {
  try {
    localStorage.removeItem(key);
  } catch (e) {}
}

export function pulseSaveIndicator() {
  const dot = document.getElementById("save-dot");
  if (!dot) return;
  dot.classList.add("saving");
  setTimeout(() => dot.classList.remove("saving"), 350);
}

export function computeSaveSignatureHash(payloadObj) {
  const raw = [
    Math.round(Number(payloadObj.money) || 0),
    Math.round(Number(payloadObj.greenCoins) || 0),
    Number(payloadObj.totalDaysElapsed) || 1,
    Boolean(payloadObj.removeAdsOwned) ? 1 : 0,
    Array.isArray(payloadObj.lots) ? payloadObj.lots.length : 1,
    "NV_SALT_2026_1X"
  ].join("|");
  let h = 2166136261;
  for (let i = 0; i < raw.length; i++) {
    h ^= raw.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return "nv_" + (h >>> 0).toString(16);
}

export function serializeStateForSave() {
  const payload = {
    version: 7,
    money: sanitizeFiniteNumber(state.money, 65000000),
    greenCoins: typeof state.greenCoins === "number" ? sanitizeFiniteNumber(state.greenCoins, 250) : 250,
    removeAdsOwned: Boolean(state.removeAdsOwned),
    adX2RevRemainingSec: Math.max(0, Math.round(Number(state.adX2RevRemainingSec) || 0)),
    adRewards: state.adRewards ? { ...state.adRewards } : null,
    ownedItems: state.ownedItems || {},
    ownedSkins: state.ownedSkins || { skin_emerald: true },
    equippedSkin: state.equippedSkin || "skin_emerald",
    year: state.year,
    month: state.month,
    dayOfMonth: state.dayOfMonth,
    totalDaysElapsed: state.totalDaysElapsed,
    simMinute: state.simMinute,
    isoView: Boolean(state.isoView),
    weatherMode: state.weatherMode,
    businessMode: state.businessMode,
    selectedLotId: state.selectedLotId,
    totalRevenueAllTime: sanitizeFiniteNumber(state.totalRevenueAllTime, 0),
    totalProfitAllTime: sanitizeFiniteNumber(state.totalProfitAllTime, 0),
    totalRentAndTaxPaid: sanitizeFiniteNumber(state.totalRentAndTaxPaid, 0),
    yearlyGrossRevenue: sanitizeFiniteNumber(state.yearlyGrossRevenue, 0),
    yearlyOperatingProfit: sanitizeFiniteNumber(state.yearlyOperatingProfit, 0),
    yearlyPrepaidTax: sanitizeFiniteNumber(state.yearlyPrepaidTax || 0, 0),
    lastSavedAt: Date.now(),
    lots: state.lots.filter(lot => lot.owned || (lot.debtPrincipal || 0) > 0 || lot.id === 1).map(lot => ({
      id: lot.id,
      owned: lot.owned,
      ownershipType: lot.ownershipType,
      businessMode: getLotBusinessMode(lot),
      areaM2: lot.areaM2,
      expansionCount: lot.expansionCount || 0,
      hasGuard: lot.hasGuard,
      debtPrincipal: lot.debtPrincipal || 0,
      debtInterest: lot.debtInterest || 0,
      debtDaysOverdue: lot.debtDaysOverdue || 0,
      lockedByDebt: Boolean(lot.lockedByDebt),
      monthlyAmenityRev: lot.monthlyAmenityRev || 0,
      amenities: lot.amenities || { tra_da: 0, cafe: 0, phong_nghi: 0, nha_an: 0, nha_hang: 0, doi_pin: 0 },
      bays: lot.bays.map(b => ({
        id: b.id,
        tier: b.tier,
        car: b.car ? { ...b.car } : null
      }))
    }))
  };
  payload.saveChecksum = computeSaveSignatureHash(payload);
  return payload;
}

export function saveGameToStorage(manualNotify = false) {
  try {
    const payload = serializeStateForSave();
    const jsonStr = JSON.stringify(payload);
    localStorage.setItem(SAVE_STORAGE_KEY, jsonStr);
    state.lastSavedAt = payload.lastSavedAt;
    pulseSaveIndicator();

    const box = document.getElementById("save-json-box");
    if (box && document.getElementById("save-modal").classList.contains("show")) {
      box.value = jsonStr;
    }
    const lbl = document.getElementById("last-save-time-lbl");
    if (lbl) {
      const d = new Date(state.lastSavedAt);
      lbl.textContent = isEn()
        ? `🟢 Auto-synced at ${d.toLocaleTimeString("en-US")}`
        : `🟢 Đã đồng bộ tự động lúc ${d.toLocaleTimeString("vi-VN")}`;
    }
    if (manualNotify) {
      logEvent(L(
        "💾 Đã lưu tiến độ chơi (5.400 Lô Đại Đô Thị NovaVerde) vào bộ nhớ trình duyệt.",
        "💾 Saved game progress (5,400 NovaVerde Lots) to browser storage."
      ));
    }
  } catch (e) {
    console.warn("Save error:", e);
  }
}

export function applyLoadedSnapshot(snap) {
  if (!snap || typeof snap !== "object") return false;
  // SEC-02: Kiểm tra mã băm toàn vẹn (Hash/Checksum) nếu bản lưu có đính kèm saveChecksum
  if (snap.saveChecksum) {
    const expectedHash = computeSaveSignatureHash(snap);
    if (snap.saveChecksum !== expectedHash) {
      state.tamperedSaveDetected = true;
      console.warn("[SEC-02 Anti-Cheat] Save checksum mismatch detected!", snap.saveChecksum, expectedHash);
      return false;
    }
  }
  state.tamperedSaveDetected = false;
  const fresh = createDefaultState();
  state.money = typeof snap.money === "number" ? sanitizeFiniteNumber(snap.money, fresh.money) : fresh.money;
  state.greenCoins = typeof snap.greenCoins === "number" ? sanitizeFiniteNumber(snap.greenCoins, 250) : 250;
  state.removeAdsOwned = Boolean(snap.removeAdsOwned) || (typeof localStorage !== "undefined" && localStorage.getItem("NOVAVERDE_IAP_REMOVE_ADS") === "true");
  state.adX2RevRemainingSec = Math.max(0, Math.round(Number(snap.adX2RevRemainingSec) || 0));
  if (snap.adRewards && typeof snap.adRewards === "object") {
    state.adRewards = { ...snap.adRewards };
  }
  state.ownedItems = (snap.ownedItems && typeof snap.ownedItems === "object") ? snap.ownedItems : {};
  state.ownedSkins = (snap.ownedSkins && typeof snap.ownedSkins === "object") ? { skin_emerald: true, ...snap.ownedSkins } : { skin_emerald: true };
  state.equippedSkin = snap.equippedSkin || "skin_emerald";
  state.year = typeof snap.year === "number" ? snap.year : 1;
  state.month = typeof snap.month === "number" ? snap.month : 1;
  state.dayOfMonth = typeof snap.dayOfMonth === "number" ? snap.dayOfMonth : 1;
  state.totalDaysElapsed = typeof snap.totalDaysElapsed === "number" ? snap.totalDaysElapsed : 1;
  state.simMinute = typeof snap.simMinute === "number" ? snap.simMinute : fresh.simMinute;
  state.isoView = snap.isoView !== undefined ? Boolean(snap.isoView) : true;
  state.weatherMode = snap.weatherMode || "auto";
  state.businessMode = snap.businessMode === "direct" ? "direct" : "franchise";
  state.selectedLotId = snap.selectedLotId || 1;
  state.totalRevenueAllTime = sanitizeFiniteNumber(snap.totalRevenueAllTime || 0, 0);
  state.totalProfitAllTime = sanitizeFiniteNumber(snap.totalProfitAllTime || 0, 0);
  state.totalRentAndTaxPaid = sanitizeFiniteNumber(snap.totalRentAndTaxPaid || 0, 0);
  state.yearlyGrossRevenue = sanitizeFiniteNumber(snap.yearlyGrossRevenue || 0, 0);
  state.yearlyOperatingProfit = sanitizeFiniteNumber(snap.yearlyOperatingProfit || 0, 0);
  state.yearlyPrepaidTax = sanitizeFiniteNumber(snap.yearlyPrepaidTax || 0, 0);
  state.lastSavedAt = snap.lastSavedAt || Date.now();

  state.lots = createInitialLots();
  if (Array.isArray(snap.lots)) {
    snap.lots.forEach(savedLot => {
      const target = state.lots[savedLot.id - 1];
      if (!target) return;
      target.owned = Boolean(savedLot.owned);
      target.ownershipType = savedLot.ownershipType || (target.owned ? "owned" : null);
      target.businessMode = savedLot.businessMode === "direct" ? "direct" : "franchise";
      if (typeof savedLot.areaM2 === "number") target.areaM2 = savedLot.areaM2;
      target.expansionCount = savedLot.expansionCount || 0;
      target.hasGuard = Boolean(savedLot.hasGuard);
      target.debtPrincipal = savedLot.debtPrincipal || 0;
      target.debtInterest = savedLot.debtInterest || 0;
      target.debtDaysOverdue = savedLot.debtDaysOverdue || 0;
      target.lockedByDebt = Boolean(savedLot.lockedByDebt);
      target.monthlyAmenityRev = savedLot.monthlyAmenityRev || 0;
      if (savedLot.amenities) {
        target.amenities = {
          tra_da: savedLot.amenities.tra_da || 0,
          cafe: savedLot.amenities.cafe || 0,
          phong_nghi: savedLot.amenities.phong_nghi || 0,
          nha_an: savedLot.amenities.nha_an || 0,
          nha_hang: savedLot.amenities.nha_hang || 0,
          doi_pin: savedLot.amenities.doi_pin || 0
        };
      }
      if (Array.isArray(savedLot.bays) && savedLot.bays.length > 0) {
        target.bays = savedLot.bays.map((sb, idx) => ({
          id: idx,
          tier: typeof sb.tier === "number" && sb.tier >= 1 ? sb.tier : 1,
          car: sb.car ? { ...sb.car } : null,
          incomingCarId: null
        }));
      }
    });
  }
  roadCars = [];
  return true;
}


export function exportSaveString() {
  const box = document.getElementById("save-json-box");
  box.select();
  navigator.clipboard?.writeText(box.value);
  logEvent(L("📋 Đã copy Mã Save JSON vào bộ nhớ tạm!", "📋 Copied Save JSON string to clipboard!"));
}
export function importSaveString() {
  const box = document.getElementById("save-json-box");
  try {
    const parsed = JSON.parse(box.value.trim());
    if (applyLoadedSnapshot(parsed)) {
      saveGameToStorage(false);
      refreshAllUI();
      closeSaveModal();
      logEvent(L("📥 Đã nạp thành công dữ liệu Save JSON!", "📥 Successfully loaded Save JSON data!"));
    }
  } catch (e) {
    alert(L("Mã JSON không hợp lệ! Vui lòng kiểm tra lại.", "Invalid JSON string! Please check and try again."));
  }
}
export function resetAllSaveData() {
  localStorage.removeItem(SAVE_STORAGE_KEY);
  state = createDefaultState();
  roadCars = [];
  floatTexts = [];
  resetMapCamera();
  saveGameToStorage(false);
  refreshAllUI();
  closeSaveModal();
  logEvent(L("🔄 Đã Reset dữ liệu về Lô #1 Phố Kim Ngân (65,000 G$ & 250 GC)!", "🔄 Reset game to Lot #1 Goldleaf St (65,000 G$ & 250 GC)!"));
}

/*****************************************************************************************
 * CHU KỲ NGÀY / THÁNG / NĂM, LÃI PHẠT NỢ 0,03%/NGÀY, KHÓA LÔ ĐẤT 360 NGÀY & NỘP THUẾ
 *****************************************************************************************/

// Đăng ký vào globalThis để tương thích ngược với HTML event handlers & các module liên kết
Object.assign(globalThis, {
  pulseSaveIndicator,
  computeSaveSignatureHash,
  serializeStateForSave,
  saveGameToStorage,
  applyLoadedSnapshot,
  exportSaveString,
  importSaveString,
  resetAllSaveData,
  storageGetItem,
  storageSetItem,
  storageRemoveItem
});
