/**
 * src/ui/shop-modal.js
 * Cửa hàng GreenCoin (VIP Tools, Vật phẩm, Skin 3D) & Hộp thoại Quảng cáo Nhận thưởng
 */
export function openGreenCoinShopModal() {
  const modal = document.getElementById("greencoin-shop-modal");
  if (!modal) return;
  if (typeof playSfx === "function") playSfx("click");
  renderGreenCoinShopModal();
  modal.classList.add("show");
}

export function closeGreenCoinShopModal() {
  const modal = document.getElementById("greencoin-shop-modal");
  if (modal) modal.classList.remove("show");
}

export function topUpGreenCoin(amountGc) {
  state.greenCoins = (state.greenCoins || 0) + amountGc;
  if (typeof playSfx === "function") playSfx("cash");
  if (typeof triggerHaptic === "function") triggerHaptic(30);
  updateGreenCoinHUD();
  saveGameToStorage(false);
  renderGreenCoinShopModal();
  refreshAllUI();
  logEvent(L(
    `🪙 Đã nạp thành công +${formatGreenCoin(amountGc)} vào ví GreenCoin (Số dư: ${formatGreenCoin(state.greenCoins)})!`,
    `🪙 Topped up +${formatGreenCoin(amountGc)} to your GreenCoin wallet (Balance: ${formatGreenCoin(state.greenCoins)})!`
  ));
}

export function useGreenCoinTool(toolId) {
  const tool = GREENCOIN_TOOLS_CATALOG.find(t => t.id === toolId);
  if (!tool) return;
  if ((state.greenCoins || 0) < tool.gcCost) {
    logEvent(L(
      `⚠️ Cần ${formatGreenCoin(tool.gcCost)} để sử dụng công cụ "${getItemName(tool)}"! Hãy nạp thêm GreenCoin trong Cửa Hàng 🪙.`,
      `⚠️ Need ${formatGreenCoin(tool.gcCost)} to use "${getItemName(tool)}"! Top up GreenCoin in the 🪙 Shop.`
    ));
    openGreenCoinShopModal();
    return;
  }

  state.greenCoins -= tool.gcCost;
  if (typeof playSfx === "function") playSfx("cash");
  if (typeof triggerHaptic === "function") triggerHaptic(35);

  if (toolId === "tool_instant_charge" || toolId === "tool_month_skip") {
    let chargedCount = 0;
    state.lots.forEach(l => {
      if (!l.owned || l.lockedByDebt) return;
      const lotMargin = getLotMarginPerKwh(l);
      l.bays.forEach(b => {
        if (b.car && b.car.state === "CHARGING") {
          const remKwh = Math.max(0, (b.car.needKwh || 30) - (b.car.chargedKwh || 0));
          b.car.chargedKwh = b.car.needKwh || 30;
          const rev = Math.round(remKwh * lotMargin);
          state.money += rev;
          state.totalRevenueAllTime += rev;
          state.totalProfitAllTime += rev;
          chargedCount++;
        }
      });
    });
    const bonusGd = 25000 * GREEN_DOLLAR_UNIT;
    state.money += bonusGd;
    state.totalRevenueAllTime += bonusGd;
    state.totalProfitAllTime += bonusGd;
    logEvent(L(
      `⚡ [VIP Tool -${tool.gcCost} GC] Đã bơm đầy 100% pin cho ${chargedCount} xe đang sạc & nhận thưởng hiệu suất +${formatVND(bonusGd)}!`,
      `⚡ [VIP Tool -${tool.gcCost} GC] Instantly charged ${chargedCount} plugged-in EVs to 100% & received +${formatVND(bonusGd)} bonus!`
    ));
    closeGreenCoinShopModal();
  } else if (toolId === "tool_ai_sweep") {
    let sweptCount = 0;
    let fineCollected = 0;
    state.lots.forEach(l => {
      if (!l.owned) return;
      l.bays.forEach((b, idx) => {
        if (b.car && b.car.state === "ICE_SQUATTING") {
          chaseAwayIceSquatter(l.id, idx, "guard");
          sweptCount++;
        } else if (b.car && b.car.state === "SQUATTING") {
          const fee = Math.max(b.car.currentFine || 1200000, b.car.maxFineTarget || 1500000);
          fineCollected += fee;
          collectSquatterFineAndRelease(l, idx, fee, "guard");
          sweptCount++;
        }
      });
    });
    const rewardGd = 15000 * GREEN_DOLLAR_UNIT;
    state.money += rewardGd;
    logEvent(L(
      `🚓 [VIP Tool -${tool.gcCost} GC] Đội Cứu Hộ AI đã dọn sạch ${sweptCount} xe đỗ lấn, thu phạt ${formatVND(fineCollected)} & thưởng +${formatVND(rewardGd)}!`,
      `🚓 [VIP Tool -${tool.gcCost} GC] AI Tow Squad cleared ${sweptCount} squatters, collected ${formatVND(fineCollected)} in fines & awarded +${formatVND(rewardGd)}!`
    ));
  } else if (toolId === "tool_weather_boost") {
    cycleWeatherMode();
    if (window.mpState) {
      window.mpState.cityEvent = {
        id: "GC_SUPER_SURGE",
        name: "⚡ Siêu Sóng Kích Cầu Sạc Điện (VIP Satellite)",
        nameEn: "⚡ VIP Satellite EV Charging Surge",
        desc: "Vệ tinh thời tiết GreenCoin kích hoạt: +45% nhu cầu sạc & +40% doanh thu tiện ích toàn thành phố!",
        descEn: "GreenCoin Weather Satellite active: +45% EV charging demand & +40% amenity revenue citywide!",
        solarBonus: 0.45,
        trafficMult: 1.45,
        amenityMult: 1.40
      };
      window.mpState.eventRemainingSec = 120;
    }
    logEvent(L(
      `☀️ [VIP Tool -${tool.gcCost} GC] Đã chuyển đổi thời tiết & kích hoạt Siêu Sóng Kích Cầu Sạc (+45% khách trong 120s)!`,
      `☀️ [VIP Tool -${tool.gcCost} GC] Weather switched & activated VIP Charging Surge (+45% traffic for 120s)!`
    ));
  } else if (toolId === "tool_capital_inject") {
    const capGd = 150000 * GREEN_DOLLAR_UNIT;
    state.money += capGd;
    logEvent(L(
      `💵 [VIP Tool -${tool.gcCost} GC] Đã giải ngân +${formatVND(capGd)} vào quỹ tiền mặt!`,
      `💵 [VIP Tool -${tool.gcCost} GC] Injected +${formatVND(capGd)} into your GreenDollar balance!`
    ));
  }

  updateGreenCoinHUD();
  saveGameToStorage(false);
  renderGreenCoinShopModal();
  refreshAllUI();
}

