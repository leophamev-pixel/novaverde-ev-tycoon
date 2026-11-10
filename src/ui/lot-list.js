/**
 * src/ui/lot-list.js
 * Thanh nhảy nhanh Lô đất, Bộ lọc Khu vực, Phân trang 5.400 Lô & Bản đồ 12 Quận
 */
export function toggleToolsPopover() {
  const pop = document.getElementById("tools-popover");
  const btn = document.getElementById("btn-toggle-tools");
  const isShow = pop.classList.toggle("show");
  btn.classList.toggle("active-tool", isShow);
}

export function setLotZoneFilter(zoneKey, btnEl) {
  state.lotZoneFilter = zoneKey;
  state.lotListPage = 0;
  document.querySelectorAll(".zone-chip").forEach(el => el.classList.remove("active"));
  if (btnEl) btnEl.classList.add("active");
  refreshAllUI();
}

export function setLotListPage(pageIdx) {
  state.lotListPage = Math.max(0, pageIdx);
  refreshAllUI();
  const tabEl = document.getElementById("tab-all-lots");
  if (tabEl) tabEl.scrollTop = 0;
}

export function jumpToLotByNumberInput(explicitId) {
  const inp = document.getElementById("lot-jump-input");
  const rawVal = explicitId !== undefined ? explicitId : (inp ? parseInt(inp.value, 10) : NaN);
  if (isNaN(rawVal) || rawVal < 1 || rawVal > 5400) {
    logEvent(L("⚠️ Vui lòng nhập số Lô hợp lệ từ 1 đến 5400!", "⚠️ Please enter a valid Lot number from 1 to 5,400!"));
    return;
  }
  const targetId = Math.max(1, Math.min(5400, Math.round(rawVal)));
  const targetLot = state.lots[targetId - 1];
  if (!targetLot) return;
  if (window.mpState) {
    window.mpState.currentDistrictIdx = targetLot.districtIdx;
    window.mpState.currentWardIdx = targetLot.wardIdx;
  }
  selectLot(targetId, true);
  logEvent(L(
    `🚀 Đã bay thẳng tới ${targetLot.name} (${targetLot.district})!`,
    `🚀 Jumped directly to ${getLotDisplayName(targetLot)} (${targetLot.districtEn || targetLot.district})!`
  ));
}

export function stepAdjacentWardSector(delta) {
  const curSec = getSectorAtWorldPos(camera.x, camera.y);
  const nextSIdx = (curSec.sIdx + delta + 36) % 36;
  const nextSec = MEGA_SECTORS_36[nextSIdx];
  if (window.mpState) {
    window.mpState.currentDistrictIdx = nextSec.districtIdx;
    window.mpState.currentWardIdx = nextSec.wardIdx;
  }
  selectLot(nextSec.startLot, true);
  logEvent(L(
    `🗺️ Đã chuyển sang Phân khu ${nextSec.districtCode}. ${nextSec.districtName} • ${nextSec.wardName} (Lô #${nextSec.startLot}–#${nextSec.endLot})!`,
    `🗺️ Switched to Sector ${nextSec.districtCodeEn}. ${nextSec.districtNameEn} • ${nextSec.wardNameEn} (Lots #${nextSec.startLot}–#${nextSec.endLot})!`
  ));
}


export function openDockTab(tabId, btnEl) {
  const wasActive = document.getElementById(tabId).classList.contains("active");
  document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
  document.querySelectorAll(".dock-tab-btn").forEach(el => el.classList.remove("active"));
  document.getElementById(tabId).classList.add("active");
  if (btnEl) btnEl.classList.add("active");

  const hdr = document.getElementById("sheet-active-tab-title");
  const mapTitles = isEn() ? TAB_TITLES_EN : TAB_TITLES;
  if (hdr && mapTitles[tabId]) hdr.textContent = mapTitles[tabId];

  if (state.sheetMode === "minimized") {
    state.sheetMode = "normal";
  } else if (wasActive && state.sheetMode === "normal") {
    state.sheetMode = "minimized";
  }
  applySheetModeUI();
}

