/**
 * src/ui/offline-modal.js
 * Hộp thoại Báo cáo & Nhận Doanh thu Offline (claimOfflineModal) và Hộp thoại Lưu/Đọc Game
 */
export function claimOfflineModal(keepModalOpen = false) {
  const reward = Math.max(0, Math.round(Number(state.pendingOfflineReward) || 0));
  const simMins = Math.max(0, Math.round(Number(state.pendingOfflineSimMinutes) || 0));
  state.pendingOfflineReward = 0;
  state.pendingOfflineSimMinutes = 0;

  if (reward > 0) {
    const beforeMoney = state.money;
    state.money = sanitizeFiniteNumber(state.money + reward, state.money);
    state.totalRevenueAllTime = sanitizeFiniteNumber(state.totalRevenueAllTime + reward, state.totalRevenueAllTime);
    state.totalProfitAllTime = sanitizeFiniteNumber(state.totalProfitAllTime + reward, state.totalProfitAllTime);
    state.yearlyGrossRevenue = sanitizeFiniteNumber(state.yearlyGrossRevenue + reward, state.yearlyGrossRevenue);
    state.yearlyOperatingProfit = sanitizeFiniteNumber(state.yearlyOperatingProfit + reward, state.yearlyOperatingProfit);
    if (simMins > 0) {
      state.simMinute = (state.simMinute + simMins) % 1440;
    }
    if (typeof playSfx === "function") playSfx("cash");
    if (typeof triggerHaptic === "function") triggerHaptic(35);
    const selLot = getSelectedLot();
    if (selLot) {
      floatTexts.push({
        x: selLot.x,
        y: selLot.y - 26,
        text: `💰 +${formatCompactVND(reward)} (Offline)`,
        color: "#10b981",
        life: 2.4
      });
    }
    const moneyEl = document.getElementById("money-display");
    if (moneyEl) {
      moneyEl.textContent = `💵 ${formatVND(state.money)}`;
    }
    logEvent(L(
      `📡 [Offline Claim] Đã nhận +${formatVND(reward)} doanh thu trạm sạc Offline! (Số dư: ${formatVND(beforeMoney)} ➔ ${formatVND(state.money)})`,
      `📡 [Offline Claim] Claimed +${formatVND(reward)} Offline Station Earnings! (Balance: ${formatVND(beforeMoney)} ➔ ${formatVND(state.money)})`
    ));
    saveGameToStorage(false);
    refreshAllUI();
    if (window.NovaVerdeMobileSDK && typeof window.NovaVerdeMobileSDK.syncCloudSaveNow === "function") {
      window.NovaVerdeMobileSDK.syncCloudSaveNow(false);
    }
  }
  if (!keepModalOpen) {
    const modal = document.getElementById("offline-modal");
    if (modal) modal.classList.remove("show");
  }
  return reward;
}

export function closeOfflineModal() {
  if (state.pendingOfflineReward && state.pendingOfflineReward > 0) {
    return claimOfflineModal(false);
  }
  const modal = document.getElementById("offline-modal");
  if (modal) modal.classList.remove("show");
  return 0;
}
export function openSaveModal() {
  const payload = serializeStateForSave();
  document.getElementById("save-json-box").value = JSON.stringify(payload);
  document.getElementById("save-modal").classList.add("show");
}
export function closeSaveModal() {
  document.getElementById("save-modal").classList.remove("show");
}

// Đăng ký vào globalThis để tương thích ngược với HTML event handlers & các module liên kết
Object.assign(globalThis, {
  claimOfflineModal,
  closeOfflineModal,
  openSaveModal,
  closeSaveModal
});