export function buyGreenCoinItem(itemId) {
  const item = GREENCOIN_ITEMS_CATALOG.find(i => i.id === itemId);
  if (!item) return;
  if (!state.ownedItems) state.ownedItems = {};
  if (state.ownedItems[itemId]) return;

  if ((state.greenCoins || 0) < item.gcCost) {
    logEvent(L(
      `⚠️ Cần ${formatGreenCoin(item.gcCost)} để mua vật phẩm "${getItemName(item)}"!`,
      `⚠️ Need ${formatGreenCoin(item.gcCost)} to buy "${getItemName(item)}"!`
    ));
    return;
  }

  state.greenCoins -= item.gcCost;
  state.ownedItems[itemId] = true;
  if (typeof playSfx === "function") playSfx("cash");
  if (typeof triggerHaptic === "function") triggerHaptic(40);
  updateGreenCoinHUD();
  saveGameToStorage(false);
  renderGreenCoinShopModal();
  refreshAllUI();
  logEvent(L(
    `🎒 Đã mua vật phẩm công nghệ "${getItemName(item)}" (-${formatGreenCoin(item.gcCost)})! Hiệu ứng đã kích hoạt vĩnh viễn.`,
    `🎒 Purchased tech item "${getItemName(item)}" (-${formatGreenCoin(item.gcCost)})! Permanent effect activated.`
  ));
}

