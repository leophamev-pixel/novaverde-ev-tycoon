/**
 * src/systems/economy.js
 * Hệ thống Kinh tế cốt lõi: Vòng lặp mô phỏng updateSimulation(dt), Doanh thu kWh, Buff cảnh quan & Định giá Lô đất
 */
import { INFRA_BASE_M2, M2_PER_CHARGER_BAY } from "../data/balance.js";
import { AMENITY_CATALOG, COMMERCIAL_DINING_ARCHETYPES } from "../data/amenity-catalog.js";
import { CHARGER_TIERS } from "../data/charger-tiers.js";

export function getAmenityFootprintM2(item, level) {
  if (!level || level <= 0) return 0;
  return item.footprintBaseM2 + (level - 1) * item.footprintStepM2;
}

export function getLotSpatialBreakdown(lot) {
  const totalAreaM2 = lot.areaM2 || 90;
  const infraM2 = INFRA_BASE_M2;
  const activeChargers = lot.bays.filter(b => b.tier > 0).length;
  const chargersM2 = activeChargers * M2_PER_CHARGER_BAY;

  let amenitiesM2 = 0;
  if (lot.amenities) {
    AMENITY_CATALOG.forEach(item => {
      const lvl = lot.amenities[item.id] || 0;
      if (lvl > 0) amenitiesM2 += getAmenityFootprintM2(item, lvl);
    });
  }

  const usedM2 = infraM2 + chargersM2 + amenitiesM2;
  const freeM2 = Math.max(0, totalAreaM2 - usedM2);

  const maxChargersPossibleNow = Math.max(
    activeChargers,
    Math.floor((totalAreaM2 - infraM2 - amenitiesM2) / M2_PER_CHARGER_BAY)
  );

  const maxAreaAfterAllExpansions = totalAreaM2 + ((lot.maxExpansions || 3) - (lot.expansionCount || 0)) * (lot.expandStepAreaM2 || 45);
  const maxChargersAtFullExpansion = Math.floor((maxAreaAfterAllExpansions - infraM2 - amenitiesM2) / M2_PER_CHARGER_BAY);

  return {
    totalAreaM2,
    infraM2,
    activeChargers,
    chargersM2,
    amenitiesM2,
    usedM2,
    freeM2,
    maxChargersPossibleNow,
    maxAreaAfterAllExpansions,
    maxChargersAtFullExpansion
  };
}

// TÍNH "BUFF CẢNH QUAN" TỰ ĐỘNG CHO LÔ ĐẤT NẰM CẠNH CÔNG VIÊN/HỒ NƯỚC, TÒA THÁP CAO ỐC CBD HOẶC TTTM & KHU ẨM THỰC (TRÊN TOÀN BỘ 36 PHƯỜNG / 5.400 LÔ)

