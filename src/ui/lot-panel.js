/**
 * src/ui/lot-panel.js
 * Hiển thị Khung Phân bổ Diện tích (m²), Trạng thái Chuồng sạc & Thanh ngăn kéo dưới (Bottom Sheet)
 */
export function applySheetModeUI() {
  const drawer = document.getElementById("bottom-drawer");
  const btn = document.getElementById("drawer-toggle-btn");
  drawer.classList.remove("minimized", "expanded");
  if (state.sheetMode === "minimized") {
    drawer.classList.add("minimized");
  } else if (state.sheetMode === "expanded") {
    drawer.classList.add("expanded");
    if (btn) btn.textContent = L("🔽 Thu vừa", "🔽 Compact");
  } else {
    if (btn) btn.textContent = L("🔼 Mở rộng", "🔼 Expand");
  }
  const activeTabEl = document.querySelector(".tab-content.active");
  const hdr = document.getElementById("sheet-active-tab-title");
  if (activeTabEl && hdr) {
    const tid = activeTabEl.id;
    const mapTitles = isEn() ? TAB_TITLES_EN : TAB_TITLES;
    if (mapTitles[tid]) hdr.textContent = mapTitles[tid];
  }
}

export function toggleSheetExpand() {
  state.sheetMode = state.sheetMode === "expanded" ? "normal" : "expanded";
  applySheetModeUI();
}

export function toggleSheetMinimize() {
  state.sheetMode = state.sheetMode === "minimized" ? "normal" : "minimized";
  applySheetModeUI();
}

export function toggleSheetState(targetMode) {
  state.sheetMode = targetMode;
  applySheetModeUI();
}

export function cycleSheetHeight() {
  if (state.sheetMode === "minimized") state.sheetMode = "normal";
  else if (state.sheetMode === "normal") state.sheetMode = "expanded";
  else state.sheetMode = "normal";
  applySheetModeUI();
}

export function toggleCardDetail(detailId) {
  const el = document.getElementById(detailId);
  if (el) el.classList.toggle("open");
}


export function renderSpatialAllocationBox(lot) {
  const sp = getLotSpatialBreakdown(lot);
  const infraPct = Math.round((sp.infraM2 / sp.totalAreaM2) * 100);
  const chargersPct = Math.round((sp.chargersM2 / sp.totalAreaM2) * 100);
  const amenitiesPct = Math.round((sp.amenitiesM2 / sp.totalAreaM2) * 100);

  const curExp = lot.expansionCount || 0;
  const maxExp = lot.maxExpansions || 3;
  const canExpandMore = curExp < maxExp;
  const nextExpandCost = Math.round(lot.expandStepCost * Math.pow(1.25, curExp));

  return `
    <div class="spatial-meter-box">
      <div style="display:flex; justify-content:space-between; align-items:center; gap:6px;">
        <div>
          <div style="font-weight:900; font-size:10.2px; color:#291507;">
            📐 ${L("Diện tích:", "Area:")} <span style="color:#047857">${sp.totalAreaM2}m²</span> • ${L("Trống:", "Free:")} <b style="color:#0284c7">${sp.freeM2}m²</b>
            <span class="u-badge area" style="margin-left:4px;">${L("Trần:", "Cap:")} ${sp.activeChargers}/${sp.maxChargersPossibleNow}🔌 (${L("Tối đa", "Max")} ${sp.maxChargersAtFullExpansion})</span>
          </div>
        </div>
        ${canExpandMore ? `
          <button class="u-btn secondary" style="padding:4px 7px; min-width:76px;" ${state.money < nextExpandCost ? 'disabled' : ''} onclick="expandLotLandArea(${lot.id})">
            📐 +${lot.expandStepAreaM2}m² ${L("Đất", "Land")}<br/>(${formatCompactVND(nextExpandCost)})
          </button>
        ` : `<span class="u-badge">${L("Đất Tối Đa", "Max Land")}</span>`}
      </div>
      <div class="spatial-bar-track">
        <div class="spatial-seg-infra" style="width:${infraPct}%"></div>
        <div class="spatial-seg-chargers" style="width:${chargersPct}%"></div>
        <div class="spatial-seg-amenities" style="width:${amenitiesPct}%"></div>
      </div>
      <div class="spatial-legend">
        <span>⬛ ${L("Cổng Barie:", "Gate/Drive:")} ${sp.infraM2}m²</span>
        <span style="color:#047857">🟩 ${sp.activeChargers} ${L("Trụ (20m²/trụ):", "Bays (20m²/bay):")} ${sp.chargersM2}m²</span>
        <span style="color:#b45309">🟧 ${L("Tiện ích:", "Amenities:")} ${sp.amenitiesM2}m²</span>
        <span style="color:#0284c7">⬜ ${L("Trống:", "Free:")} ${sp.freeM2}m²</span>
      </div>
    </div>
  `;
}