/*****************************************************************************************
 * AUTO-SAVE (DELTA-SAVING CHO 5.400 LÔ ĐẤT) & SERVER OFFLINE SIMULATION
 *****************************************************************************************/

export function renderQuickJumpStrip() {
  const strip = document.getElementById("quick-lot-strip");
  if (!strip) return;
  const curSec = getSectorAtWorldPos(camera.x, camera.y);
  const ownedLots = state.lots.filter(l => l.owned);
  const wardLots = (SECTOR_LOTS_MAP[curSec.sIdx] || []).slice(0, 30);
  const merged = [...ownedLots];
  wardLots.forEach(wl => {
    if (!merged.some(m => m.id === wl.id)) merged.push(wl);
  });
  strip.innerHTML = merged.map(l => `
    <button class="mini-lot-chip ${l.owned ? 'owned' : ''} ${l.id === state.selectedLotId ? 'active' : ''}"
      onclick="selectLot(${l.id}, true)">
      #${l.id}
    </button>
  `).join("");
}


export function openWorldMetroMapModal() {
  const modal = document.getElementById("metro-map-modal");
  const body = document.getElementById("metro-map-modal-body");
  if (!modal || !body) return;

  const curSec = getSectorAtWorldPos(camera.x, camera.y);
  window.mpState.currentDistrictIdx = curSec.districtIdx;
  window.mpState.currentWardIdx = curSec.wardIdx;

  const hour = Math.floor(state.simMinute / 60);
  const isMorningRush = (hour >= 6 && hour <= 10);
  const isEveningRush = (hour >= 17 && hour <= 22);
  const migrationBanner = isMorningRush
    ? L(
        "🌅 <b>Di cư Sáng (06:00–10:30):</b> Dòng xe điện từ các Quận Cửa Ngõ đang dồn mạnh vào <b>8 Quận Nội Đô & CBD (+35% nhu cầu sạc)</b>!",
        "🌅 <b>Morning Rush (06:00–10:30):</b> EVs from Gateway Districts surge into <b>8 Inner Core & CBD Districts (+35% charging demand)</b>!"
      )
    : (isEveningRush
      ? L(
          "🌆 <b>Di cư Chiều Tối (17:00–22:00):</b> Dòng xe tan tầm dồn về <b>Quận Bích Hồ, Hoàng Kim & 4 Quận Cửa Ngõ (+40% sạc đêm)</b>!",
          "🌆 <b>Evening Rush (17:00–22:00):</b> Commuters head back to <b>Azure Lake, Aurum & 4 Gateway Districts (+40% night charging)</b>!"
        )
      : L(
          "☀️ <b>Lưu thông Cân bằng:</b> Dòng xe phân bổ đều khắp 12 Quận và các tuyến Vành Đai 2 – Vành Đai 3.",
          "☀️ <b>Balanced Traffic Flow:</b> Vehicles circulate evenly across all 12 Districts and Ring Roads 2 & 3."
        ));

  const totalOwned5400 = getTotalOwnedLotsAcrossAll5400();

  body.innerHTML = `
    <div style="background:#ecfdf5; border:2px solid #047857; border-radius:12px; padding:7px 9px; margin-bottom:8px; font-size:9.5px;">
      <div>${L(
        "🌐 <b>Quy mô Đô Thị:</b> <b>12 Quận × 3 Phường × 150 Lô = 5.400 Lô Đất Liền Mạch (Lưới 6×6 Phường)</b>",
        "🌐 <b>Megacity Scale:</b> <b>12 Districts × 3 Wards × 150 Lots = 5,400 Seamless Lots (6×6 Ward Grid)</b>"
      )}</div>
      <div style="margin-top:2px;">📌 <b>${L("Camera đang ở:", "Current Camera:")}</b> <b style="color:#047857">${getCurrentZoneLabel()}</b> • ${L("Tổng sở hữu:", "Total Owned:")} <b>${totalOwned5400}/5,400 ${L("Lô", "Lots")}</b></div>
      <div style="margin-top:3px; color:#0369a1;">${migrationBanner}</div>
    </div>
    ${HANOI_12_DISTRICTS.map(d => {
      const isCurD = d.idx === curSec.districtIdx;
      const dName = isEn() ? (d.nameEn || d.name) : d.name;
      const dTier = isEn() ? (d.tierEn || d.tier) : d.tier;
      const dWonder = isEn() ? (d.centralWonderNameEn || d.centralWonderName) : d.centralWonderName;
      const dArch = isEn() ? (d.archDescEn || d.archDesc) : d.archDesc;
      const dWards = isEn() ? (d.wardsEn || d.wards) : d.wards;
      const dCodeDisp = isEn() ? (d.codeEn || d.code) : d.code;
      const dStreetsDisp = isEn() ? (d.streetsEn || d.streets) : d.streets;
      return `
        <div class="upgrade-card ${isCurD ? 'selected-lot' : ''}" style="flex-direction:column; align-items:stretch; gap:5px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div class="u-title">
              <span>🏙️ ${dCodeDisp}. ${dName}</span>
              <span class="u-badge ${d.priceMult > 1.15 ? 'rival' : (d.priceMult >= 1.0 ? 'taxi' : 'area')}">${dTier}</span>
              <span class="u-badge">${L("Giá đất", "Land")} ×${d.priceMult}</span>
            </div>
            <span style="font-size:8.5px; font-weight:800; color:#57534e;">450 ${L("Lô", "Lots")} (#${d.idx * 450 + 1}–#${(d.idx + 1) * 450})</span>
          </div>
          <div style="font-size:8.8px; color:#047857; font-weight:800;">
            ✦ ${L("Kỳ quan 3D:", "3D Wonder:")} <b>${dWonder}</b> • <span style="color:#0369a1;">${d.hasRiver ? L('🌊 Ven Sông Ngân Hà', '🌊 Silverstar Riverfront') : L('🏙️ Đô Thị Nội Địa', '🏙️ Inland Metro')}</span>
          </div>
          <div style="font-size:8.3px; color:#57534e;">
            🏛️ ${L("Kiến trúc:", "Architecture:")} ${dArch} • ${L("Tuyến phố:", "Streets:")} <i>${dStreetsDisp.slice(0, 6).join(", ")}...</i>
          </div>
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:5px;">
            ${dWards.map((wName, wIdx) => {
              const sIdx = d.idx * 3 + wIdx;
              const isActiveWard = (sIdx === curSec.sIdx);
              const wardLots = SECTOR_LOTS_MAP[sIdx] || [];
              const ownedInWard = wardLots.filter(l => l.owned).length;
              const startLot = sIdx * 150 + 1;
              return `
                <button class="pop-btn ${isActiveWard ? 'green' : ''}" onclick="switchToDistrictWard(${d.idx}, ${wIdx})">
                  ${isActiveWard ? '📍 ' : ''}${wName}<br/>
                  <span style="font-size:7.8px; font-weight:700;">#${startLot}..#${startLot+149} (${ownedInWard}🟢)</span>
                </button>
              `;
            }).join("")}
          </div>
        </div>
      `;
    }).join("")}
  `;
  modal.classList.add("show");
}

export function closeWorldMetroMapModal() {
  const modal = document.getElementById("metro-map-modal");
  if (modal) modal.classList.remove("show");
}


// Đăng ký vào globalThis để tương thích ngược với HTML event handlers & các module liên kết
Object.assign(globalThis, {
  toggleToolsPopover,
  setLotZoneFilter,
  setLotListPage,
  jumpToLotByNumberInput,
  stepAdjacentWardSector,
  openDockTab,
  renderQuickJumpStrip,
  openWorldMetroMapModal,
  closeWorldMetroMapModal
});
