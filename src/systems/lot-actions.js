/**
 * src/systems/lot-actions.js
 * Các thao tác của người chơi trên Lô đất: Mua/Thuê, Mở rộng diện tích, Lắp trụ, Mua tiện ích, Thuê bảo vệ, Ký B2B
 */
export function selectLot(lotId, panCamera = true) {
  state.selectedLotId = lotId;
  if (panCamera) zoomToLot(lotId);
  refreshAllUI();
}

export function setPendingNewLotBizMode(mode) {
  state.pendingNewLotBizMode = mode === "direct" ? "direct" : "franchise";
  if (typeof playSfx === "function") playSfx("click");
  refreshAllUI();
}

export function upgradeLotToDirectSale(lotId) {
  const lot = state.lots.find(l => l.id === lotId);
  if (!lot || !lot.owned) return;
  if (getLotBusinessMode(lot) === "direct") {
    logEvent(L(`ℹ️ ${getLotDisplayName(lot)} đã ở chế độ Tự Doanh (Direct Sale)!`, `ℹ️ ${getLotDisplayName(lot)} is already operating in Direct Sale mode!`));
    return;
  }
  const paybackCost = getLotSubsidyBuyoutCostToDirect(lot);
  if (state.money < paybackCost) {
    logEvent(L(
      `⚠️ Cần ${formatVND(paybackCost)} để đóng bù tiền trợ giá trụ sạc & hạ tầng biến áp khi nâng cấp ${getLotDisplayName(lot)} lên Tự Doanh (Direct Sale)!`,
      `⚠️ Need ${formatVND(paybackCost)} to pay back charger subsidies & transformer setup to upgrade ${getLotDisplayName(lot)} to Direct Sale!`
    ));
    return;
  }
  state.money -= paybackCost;
  lot.businessMode = "direct";
  if (typeof playSfx === "function") playSfx("cash");
  if (typeof triggerHaptic === "function") triggerHaptic(32);
  floatTexts.push({
    x: lot.x,
    y: lot.y - 26,
    text: L(`🏢 Lên Tự Doanh (+1.35 G$/kWh)`, `🏢 Direct Sale (+1.35 G$/kWh)`),
    color: "#0284c7",
    life: 2.2
  });
  logEvent(L(
    `🏢 Đã đóng bù ${formatVND(paybackCost)} tiền trợ giá để nâng cấp ${getLotDisplayName(lot)} từ Nhượng Quyền (Franchise) lên Tự Doanh (Direct Sale — Hưởng trọn +1.35 G$/kWh)!`,
    `🏢 Paid ${formatVND(paybackCost)} subsidy buyout to upgrade ${getLotDisplayName(lot)} from Franchise to Direct Sale (+1.35 G$/kWh margin)!`
  ));
  saveGameToStorage(false);
  refreshAllUI();
}

