/**
 * src/ui/hud.js
 * Cập nhật Thanh trạng thái HUD, Định dạng tiền tệ, Hiệu ứng Âm thanh WebAudio & Rung Haptics
 */
import { GREEN_DOLLAR_UNIT } from "../data/balance.js";


export function sanitizeFiniteNumber(val, fallback = 0) {
  const n = Number(val);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(-1e24, Math.min(1e24, n));
}

export function formatVND(amount) {
  const safeAmt = sanitizeFiniteNumber(amount, 0);
  const gd = safeAmt / GREEN_DOLLAR_UNIT;
  const absGd = Math.abs(gd);
  if (absGd >= 1e12) return formatCompactVND(safeAmt);
  if (absGd > 0 && absGd < 10) {
    return gd.toFixed(2).replace(/\.00$/, "") + " G$";
  }
  return Math.round(gd).toLocaleString("en-US") + " G$";
}

export function formatCompactVND(amount) {
  const safeAmt = sanitizeFiniteNumber(amount, 0);
  const gd = safeAmt / GREEN_DOLLAR_UNIT;
  const absGd = Math.abs(gd);
  if (absGd >= 1e18) return (gd / 1e18).toFixed(2).replace(/\.00$/, "") + "ab G$";
  if (absGd >= 1e15) return (gd / 1e15).toFixed(2).replace(/\.00$/, "") + "aa G$";
  if (absGd >= 1e12) return (gd / 1e12).toFixed(2).replace(/\.00$/, "") + "T G$";
  if (absGd >= 1e9) return (gd / 1e9).toFixed(2).replace(/\.00$/, "") + "B G$";
  if (absGd >= 1e6) return (gd / 1e6).toFixed(2).replace(/\.00$/, "") + "M G$";
  if (absGd >= 1e3) return (gd / 1e3).toFixed(2).replace(/\.00$/, "") + "K G$";
  if (absGd > 0 && absGd < 10) return gd.toFixed(2).replace(/\.00$/, "") + " G$";
  return Math.round(gd).toLocaleString("en-US") + " G$";
}

export function formatGreenCoin(gc) {
  const safeGc = Math.max(0, sanitizeFiniteNumber(gc, 0));
  return Math.round(safeGc).toLocaleString("en-US") + " GC";
}

export function buyRemoveAdsPack() {
  if (state.removeAdsOwned) {
    logEvent(L("ℹ️ Bạn đã sở hữu gói Tắt Quảng Cáo Vĩnh Viễn (Remove Ads) rồi!", "ℹ️ You already own the Permanent Remove Ads pack!"));
    return false;
  }
  state.removeAdsOwned = true;
  state.greenCoins = (state.greenCoins || 0) + 150;
  try {
    localStorage.setItem("NOVAVERDE_IAP_REMOVE_ADS", "true");
  } catch (e) {}
  if (window.NovaVerdeMobileSDK && typeof window.NovaVerdeMobileSDK.toggleNativeBannerAd === "function") {
    window.NovaVerdeMobileSDK.toggleNativeBannerAd(false);
  }
  if (typeof playSfx === "function") playSfx("cash");
  updateGreenCoinHUD();
  saveGameToStorage(false);
  renderGreenCoinShopModal();
  refreshAllUI();
  logEvent(L(
    "🚫 [IAP Non-Consumable] Đã kích hoạt GÓI TẮT QUẢNG CÁO VĨNH VIỄN (Remove Ads) + Tặng kèm 150 GC! Toàn bộ Banner & Interstitial Ads đã được gỡ bỏ.",
    "🚫 [IAP Non-Consumable] Activated PERMANENT REMOVE ADS PACK + 150 GC Bonus! All Banner & Interstitial Ads have been removed."
  ));
  return true;
}

export function restoreIapPurchases() {
  let restoredAny = false;
  try {
    if (localStorage.getItem("NOVAVERDE_IAP_REMOVE_ADS") === "true" && !state.removeAdsOwned) {
      state.removeAdsOwned = true;
      restoredAny = true;
    }
  } catch (e) {}
  if (state.removeAdsOwned) {
    restoredAny = true;
    if (window.NovaVerdeMobileSDK && typeof window.NovaVerdeMobileSDK.toggleNativeBannerAd === "function") {
      window.NovaVerdeMobileSDK.toggleNativeBannerAd(false);
    }
  }
  saveGameToStorage(false);
  renderGreenCoinShopModal();
  refreshAllUI();
  logEvent(restoredAny
    ? L("🔄 [Restore Purchases] Đã khôi phục thành công gói Vĩnh Viễn (Remove Ads) từ tài khoản Store của bạn (Không nhân đôi gói tiêu hao)!", "🔄 [Restore Purchases] Successfully restored Non-Consumable entitlements (Remove Ads) from your Store account!")
    : L("ℹ️ [Restore Purchases] Đã kiểm tra tài khoản Store — hiện chưa có gói Vĩnh Viễn (Non-Consumable) nào cần khôi phục.", "ℹ️ [Restore Purchases] Checked Store account — no Non-Consumable entitlements found to restore.")
  );
  return restoredAny;
}

export function updateGreenCoinHUD() {
  const gcEl = document.getElementById("greencoin-display");
  if (gcEl) gcEl.textContent = `🪙 ${formatGreenCoin(state.greenCoins || 0)}`;
  const gcSub = document.getElementById("gc-sub-lbl");
  if (gcSub) {
    const sk = getActiveStationSkin();
    gcSub.textContent = `${sk.icon} ${L("Tools•Skin", "Tools•Skin")}`;
  }
}


export function logEvent(msg) {
  const box = document.getElementById("event-log");
  if (!box) return;
  const hh = String(Math.floor(state.simMinute / 60)).padStart(2, "0");
  const mm = String(Math.floor(state.simMinute % 60)).padStart(2, "0");
  const div = document.createElement("div");
  const timeTag = isEn() ? `[M${state.month}/D${state.dayOfMonth} ${hh}:${mm}]` : `[T${state.month}/Ng${state.dayOfMonth} ${hh}:${mm}]`;
  div.innerHTML = `<span style="color:#0369a1">${timeTag}</span> ${msg}`;
  box.prepend(div);
  while (box.children.length > 30) box.removeChild(box.lastChild);
}

