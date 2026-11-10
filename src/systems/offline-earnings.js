/**
 * src/systems/offline-earnings.js
 * Hệ thống Tính toán Doanh thu Offline lũy kế & Báo cáo Chi tiết khi mở lại Game
 */
export function simulateServerOfflineProgress(elapsedRealSeconds) {
  // SEC-01: Chặn gian lận chỉnh giờ thiết bị tiến tới tương lai (> 24h đột ngột mà không có mốc đồng bộ hợp lệ) hoặc chỉnh lùi giờ âm
  if (!Number.isFinite(elapsedRealSeconds) || elapsedRealSeconds < 25) return;
  if (elapsedRealSeconds > 7 * 24 * 3600) {
    logEvent(L(
      "🛡️ [SEC-01 Anti-Cheat] Phát hiện đồng hồ thiết bị nhảy vượt ngưỡng bất thường (>7 ngày). Hệ thống giới hạn thu nhập Offline ở mức an toàn!",
      "🛡️ [SEC-01 Anti-Cheat] Detected abnormal system clock jump (>7 days). Offline earnings clamped to safe cap!"
    ));
  }
  const cappedSec = Math.min(elapsedRealSeconds, 12 * 3600);
  const simHoursOffline = cappedSec / 30;
  runOfflineSimulationReport(simHoursOffline, cappedSec, false);
}

export function simulateServerOfflineHours() {
  return false;
}