export function acquireLot(lotId, mode, explicitBizMode) {
  const lot = state.lots.find(l => l.id === lotId);
  if (!lot) return;
  const val = getLotMarketValuation(lot);

  if (!lot.owned && val.botOwner) {
    buyoutLotFromBot(lotId);
    return;
  }

  if (!lot.owned) {
    const chosenBiz = explicitBizMode || state.pendingNewLotBizMode || "franchise";
    const extraDirectSetup = chosenBiz === "direct" ? getLotSubsidyBuyoutCostToDirect(lot) : 0;
    const baseLandCost = mode === "leased" ? val.marketLeaseDeposit : val.marketBuyPrice;
    const cost = baseLandCost + extraDirectSetup;
    if (state.money < cost) {
      logEvent(L(
        `⚠️ Cần ${formatVND(cost)} (${chosenBiz === "direct" ? "Đã gồm phí thiết bị Direct Sale không trợ giá" : "Chế độ Franchise trợ giá"}) để ${mode === "leased" ? "thuê" : "mua sổ đỏ"} ${getLotDisplayName(lot)}!`,
        `⚠️ Need ${formatVND(cost)} (${chosenBiz === "direct" ? "Includes unsubsidized Direct Sale hardware setup" : "Subsidized Franchise mode"}) to ${mode === "leased" ? "lease" : "buy freehold"} ${getLotDisplayName(lot)}!`
      ));
      return;
    }
    state.money -= cost;
    lot.owned = true;
    lot.ownershipType = mode;
    lot.businessMode = chosenBiz === "direct" ? "direct" : "franchise";
    state.selectedLotId = lot.id;
    zoomToLot(lot.id);

    const bizTagVi = lot.businessMode === "direct" ? "Tự Doanh Direct Sale (+1.35 G$/kWh)" : "Nhượng Quyền Franchise (+0.75 G$/kWh)";
    const bizTagEn = lot.businessMode === "direct" ? "Direct Sale (+1.35 G$/kWh)" : "Franchise (+0.75 G$/kWh)";

    if (mode === "leased") {
      logEvent(L(
        `📝 Đã THUÊ ${getLotDisplayName(lot)} (${lot.areaM2}m² • ${bizTagVi}) với tổng chi phí ${formatVND(cost)}. Tiền thuê: ${formatVND(getLotMonthlyRent(lot))}/tháng!`,
        `📝 LEASED ${getLotDisplayName(lot)} (${lot.areaM2}m² • ${bizTagEn}) for ${formatVND(cost)}. Monthly rent: ${formatVND(getLotMonthlyRent(lot))}!`
      ));
    } else {
      logEvent(L(
        `🏠 Đã MUA SỔ ĐỎ ${getLotDisplayName(lot)} (${lot.areaM2}m² • ${bizTagVi}) với tổng chi phí ${formatVND(cost)}. Miễn tiền thuê tháng!`,
        `🏠 BOUGHT FREEHOLD ${getLotDisplayName(lot)} (${lot.areaM2}m² • ${bizTagEn}) for ${formatVND(cost)}. Zero monthly rent!`
      ));
    }
  } else if (lot.ownershipType === "leased" && mode === "owned") {
    const buyoutCost = Math.round(val.marketBuyPrice * 0.88);
    if (state.money < buyoutCost) return;
    state.money -= buyoutCost;
    lot.ownershipType = "owned";
    logEvent(L(`🏠 Đã mua đứt quyền sở hữu sổ đỏ ${getLotDisplayName(lot)}!`, `🏠 Upgraded ${getLotDisplayName(lot)} to Freehold Red Book!`));
  }
  if (typeof playSfx === "function") playSfx("cash");
  if (typeof triggerHaptic === "function") triggerHaptic(28);
  if (typeof sendMpPacket === "function") sendMpPacket({ type: "CLAIM_LOT", lotId: lot.id, mode: lot.ownershipType });
  saveGameToStorage(false);
  refreshAllUI();
}

export function expandLotLandArea(lotId) {
  const lot = state.lots.find(l => l.id === lotId);
  if (!lot || !lot.owned) return;
  const curExp = lot.expansionCount || 0;
  const maxExp = lot.maxExpansions || 3;
  const lotDisp = getLotDisplayName(lot);
  if (curExp >= maxExp) {
    logEvent(L(`📐 ${lotDisp} đã đạt diện tích tối đa (${lot.areaM2} m²)!`, `📐 ${lotDisp} has reached maximum land area (${lot.areaM2} m²)!`));
    return;
  }
  const stepCost = Math.round(lot.expandStepCost * Math.pow(1.25, curExp));
  if (state.money < stepCost) {
    logEvent(L(`⚠️ Cần ${formatVND(stepCost)} để mở rộng thêm +${lot.expandStepAreaM2} m²!`, `⚠️ Need ${formatVND(stepCost)} to expand land by +${lot.expandStepAreaM2} m²!`));
    return;
  }
  state.money -= stepCost;
  lot.expansionCount = curExp + 1;
  lot.areaM2 += lot.expandStepAreaM2;

  const sp = getLotSpatialBreakdown(lot);
  floatTexts.push({
    x: lot.x,
    y: lot.y - 24,
    text: L(`📐 +${lot.expandStepAreaM2}m² (Trần ${sp.maxChargersPossibleNow}🔌)`, `📐 +${lot.expandStepAreaM2}m² (Cap ${sp.maxChargersPossibleNow}🔌)`),
    color: "#0284c7",
    life: 2.0
  });
  logEvent(L(`📐 Đã mở rộng ${lotDisp} lên ${lot.areaM2} m²! Trần trụ sạc tăng lên ${sp.maxChargersPossibleNow} trụ.`, `📐 Expanded ${lotDisp} to ${lot.areaM2} m²! Charger capacity increased to ${sp.maxChargersPossibleNow} bays.`));
  saveGameToStorage(false);
  refreshAllUI();
}