/*****************************************************************************************
 * RENDER GIAO DIỆN TINH GIẢN (5.400 LÔ ĐẤT + BỘ LỌC THEO PHÂN KHU + SONG NGỮ VI/EN)
 *****************************************************************************************/

export function refreshAllUI() {
  const topMoneyEl = document.getElementById("money-display");
  if (topMoneyEl) topMoneyEl.textContent = `💵 ${formatVND(state.money)}`;
  updateGreenCoinHUD();
  const lot = getSelectedLot();
  const sp = getLotSpatialBreakdown(lot);
  const appeal = getLotAppealScores(lot);
  const mVal = getLotMarketValuation(lot);
  const adjRoad = H_ROADS[lot.roadHIdx];
  const roadRuleTxt = adjRoad.oneWay === 0
    ? L("Đường 2 chiều", "2-Way Street")
    : (adjRoad.oneWay === 1 ? L("Đường 1 chiều ➔", "1-Way Street ➔") : L("Đường 1 chiều ⬅", "1-Way Street ⬅"));
  const lotDisplayName = getLotDisplayName(lot);
  const lotDisplayNote = getLotDisplayNote(lot);

  const ctxLbl = document.getElementById("drawer-context-lbl");
  const ctxSub = document.getElementById("drawer-context-sub");
  if (ctxLbl && lot) {
    ctxLbl.textContent = `📌 ${lotDisplayName} (${lot.areaM2}m²)`;
  }
  const pendingBiz = state.pendingNewLotBizMode === "direct" ? "direct" : "franchise";
  const unownedDirectExtra = !lot.owned ? getLotSubsidyBuyoutCostToDirect(lot) : 0;
  const effectiveLeaseCost = mVal.marketLeaseDeposit + (pendingBiz === "direct" ? unownedDirectExtra : 0);
  const effectiveBuyCost = mVal.marketBuyPrice + (pendingBiz === "direct" ? unownedDirectExtra : 0);

  if (ctxSub && lot) {
    if (!lot.owned) {
      if (mVal.botOwner) {
        ctxSub.innerHTML = `<span>🤖 <b>${mVal.botOwner.ownerName}</b> (${mVal.botChargers}🔌)</span><span>💼 ${L("Mua lại:", "Buyout:")} ${formatCompactVND(mVal.botBuyoutPrice)}</span><span>📈 +${mVal.pctChange}%</span>`;
      } else {
        ctxSub.innerHTML = `<span>🔑 ${L("Thuê:", "Lease:")} ${formatCompactVND(effectiveLeaseCost)}</span><span>🏠 ${L("Mua:", "Buy:")} ${formatCompactVND(effectiveBuyCost)}</span><span>⚡ ${pendingBiz === "direct" ? "Direct" : "Franchise"}</span>`;
      }
    } else {
      const lotModeTag = getLotBusinessMode(lot) === "direct" ? "🏢Direct (+1.35G$)" : "🤝Franchise (+0.75G$)";
      ctxSub.innerHTML = `<span>🔌 ${sp.activeChargers}/${sp.maxChargersPossibleNow} ${L("Trụ", "Bays")}</span><span>${lotModeTag}</span><span>🚕${appeal.taxiTotal}${L("đ", "pt")} | 🚗${appeal.casualTotal}${L("đ", "pt")}</span>`;
    }
  }

  renderQuickJumpStrip();

  const ownedLotsNow = state.lots.filter(l => l.owned);
  const myLotBadge = document.getElementById("my-lot-count-badge");
  if (myLotBadge) {
    myLotBadge.textContent = String(ownedLotsNow.length);
  }

  const quickLandBtn = document.getElementById("quick-land-btn");
  const quickExpandBtn = document.getElementById("quick-expand-btn");
  if (quickLandBtn && quickExpandBtn) {
    if (!lot.owned) {
      if (mVal.botOwner) {
        quickLandBtn.textContent = `💼 ${L("Thâu Tóm", "Buyout")} (${formatCompactVND(mVal.botBuyoutPrice)})`;
        quickLandBtn.onclick = () => buyoutLotFromBot(lot.id);
        quickExpandBtn.textContent = `🎬 +35K G$ (Ad)`;
        quickExpandBtn.onclick = () => startRewardedVideoAd("ad_cash");
      } else {
        quickLandBtn.textContent = `📝 ${L("Thuê", "Lease")} (${formatCompactVND(effectiveLeaseCost)})`;
        quickLandBtn.onclick = () => acquireLot(lot.id, "leased", pendingBiz);
        quickExpandBtn.textContent = `🏠 ${L("Mua", "Buy")} (${formatCompactVND(effectiveBuyCost)})`;
        quickExpandBtn.onclick = () => acquireLot(lot.id, "owned", pendingBiz);
      }
    } else {
      const curExp = lot.expansionCount || 0;
      const maxExp = lot.maxExpansions || 3;
      const installCostNow = getBayInstallCostForLot(lot);
      quickLandBtn.textContent = curExp < maxExp ? `📐 +${lot.expandStepAreaM2}m²` : L(`📐 Max Đất`, `📐 Max Land`);
      quickLandBtn.onclick = () => quickExpandLandSelectedLot();
      quickExpandBtn.textContent = sp.activeChargers < sp.maxChargersPossibleNow
        ? `🔌 +${L("Trụ", "Bay")} (${formatCompactVND(installCostNow)})`
        : L(`🔌 Hết m²`, `🔌 No m²`);
      quickExpandBtn.onclick = () => quickAddChargerSelectedLot();
    }
  }

  const totalDebt = getTotalPlayerDebt();
  const quickDebtBtn = document.getElementById("pay-debt-quick-btn");
  const debtDot = document.getElementById("debt-dot-alert");
  if (quickDebtBtn) {
    if (totalDebt > 0) {
      quickDebtBtn.style.display = "inline-block";
      quickDebtBtn.textContent = `💳 ${L("Nợ", "Debt")} ${formatCompactVND(totalDebt)}`;
      if (debtDot) debtDot.style.display = "block";
    } else {
      quickDebtBtn.style.display = "none";
      if (debtDot) debtDot.style.display = "none";
    }
  }

  // 1. Render Tab 1
  const selPanel = document.getElementById("selected-lot-panel");
  if (!lot.owned) {
    const estRentMonth = Math.round(lot.areaM2 * lot.monthlyRentPerM2);
    const roadNameDisp = isEn() ? (adjRoad.nameEn || adjRoad.name) : adjRoad.name;
    selPanel.innerHTML = `
      <div class="upgrade-card selected-lot" style="flex-direction:column; align-items:stretch; gap:6px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
          <div class="u-info">
            <div class="u-title">
              <span>${lotDisplayName}</span>
              <span class="u-badge area">📈 ${L(`Giá Thị Trường +${mVal.pctChange}%`, `Market +${mVal.pctChange}%`)}</span>
              ${mVal.botOwner ? `<span class="u-badge rival">🤖 ${mVal.botOwner.ownerName} (${mVal.botChargers}🔌)</span>` : `<span class="u-badge">🚦 ${roadRuleTxt}</span>`}
              ${appeal.landscapeLabel ? `<span class="u-badge taxi">${appeal.landscapeLabel}</span>` : ""}
            </div>
            <div class="u-desc">
              ${mVal.botOwner
                ? L(
                    `🤖 Đang thuộc sở hữu của tập đoàn <b>${mVal.botOwner.ownerName}</b> (Đã lắp <b>${mVal.botChargers} trụ sạc</b>). Giá mua đứt theo thị trường: <b style="color:#dc2626">${formatVND(mVal.botBuyoutPrice)}</b> (Tiếp quản toàn bộ trụ sạc!).`,
                    `🤖 Currently owned by Bot Corp <b>${mVal.botOwner.ownerName}</b> (<b>${mVal.botChargers} chargers</b> built). Market Buyout Price: <b style="color:#dc2626">${formatVND(mVal.botBuyoutPrice)}</b> (Inherit all chargers!).`
                  )
                : `📝 <b>${L("Thuê:", "Lease:")}</b> ${formatVND(effectiveLeaseCost)} (${formatCompactVND(estRentMonth)}/${L("tháng", "mo")}) • 🏠 <b>${L("Mua Sổ đỏ:", "Buy Freehold:")}</b> ${formatVND(effectiveBuyCost)}`
              }
              <span class="detail-toggle-link" onclick="toggleCardDetail('unowned-detail-${lot.id}')">ℹ️ ${L("Công thức giá", "Price Formula")}</span>
            </div>
            <div class="more-detail-box" id="unowned-detail-${lot.id}">
              • <b>${L("Công thức Định giá Thị trường:", "Market Valuation Formula:")}</b> ${L("Giá gốc", "Base")} (${formatCompactVND(lot.buyLandCost)}) × ${L("Sức nóng Phường", "Ward Demand")} (${mVal.occupiedInWard} ${L("lô đã mở", "active lots")}) × ${L("Cảnh quan & Sóng BĐS", "Landscape & Market Wave")} = <b>×${mVal.totalMult.toFixed(2)} (+${mVal.pctChange}%)</b>.<br/>
              • ${lotDisplayNote} • ${L("Tiếp giáp:", "Frontage:")} <b>${roadNameDisp}</b>.
            </div>
          </div>
          <div style="display:flex; flex-direction:column; gap:4px; flex-shrink:0;">
            ${mVal.botOwner ? `
              <button class="u-btn warn" ${state.money < mVal.botBuyoutPrice ? "disabled" : ""} onclick="buyoutLotFromBot(${lot.id})">
                💼 ${L("Thâu Tóm Lô Đất", "Buyout From Bot")}<br/>(${formatCompactVND(mVal.botBuyoutPrice)})
              </button>
              <button class="u-btn purple" onclick="startRewardedVideoAd('ad_cash')">
                🎬 ${L("Xem Video<br/>(+35,000 G$)", "Watch Ad<br/>(+35,000 G$)")}
              </button>
            ` : `
              <button class="u-btn warn" ${state.money < effectiveLeaseCost ? "disabled" : ""} onclick="acquireLot(${lot.id}, 'leased', '${pendingBiz}')">
                📝 ${L("Thuê Đất", "Lease Lot")}<br/>(${formatCompactVND(effectiveLeaseCost)})
              </button>
              <button class="u-btn" ${state.money < effectiveBuyCost ? "disabled" : ""} onclick="acquireLot(${lot.id}, 'owned', '${pendingBiz}')">
                🏠 ${L("Mua Sổ Đỏ", "Buy Freehold")}<br/>(${formatCompactVND(effectiveBuyCost)})
              </button>
            `}
          </div>
        </div>

        ${!mVal.botOwner ? `
          <div style="border-top:1.5px dashed #d6d3d1; padding-top:5px;">
            <div style="font-size:8.6px; font-weight:900; color:#78350f; margin-bottom:4px;">
              ⚡ ${L("CHỌN MÔ HÌNH KINH DOANH CHO LÔ TRẠM SẠC NÀY KHI MỞ:", "SELECT BUSINESS MODE FOR THIS LOT UPON OPENING:")}
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:5px;">
              <button class="pop-btn ${pendingBiz === 'franchise' ? 'green' : ''}" onclick="setPendingNewLotBizMode('franchise')">
                🤝 ${L("Nhượng Quyền (Franchise)", "Franchise (Subsidized)")}<br/>
                <span style="font-size:7.8px; font-weight:700;">${L("Trợ giá trụ -40% (10K/trụ) • Lãi +0.75 G$/kWh • +8đ Taxi", "Subsidized (-40%, 10K/bay) • +0.75 G$/kWh • +8pt Taxi")}</span>
              </button>
              <button class="pop-btn ${pendingBiz === 'direct' ? 'blue' : ''}" onclick="setPendingNewLotBizMode('direct')">
                🏢 ${L("Tự Doanh (Direct Sale)", "Direct Sale (Full Margin)")}<br/>
                <span style="font-size:7.8px; font-weight:700;">${L(`Tự đầu tư (+${formatCompactVND(unownedDirectExtra)} khi mở, 18K/trụ) • Lãi +1.35 G$/kWh`, `Unsubsidized (+${formatCompactVND(unownedDirectExtra)} setup, 18K/bay) • +1.35 G$/kWh`)}</span>
              </button>
            </div>
          </div>
        ` : ""}
      </div>
    `;
  } else {
    const amenityBonus = getLotAmenityBonusPerCar(lot);
    const lotDebt = Math.round((lot.debtPrincipal || 0) + (lot.debtInterest || 0));
    const lotBizMode = getLotBusinessMode(lot);
    const isDirect = lotBizMode === "direct";
    const subsidyBuyoutCost = getLotSubsidyBuyoutCostToDirect(lot);
    const installCostForLot = getBayInstallCostForLot(lot);
    const monthlyRentLot = getLotMonthlyRent(lot);
    const monthlyGuardLot = lot.hasGuard ? (lot.guardMonthlyWage || 6000000) : 0;

    let html = renderSpatialAllocationBox(lot);

    html += `
      <div class="upgrade-card selected-lot">
        <div class="u-info">
          <div class="u-title">
            <span>${lotDisplayName}</span>
            <span class="u-badge">${lot.ownershipType === "owned" ? L("🏠 Sổ Đỏ", "🏠 Freehold") : L("📝 Đất Thuê", "📝 Leased")}</span>
            <span class="u-badge ${isDirect ? 'area' : 'taxi'}">${isDirect ? L("🏢 Tự Doanh (+1.35 G$/kWh)", "🏢 Direct Sale (+1.35 G$/kWh)") : L("🤝 Nhượng Quyền (+0.75 G$/kWh)", "🤝 Franchise (+0.75 G$/kWh)")}</span>
            <span class="u-badge taxi">🚕 ${appeal.taxiTotal}${L("đ", "pt")}</span>
            <span class="u-badge casual">🚗 ${appeal.casualTotal}${L("đ", "pt")}</span>
            ${appeal.iceSquatterCount > 0 ? `<span class="u-badge rival">⛽ ${appeal.iceSquatterCount} ${L(`Xe xăng lấn (-${appeal.iceSquatterPenalty}đ)`, `Gas Squat (-${appeal.iceSquatterPenalty}pt)`)}</span>` : ""}
            ${appeal.landscapeLabel ? `<span class="u-badge taxi">${appeal.landscapeLabel}</span>` : ""}
          </div>
          <div class="u-desc">
            ${L("Thu phụ trợ:", "Amenity Rev:")} <b>+${formatVND(amenityBonus)}/${L("xe", "car")}</b> •
            ${L("Chi phí tháng:", "Monthly Fixed:")} <b style="color:#dc2626">${formatCompactVND(monthlyRentLot + monthlyGuardLot)}/${L("th", "mo")}</b> •
            ${L("Định giá bán:", "Bot Offer:")} <b style="color:#047857">${formatVND(mVal.botOfferForPlayerLot)}</b>
            <span class="detail-toggle-link" onclick="toggleCardDetail('lot-info-detail-${lot.id}')">ℹ️ ${L("Chi tiết", "Details")}</span>
          </div>
          <div class="more-detail-box" id="lot-info-detail-${lot.id}">
            • ${L(
                `Điểm thu hút: Trụ sạc (+${appeal.chargerScore}đ)${!isDirect ? ' + Thương hiệu Franchise (+8đ Taxi)' : ''} + Tiện ích (Taxi +${appeal.taxiAmenityScore}đ / Thường +${appeal.casualAmenityScore}đ)`,
                `Appeal Score: Chargers (+${appeal.chargerScore}pt)${!isDirect ? ' + Franchise Brand (+8pt Taxi)' : ''} + Amenities (Taxi +${appeal.taxiAmenityScore}pt / Casual +${appeal.casualAmenityScore}pt)`
              )}${appeal.iceSquatterPenalty > 0 ? ` - ${L("Xe xăng đỗ lấn", "Gas Car Squatting")} (<b style="color:#dc2626">-${appeal.iceSquatterPenalty}${L("đ", "pt")}</b>)` : ""}.<br/>
            • ${L("Chi phí định kỳ Ngày 30:", "Day 30 Monthly Billing:")} ${L("Thuê đất", "Land Rent")} <b>${formatVND(monthlyRentLot)}</b> + ${L("Lương Bảo vệ", "Guard Salary")} <b>${formatVND(monthlyGuardLot)}</b>.
          </div>
        </div>
        <div style="display:flex; flex-direction:column; gap:4px;">
          ${lot.ownershipType === "leased" ? `
            <button class="u-btn warn" ${state.money < Math.round(mVal.marketBuyPrice * 0.88) ? "disabled" : ""} onclick="acquireLot(${lot.id}, 'owned')">
              🏠 ${L("Mua Sổ Đỏ", "Buy Freehold")}<br/>(${formatCompactVND(Math.round(mVal.marketBuyPrice * 0.88))})
            </button>
          ` : ""}
          <button class="u-btn secondary" onclick="openAmenitiesForSelectedLot()">${L("☕ Tiện Ích", "☕ Amenities")}</button>
          ${ownedLotsNow.length > 1 ? `
            <button class="u-btn purple" onclick="sellPlayerLotToBotMarket(${lot.id})" title="${L('Bán chốt lời lô đất này cho Tập đoàn Bot theo Giá Thị Trường', 'Sell this lot to a Bot Corp at Market Valuation')}">
              🤝 ${L("Bán Cho Bot", "Sell to Bot")}<br/>(+${formatCompactVND(mVal.botOfferForPlayerLot)})
            </button>
          ` : ""}
        </div>
      </div>
    `;

    // THẺ MÔ HÌNH KINH DOANH CỦA RIÊNG LÔ TRẠM SẠC NÀY (FRANCHISE vs DIRECT SALE — CHO PHÉP ĐÓNG BÙ TIỀN TRỢ GIÁ ĐỂ NÂNG CẤP)
    html += `
      <div class="upgrade-card ${isDirect ? 'selected-lot' : 'amenity-card'}">
        <div class="u-info">
          <div class="u-title">
            <span>⚡ ${L("Mô Hình Vận Hành Lô Trạm Sạc:", "Station Business Mode:")} <b>${isDirect ? L("🏢 Tự Doanh (Direct Sale)", "🏢 Direct Sale") : L("🤝 Nhượng Quyền (Franchise)", "🤝 Franchise")}</b></span>
            <span class="u-badge ${isDirect ? 'taxi' : 'area'}">${isDirect ? "+1.35 G$/kWh" : "+0.75 G$/kWh"}</span>
          </div>
          <div class="u-desc">
            ${isDirect
              ? L(
                  `Lô này đã tự đầu tư 100% thiết bị & trạm biến áp: Hưởng trọn biên lợi nhuận <b>+1.35 G$/kWh</b> (Chi phí lắp trụ mới: <b>${formatCompactVND(DIRECT_BAY_INSTALL_COST)}/trụ</b>, nâng cấp trụ tính 100% giá gốc).`,
                  `Operating in 100% self-owned Direct Sale mode: Earns full <b>+1.35 G$/kWh</b> retail margin (New bay setup: <b>${formatCompactVND(DIRECT_BAY_INSTALL_COST)}/bay</b>, unsubsidized hardware upgrades).`
                )
              : L(
                  `Đang nhận trợ giá ~40% từ hãng Nhượng Quyền (Lắp trụ chỉ <b>${formatCompactVND(FRANCHISE_BAY_INSTALL_COST)}/trụ</b>, nâng cấp rẻ hơn, +8đ thu hút Taxi, lãi <b>+0.75 G$/kWh</b>). Bạn có thể <b>đóng bù tiền trợ giá (${formatVND(subsidyBuyoutCost)})</b> để nâng cấp lô này lên <b>Tự Doanh (+1.35 G$/kWh)</b>!`,
                  `Subsidized ~40% under Franchise agreement (New bay only <b>${formatCompactVND(FRANCHISE_BAY_INSTALL_COST)}/bay</b>, cheaper upgrades, +8pt Taxi appeal, <b>+0.75 G$/kWh</b> margin). Pay back the hardware subsidy (<b>${formatVND(subsidyBuyoutCost)}</b>) to upgrade this lot to <b>Direct Sale (+1.35 G$/kWh)</b>!`
                )}
          </div>
        </div>
        ${isDirect
          ? `<button class="u-btn maxed" disabled>✅ ${L("Đã Tự Doanh", "Direct Active")}</button>`
          : `<button class="u-btn warn" ${state.money < subsidyBuyoutCost || lot.lockedByDebt ? "disabled" : ""} onclick="upgradeLotToDirectSale(${lot.id})">
              🏢 ${L("Lên Tự Doanh", "Go Direct Sale")}<br/>(${formatCompactVND(subsidyBuyoutCost)})
            </button>`}
      </div>
    `;

    if (lotDebt > 0) {
      html += `
        <div class="upgrade-card debt-card">
          <div class="u-info">
            <div class="u-title" style="color:#dc2626;">
              <span>${lot.lockedByDebt ? L("🔒 ĐÃ KHÓA DO NỢ QUÁ HẠN 360 NGÀY", "🔒 LOCKED DUE TO 360-DAY OVERDUE DEBT") : L("⚠️ ĐANG NỢ THUÊ / THUẾ", "⚠️ OVERDUE RENT / TAX DEBT")}</span>
            </div>
            <div class="u-desc" style="color:#991b1b;">
              ${L("Gốc:", "Principal:")} <b>${formatCompactVND(lot.debtPrincipal)}</b> + ${L("Lãi phạt:", "Penalty:")} <b>${formatCompactVND(lot.debtInterest)}</b> (${lot.debtDaysOverdue}/360 ${L("ngày", "days")}).
            </div>
          </div>
          <button class="u-btn danger" onclick="payLotDebt(${lot.id})">
            💳 ${L("Trả Nợ", "Pay Debt")}<br/>(${formatCompactVND(lotDebt)})
          </button>
        </div>
      `;
    }

    const canAddMoreChargerNow = sp.activeChargers < sp.maxChargersPossibleNow;
    html += `
      <div class="upgrade-card expand-highlight">
        <div class="u-info">
          <div class="u-title">
            <span>${L("🔌 Lắp Trụ Sạc Mới (20 m²/trụ)", "🔌 Install New EV Charger (20 m²/bay)")}</span>
            <span class="u-badge">${sp.activeChargers}/${sp.maxChargersPossibleNow} ${L("Trụ", "Bays")}</span>
            <span class="u-badge ${isDirect ? 'area' : 'taxi'}">${isDirect ? L("Giá gốc Direct: 18K G$", "Direct Cost: 18K G$") : L("Trợ giá Franchise: 10K G$", "Franchise Subsidized: 10K G$")}</span>
          </div>
          <div class="u-desc">
            ${canAddMoreChargerNow
              ? L(
                  `Đất trống còn <b>${sp.freeM2}m²</b> (đủ lắp thêm <b>${sp.maxChargersPossibleNow - sp.activeChargers} trụ</b>, +4đ thu hút/trụ • Chi phí lắp theo chế độ ${isDirect ? "Tự Doanh" : "Nhượng Quyền"}: <b>${formatVND(installCostForLot)}</b>).`,
                  `Free land: <b>${sp.freeM2}m²</b> (room for <b>${sp.maxChargersPossibleNow - sp.activeChargers} more chargers</b>, +4pt appeal/charger • ${isDirect ? "Direct Sale" : "Franchise"} setup cost: <b>${formatVND(installCostForLot)}</b>).`
                )
              : L(
                  `⚠️ Trống <b>${sp.freeM2}m²</b> (< 20m²/trụ). Bấm <b>📐 +${lot.expandStepAreaM2}m² Đất</b> ở trên để mở thêm trụ!`,
                  `⚠️ Only <b>${sp.freeM2}m²</b> free (< 20m²/bay). Tap <b>📐 +${lot.expandStepAreaM2}m² Land</b> above to add more bays!`
                )}
          </div>
        </div>
        ${canAddMoreChargerNow ? `
          <button class="u-btn" ${state.money < installCostForLot || lot.lockedByDebt ? "disabled" : ""} onclick="installNewChargerOnLot(${lot.id})">
            🔌 +${L("Trụ", "Bay")} #${sp.activeChargers + 1}<br/>(${formatCompactVND(installCostForLot)})
          </button>
        ` : `
          <button class="u-btn secondary" ${(lot.expansionCount || 0) >= (lot.maxExpansions || 3) ? "disabled" : ""} onclick="expandLotLandArea(${lot.id})">
            ${L("📐 Mở Đất", "📐 Expand Land")}
          </button>
        `}
      </div>
    `;

    html += `
      <div class="upgrade-card guard-card">
        <div class="u-info">
          <div class="u-title">
            <span>${L("👮 Bốt Bảo Vệ 24/7 (Thu Lương Tháng)", "👮 24/7 Security Booth (Monthly Salary)")}</span>
            <span class="u-badge ${lot.hasGuard ? 'taxi' : 'area'}">${lot.hasGuard ? L("Đang trực • Lương 6,000 G$/tháng", "Active • Salary 6,000 G$/mo") : L("Chưa thuê • 0 G$ phí trả trước", "Not Hired • 0 G$ Upfront")}</span>
          </div>
          <div class="u-desc">
            ${lot.hasGuard
              ? L(
                  `Đang trực 24/7: Tự động xua đuổi <b>Xe Xăng đỗ lấn chỗ</b> (tránh mất -15đ thu hút/xe), +6đ thu hút & thu phạt xe quá giờ nhanh gấp ×2.2 lần. <b>Lương định kỳ ${formatVND(lot.guardMonthlyWage || 6000000)}/tháng</b> tự động khấu trừ vào Ngày 30 cuối tháng!`,
                  `On duty 24/7: Auto-evicts <b>Gas Cars in EV bays</b> (prevents -15pt appeal penalty), +6pt appeal & ×2.2 faster overstay fine collection. <b>Monthly salary of ${formatVND(lot.guardMonthlyWage || 6000000)}/mo</b> is billed on Day 30!`
                )
              : L(
                  `Tuyển dụng ngay với <b>0 G$ phí trả trước</b> (Trả lương định kỳ <b>${formatVND(lot.guardMonthlyWage || 6000000)}/tháng</b> vào Ngày 30 cuối tháng). Giúp tự động đuổi Xe Xăng đỗ lấn chỗ, +6đ thu hút & thu phạt ×2.2 lần!`,
                  `Hire immediately with <b>0 G$ upfront fee</b> (Monthly salary of <b>${formatVND(lot.guardMonthlyWage || 6000000)}/mo</b> billed on Day 30). Auto-evicts gas squatters, adds +6pt appeal & speeds up fine collection by ×2.2!`
                )}
          </div>
        </div>
        ${lot.hasGuard
          ? `<button class="u-btn danger" onclick="dismissGuardForLot(${lot.id})">🛑 ${L("Cho Nghỉ Việc", "Dismiss")}<br/>(${L("-6K G$/th", "-6K G$/mo")})</button>`
          : `<button class="u-btn secondary" onclick="hireGuardForLot(${lot.id})">👮 ${L("Tuyển Bảo Vệ", "Hire Guard")}<br/>(${L("0 G$ • 6K/th", "0 G$ • 6K/mo")})</button>`
        }
      </div>
    `;

    lot.bays.forEach((bay, idx) => {
      const curTier = CHARGER_TIERS[bay.tier];
      const nextTier = CHARGER_TIERS[bay.tier + 1];
      const statusHtml = getBayStatusText(bay);

      html += `
        <div class="upgrade-card">
          <div class="u-info">
            <div class="u-title">
              <span>${L("Trụ", "Bay")} #${idx + 1}: ${getItemName(curTier)}</span>
              <span class="u-badge">${curTier.kw} kW • 20m²</span>
            </div>
            <div class="u-desc" id="live-bay-status-${lot.id}-${idx}">${statusHtml}</div>
          </div>
          <div style="display:flex; flex-direction:column; gap:4px;" id="live-bay-actions-${lot.id}-${idx}">
            ${renderBayActionButtons(lot, bay, idx, curTier, nextTier)}
          </div>
        </div>
      `;
    });

    selPanel.innerHTML = html;
  }

  // 2. Render Tab 2
  const amPanel = document.getElementById("selected-lot-amenities-panel");
  if (!lot.owned) {
    amPanel.innerHTML = `
      <div class="upgrade-card">
        <div class="u-info">
          <div class="u-title">${L("🔒 Lô đất này chưa mở", "🔒 Lot Not Yet Acquired")}</div>
          <div class="u-desc">${L(`Hãy Thuê hoặc Mua Sổ Đỏ <b>${lotDisplayName}</b> trước khi xây dựng Tiện ích 2.5D.`, `Please Lease or Buy Freehold for <b>${lotDisplayName}</b> before building 2.5D Amenities.`)}</div>
        </div>
        <button class="u-btn warn" onclick="openDockTab('tab-lot-detail', document.getElementById('btn-tab-lot'))">${L("Mở Lô Đất", "Acquire Lot")}</button>
      </div>
    `;
  } else {
    let amHtml = renderSpatialAllocationBox(lot);

    AMENITY_CATALOG.forEach(item => {
      const lvl = (lot.amenities && lot.amenities[item.id]) || 0;
      const isMax = lvl >= 3;
      const curFootprint = getAmenityFootprintM2(item, lvl);
      const nextFootprint = isMax ? curFootprint : getAmenityFootprintM2(item, lvl + 1);
      const deltaM2Needed = nextFootprint - curFootprint;
      const enoughSpace = sp.freeM2 >= deltaM2Needed;

      const nextCost = isMax ? 0 : Math.round(item.baseCost * Math.pow(1.75, lvl));
      const curRev = lvl > 0 ? Math.round(item.baseRevPerCar * (1 + (lvl - 1) * 0.65)) : 0;
      const nextRev = Math.round(item.baseRevPerCar * (1 + lvl * 0.65));

      amHtml += `
        <div class="upgrade-card amenity-card ${lvl > 0 ? "owned" : ""}">
          <div class="u-info">
            <div class="u-title">
              <span>${item.icon} ${getItemName(item)}</span>
              <span class="u-badge">${lvl > 0 ? L(`Cấp ${lvl}/3 (${curFootprint}m²)`, `Lv ${lvl}/3 (${curFootprint}m²)`) : L(`Cần ${nextFootprint}m²`, `Needs ${nextFootprint}m²`)}</span>
              <span class="u-badge taxi">🚕+${item.taxiAppeal}${L("đ", "pt")}</span>
              <span class="u-badge casual">🚗+${item.casualAppeal}${L("đ", "pt")}</span>
            </div>
            <div class="u-desc">
              ${L("Thu:", "Rev:")} <b>+${formatVND(lvl > 0 ? curRev : nextRev)}/${L("xe", "car")}</b> •
              ${L("Chiếm:", "Area:")} <b>${lvl > 0 ? curFootprint : nextFootprint}m²</b>
              <span class="detail-toggle-link" onclick="toggleCardDetail('am-detail-${item.id}')">ℹ️ ${L("Mô tả", "Info")}</span>
            </div>
            <div class="more-detail-box" id="am-detail-${item.id}">
              ${getItemDesc(item)}
            </div>
          </div>
          <div>
            ${isMax
              ? `<button class="u-btn maxed" disabled>Max (3/3)</button>`
              : (!enoughSpace
                  ? `<button class="u-btn secondary" onclick="expandLotLandArea(${lot.id})">${L(`Thiếu ${deltaM2Needed - sp.freeM2}m²<br/>(Mở Đất)`, `Need ${deltaM2Needed - sp.freeM2}m²<br/>(Expand)`)}</button>`
                  : `<button class="u-btn ${lvl === 0 ? "warn" : ""}" ${state.money < nextCost || lot.lockedByDebt ? "disabled" : ""} onclick="buyOrUpgradeAmenity(${lot.id}, '${item.id}')">
                      ${lvl === 0 ? L(`Mở (-${deltaM2Needed}m²)`, `Build (-${deltaM2Needed}m²)`) : L(`Lên C${lvl + 1} (-${deltaM2Needed}m²)`, `Lv${lvl + 1} (-${deltaM2Needed}m²)`) }<br/>(${formatCompactVND(nextCost)})
                    </button>`
                )
            }
          </div>
        </div>
      `;
    });
    amPanel.innerHTML = amHtml;
  }

  // 3. Render Tab 3: Toàn bộ 5.400 Lô Đất Đại Đô Thị Hà Nội (12 Quận × 3 Phường × 150 Lô) có Phân trang 50 Lô/trang mượt mà
  const allLotsEl = document.getElementById("all-lots-list");
  const curSec = getSectorAtWorldPos(camera.x, camera.y);
  let filteredLots = state.lots;
  if (state.lotZoneFilter === "OWNED") {
    filteredLots = state.lots.filter(l => l.owned);
  } else if (state.lotZoneFilter === "CURRENT_WARD") {
    filteredLots = SECTOR_LOTS_MAP[curSec.sIdx] || [];
  } else if (state.lotZoneFilter && state.lotZoneFilter.startsWith("DIST_")) {
    const dIdx = parseInt(state.lotZoneFilter.replace("DIST_", ""), 10);
    filteredLots = state.lots.filter(l => l.districtIdx === dIdx);
  } else if (state.lotZoneFilter !== "ALL") {
    filteredLots = state.lots.filter(l => l.zone === state.lotZoneFilter);
  }

  const PAGE_SIZE = 50;
  const totalMatching = filteredLots.length;
  const totalPages = Math.max(1, Math.ceil(totalMatching / PAGE_SIZE));
  const curPage = Math.max(0, Math.min(totalPages - 1, state.lotListPage || 0));
  state.lotListPage = curPage;
  const pageLots = filteredLots.slice(curPage * PAGE_SIZE, (curPage + 1) * PAGE_SIZE);

  const paginationBarHtml = `
    <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; background:#fef3c7; border:1.8px solid var(--wood-border); border-radius:10px; padding:5px 8px; margin-bottom:6px; font-size:9px; font-weight:900; color:#451a03;">
      <button class="sheet-mini-btn" ${curPage <= 0 ? "disabled" : ""} onclick="setLotListPage(${curPage - 1})">${L("◀ Trước", "◀ Prev")}</button>
      <span>📊 ${L("Đang hiển thị", "Showing")} <b>${totalMatching > 0 ? (curPage * PAGE_SIZE + 1) : 0}–${Math.min(totalMatching, (curPage + 1) * PAGE_SIZE)}</b> / <b style="color:#047857">${totalMatching.toLocaleString(isEn() ? "en-US" : "vi-VN")} ${L("Lô", "Lots")}</b> (${L("Trang", "Page")} ${curPage + 1}/${totalPages})</span>
      <button class="sheet-mini-btn" ${curPage >= totalPages - 1 ? "disabled" : ""} onclick="setLotListPage(${curPage + 1})">${L("Sau ▶", "Next ▶")}</button>
    </div>
  `;

  let allHtml = paginationBarHtml;
  pageLots.forEach(l => {
    const isSel = l.id === state.selectedLotId;
    const lsp = getLotSpatialBreakdown(l);
    const lappeal = getLotAppealScores(l);
    const lRoad = H_ROADS[l.roadHIdx];
    const lRoadTag = lRoad.oneWay === 0 ? L("2 chiều", "2-Way") : (lRoad.oneWay === 1 ? L("1 chiều ➔", "1-Way ➔") : L("1 chiều ⬅", "1-Way ⬅"));

    const bayPills = l.bays.map((b, i) => `<span class="slot-pill">#${i + 1}:${CHARGER_TIERS[b.tier].kw}kW</span>`).join("");
    const amenityPills = getLotOwnedAmenitiesList(l).map(am => `<span class="slot-pill amenity-pill">${am.icon}${isEn() ? "Lv" : "C"}${am.level}</span>`).join("");

    allHtml += `
      <div class="upgrade-card ${isSel ? "selected-lot" : ""}">
        <div class="u-info">
          <div class="u-title">
            <span>${getLotDisplayName(l)}</span>
            <span class="u-badge area">${l.areaM2}m² (${lsp.activeChargers}/${lsp.maxChargersPossibleNow}🔌)</span>
            <span class="u-badge">🚦 ${lRoadTag}</span>
            ${lappeal.landscapeLabel ? `<span class="u-badge taxi">${lappeal.landscapeLabel}</span>` : ""}
            ${l.owned
              ? `<span class="u-badge taxi">🚕${lappeal.taxiTotal}${L("đ", "pt")}</span><span class="u-badge casual">🚗${lappeal.casualTotal}${L("đ", "pt")}</span>`
              : `<span class="u-badge">${L("Chưa mở", "Available")}</span>`}
          </div>
          <div class="u-desc">${isEn() ? (l.districtEn || l.district) : l.district} — ${L("Thuê:", "Lease:")} ${formatCompactVND(l.leaseCostInitial)} | ${L("Mua:", "Buy:")} ${formatCompactVND(l.buyLandCost)} <span class="detail-toggle-link" onclick="toggleCardDetail('all-lot-desc-${l.id}')">ℹ️ ${L("Chi tiết", "Details")}</span></div>
          <div class="more-detail-box" id="all-lot-desc-${l.id}">${getLotDisplayNote(l)}</div>
          <div class="slot-pills">${bayPills} ${amenityPills}</div>
        </div>
        <div style="display:flex; flex-direction:column; gap:4px;">
          <button class="u-btn secondary" onclick="selectLot(${l.id}, true); openDockTab('tab-lot-detail', document.getElementById('btn-tab-lot')); state.sheetMode='normal'; applySheetModeUI();">
            ${L("🎯 Bay Tới", "🎯 Jump To")}
          </button>
          ${!l.owned ? `
            <button class="u-btn warn" ${state.money < l.leaseCostInitial ? "disabled" : ""} onclick="acquireLot(${l.id}, 'leased')">
              📝 ${L("Thuê", "Lease")} (${formatCompactVND(l.leaseCostInitial)})
            </button>
          ` : ""}
        </div>
      </div>
    `;
  });
  if (totalPages > 1) allHtml += paginationBarHtml;
  allLotsEl.innerHTML = pageLots.length > 0 ? allHtml : `<div class="upgrade-card"><div class="u-desc">${L("Không có lô đất nào trong bộ lọc này.", "No lots match this filter.")}</div></div>`;

  // 4. Render Tab 4 (V2 MULTIPLAYER COMMAND CENTER: LIVE LAND AUCTION, PRICE WAR, B2B CONTRACTS, DAILY QUESTS, LEADERBOARD & 8 RIVALS)
  renderMultiplayerAndRivalsTab();

  // 5. Render Tab 5
  renderTaxAndDebtTab();
}