export function getLotLandscapeBuff(lot) {
  let taxiBonus = 0;
  let casualBonus = 0;
  let revMulti = 1.0;
  const tags = [];
  const lxLocal = lot.x - (lot.ox || 0);
  const lyLocal = lot.y - (lot.oy || 0);

  const nearPark = MAJOR_PARKS.find(pk => {
    const pkX = (V_ROADS[pk.col].x + V_ROADS[pk.col + 1].x) / 2;
    const pkY = (H_ROADS[pk.row].y + H_ROADS[pk.row + 1].y) / 2;
    return Math.hypot(lxLocal - pkX, lyLocal - pkY) < 460;
  });
  if (nearPark || lot.zone === "CONG_VIEN" || lot.zone === "HO_GUOM") {
    casualBonus += 16;
    taxiBonus += 6;
    revMulti += 0.15;
    tags.push(L("🌳Buff Công Viên (+16🚗 +15%DV)", "🌳Park Buff (+16🚗 +15%Rev)"));
  }

  const nearTower = HOAN_KIEM_BUILDINGS.find(b => b.isSkyscraper && Math.hypot((b.x + b.w / 2) - lxLocal, (b.y + b.h / 2) - lyLocal) < 420);
  if (nearTower || lot.zone === "CAO_OC_CBD") {
    taxiBonus += 18;
    casualBonus += 12;
    revMulti += 0.15;
    tags.push(L("🏙️Buff Cao Ốc (+18🚕 +12🚗)", "🏙️CBD Tower Buff (+18🚕 +12🚗)"));
  }

  const nearMallOrDining = (typeof ARCHITECTURAL_CLUSTERS !== "undefined") && ARCHITECTURAL_CLUSTERS.find(cl =>
    COMMERCIAL_DINING_ARCHETYPES.has(cl.archetype) && Math.hypot(cl.cx - lxLocal, cl.cy - lyLocal) < 260
  );
  if (nearMallOrDining) {
    taxiBonus += 8;
    casualBonus += 8;
    revMulti += 0.10;
    tags.push(L("🛍️Buff TTTM & Ẩm Thực (+8🚕 +8🚗 +10%DV)", "🛍️Mall & Dining Buff (+8🚕 +8🚗 +10%Rev)"));
  }

  return {
    taxiBonus,
    casualBonus,
    revMulti,
    label: tags.join(" • ")
  };
}

// ENGINE NHỊP SỐNG THỦ ĐÔ THỨ 2 -> CHỦ NHẬT & TỶ LỆ XE ĐIỆN / XE XĂNG HÀ NỘI (SONG NGỮ VI / EN)

export function getLotAppealScores(lot) {
  const landBuff = getLotLandscapeBuff(lot);
  if (!lot.owned || lot.lockedByDebt) {
    return { chargerScore: 0, taxiAmenityScore: 0, casualAmenityScore: 0, weatherBonus: 0, iceSquatterCount: 0, iceSquatterPenalty: 0, landscapeTaxi: landBuff.taxiBonus, landscapeCasual: landBuff.casualBonus, landscapeLabel: landBuff.label, taxiTotal: 0, casualTotal: 0, avgAppeal: 0 };
  }
  let chargerScore = 0;
  let iceSquatterCount = 0;
  lot.bays.forEach(b => {
    if (b.tier > 0) chargerScore += 4 + (b.tier - 1) * 2;
    if (b.car && b.car.state === "ICE_SQUATTING") {
      iceSquatterCount++;
    }
  });

  // Cơ chế theo đúng yêu cầu: Xe xăng đỗ lấn chỗ (ICE_SQUATTING) không thu được tiền sạc và làm GIẢM ĐIỂM THU HÚT (-15đ/xe xăng lấn chỗ) nếu chưa có Bảo vệ hoặc người chơi chưa ấn đuổi!
  const iceSquatterPenalty = iceSquatterCount * 15;

  let taxiAmenityScore = 0;
  let casualAmenityScore = 0;
  let shelterCount = 0;
  if (lot.amenities) {
    AMENITY_CATALOG.forEach(item => {
      const lvl = lot.amenities[item.id] || 0;
      if (lvl > 0) {
        taxiAmenityScore += item.taxiAppeal * lvl;
        casualAmenityScore += item.casualAppeal * lvl;
        if (["cafe", "phong_nghi", "nha_an", "nha_hang"].includes(item.id)) shelterCount += lvl;
      }
    });
  }

  const tl = getHanoiWeeklyTimelineState();
  const timelineBonus = tl.preferredDistricts.includes(lot.districtIdx || 0) ? 8 : 0;
  const skinBonus = getActiveStationSkin().appealBonus || 0;
  const prBonus = (state.ownedItems && state.ownedItems.item_mega_pr) ? 25 : 0;
  const rankWeeklyBonus = state.weeklyRankAppealBonus || 0;

  const guardBonus = (lot.hasGuard || (state.ownedItems && state.ownedItems.item_ai_guard_net)) ? 6 : 0;
  const franchiseTaxiBonus = getLotBusinessMode(lot) === "franchise" ? 8 : 0;
  const weatherBonus = (state.isRaining && shelterCount > 0) ? shelterCount * 5 : 0;
  const taxiTotal = Math.max(1, chargerScore + taxiAmenityScore + guardBonus + franchiseTaxiBonus + weatherBonus + landBuff.taxiBonus + timelineBonus + skinBonus + prBonus + rankWeeklyBonus - iceSquatterPenalty);
  const casualTotal = Math.max(1, chargerScore + casualAmenityScore + guardBonus + weatherBonus + landBuff.casualBonus + timelineBonus + skinBonus + prBonus + rankWeeklyBonus - iceSquatterPenalty);
  const avgAppeal = Math.round((taxiTotal + casualTotal) / 2);

  return {
    chargerScore,
    taxiAmenityScore,
    casualAmenityScore,
    weatherBonus,
    iceSquatterCount,
    iceSquatterPenalty,
    landscapeTaxi: landBuff.taxiBonus,
    landscapeCasual: landBuff.casualBonus,
    landscapeLabel: landBuff.label,
    taxiTotal,
    casualTotal,
    avgAppeal
  };
}