export function installNewChargerOnLot(lotId) {
  const lot = state.lots.find(l => l.id === lotId);
  if (!lot || !lot.owned || lot.lockedByDebt) return;
  const sp = getLotSpatialBreakdown(lot);
  const lotDisp = getLotDisplayName(lot);
  const installCost = getBayInstallCostForLot(lot);
  const isDirect = getLotBusinessMode(lot) === "direct";

  if (sp.activeChargers >= sp.maxChargersPossibleNow) {
    logEvent(L(`⚠️ Cần 20 m²/trụ (hiện còn trống ${sp.freeM2} m²)! Hãy bấm '📐 +Đất' để mở rộng mặt bằng.`, `⚠️ Requires 20 m²/bay (currently ${sp.freeM2} m² free)! Tap '📐 +Land' to expand your plot.`));
    return;
  }
  if (state.money < installCost) {
    logEvent(L(
      `⚠️ Cần ${formatVND(installCost)} (${isDirect ? "Giá gốc Direct Sale không trợ giá" : "Giá Franchise đã trợ giá"}) để lắp Trụ AC 11kW mới!`,
      `⚠️ Need ${formatVND(installCost)} (${isDirect ? "Unsubsidized Direct Sale cost" : "Subsidized Franchise cost"}) to install a new AC 11kW Charger!`
    ));
    return;
  }

  state.money -= installCost;
  const newBayId = lot.bays.length;
  lot.bays.push({ id: newBayId, tier: 1, car: null, incomingCarId: null });

  floatTexts.push({
    x: lot.x,
    y: lot.y - 20,
    text: L(`🔌 +Trụ #${newBayId + 1} (-20m²)`, `🔌 +Bay #${newBayId + 1} (-20m²)`),
    color: "#15803d",
    life: 1.8
  });
  logEvent(L(
    `🔌 Đã lắp đặt Trụ sạc #${newBayId + 1} (${formatVND(installCost)} • ${isDirect ? "Direct Sale" : "Franchise trợ giá"}) tại ${lotDisp}!`,
    `🔌 Installed Charger Bay #${newBayId + 1} (${formatVND(installCost)} • ${isDirect ? "Direct Sale" : "Subsidized Franchise"}) at ${lotDisp}!`
  ));
  saveGameToStorage(false);
  refreshAllUI();
}

export function quickExpandLandSelectedLot() {
  const lot = getSelectedLot();
  if (!lot.owned) {
    state.sheetMode = "normal";
    applySheetModeUI();
    openDockTab("tab-lot-detail", document.getElementById("btn-tab-lot"));
    return;
  }
  expandLotLandArea(lot.id);
}

export function quickAddChargerSelectedLot() {
  const lot = getSelectedLot();
  if (!lot.owned) {
    state.sheetMode = "normal";
    applySheetModeUI();
    openDockTab("tab-lot-detail", document.getElementById("btn-tab-lot"));
    return;
  }
  installNewChargerOnLot(lot.id);
}

export function openAmenitiesForSelectedLot() {
  state.sheetMode = "normal";
  applySheetModeUI();
  openDockTab("tab-lot-amenities", document.getElementById("btn-tab-amenities"));
  state.sheetMode = "normal";
  applySheetModeUI();
}