export function buyOrEquipStationSkin(skinId) {
  const skin = STATION_SKINS_CATALOG.find(s => s.id === skinId);
  if (!skin) return;
  if (!state.ownedSkins) state.ownedSkins = { skin_emerald: true };

  if (!state.ownedSkins[skinId]) {
    if ((state.greenCoins || 0) < skin.gcCost) {
      logEvent(L(
        `⚠️ Cần ${formatGreenCoin(skin.gcCost)} để mở khóa "${getItemName(skin)}"!`,
        `⚠️ Need ${formatGreenCoin(skin.gcCost)} to unlock "${getItemName(skin)}"!`
      ));
      return;
    }
    state.greenCoins -= skin.gcCost;
    state.ownedSkins[skinId] = true;
    state.equippedSkin = skinId;
    if (typeof playSfx === "function") playSfx("cash");
    if (typeof triggerHaptic === "function") triggerHaptic(45);
    logEvent(L(
      `🎨 Đã mở khóa & trang bị "${getItemName(skin)}" (-${formatGreenCoin(skin.gcCost)}) cho toàn bộ trạm sạc 3D!`,
      `🎨 Unlocked & equipped "${getItemName(skin)}" (-${formatGreenCoin(skin.gcCost)}) across all your 3D stations!`
    ));
  } else {
    state.equippedSkin = skinId;
    if (typeof playSfx === "function") playSfx("click");
    logEvent(L(
      `🎨 Đã trang bị "${getItemName(skin)}" cho toàn bộ trạm sạc 3D của bạn!`,
      `🎨 Equipped "${getItemName(skin)}" on all your 3D charging stations!`
    ));
  }

  updateGreenCoinHUD();
  saveGameToStorage(false);
  renderGreenCoinShopModal();
  refreshAllUI();
}