export function getLotAmenityBonusPerCar(lot) {
  if (!lot.amenities) return 0;
  let total = 0;
  AMENITY_CATALOG.forEach(item => {
    const lvl = lot.amenities[item.id] || 0;
    if (lvl > 0) total += Math.round(item.baseRevPerCar * (1 + (lvl - 1) * 0.65));
  });
  const landBuff = getLotLandscapeBuff(lot);
  const tl = getHanoiWeeklyTimelineState();
  const skinMult = getActiveStationSkin().amenityRevMult || 1.0;
  return Math.round(total * landBuff.revMulti * (tl.amenityMult || 1.0) * skinMult);
}

export function getLotOwnedAmenitiesList(lot) {
  if (!lot.amenities) return [];
  const list = [];
  AMENITY_CATALOG.forEach(item => {
    const lvl = lot.amenities[item.id] || 0;
    if (lvl > 0) list.push({ ...item, level: lvl, footprintM2: getAmenityFootprintM2(item, lvl) });
  });
  return list;
}


export function updateSimulation(dt) {
  // Khóa cứng tốc độ thời gian ở mức 1x theo thời gian thực để chống gian lận đua Top
  state.gameSpeed = 1;
  const effDt = dt;

  trafficLightTimer += dt;
  updateWeatherState();

  state.simMinute += effDt * 18;
  if (state.simMinute >= 1440) {
    const daysPassed = Math.floor(state.simMinute / 1440);
    state.simMinute = state.simMinute % 1440;
    for (let d = 0; d < daysPassed; d++) {
      processDailyDebtAndCalendar();
    }
  }

  let totalPlayerAppeal = 0;
  let activeOwnedLots = 0;
  state.lots.forEach(l => {
    if (l.owned && !l.lockedByDebt) {
      totalPlayerAppeal += getLotAppealScores(l).avgAppeal;
      activeOwnedLots++;
    }
  });

  const hour = Math.floor(state.simMinute / 60);
  const tl = getHanoiWeeklyTimelineState();
  const appealSpawnMultiplier = 1 + Math.min(2.6, totalPlayerAppeal / 90);
  const lotCountMultiplier = 1 + Math.max(0, activeOwnedLots - 1) * 0.22;

  // Thu hồi các xe lưu thông tự do đã đi quá xa khỏi vùng Camera (> 2.550px) để khi chuyển Quận luôn có xe mới chạy quanh màn hình!
  let nearCamCars = 0;
  for (let i = roadCars.length - 1; i >= 0; i--) {
    const rc = roadCars[i];
    const distCam = Math.hypot(rc.x - camera.x, rc.y - camera.y);
    if (distCam <= 2300) {
      nearCamCars++;
    } else if (distCam > 2550 && rc.destType !== "player" && rc.destType !== "ice_squat") {
      roadCars.splice(i, 1);
    }
  }

  const spawnRate = 5.5 * (tl.trafficMult || 1.2) * appealSpawnMultiplier * lotCountMultiplier;
  const maxCarsOnMap = Math.round(92 * Math.min(1.5, tl.trafficMult || 1.2));

  // Nếu người chơi vừa bay sang Quận/Phường mới (lượng xe quanh Camera < 34), lập tức bơm nhanh dòng xe liên quận vào màn hình!
  if (nearCamCars < 34 && roadCars.length < maxCarsOnMap) {
    const burst = Math.min(12, 34 - nearCamCars);
    for (let b = 0; b < burst; b++) {
      spawnCrossSectorCommuterOrScooter(tl);
    }
  }

  spawnAccumulator += effDt * spawnRate;
  while (spawnAccumulator >= 1) {
    spawnAccumulator -= 1;
    if (roadCars.length < maxCarsOnMap) spawnEVOnMap();
  }

  const subSteps = Math.min(12, Math.max(1, Math.ceil(effDt / 0.045)));
  const subDt = effDt / subSteps;
  const realSubDt = dt / subSteps;
  for (let s = 0; s < subSteps; s++) {
    stepRoadCarsPhysics(subDt, realSubDt);
  }

  let instantRevPerMin = 0;
  const hasQuantumCore = Boolean(state.ownedItems && state.ownedItems.item_quantum_core);
  const hasAiGuardNet = Boolean(state.ownedItems && state.ownedItems.item_ai_guard_net);
  const adX2Mult = (state.adX2RevRemainingSec && state.adX2RevRemainingSec > 0) ? 2.0 : 1.0;
  const speedMult = hasQuantumCore ? 1.35 : 1.0;

  state.lots.forEach(lot => {
    if (!lot.owned || lot.lockedByDebt) return;
    const baseMarginPerKwh = getLotMarginPerKwh(lot);
    const marginPerKwh = Math.round(baseMarginPerKwh * (hasQuantumCore ? 1.20 : 1.0) * adX2Mult);
    const amenityBonus = Math.round(getLotAmenityBonusPerCar(lot) * adX2Mult);

    lot.bays.forEach((bay, bIdx) => {
      if (!bay.car) return;
      const c = bay.car;
      const kw = CHARGER_TIERS[bay.tier].kw * speedMult;

      if (c.state === "CHARGING") {
        const kwhAdded = (kw * (effDt / 8.5));
        const actualAdd = Math.min(c.needKwh - c.chargedKwh, kwhAdded);
        c.chargedKwh += actualAdd;

        const revEarned = actualAdd * marginPerKwh;
        state.money += revEarned;
        state.totalRevenueAllTime += revEarned;
        state.totalProfitAllTime += revEarned;
        state.yearlyGrossRevenue += revEarned;
        state.yearlyOperatingProfit += revEarned;
        instantRevPerMin += revEarned * 60;

        if (c.chargedKwh >= c.needKwh - 0.05) {
          c.chargedKwh = c.needKwh;
          if (amenityBonus > 0) {
            state.money += amenityBonus;
            state.totalRevenueAllTime += amenityBonus;
            state.totalProfitAllTime += amenityBonus;
            state.yearlyGrossRevenue += amenityBonus;
            state.yearlyOperatingProfit += amenityBonus;
            lot.monthlyAmenityRev = (lot.monthlyAmenityRev || 0) + amenityBonus;

            const pos = getBayWorldPos(lot, bIdx);
            floatTexts.push({
              x: pos.x,
              y: pos.y - 18,
              text: `☕+${formatCompactVND(amenityBonus)}`,
              color: "#d97706",
              life: 1.5
            });
          }

          if (Math.random() < c.model.squatterChance) {
            initRandomSquatterPenalty(c);
          } else {
            const pos = getBayWorldPos(lot, bIdx);
            const totalBill = c.needKwh * marginPerKwh;
            floatTexts.push({
              x: pos.x,
              y: pos.y - 6,
              text: `+${formatCompactVND(totalBill)}`,
              color: "#15803d",
              life: 1.2
            });
            const finishedModel = c.model;
            bay.car = null;
            bay.incomingCarId = null;
            if (roadCars.length < 64) {
              spawnExitingCarFromLot(lot, bIdx, finishedModel);
            }
          }
        }
      } else if (c.state === "SQUATTING") {
        if (!c.maxFineTarget || c.maxFineTarget < 1050000 || !c.fineRatePerSec) {
          initRandomSquatterPenalty(c);
        }
        const guardAccel = (lot.hasGuard || hasAiGuardNet) ? 2.2 : 1.0;
        c.currentFine = (c.currentFine || 150000) + c.fineRatePerSec * effDt * guardAccel;
        c.overstayMin = 30 + Math.round(c.currentFine / 1100);
        instantRevPerMin += (c.fineRatePerSec * guardAccel) * 3.5;

        if (c.currentFine >= c.maxFineTarget) {
          collectSquatterFineAndRelease(lot, bIdx, c.maxFineTarget, (lot.hasGuard || hasAiGuardNet) ? "guard" : "auto");
        }
      } else if (c.state === "ICE_SQUATTING") {
        // Xe xăng đỗ lấn chỗ: KHÔNG THU TIỀN SẠC, làm giảm -15đ thu hút trạm sạc!
        // Nếu trạm CÓ BẢO VỆ (lot.hasGuard) hoặc đã mua Camera AI (item_ai_guard_net), tự động đuổi xe xăng!
        c.overstayMin = (c.overstayMin || 0) + effDt * 4;
        if (lot.hasGuard || hasAiGuardNet) {
          c.guardChaseTimer = (c.guardChaseTimer !== undefined && c.guardChaseTimer < 100 ? c.guardChaseTimer : (hasAiGuardNet ? 2.0 : 3.5)) - effDt;
          if (c.guardChaseTimer <= 0) {
            chaseAwayIceSquatter(lot.id, bIdx, "guard");
          }
        }
      }
    });
  });

  if (state.isRaining) {
    const wrap = document.getElementById("canvas-wrap");
    const vw = wrap.clientWidth;
    const vh = wrap.clientHeight;
    rainDrops.forEach(r => {
      r.x -= dt * 45;
      r.y += dt * r.spd;
      if (r.y > vh) {
        r.y = -15;
        r.x = Math.random() * (vw + 60);
      }
      if (r.x < -20) r.x = vw + 20;
    });
  }

  for (let i = floatTexts.length - 1; i >= 0; i--) {
    floatTexts[i].y -= dt * 22;
    floatTexts[i].life -= dt;
    if (floatTexts[i].life <= 0) floatTexts.splice(i, 1);
  }

  document.getElementById("money-display").textContent = `💵 ${formatVND(state.money)}`;
  document.getElementById("net-rate-lbl").textContent = `+${formatCompactVND(instantRevPerMin)}/${L("ph", "min")}`;
  updateGreenCoinHUD();

  const hh = String(Math.floor(state.simMinute / 60)).padStart(2, "0");
  const mm = String(Math.floor(state.simMinute % 60)).padStart(2, "0");
  const isNightNow = state.weatherMode === "night" || (state.weatherMode !== "sunny" && (hour >= 18 || hour < 6));
  const weatherIcon = state.isRaining ? "🌧️" : (isNightNow ? "🌙" : "☀️");
  document.getElementById("clock-display").textContent = `${hh}:${mm} ${weatherIcon}`;
  document.getElementById("calendar-display").textContent = isEn() ? `M${state.month}•Y${state.year}` : `T${state.month}•N${state.year}`;
  document.getElementById("day-display").textContent = isEn() ? `${tl.weekdayShort}•D${state.dayOfMonth}` : `${tl.weekdayShort}•Ng${state.dayOfMonth}`;

  const phaseEl = document.getElementById("hud-weekday-phase-lbl");
  if (phaseEl && phaseEl.textContent !== tl.phaseLabel) {
    phaseEl.textContent = tl.phaseLabel;
  }
  const mixEl = document.getElementById("hud-fleet-mix-lbl");
  if (mixEl) {
    const mixTxt = isEn()
      ? `⚡${tl.evSharePct}% EV • ⛽${tl.iceSharePct}% Gas`
      : `⚡${tl.evSharePct}% Điện • ⛽${tl.iceSharePct}% Xăng`;
    if (mixEl.textContent !== mixTxt) mixEl.textContent = mixTxt;
  }

  uiRefreshAccumSec += dt;
  if (uiRefreshAccumSec >= 0.45) {
    uiRefreshAccumSec = 0;
    updateLiveStatusOnly();
  }
  autoSaveAccumSec += dt;
  if (autoSaveAccumSec >= 5.0) {
    autoSaveAccumSec = 0;
    const isOnTitle = Boolean(window.NovaVerdeMobileSDK && window.NovaVerdeMobileSDK.state && window.NovaVerdeMobileSDK.state.inTitleScreen);
    if (!isOnTitle && !(state.pendingOfflineReward > 0)) {
      saveGameToStorage(false);
    }
  }
}