export function buyOrUpgradeAmenity(lotId, amenityId) {
  const lot = state.lots.find(l => l.id === lotId);
  if (!lot || !lot.owned || lot.lockedByDebt) return;
  const item = AMENITY_CATALOG.find(a => a.id === amenityId);
  if (!item) return;

  if (!lot.amenities) lot.amenities = { tra_da: 0, cafe: 0, phong_nghi: 0, nha_an: 0, nha_hang: 0, doi_pin: 0 };
  const curLvl = lot.amenities[amenityId] || 0;
  if (curLvl >= 3) return;

  const sp = getLotSpatialBreakdown(lot);
  const curFootprint = getAmenityFootprintM2(item, curLvl);
  const nextFootprint = getAmenityFootprintM2(item, curLvl + 1);
  const deltaM2Needed = nextFootprint - curFootprint;
  const itemDisp = getItemName(item);

  if (sp.freeM2 < deltaM2Needed) {
    logEvent(L(`⚠️ Cần thêm ${deltaM2Needed} m² cho ${itemDisp} (còn trống ${sp.freeM2} m²)! Hãy bấm '📐 +Đất'.`, `⚠️ Need ${deltaM2Needed} m² more for ${itemDisp} (${sp.freeM2} m² free)! Tap '📐 +Land'.`));
    return;
  }

  const cost = Math.round(item.baseCost * Math.pow(1.75, curLvl));
  if (state.money < cost) {
    logEvent(L(`⚠️ Không đủ ngân quỹ (${formatVND(cost)}) để mở ${itemDisp}!`, `⚠️ Insufficient funds (${formatVND(cost)}) to build ${itemDisp}!`));
    return;
  }

  state.money -= cost;
  lot.amenities[amenityId] = curLvl + 1;

  const scores = getLotAppealScores(lot);
  floatTexts.push({
    x: lot.x,
    y: lot.y - 24,
    text: L(`${item.icon} Cấp ${curLvl + 1} (-${deltaM2Needed}m²)`, `${item.icon} Lv ${curLvl + 1} (-${deltaM2Needed}m²)`),
    color: "#047857",
    life: 1.9
  });
  logEvent(L(
    `🎉 Đã mở ${itemDisp} Cấp ${curLvl + 1} (${nextFootprint} m²)! Hút 🚕Taxi ${scores.taxiTotal}đ | 🚗Thường ${scores.casualTotal}đ.`,
    `🎉 Built ${itemDisp} Lv ${curLvl + 1} (${nextFootprint} m²)! Appeal: 🚕Taxi ${scores.taxiTotal}pt | 🚗Casual ${scores.casualTotal}pt.`
  ));
  saveGameToStorage(false);
  refreshAllUI();
}

export function hireGuardForLot(lotId) {
  const lot = state.lots[lotId - 1] || state.lots.find(l => l.id === lotId);
  if (!lot || !lot.owned) return;
  if (lot.hasGuard) {
    dismissGuardForLot(lotId);
    return;
  }
  // Không thu tiền 1 cục lúc bấm thuê — Lương 6,000 G$/tháng sẽ tự động khấu trừ vào Ngày 30 cuối mỗi tháng!
  lot.hasGuard = true;
  lot.guardMonthlyWage = lot.guardMonthlyWage || 6000000;
  if (typeof playSfx === "function") playSfx("click");
  if (typeof triggerHaptic === "function") triggerHaptic(22);
  lot.bays.forEach((b, idx) => {
    if (b.car && b.car.state === "SQUATTING") {
      const fee = Math.max(b.car.currentFine || 1200000, b.car.maxFineTarget || 1450000);
      collectSquatterFineAndRelease(lot, idx, fee, "guard");
    } else if (b.car && b.car.state === "ICE_SQUATTING") {
      chaseAwayIceSquatter(lot.id, idx, "guard");
    }
  });
  logEvent(L(
    `👮 Đã ký hợp đồng thuê Bảo vệ 24/7 tại ${getLotDisplayName(lot)} (0 G$ trả trước • Lương ${formatVND(lot.guardMonthlyWage)}/tháng thu vào Ngày 30)!`,
    `👮 Contracted 24/7 Security Guard at ${getLotDisplayName(lot)} (0 G$ upfront • Salary ${formatVND(lot.guardMonthlyWage)}/mo billed on Day 30)!`
  ));
  saveGameToStorage(false);
  refreshAllUI();
}