export function renderGreenCoinShopModal() {
  const body = document.getElementById("greencoin-shop-modal-body");
  if (!body) return;
  if (!state.ownedItems) state.ownedItems = {};
  if (!state.ownedSkins) state.ownedSkins = { skin_emerald: true };
  const curSkin = getActiveStationSkin();
  const adState = ensureAdRewardsState();
  const x2Left = state.adX2RevRemainingSec || 0;

  body.innerHTML = `
    <!-- SLOT BANNER QUẢNG CÁO TÀI TRỢ (320x50 / NATIVE BANNER AD SLOT) -->
    ${renderSponsorBannerAdSlot("shop-top-banner")}

    <!-- VÍ TIỀN TỆ KÉP: GREENDOLLAR (G$) & GREENCOIN (GC) + NẠP NHANH GREENCOIN -->
    <div style="background:linear-gradient(135deg, #0f172a, #1e293b); color:#fff; border:2.5px solid #fbbf24; border-radius:14px; padding:9px 11px; margin-bottom:9px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
        <div>
          <div style="font-size:10px; color:#cbd5e1; font-weight:800;">${L("HỆ TIỀN TỆ THỐNG NHẤT (KHÔNG ĐỔI CHÉO)", "UNIFIED DUAL-CURRENCY ECONOMY")}</div>
          <div style="font-size:12.5px; font-weight:900; margin-top:2px;">
            <span style="color:#34d399;">💵 ${formatVND(state.money)}</span>
            <span style="margin:0 6px; opacity:0.4;">|</span>
            <span style="color:#fbbf24;">🪙 ${formatGreenCoin(state.greenCoins || 0)}</span>
          </div>
          <div style="font-size:8.6px; color:#fde047; margin-top:2px;">
            ${L("Skin đang dùng:", "Equipped 3D Skin:")} <b>${curSkin.icon} ${getItemName(curSkin)}</b>
            ${x2Left > 0 ? ` • <span style="color:#38bdf8; font-weight:900;">⚡ ${L(`X2 Doanh thu: ${x2Left}s`, `2X Revenue: ${x2Left}s`)}</span>` : ""}
          </div>
        </div>
        <div style="display:flex; gap:4px; flex-wrap:wrap;">
          <button class="u-btn warn" style="min-width:64px; padding:4px 7px;" onclick="topUpGreenCoin(100)">
            ➕ +100 GC<br/><span style="font-size:7.6px;">$0.99 • ${L("Gói Cơ Bản", "Starter")}</span>
          </button>
          <button class="u-btn warn" style="min-width:64px; padding:4px 7px;" onclick="topUpGreenCoin(500)">
            💎 +500 GC<br/><span style="font-size:7.6px;">$3.99 • ${L("Gói VIP", "VIP Pack")}</span>
          </button>
          <button class="u-btn purple" style="min-width:68px; padding:4px 7px;" onclick="topUpGreenCoin(2000)">
            👑 +2,000 GC<br/><span style="font-size:7.6px;">$12.99 • ${L("Gói Tycoon", "Tycoon Pack")}</span>
          </button>
        </div>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; margin-top:7px; padding-top:6px; border-top:1px dashed rgba(251, 191, 36, 0.35); flex-wrap:wrap;">
        <div style="font-size:8.6px; color:#e2e8f0; font-weight:700;">
          🚫 <b>${L("Gói Mua Vĩnh Viễn:", "Non-Consumable Store Pack:")}</b> ${L("Tắt toàn bộ Quảng cáo vĩnh viễn + Tặng 150 GC", "Remove all Banner & Interstitial Ads forever + 150 GC Bonus")}
        </div>
        <div style="display:flex; gap:4px;">
          <button class="u-btn ${state.removeAdsOwned ? 'maxed' : 'secondary'}" style="min-width:92px; padding:4px 8px;" ${state.removeAdsOwned ? 'disabled' : ''} onclick="buyRemoveAdsPack()">
            ${state.removeAdsOwned ? L("✅ Đã Sở Hữu", "✅ Owned") : L("🚫 Tắt Quảng Cáo ($2.99)", "🚫 Remove Ads ($2.99)")}
          </button>
          <button class="sheet-mini-btn" onclick="restoreIapPurchases()" title="${L('Khôi phục các gói Vĩnh Viễn đã mua trên Store', 'Restore Non-Consumable Store Purchases')}">
            🔄 ${L("Khôi phục IAP", "Restore IAP")}
          </button>
        </div>
      </div>
    </div>

    <!-- PHẦN 0: TRUNG TÂM QUẢNG CÁO GOOGLE ADMOB REWARDED VIDEO (GIỚI HẠN LƯỢT/NGÀY) -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin:6px 0 4px;">
      <div style="font-weight:900; font-size:10.5px; color:#047857;">
        📺 ${L("0. QUẢNG CÁO GOOGLE ADMOB NHẬN THƯỞNG (GIỚI HẠN LƯỢT/NGÀY)", "0. GOOGLE ADMOB REWARDED VIDEO ADS (DAILY QUOTA)")}
      </div>
    </div>
    ${REWARDED_AD_SLOTS_CONFIG.map(sl => {
      const used = adState[sl.usedKey] || 0;
      const maxed = used >= sl.dailyLimit;
      return `
        <div class="upgrade-card ${maxed ? '' : 'selected-lot'}">
          <div class="u-info">
            <div class="u-title">
              <span>${sl.icon} ${isEn() ? sl.nameEn : sl.name}</span>
              <span class="u-badge ${maxed ? 'rival' : 'taxi'}">${L("Hôm nay:", "Today:")} ${used}/${sl.dailyLimit}</span>
              <span class="u-badge area">${isEn() ? sl.badgeEn : sl.badgeVi}</span>
            </div>
            <div class="u-desc">${isEn() ? sl.descEn : sl.desc}</div>
          </div>
          <button class="u-btn ${maxed ? 'maxed' : 'warn'}" ${maxed ? 'disabled' : ''} onclick="startRewardedVideoAd('${sl.id}')">
            ${maxed ? L("✅ Hết Lượt<br/>Hôm Nay", "✅ Quota<br/>Used") : `📺 ${L("Xem AdMob", "Watch AdMob")}`}
          </button>
        </div>
      `;
    }).join("")}

    <!-- PHẦN 1: SKIN TRẠM SẠC 3D & MÁI SOLAR CANOPY (HIỂN THỊ TRỰC TIẾP TRÊN BẢN ĐỒ 3D) -->
    <div style="font-weight:900; font-size:10.5px; color:#78350f; margin:6px 0 4px;">
      🎨 ${L("1. SKIN TRẠM SẠC 3D & HÀO QUANG MÁI SOLAR (MUA BẰNG GREENCOIN)", "1. 3D STATION & SOLAR CANOPY SKINS (UNLOCK WITH GREENCOIN)")}
    </div>
    ${STATION_SKINS_CATALOG.map(sk => {
      const isOwned = Boolean(state.ownedSkins[sk.id]);
      const isEquipped = state.equippedSkin === sk.id;
      return `
        <div class="upgrade-card ${isEquipped ? 'selected-lot' : 'amenity-card'}">
          <div class="u-info">
            <div class="u-title">
              <span>${sk.icon} ${getItemName(sk)}</span>
              ${sk.appealBonus > 0 ? `<span class="u-badge taxi">+${sk.appealBonus}${L("đ thu hút", "pt Appeal")}</span>` : `<span class="u-badge">${L("Mặc định", "Default")}</span>`}
              ${sk.amenityRevMult > 1 ? `<span class="u-badge area">+${Math.round((sk.amenityRevMult - 1) * 100)}% ${L("Thu DV", "Amenity Rev")}</span>` : ""}
            </div>
            <div class="u-desc">${getItemDesc(sk)}</div>
          </div>
          <button class="u-btn ${isEquipped ? 'maxed' : (isOwned ? 'secondary' : 'warn')}" ${isEquipped ? 'disabled' : ''} onclick="buyOrEquipStationSkin('${sk.id}')">
            ${isEquipped
              ? L("✅ Đang Dùng", "✅ Equipped")
              : (isOwned
                  ? L("🎨 Trang Bị", "🎨 Equip")
                  : `🪙 ${formatGreenCoin(sk.gcCost)}`)}
          </button>
        </div>
      `;
    }).join("")}

    <!-- PHẦN 2: VẬT PHẨM CÔNG NGHỆ VĨNH VIỄN (TECH ITEMS & BOOSTERS) -->
    <div style="font-weight:900; font-size:10.5px; color:#78350f; margin:8px 0 4px;">
      🎒 ${L("2. VẬT PHẨM CÔNG NGHỆ & ĐẶC QUYỀN VĨNH VIỄN", "2. PERMANENT TECH ITEMS & NETWORK BOOSTERS")}
    </div>
    ${GREENCOIN_ITEMS_CATALOG.map(it => {
      const owned = Boolean(state.ownedItems[it.id]);
      return `
        <div class="upgrade-card ${owned ? 'selected-lot' : 'guard-card'}">
          <div class="u-info">
            <div class="u-title">
              <span>${it.icon} ${getItemName(it)}</span>
              <span class="u-badge ${owned ? 'taxi' : 'area'}">${owned ? L("Đã Kích Hoạt", "Active") : formatGreenCoin(it.gcCost)}</span>
            </div>
            <div class="u-desc">${getItemDesc(it)}</div>
          </div>
          <button class="u-btn ${owned ? 'maxed' : 'purple'}" ${owned ? 'disabled' : ''} onclick="buyGreenCoinItem('${it.id}')">
            ${owned ? L("✅ Đã Sở Hữu", "✅ Owned") : `🪙 ${L("Mua", "Buy")}<br/>(${formatGreenCoin(it.gcCost)})`}
          </button>
        </div>
      `;
    }).join("")}

    <!-- PHẦN 3: CÔNG CỤ ĐIỀU HÀNH ĐẶC QUYỀN (VIP TOOLS SỬ DỤNG GREENCOIN) -->
    <div style="font-weight:900; font-size:10.5px; color:#78350f; margin:8px 0 4px;">
      🛠️ ${L("3. CÔNG CỤ ĐIỀU HÀNH ĐẶC QUYỀN CEO", "3. CEO VIP OPERATIONAL TOOLS (INSTANT USE)")}
    </div>
    ${GREENCOIN_TOOLS_CATALOG.map(tl => `
      <div class="upgrade-card expand-highlight">
        <div class="u-info">
          <div class="u-title">
            <span>${tl.icon} ${getItemName(tl)}</span>
            <span class="u-badge area">🪙 ${formatGreenCoin(tl.gcCost)}</span>
          </div>
          <div class="u-desc">${getItemDesc(tl)}</div>
        </div>
        <button class="u-btn warn" onclick="useGreenCoinTool('${tl.id}')">
          ⚡ ${L("Sử Dụng", "Use Tool")}<br/>(${formatGreenCoin(tl.gcCost)})
        </button>
      </div>
    `).join("")}
  `;
}