export function getLotMarketValuation(lot) {
  if (!lot) return { marketBuyPrice: 80000000, marketLeaseDeposit: 18000000, totalMult: 1, pctChange: 0, occupiedInWard: 1, botOwner: null, botChargers: 0, botBuyoutPrice: 100000000, botOfferForPlayerLot: 95000000 };

  // 1. Hệ số tăng trưởng theo thời gian trong game (+3.5%/tháng + +0.2%/ngày)
  const monthsElapsed = Math.max(0, ((state.year || 1) - 1) * 12 + ((state.month || 1) - 1));
  const timeMult = 1 + monthsElapsed * 0.035 + ((state.dayOfMonth || 1) - 1) * 0.002;

  // 2. Hệ số khan hiếm quỹ đất trong Phường (Càng nhiều lô trong Phường có chủ của Bạn hoặc Bot -> giá đất Phường càng sốt!)
  const wardLots = SECTOR_LOTS_MAP[lot.sectorIdx || 0] || [];
  let occupiedInWard = 0;
  const lotOwnersMap = (window.mpState && window.mpState.lotOwners) || {};
  wardLots.forEach(wl => {
    if (wl.owned || lotOwnersMap[wl.id]) occupiedInWard++;
  });
  const scarcityMult = 1 + Math.min(0.85, occupiedInWard * 0.045);

  // 3. Hệ số Đô thị & Cảnh quan xung quanh lô đất (Công viên, Cao ốc CBD, TTTM & Khu ẩm thực)
  const landBuff = getLotLandscapeBuff(lot);
  const locationMult = 1 + ((landBuff.revMulti || 1) - 1) * 0.55;

  // 4. Chỉ số sóng thị trường chung & Sự kiện đô thị
  const marketWave = (window.mpState && window.mpState.marketIndexMult) || 1.05;
  const eventBoost = (window.mpState && window.mpState.cityEvent && window.mpState.cityEvent.landBoost) || 0.05;

  const totalMult = Math.max(0.90, Math.min(3.50, timeMult * scarcityMult * locationMult * (marketWave + eventBoost * 0.5)));
  const marketBuyPrice = Math.round((lot.buyLandCost || 80000000) * totalMult);
  const marketLeaseDeposit = Math.round((lot.leaseCostInitial || 18000000) * totalMult);
  const pctChange = Math.round((totalMult - 1) * 100);

  const botOwner = (!lot.owned && lotOwnersMap[lot.id] && lotOwnersMap[lot.id].ownerId !== (window.mpState && window.mpState.playerId))
    ? lotOwnersMap[lot.id]
    : null;
  const botChargers = botOwner ? (botOwner.chargers || 2) : 0;

  // Giá Mua đứt / Thâu tóm từ tay Bot CEO = 125% Giá Thị Trường + Giá trị trụ sạc Bot đã lắp trên lô đất
  const botBuyoutPrice = Math.round(marketBuyPrice * 1.25 + botChargers * NEW_BAY_INSTALL_COST * 0.85);

  // Giá Bot đề nghị mua lại lô đất của người chơi (Chốt lời BĐS = 118% Giá Thị Trường + 90% giá trị trụ & mở rộng đất)
  const playerInvested = (lot.bays ? lot.bays.length : 1) * NEW_BAY_INSTALL_COST + (lot.expansionCount || 0) * (lot.expandStepCost || 25000000);
  const botOfferForPlayerLot = Math.round((lot.ownershipType === "owned" ? marketBuyPrice * 1.18 : marketLeaseDeposit * 0.85) + playerInvested * 0.90);

  return {
    marketBuyPrice,
    marketLeaseDeposit,
    totalMult,
    pctChange,
    occupiedInWard,
    botOwner,
    botChargers,
    botBuyoutPrice,
    botOfferForPlayerLot
  };
}