export function getBayStatusText(bay) {
  if (!bay.car) {
    return `<span style="color:#15803d; font-weight:800;">🟢 ${L("Trống — Đón xe qua Cổng Barie IN (+4đ thu hút)", "Available — Ready for EVs via IN Barrier (+4pt appeal)")}</span>`;
  }
  const carModelName = getItemName(bay.car.model);
  if (bay.car.state === "ICE_SQUATTING") {
    return `<span style="color:#c2410c; font-weight:900;">⛽ ${carModelName} ${L("đỗ lấn chỗ (0đ • Làm giảm -15đ thu hút trạm!)", "illegally parked ($0 • -15pt station appeal penalty!)")}</span>`;
  }
  if (bay.car.state === "SQUATTING") {
    const curF = formatVND(bay.car.currentFine || 150000);
    const maxF = formatCompactVND(bay.car.maxFineTarget || 1500000);
    return `<span style="color:#dc2626; font-weight:900;">🚨 ${carModelName} ${L(`đang nhảy phạt: ${curF} (Tự rời ở mốc ${maxF})`, `overstay fine ticking: ${curF} (Auto-leaves at ${maxF})`)}</span>`;
  }
  const pct = Math.min(100, Math.round((bay.car.chargedKwh / bay.car.needKwh) * 100));
  return `<span style="color:#0369a1; font-weight:800;">⚡ ${carModelName}: ${bay.car.chargedKwh.toFixed(1)}/${bay.car.needKwh} kWh (${pct}%)</span>`;
}

export function renderBayActionButtons(lot, bay, idx, curTier, nextTier) {
  let btns = "";
  if (bay.car && bay.car.state === "ICE_SQUATTING") {
    btns += `<button class="u-btn warn" onclick="chaseAwayIceSquatter(${lot.id}, ${idx}, 'manual')">📢 ${L("Đuổi Xe Xăng<br/>(0đ • +15đ thu hút)", "Evict Gas Car<br/>($0 • +15pt appeal)")}</button>`;
  } else if (bay.car && bay.car.state === "SQUATTING") {
    const feeNow = Math.max(bay.car.currentFine || 1100000, bay.car.maxFineTarget || 1350000);
    btns += `<button class="u-btn danger" onclick="fineAndTowSquatter(${lot.id}, ${idx})">🚓 ${L("Thu Phạt Ngay", "Collect Fine")}<br/>(+${formatCompactVND(feeNow)})</button>`;
  }
  if (nextTier) {
    const upgCost = getBayUpgradeCostForLot(lot, bay.tier);
    btns += `
      <button class="u-btn" ${state.money < upgCost || lot.lockedByDebt ? "disabled" : ""} onclick="upgradeBayTier(${lot.id}, ${idx})">
        ${L(`Lên ${nextTier.kw}kW`, `Up to ${nextTier.kw}kW`)}<br/>(${formatCompactVND(upgCost)})
      </button>
    `;
  } else {
    btns += `<button class="u-btn maxed" disabled>${L("Tối đa 120kW", "Max 120kW")}</button>`;
  }
  return btns;
}


// Đăng ký vào globalThis để tương thích ngược với HTML event handlers & các module liên kết
Object.assign(globalThis, {
  applySheetModeUI,
  toggleSheetExpand,
  toggleSheetMinimize,
  toggleSheetState,
  cycleSheetHeight,
  toggleCardDetail,
  renderSpatialAllocationBox,
  getBayStatusText,
  renderBayActionButtons
});