/*****************************************************************************************
 * V2 MOBILE SOUND SYNTHESIZER (WEB AUDIO API) + HAPTIC FEEDBACK + MULTIPLAYER WEBSOCKET
 *****************************************************************************************/
globalThis.audioCtx = null;
globalThis.sfxEnabled = true;

export function triggerHaptic(ms = 18) {
  try {
    if (navigator.vibrate) navigator.vibrate(ms);
  } catch (e) {}
}

export function playSfx(kind = "click") {
  if (!sfxEnabled) return;
  try {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    if (!audioCtx) return;
    if (audioCtx.state === "suspended") audioCtx.resume();

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (kind === "cash") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.setValueAtTime(880.0, now + 0.06);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (kind === "bid") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.14);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc.start(now);
      osc.stop(now + 0.16);
    } else if (kind === "fine") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.setValueAtTime(480, now + 0.08);
      gain.gain.setValueAtTime(0.10, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.20);
      osc.start(now);
      osc.stop(now + 0.20);
    } else {
      osc.type = "sine";
      osc.frequency.setValueAtTime(520, now);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.start(now);
      osc.stop(now + 0.06);
    }
  } catch (e) {}
}

export function toggleSoundEffects() {
  sfxEnabled = !sfxEnabled;
  const btn = document.getElementById("btn-toggle-sfx");
  if (btn) {
    btn.textContent = sfxEnabled ? "🔊" : "🔇";
    btn.classList.toggle("active-tool", sfxEnabled);
  }
  const popSfx = document.getElementById("sfx-pop-btn");
  if (popSfx) {
    popSfx.textContent = sfxEnabled
      ? L("🔊 Âm thanh: Bật", "🔊 Sound: ON")
      : L("🔇 Âm thanh: Tắt", "🔇 Sound: OFF");
    popSfx.classList.toggle("green", sfxEnabled);
  }
  if (sfxEnabled) playSfx("cash");
  triggerHaptic(15);
}