export function buyoutLotFromBot(lotId) {
  const lot = state.lots.find(l => l.id === lotId);
  if (!lot || lot.owned) return;
  const val = getLotMarketValuation(lot);
  if (!val.botOwner) {
    acquireLot(lotId, "owned");
    return;
  }
  if (state.money < val.botBuyoutPrice) {
    logEvent(L(
      `⚠️ Cần ${formatVND(val.botBuyoutPrice)} để thâu tóm Sổ Đỏ ${getLotDisplayName(lot)} từ tay ${val.botOwner.ownerName}!`,
      `⚠️ Need ${formatVND(val.botBuyoutPrice)} to buy out ${getLotDisplayName(lot)} from ${val.botOwner.ownerName}!`
    ));
    return;
  }
  const sellerName = val.botOwner.ownerName;
  const inheritedChargers = Math.max(2, Math.min(4, val.botChargers || 2));
  state.money -= val.botBuyoutPrice;
  delete window.mpState.lotOwners[lot.id];
  lot.owned = true;
  lot.ownershipType = "owned";
  while (lot.bays.length < inheritedChargers) {
    lot.bays.push({ tier: 1, car: null, incomingCarId: null });
  }

  const botEntry = window.mpState.leaderboard.find(b => b.name === sellerName);
  if (botEntry) {
    botEntry.ownedLots = Math.max(1, botEntry.ownedLots - 1);
    botEntry.netWorth += Math.round(val.botBuyoutPrice * 0.25);
  }

  playSfx("cash");
  triggerHaptic(40);
  window.mpState.recentFeed.unshift(L(
    `💼 THÂU TÓM BĐS: ${window.mpState.playerName} đã mua đứt ${getLotDisplayName(lot)} từ ${sellerName} giá ${formatCompactVND(val.botBuyoutPrice)}!`,
    `💼 TAKEOVER: ${window.mpState.playerName} bought out ${getLotDisplayName(lot)} from ${sellerName} for ${formatCompactVND(val.botBuyoutPrice)}!`
  ));
  logEvent(L(
    `💼 Đã thâu tóm Sổ Đỏ ${getLotDisplayName(lot)} từ ${sellerName} với giá thị trường ${formatVND(val.botBuyoutPrice)} (Tiếp quản luôn ${lot.bays.length} trụ sạc)!`,
    `💼 Bought out Freehold ${getLotDisplayName(lot)} from ${sellerName} at market price ${formatVND(val.botBuyoutPrice)} (Inherited ${lot.bays.length} chargers)!`
  ));
  saveGameToStorage(false);
  refreshAllUI();
}