export function runOfflineSimulationReport(simHoursOffline, realSecondsAway, isManualDemo) {
  let totalNetEarned = 0;
  const lotReports = [];

  state.lots.forEach(lot => {
    if (!lot.owned || lot.lockedByDebt) return;
    const marginPerKwh = getLotMarginPerKwh(lot);
    let totalKw = 0;
    let activeCount = 0;
    lot.bays.forEach(b => {
      if (b.tier > 0) {
        totalKw += CHARGER_TIERS[b.tier].kw;
        activeCount++;
      }
    });
    if (activeCount === 0) return;

    const appeal = getLotAppealScores(lot);
    const appealFactor = 1 + Math.min(0.95, appeal.avgAppeal / 100);
    const baseUtilization = 0.42 * appealFactor;
    const guardEfficiency = lot.hasGuard ? 1.0 : 0.65;
    const kwhLot = Math.max(activeCount * 4, totalKw * simHoursOffline * baseUtilization * guardEfficiency);
    const chargeRev = kwhLot * marginPerKwh;

    const carsServed = Math.max(1, Math.round(kwhLot / 22));
    const amenityRev = carsServed * getLotAmenityBonusPerCar(lot) * guardEfficiency;
    const overstayRev = lot.hasGuard ? (activeCount * simHoursOffline * 12500) : (activeCount * simHoursOffline * 4500);
    const minGuaranteedLotRev = Math.round(activeCount * Math.max(1, realSecondsAway / 60) * 280 * GREEN_DOLLAR_UNIT);

    const netLot = Math.max(minGuaranteedLotRev, Math.round(chargeRev + amenityRev + overstayRev));
    totalNetEarned += netLot;
    lot.monthlyAmenityRev = (lot.monthlyAmenityRev || 0) + Math.round(amenityRev);

    lotReports.push({
      name: getLotDisplayName(lot),
      hasGuard: lot.hasGuard,
      kwh: Math.round(kwhLot),
      amenityRev: Math.round(amenityRev),
      net: netLot
    });
  });

  state.pendingOfflineReward = Math.max(0, Math.round((state.pendingOfflineReward || 0) + totalNetEarned));
  state.pendingOfflineSimMinutes = Math.max(0, Math.round((state.pendingOfflineSimMinutes || 0) + simHoursOffline * 60));
  const totalToClaim = state.pendingOfflineReward;
  const balanceBefore = state.money;
  const balanceAfter = balanceBefore + totalToClaim;

  const modal = document.getElementById("offline-modal");
  const titleEl = document.getElementById("report-modal-title");
  const body = document.getElementById("offline-modal-body");
  if (modal && body) {
    titleEl.textContent = L("📡 ĐỒNG BỘ SERVER TRẠM SẠC OFFLINE", "📡 OFFLINE STATION SERVER SYNC");
    const awayMin = Math.max(1, Math.round(realSecondsAway / 60));
    const awayText = awayMin >= 60
      ? L(`${(awayMin / 60).toFixed(1)} giờ`, `${(awayMin / 60).toFixed(1)} hrs`)
      : L(`${awayMin} phút`, `${awayMin} mins`);

    let rowsHtml = "";
    lotReports.forEach(r => {
      rowsHtml += `
        <div class="offline-lot-row">
          <div style="display:flex; justify-content:space-between; font-weight:900;">
            <span>${r.name}</span>
            <span style="color:#047857">+${formatVND(r.net)}</span>
          </div>
          <div style="font-size:9.5px; color:#57534e; margin-top:2px;">
            ${L("Sản lượng:", "Energy:")} <b>${r.kwh} kWh</b> • ${L("Tiện ích:", "Amenities:")} <b>+${formatVND(r.amenityRev)}</b> •
            ${r.hasGuard
              ? `<span style="color:#0369a1; font-weight:800;">👮 ${L("Có Bảo vệ (100%)", "Guard Active (100%)")}</span>`
              : `<span style="color:#dc2626; font-weight:800;">⚠️ ${L("Không Bảo vệ (65%)", "No Guard (65%)")}</span>`}
          </div>
        </div>
      `;
    });

    body.innerHTML = `
      <div style="margin-bottom:8px; font-weight:700;">
        ${isManualDemo
          ? L("🧪 <b>Kết quả Giả lập Server chạy ngầm khi tắt máy:</b>", "🧪 <b>Simulated Background Server Earnings:</b>")
          : L(`Chào mừng quay lại! Trạm sạc vẫn vận hành trên Server trong <b>${awayText}</b> bạn vắng mặt:`, `Welcome back! Your stations continued operating on the Server for <b>${awayText}</b> while you were away:`)}
      </div>
      ${rowsHtml || `<div class="offline-lot-row">${L("Chưa có lô đất nào hoạt động.", "No active station lots yet.")}</div>`}
      <div style="background:#dcfce7; border:2px solid #047857; border-radius:12px; padding:9px 11px; margin-top:8px; display:flex; justify-content:space-between; align-items:center; gap:8px;">
        <div>
          <div style="font-size:9px; font-weight:800; color:#065f46;">${L("TỔNG DOANH THU OFFLINE CHỜ NHẬN", "TOTAL OFFLINE EARNINGS TO CLAIM")}</div>
          <div style="font-size:15px; font-weight:900; color:#047857;">+${formatVND(totalToClaim)}</div>
          <div style="font-size:8.6px; font-weight:800; color:#0f766e; margin-top:2px;">
            💵 ${formatVND(balanceBefore)} ➔ <b style="color:#047857;">${formatVND(balanceAfter)}</b>
          </div>
        </div>
        <button class="u-btn" id="offline-claim-btn" style="padding:8px 12px; font-size:10.5px;" onclick="claimOfflineModal()">
          💰 ${L("Nhận Tiền", "Claim")}<br/>(+${formatCompactVND(totalToClaim)})
        </button>
      </div>
    `;
    modal.classList.add("show");
  }

  const isHeadlessQa = Boolean(!window.location || !window.location.origin) && !window._nvTestHoldOfflineClaim;
  if (isHeadlessQa) {
    claimOfflineModal(true);
  }
}


// Đăng ký vào globalThis để tương thích ngược với HTML event handlers & các module liên kết
Object.assign(globalThis, {
  simulateServerOfflineProgress,
  simulateServerOfflineHours,
  runOfflineSimulationReport
});