export function dismissGuardForLot(lotId) {
  const lot = state.lots[lotId - 1] || state.lots.find(l => l.id === lotId);
  if (!lot || !lot.owned || !lot.hasGuard) return;
  lot.hasGuard = false;
  if (typeof playSfx === "function") playSfx("click");
  logEvent(L(
    `🛑 Đã cho Bảo vệ tại ${getLotDisplayName(lot)} nghỉ việc (Tiết kiệm ${formatVND(lot.guardMonthlyWage || 6000000)}/tháng lương định kỳ).`,
    `🛑 Dismissed Security Guard at ${getLotDisplayName(lot)} (Saves ${formatVND(lot.guardMonthlyWage || 6000000)}/mo in monthly salary).`
  ));
  saveGameToStorage(false);
  refreshAllUI();
}

export function upgradeBayTier(lotId, bayIdx) {
  const lot = state.lots.find(l => l.id === lotId);
  if (!lot || !lot.owned || lot.lockedByDebt) return;
  const bay = lot.bays[bayIdx];
  const curTier = CHARGER_TIERS[bay.tier];
  const upgCost = getBayUpgradeCostForLot(lot, bay.tier);
  if (!curTier || upgCost === null) return;
  if (state.money < upgCost) {
    logEvent(L(
      `⚠️ Cần ${formatVND(upgCost)} (${getLotBusinessMode(lot) === "direct" ? "Direct Sale không trợ giá" : "Franchise trợ giá"}) để nâng cấp trụ sạc!`,
      `⚠️ Need ${formatVND(upgCost)} (${getLotBusinessMode(lot) === "direct" ? "Unsubsidized Direct Sale" : "Subsidized Franchise"}) to upgrade charger!`
    ));
    return;
  }

  state.money -= upgCost;
  bay.tier += 1;
  const nextTier = CHARGER_TIERS[bay.tier];
  logEvent(L(
    `⚡ Nâng cấp Trụ #${bayIdx + 1} (${getLotDisplayName(lot)}) lên ${getItemName(nextTier)} (${nextTier.kw}kW • -${formatVND(upgCost)})!`,
    `⚡ Upgraded Bay #${bayIdx + 1} (${getLotDisplayName(lot)}) to ${getItemName(nextTier)} (${nextTier.kw}kW • -${formatVND(upgCost)})!`
  ));
  saveGameToStorage(false);
  refreshAllUI();
}


export function locateMyNextChargingLot() {
  const ownedLots = state.lots.filter(l => l.owned);
  if (ownedLots.length === 0) {
    logEvent(L("⚠️ Bạn chưa sở hữu Lô Trạm Sạc nào! Hãy Thuê hoặc Mua 1 lô bất kỳ.", "⚠️ You don't own any Charging Lots yet! Lease or Buy a lot first."));
    return;
  }
  if (typeof state.myLotCycleIdx !== "number") state.myLotCycleIdx = 0;
  const curSelectedPos = ownedLots.findIndex(l => l.id === state.selectedLotId);
  let targetIdx;
  if (curSelectedPos !== -1 && ownedLots.length > 1) {
    targetIdx = (curSelectedPos + 1) % ownedLots.length;
  } else {
    targetIdx = state.myLotCycleIdx % ownedLots.length;
  }
  state.myLotCycleIdx = (targetIdx + 1) % ownedLots.length;
  const targetLot = ownedLots[targetIdx];

  const sec = MEGA_SECTORS_36[targetLot.sectorIdx || 0];
  if (sec && window.mpState) {
    window.mpState.currentDistrictIdx = sec.districtIdx;
    window.mpState.currentWardIdx = sec.wardIdx;
  }
  selectLot(targetLot.id, true);
  if (typeof playSfx === "function") playSfx("click");
  if (typeof triggerHaptic === "function") triggerHaptic(18);
  logEvent(L(
    `🎯 [Trạm ${targetIdx + 1}/${ownedLots.length}] Đã định vị tới ${getLotDisplayName(targetLot)} (🔌 ${targetLot.bays.length} trụ sạc)!`,
    `🎯 [Station ${targetIdx + 1}/${ownedLots.length}] Located ${getLotDisplayName(targetLot)} (🔌 ${targetLot.bays.length} bays)!`
  ));
}