/*****************************************************************************************
 * ENGINE GIAO THÔNG CHỐNG KẸT 100%
 *****************************************************************************************/

export function ensureAdRewardsState() {
  if (!state.adRewards) {
    state.adRewards = { cashUsed: 0, gcUsed: 0, x2Used: 0, boxUsed: 0, cooldownSec: 0, totalWatchedAllTime: 0 };
  }
  return state.adRewards;
}

export function renderSponsorBannerAdSlot(slotDomId = "banner-slot-main") {
  // IAP-03 & ADS-07: Nếu người chơi đã sở hữu gói Remove Ads, ẩn hoàn toàn mọi Banner quảng cáo ngay lập tức
  if (state.removeAdsOwned) return "";
  const isAndroid = typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent || "");
  const activeBannerUnit = isAndroid
    ? "ca-app-pub-7182007818337262/1327088098"
    : "ca-app-pub-7182007818337262/1084525457";
  const activeSlotNum = isAndroid ? "1327088098" : "1084525457";
  setTimeout(() => {
    try {
      if (typeof window !== "undefined" && window.adsbygoogle && typeof window.adsbygoogle.push === "function") {
        const insEl = document.querySelector(`[data-ad-slot-dom="${slotDomId}"] ins.adsbygoogle`);
        if (insEl && !insEl.getAttribute("data-adsbygoogle-status")) {
          window.adsbygoogle.push({});
        }
      }
    } catch (e) {}
  }, 60);
  return `
    <div class="ad-banner-slot" data-ad-slot="${slotDomId}" data-ad-slot-dom="${slotDomId}" style="background:#0f172a; border:1.5px solid #334155; border-radius:10px; padding:5px 8px; margin:6px 0; min-height:54px; display:flex; flex-direction:column; justify-content:center; align-items:center; color:#94a3b8; position:relative; overflow:hidden;">
      <div style="width:100%; display:flex; justify-content:space-between; align-items:center; font-size:7.2px; color:#64748b; font-weight:800; margin-bottom:2px;">
        <span>GOOGLE ADMOB BANNER • ${slotDomId.toUpperCase()}</span>
        <span>ID: ${activeBannerUnit}</span>
      </div>
      <ins class="adsbygoogle"
           style="display:block; width:100%; min-height:50px; max-height:60px;"
           data-ad-client="ca-pub-7182007818337262"
           data-ad-slot="${activeSlotNum}"
           data-ad-format="horizontal"
           data-full-width-responsive="true"></ins>
    </div>
  `;
}