export function updateLiveStatusOnly() {
  const lot = getSelectedLot();
  if (lot && lot.owned) {
    lot.bays.forEach((bay, idx) => {
      const stEl = document.getElementById(`live-bay-status-${lot.id}-${idx}`);
      if (stEl) stEl.innerHTML = getBayStatusText(bay);
    });
  }
  const totalDebt = getTotalPlayerDebt();
  const yrRevEl = document.getElementById("fin-yr-rev");
  if (yrRevEl) yrRevEl.textContent = formatVND(state.yearlyGrossRevenue);
  const chRevEl = document.getElementById("fin-charge-rev");
  if (chRevEl) chRevEl.textContent = formatVND(state.totalProfitAllTime);
  const txEl = document.getElementById("fin-tax-paid");
  if (txEl) txEl.textContent = formatVND(state.totalRentAndTaxPaid);
  const dbEl = document.getElementById("fin-debt-total");
  if (dbEl) dbEl.textContent = formatVND(totalDebt);
}

/*****************************************************************************************
 * KHỞI ĐỘNG GAME V2 MULTIPLAYER, ĐĂNG KÝ PWA SERVICE WORKER & VÒNG LẶP 60 FPS
 *****************************************************************************************/

// Đăng ký vào globalThis để tương thích ngược với HTML event handlers & các module liên kết
Object.assign(globalThis, {
  sanitizeFiniteNumber,
  formatVND,
  formatCompactVND,
  formatGreenCoin,
  buyRemoveAdsPack,
  restoreIapPurchases,
  updateGreenCoinHUD,
  logEvent,
  refreshAllUI,
  triggerHaptic,
  playSfx,
  toggleSoundEffects,
  updateLiveStatusOnly
});