export function addDemoCapital() {
  openGreenCoinShopModal();
  return false;
}


export function adjustPlayerElectricityPrice(delta) {
  const nextP = Math.max(2900, Math.min(4600, window.mpState.retailPriceKwh + delta));
  window.mpState.retailPriceKwh = nextP;
  localStorage.setItem("HN_EV_MP_PRICE_KWH", String(nextP));
  playSfx("click");
  triggerHaptic(12);
  sendMpPacket({ type: "SET_PRICE", priceKwh: nextP });
  logEvent(L(`⚡ Đã điều chỉnh giá bán lẻ điện toàn hệ thống sang ${formatVND(nextP)}/kWh.`, `⚡ Updated network retail charging rate to ${formatVND(nextP)}/kWh.`));
  refreshAllUI();
}

export function signB2BContract(contractId) {
  const c = B2B_CONTRACTS_CATALOG.find(item => item.id === contractId);
  if (!c || window.mpState.signedContracts[contractId]) return;
  const totalChargers = state.lots.reduce((s, l) => s + (l.owned ? l.bays.length : 0), 0);
  const cName = getItemName(c);
  if (totalChargers < c.reqChargers) {
    logEvent(L(`⚠️ Cần tối thiểu ${c.reqChargers} trụ sạc đang hoạt động để ký ${cName}!`, `⚠️ Need at least ${c.reqChargers} active chargers to sign ${cName}!`));
    return;
  }
  if (state.money < c.signingFee) {
    logEvent(L(`⚠️ Cần ${formatVND(c.signingFee)} phí bảo lãnh để ký ${cName}!`, `⚠️ Need ${formatVND(c.signingFee)} escrow fee to sign ${cName}!`));
    return;
  }
  state.money -= c.signingFee;
  window.mpState.signedContracts[contractId] = true;
  localStorage.setItem("HN_EV_MP_CONTRACTS", JSON.stringify(window.mpState.signedContracts));
  playSfx("cash");
  triggerHaptic(30);
  sendMpPacket({ type: "SIGN_B2B_CONTRACT", contractName: cName });
  logEvent(L(`🤝 Đã ký thành công ${cName}! Nhận đều đặn +${formatCompactVND(c.dailyBonusVnd)} mỗi ngày.`, `🤝 Signed ${cName}! Receiving +${formatCompactVND(c.dailyBonusVnd)} daily.`));
  refreshAllUI();
}

export function claimDailyQuest(questId, rewardVnd) {
  if (window.mpState.claimedQuests[questId]) return;
  window.mpState.claimedQuests[questId] = true;
  localStorage.setItem("HN_EV_MP_QUESTS", JSON.stringify(window.mpState.claimedQuests));
  state.money += rewardVnd;
  playSfx("cash");
  triggerHaptic(35);
  logEvent(L(`🎁 Đã nhận thưởng Nhiệm Vụ Ngày +${formatVND(rewardVnd)}!`, `🎁 Claimed Daily Quest reward +${formatVND(rewardVnd)}!`));
  refreshAllUI();
}


export function getCurrentZoneKey() {
  const curSec = getSectorAtWorldPos(camera.x, camera.y);
  return `D${curSec.districtIdx}_W${curSec.wardIdx}`;
}

export function getCurrentZoneLabel() {
  const curSec = getSectorAtWorldPos(camera.x, camera.y);
  const dName = isEn() ? (curSec.districtNameEn || curSec.districtName) : curSec.districtName;
  const wName = isEn() ? (curSec.wardNameEn || curSec.wardName) : curSec.wardName;
  return `${dName} • ${wName} (${L("Lô", "Lots")} #${curSec.startLot}–#${curSec.endLot})`;
}