globalThis.activeAdWatchSession = null;
globalThis.activeAdIntervalId = null;

export function startRewardedVideoAd(adType) {
  // ADS-03: Kiểm tra kết nối mạng trước khi nạp quảng cáo
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    logEvent(L(
      "⚠️ Quảng cáo chưa sẵn sàng / Vui lòng kiểm tra kết nối mạng (Wi-Fi/4G) để xem Video nhận thưởng!",
      "⚠️ Ad not ready / Please check your internet connection (Wi-Fi/4G) to watch Rewarded Video Ads!"
    ));
    return false;
  }

  const adState = ensureAdRewardsState();
  const slot = REWARDED_AD_SLOTS_CONFIG.find(s => s.id === adType) || REWARDED_AD_SLOTS_CONFIG[0];
  const used = adState[slot.usedKey] || 0;

  if (used >= slot.dailyLimit) {
    logEvent(L(
      `⚠️ Bạn đã dùng hết ${used}/${slot.dailyLimit} lượt "${slot.name}" hôm nay! Lượt xem sẽ tự động làm mới vào ngày mai (hoặc bấm Reset Lượt Ads để test).`,
      `⚠️ You have used all ${used}/${slot.dailyLimit} "${slot.nameEn}" quotas today! Quotas reset each new day.`
    ));
    return false;
  }

  const modal = document.getElementById("rewarded-ad-video-modal");
  if (!modal) {
    completeAndGrantRewardedAdPrize(slot.id);
    return true;
  }

  if (activeAdIntervalId) clearInterval(activeAdIntervalId);
  // ADS-04: Lưu trạng thái âm thanh trước khi mở Ad và tạm thời tắt tiếng game trong lúc phát quảng cáo
  const prevSound = Boolean(state.soundEnabled);
  state.soundEnabled = false;
  activeAdWatchSession = {
    slotId: slot.id,
    remainingSec: 5,
    totalSec: 5,
    completed: false,
    pausedByVisibility: false,
    prevSoundEnabled: prevSound
  };

  updateRewardedAdModalUI();
  modal.classList.add("show");

  activeAdIntervalId = setInterval(() => {
    if (!activeAdWatchSession || activeAdWatchSession.pausedByVisibility) return;
    activeAdWatchSession.remainingSec = Math.max(0, activeAdWatchSession.remainingSec - 1);
    if (activeAdWatchSession.remainingSec <= 0) {
      activeAdWatchSession.completed = true;
      clearInterval(activeAdIntervalId);
      activeAdIntervalId = null;
    }
    updateRewardedAdModalUI();
  }, 1000);
  return true;
}

