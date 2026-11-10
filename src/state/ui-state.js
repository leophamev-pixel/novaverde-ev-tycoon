/**
 * src/state/ui-state.js
 * Quản lý trạng thái Giao diện: Lô đang chọn, Bộ lọc vùng, Góc chiếu Isometric, Tốc độ Game
 */
export function getSelectedLot() {
  return state.lots[state.selectedLotId - 1] || state.lots[0];
}

export function toggleIsometricProjection() {
  state.isoView = !state.isoView;
  const btn = document.getElementById("btn-toggle-iso");
  const popBtn = document.getElementById("iso-mode-pop-btn");
  if (btn) btn.classList.toggle("active-tool", state.isoView);
  if (popBtn) popBtn.textContent = state.isoView ? L("💎 Góc: Iso 3D", "💎 View: Iso 3D") : L("🗺️ Góc: Phẳng", "🗺️ View: Flat 2D");
}


export function toggleBusinessMode() {
  state.businessMode = state.businessMode === "franchise" ? "direct" : "franchise";
  const btn = document.getElementById("mode-btn");
  if (state.businessMode === "franchise") {
    btn.textContent = L("⚡ Chế độ: Nhượng Quyền (+0.75 G$/kWh)", "⚡ Mode: Franchise (+0.75 G$/kWh)");
  } else {
    btn.textContent = L("⚡ Chế độ: Tự Doanh (+1.26 G$/kWh)", "⚡ Mode: Direct Retail (+1.26 G$/kWh)");
  }
  saveGameToStorage(false);
  refreshAllUI();
}

// KHÓA CỨNG TỐC ĐỘ THỜI GIAN 1X CỐ ĐỊNH (CHỐNG GIAN LẬN ĐUA TOP DOANH THU)
export function setGameSpeed(spd) {
  state.gameSpeed = 1;
  const badge = document.getElementById("hud-realtime-badge");
  if (badge) badge.textContent = tPack("speedLockedBadge");
}

export function cycleGameSpeed() {
  state.gameSpeed = 1;
}


export function getUiState() {
  const s = globalThis.state || {};
  return {
    selectedLotId: s.selectedLotId,
    lotZoneFilter: s.lotZoneFilter,
    lotListPage: s.lotListPage,
    sheetMode: s.sheetMode,
    isoView: s.isoView,
    gameSpeed: s.gameSpeed
  };
}


// Đăng ký vào globalThis để tương thích ngược với HTML event handlers & các module liên kết
Object.assign(globalThis, {
  getSelectedLot,
  toggleIsometricProjection,
  toggleBusinessMode,
  setGameSpeed,
  cycleGameSpeed,
  getUiState
});