export function sellPlayerLotToBotMarket(lotId) {
  const ownedLots = state.lots.filter(l => l.owned);
  if (ownedLots.length <= 1) {
    logEvent(L(
      "⚠️ Bạn cần giữ lại ít nhất 1 Lô Trạm Sạc đang hoạt động làm trụ sở chính!",
      "⚠️ You must keep at least 1 active Charging Station Lot as your headquarters!"
    ));
    return;
  }
  const lot = state.lots.find(l => l.id === lotId);
  if (!lot || !lot.owned) return;

  const val = getLotMarketValuation(lot);
  const buyerBot = window.mpState.leaderboard[Math.floor(Math.random() * window.mpState.leaderboard.length)] || { id: "bot_vgreen", name: "Minh_SolarisVolt" };
  const salePrice = val.botOfferForPlayerLot;
  const chargerCount = Math.max(1, lot.bays.length);

  lot.bays.forEach(b => { b.car = null; b.incomingCarId = null; });
  lot.owned = false;
  lot.ownershipType = "leased";
  lot.debtPrincipal = 0;
  lot.debtInterest = 0;
  lot.lockedByDebt = false;

  window.mpState.lotOwners[lot.id] = {
    ownerId: buyerBot.id,
    ownerName: buyerBot.name,
    chargers: chargerCount,
    acquiredPrice: salePrice
  };
  buyerBot.ownedLots = (buyerBot.ownedLots || 2) + 1;
  buyerBot.totalChargers = (buyerBot.totalChargers || 8) + chargerCount;

  state.money += salePrice;
  state.totalRevenueAllTime += salePrice;
  state.totalProfitAllTime += Math.round(salePrice * 0.35);

  const remainingOwned = state.lots.filter(l => l.owned);
  if (remainingOwned.length > 0) {
    state.selectedLotId = remainingOwned[0].id;
  }

  playSfx("cash");
  triggerHaptic(38);
  window.mpState.recentFeed.unshift(L(
    `🤝 CHỐT LỜI BĐS: ${window.mpState.playerName} đã nhượng quyền ${getLotDisplayName(lot)} cho ${buyerBot.name} thu về +${formatCompactVND(salePrice)}!`,
    `🤝 LAND DEAL: ${window.mpState.playerName} sold ${getLotDisplayName(lot)} to ${buyerBot.name} for +${formatCompactVND(salePrice)}!`
  ));
  logEvent(L(
    `🤝 Đã bán chốt lời ${getLotDisplayName(lot)} cho tập đoàn ${buyerBot.name} thu về +${formatVND(salePrice)} tiền mặt!`,
    `🤝 Sold ${getLotDisplayName(lot)} to ${buyerBot.name} for +${formatVND(salePrice)} cash!`
  ));
  saveGameToStorage(false);
  refreshAllUI();
}


export function calcPlayerNetWorth() {
  let worth = state.money;
  state.lots.forEach(l => {
    if (l.owned) {
      const val = getLotMarketValuation(l);
      worth += (l.ownershipType === "owned" ? val.marketBuyPrice : val.marketLeaseDeposit);
      worth += l.bays.length * NEW_BAY_INSTALL_COST;
    }
  });
  return Math.round(worth);
}


// Đăng ký vào globalThis để tương thích ngược với HTML event handlers & các module liên kết
Object.assign(globalThis, {
  getAmenityFootprintM2,
  getLotSpatialBreakdown,
  getLotLandscapeBuff,
  getLotAppealScores,
  getLotAmenityBonusPerCar,
  getLotOwnedAmenitiesList,
  updateSimulation,
  getLotMarketValuation,
  buyoutLotFromBot,
  sellPlayerLotToBotMarket,
  calcPlayerNetWorth
});