export function updateRewardedAdModalUI() {
  const body = document.getElementById("rewarded-ad-video-modal-body");
  if (!body || !activeAdWatchSession) return;
  const slot = REWARDED_AD_SLOTS_CONFIG.find(s => s.id === activeAdWatchSession.slotId) || REWARDED_AD_SLOTS_CONFIG[0];
  const pct = Math.round(((activeAdWatchSession.totalSec - activeAdWatchSession.remainingSec) / activeAdWatchSession.totalSec) * 100);
  const done = activeAdWatchSession.completed;

  body.innerHTML = `
    <div style="background:linear-gradient(135deg, #0f172a, #1e293b); border:2.5px solid #38bdf8; border-radius:16px; padding:14px; text-align:center; color:#fff;">
      <div style="display:flex; justify-content:space-between; align-items:center; font-size:8.5px; color:#94a3b8; margin-bottom:8px;">
        <span>📺 ${L("VIDEO TÀI TRỢ • 🔇 ĐÃ TẮT TIẾNG GAME", "SPONSORED VIDEO AD • 🔇 GAME AUDIO MUTED")}</span>
        <span style="background:#0284c7; color:#fff; padding:1.5px 7px; border-radius:99px; font-weight:900;">
          ${done ? L("✅ ĐÃ XEM XONG", "✅ COMPLETED") : L(`⏳ Còn ${activeAdWatchSession.remainingSec}s...`, `⏳ ${activeAdWatchSession.remainingSec}s left...`)}
        </span>
      </div>
      <div style="font-size:32px; margin:8px 0;">${slot.icon} ⚡ 🚕</div>
      <div style="font-size:12px; font-weight:900; color:#fef08a;">
        ${isEn() ? slot.nameEn : slot.name}
      </div>
      <div style="font-size:9.5px; color:#cbd5e1; margin:5px 0 10px;">
        ${isEn() ? slot.descEn : slot.desc}
      </div>
      <div style="width:100%; height:10px; background:#334155; border-radius:99px; overflow:hidden; border:1px solid #64748b; margin-bottom:12px;">
        <div style="width:${pct}%; height:100%; background:linear-gradient(90deg, #10b981, #fde047); transition:width 0.3s ease;"></div>
      </div>
      <div style="display:flex; justify-content:center; gap:8px;">
        <button class="u-btn ${done ? 'warn' : ''}" style="min-width:165px; padding:7px 14px; font-size:10.5px;" ${!done ? 'disabled' : ''} onclick="claimRewardedVideoAdPrize()">
          ${done ? L(`🎁 NHẬN THƯỞNG (${slot.badgeVi})`, `🎁 CLAIM REWARD (${slot.badgeEn})`) : L(`⏳ Vui lòng xem (${activeAdWatchSession.remainingSec}s)`, `⏳ Watching Ad (${activeAdWatchSession.remainingSec}s)`)}
        </button>
        <button class="u-btn danger" style="min-width:75px;" onclick="closeRewardedVideoAdModal()">
          ${done ? L("Đóng", "Close") : L("Bỏ qua", "Skip Ad")}
        </button>
      </div>
    </div>
  `;
}

export function closeRewardedVideoAdModal() {
  if (activeAdIntervalId) {
    clearInterval(activeAdIntervalId);
    activeAdIntervalId = null;
  }
  const wasAborted = activeAdWatchSession && !activeAdWatchSession.completed;
  // ADS-04: Khôi phục nguyên trạng thái âm thanh trước khi mở quảng cáo (nếu trước đó đang Mute thì giữ nguyên Mute)
  if (activeAdWatchSession && typeof activeAdWatchSession.prevSoundEnabled === "boolean") {
    state.soundEnabled = activeAdWatchSession.prevSoundEnabled;
  }
  activeAdWatchSession = null;
  const modal = document.getElementById("rewarded-ad-video-modal");
  if (modal) modal.classList.remove("show");
  if (wasAborted) {
    logEvent(L(
      "ℹ️ [ADS-02] Bạn đã đóng sớm Video Quảng cáo trước khi kết thúc — Không nhận thưởng và không bị trừ lượt xem hôm nay!",
      "ℹ️ [ADS-02] You skipped the Rewarded Video Ad early — No reward granted and your daily quota was not deducted!"
    ));
  }
}

export function claimRewardedVideoAdPrize() {
  if (!activeAdWatchSession || !activeAdWatchSession.completed) return;
  const slotId = activeAdWatchSession.slotId;
  closeRewardedVideoAdModal();
  completeAndGrantRewardedAdPrize(slotId);
}