export function getTotalOwnedLotsAcrossAll5400() {
  return state.lots.filter(l => l.owned).length;
}

export function saveCurrentWardToStore() {
  saveGameToStorage(false);
}

export function switchToDistrictWard(dIdx, wIdx) {
  window.mpState.currentDistrictIdx = dIdx;
  window.mpState.currentWardIdx = wIdx;

  const sIdx = dIdx * 3 + wIdx;
  const sec = MEGA_SECTORS_36[sIdx] || MEGA_SECTORS_36[0];
  const targetKey = `D${dIdx}_W${wIdx}`;
  const dName = isEn() ? (sec.districtNameEn || sec.districtName) : sec.districtName;
  const wName = isEn() ? (sec.wardNameEn || sec.wardName) : sec.wardName;

  playSfx("click");
  triggerHaptic(22);
  sendMpPacket({ type: "SWITCH_ZONE", zoneKey: targetKey, zoneLabel: `${dName} - ${wName}` });
  closeWorldMetroMapModal();
  selectLot(sec.startLot, true);
  logEvent(L(`🗺️ Đã bay tới ${sec.districtCode}. ${dName} • ${wName} (Lô #${sec.startLot} – #${sec.endLot} / 5.400 Lô)!`, `🗺️ Jumped to ${sec.districtCode}. ${dName} • ${wName} (Lots #${sec.startLot} – #${sec.endLot} / 5,400)!`));
}


export function buyGuildMegaHubShare(hubId, shareCost, dailyDiv) {
  const curShares = window.mpState.guildShares[hubId] || 0;
  if (curShares >= 5) {
    logEvent(L("⚠️ Mỗi CEO chỉ được nắm giữ tối đa 5 cổ phần tại mỗi Siêu Trạm Liên Minh!", "⚠️ Each CEO can hold at most 5 shares per Guild Mega-Hub!"));
    return;
  }
  if (state.money < shareCost) {
    logEvent(L(`⚠️ Cần ${formatVND(shareCost)} để mua +1% Cổ phần Siêu Trạm Liên Minh!`, `⚠️ Need ${formatVND(shareCost)} to buy +1% Guild Mega-Hub Share!`));
    return;
  }
  state.money -= shareCost;
  window.mpState.guildShares[hubId] = curShares + 1;
  localStorage.setItem("HN_EV_MP_GUILD_SHARES", JSON.stringify(window.mpState.guildShares));
  playSfx("cash");
  triggerHaptic(32);
  sendMpPacket({ type: "BUY_GUILD_SHARE", hubId });
  logEvent(L(`🤝 Đã mua cổ phần thứ ${curShares + 1}/5 tại Siêu Trạm Liên Minh (+${formatCompactVND(dailyDiv)} cổ tức/ngày)!`, `🤝 Purchased Share ${curShares + 1}/5 in Guild Mega-Hub (+${formatCompactVND(dailyDiv)} daily dividend)!`));
  refreshAllUI();
}


// Đăng ký vào globalThis để tương thích ngược với HTML event handlers & các module liên kết
Object.assign(globalThis, {
  selectLot,
  setPendingNewLotBizMode,
  upgradeLotToDirectSale,
  acquireLot,
  expandLotLandArea,
  installNewChargerOnLot,
  quickExpandLandSelectedLot,
  quickAddChargerSelectedLot,
  openAmenitiesForSelectedLot,
  buyOrUpgradeAmenity,
  hireGuardForLot,
  dismissGuardForLot,
  upgradeBayTier,
  locateMyNextChargingLot,
  addDemoCapital,
  adjustPlayerElectricityPrice,
  signB2BContract,
  claimDailyQuest,
  getCurrentZoneKey,
  getCurrentZoneLabel,
  getTotalOwnedLotsAcrossAll5400,
  saveCurrentWardToStore,
  switchToDistrictWard,
  buyGuildMegaHubShare
});