export function completeAndGrantRewardedAdPrize(slotId) {
  const adState = ensureAdRewardsState();
  const slot = REWARDED_AD_SLOTS_CONFIG.find(s => s.id === slotId) || REWARDED_AD_SLOTS_CONFIG[0];
  if ((adState[slot.usedKey] || 0) >= slot.dailyLimit) return;

  adState[slot.usedKey] = (adState[slot.usedKey] || 0) + 1;
  adState.totalWatchedAllTime = (adState.totalWatchedAllTime || 0) + 1;
  const curUsed = adState[slot.usedKey];

  if (slotId === "ad_cash") {
    const cashBonus = 35000 * GREEN_DOLLAR_UNIT;
    state.money += cashBonus;
    state.totalRevenueAllTime += cashBonus;
    state.totalProfitAllTime += cashBonus;
    logEvent(L(
      `🎬 [Quà Video ${curUsed}/${slot.dailyLimit}] Đã nhận +${formatVND(cashBonus)} vốn tài trợ quảng cáo!`,
      `🎬 [Video Ad ${curUsed}/${slot.dailyLimit}] Received +${formatVND(cashBonus)} sponsor capital!`
    ));
  } else if (slotId === "ad_gc") {
    const gcBonus = 15;
    state.greenCoins = (state.greenCoins || 0) + gcBonus;
    updateGreenCoinHUD();
    logEvent(L(
      `🎬 [Quà Video ${curUsed}/${slot.dailyLimit}] Đã nhận +${formatGreenCoin(gcBonus)} miễn phí từ nhà tài trợ!`,
      `🎬 [Video Ad ${curUsed}/${slot.dailyLimit}] Earned +${formatGreenCoin(gcBonus)} from sponsor video!`
    ));
  } else if (slotId === "ad_x2") {
    state.adX2RevRemainingSec = (state.adX2RevRemainingSec || 0) + 180;
    logEvent(L(
      `⚡ [Quà Video ${curUsed}/${slot.dailyLimit}] Đã kích hoạt X2 DOANH THU SẠC & TIỆN ÍCH trong ${state.adX2RevRemainingSec} giây!`,
      `⚡ [Video Ad ${curUsed}/${slot.dailyLimit}] Activated 2X CHARGING & AMENITY REVENUE for ${state.adX2RevRemainingSec}s!`
    ));
  } else if (slotId === "ad_box") {
    const roll = Math.random();
    if (roll < 0.45) {
      const randGd = (30000 + Math.floor(Math.random() * 30) * 1000) * GREEN_DOLLAR_UNIT;
      state.money += randGd;
      logEvent(L(
        `🎁 [Hộp Quà Ads ${curUsed}/${slot.dailyLimit}] Mở trúng giải Vốn Đầu Tư +${formatVND(randGd)}!`,
        `🎁 [Lucky Ad Box ${curUsed}/${slot.dailyLimit}] Won +${formatVND(randGd)} cash prize!`
      ));
    } else {
      const randGc = 15 + Math.floor(Math.random() * 16);
      state.greenCoins = (state.greenCoins || 0) + randGc;
      updateGreenCoinHUD();
      logEvent(L(
        `🎁 [Hộp Quà Ads ${curUsed}/${slot.dailyLimit}] Mở trúng kho báu +${formatGreenCoin(randGc)}!`,
        `🎁 [Lucky Ad Box ${curUsed}/${slot.dailyLimit}] Won +${formatGreenCoin(randGc)} jackpot!`
      ));
    }
  }

  if (typeof playSfx === "function") playSfx("cash");
  if (typeof triggerHaptic === "function") triggerHaptic(35);
  saveGameToStorage(false);
  renderGreenCoinShopModal();
  refreshAllUI();
}

export function resetDailyAdQuotasDemo() {
  return false;
}


// Đăng ký vào globalThis để tương thích ngược với HTML event handlers & các module liên kết
Object.assign(globalThis, {
  openGreenCoinShopModal,
  closeGreenCoinShopModal,
  topUpGreenCoin,
  useGreenCoinTool,
  buyGreenCoinItem,
  buyOrEquipStationSkin,
  renderGreenCoinShopModal,
  ensureAdRewardsState,
  renderSponsorBannerAdSlot,
  startRewardedVideoAd,
  updateRewardedAdModalUI,
  closeRewardedVideoAdModal,
  claimRewardedVideoAdPrize,
  completeAndGrantRewardedAdPrize,
  resetDailyAdQuotasDemo
});
