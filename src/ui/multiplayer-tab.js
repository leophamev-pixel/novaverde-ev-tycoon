/**
 * src/ui/multiplayer-tab.js
 * Hiển thị Tab Đấu trường Multiplayer, Đấu giá Sổ Đỏ, Hợp đồng B2B & Nhiệm vụ Ngày
 */
export function renderMultiplayerAndRivalsTab() {
  const rvEl = document.getElementById("rivals-list");
  if (!rvEl) return;

  const curSec = getSectorAtWorldPos(camera.x, camera.y);
  const wardLots = SECTOR_LOTS_MAP[curSec.sIdx] || [];
  const curRivals = SECTOR_RIVALS_MAP[curSec.sIdx] || RIVAL_STATIONS;

  let playerTotalAppeal = 0;
  let totalChargers = 0;
  let totalAmenities = 0;
  state.lots.forEach(l => {
    if (l.owned && !l.lockedByDebt) {
      playerTotalAppeal += getLotAppealScores(l).avgAppeal;
      totalChargers += l.bays.length;
      totalAmenities += getLotOwnedAmenitiesList(l).length;
    }
  });
  const rivalTotalAppeal = curRivals.reduce((acc, r) => acc + Math.round((r.taxiAppeal + r.casualAppeal) / 2), 0);
  const sharePct = Math.round((playerTotalAppeal / Math.max(1, playerTotalAppeal + rivalTotalAppeal)) * 100);
  const ownedCountInWard = wardLots.filter(l => l.owned).length;
  const rk = getPlayerLeaderboardRankInfo();

  document.getElementById("owned-lots-lbl").textContent = L(`${rk.totalOwned5400}/5.400 Lô`, `${rk.totalOwned5400}/5,400 Lots`);
  document.getElementById("market-share-pill").textContent = L(`${curSec.districtCode} • Thị phần: ${sharePct}%`, `${curSec.districtCode} • Share: ${sharePct}%`);

  const ev = window.mpState.cityEvent;
  const auc = window.mpState.activeAuction;
  const priceDiff = 3650 - window.mpState.retailPriceKwh;
  const trafficBoostPct = Math.round(priceDiff / 15);
  const sampleLotVal = getLotMarketValuation(wardLots[0] || state.lots[0]);

  const quests = [
    { id: "q_lots_2", title: L("Mở từ 2 Lô Trạm Sạc trở lên trên mạng lưới 5.400 Lô", "Acquire 2+ EV Station Lots across the 5,400-Lot network"), done: rk.totalOwned5400 >= 2, reward: 25000000 },
    { id: "q_chg_4", title: L("Vận hành ít nhất 4 Trụ Sạc EV trên hệ thống", "Operate at least 4 active EV Chargers across your stations"), done: totalChargers >= 4, reward: 30000000 },
    { id: "q_amn_2", title: L("Xây dựng 2 Tiện ích (Trà đá/Phở/Café...)", "Build 2 Station Amenities (Iced Tea/Pho/Café...)"), done: totalAmenities >= 2, reward: 35000000 }
  ];

  const aucDisplayName = auc ? (isEn() ? (auc.lotNameEn || auc.lotName) : auc.lotName) : "";

  let html = `
    <!-- SLOT BANNER QUẢNG CÁO TÀI TRỢ (320x50 / NATIVE BANNER AD SLOT) -->
    ${renderSponsorBannerAdSlot("leaderboard-top-banner")}

    <!-- 1. HỒ SƠ CEO, THỨ HẠNG HIỆN TẠI & THƯỞNG ĐUA TOP CHỦ NHẬT HÀNG TUẦN -->
    <div class="upgrade-card selected-lot" style="flex-direction:column; align-items:stretch; gap:6px;">
      <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; flex-wrap:wrap;">
        <div class="u-title">
          <span>🏆 ${L(`Hạng #${rk.myRank}:`, `Rank #${rk.myRank}:`)} ${rk.tierTitle}</span>
          <span class="u-badge taxi">+${formatCompactVND(rk.rewardGd)} & +${formatGreenCoin(rk.rewardGc)}/${L("tuần", "wk")}</span>
          ${state.weeklyRankAppealBonus ? `<span class="u-badge area">🔥 ${L(`Buff Tuần +${state.weeklyRankAppealBonus}đ`, `Weekly Buff +${state.weeklyRankAppealBonus}pt`)}</span>` : ""}
        </div>
        <span class="u-badge area" style="padding:4px 8px; font-size:8.4px;">
          ⏰ ${L("Tự động trao 24:00 CN", "Auto-payout Sun 24:00")}
        </span>
      </div>
      <div class="u-desc">
        ${L(
          `Vào <b>24:00 tối Chủ Nhật hàng tuần</b>, hệ thống trao thưởng theo Thứ hạng BXH của bạn (Hiện tại: <b>+${formatVND(rk.rewardGd)}</b>, <b>+${formatGreenCoin(rk.rewardGc)}</b> & <b>+${rk.appealBonus}đ thu hút xe</b>).`,
          `Every <b>Sunday at 24:00</b>, weekly Leaderboard rewards are paid out based on your Rank (Current: <b>+${formatVND(rk.rewardGd)}</b>, <b>+${formatGreenCoin(rk.rewardGc)}</b> & <b>+${rk.appealBonus}pt appeal</b>).`
        )}
      </div>
      <div style="display:flex; gap:5px; align-items:center;">
        <span style="font-size:8.6px; font-weight:900; color:#78350f;">👔 ${L("Tên Tập đoàn:", "Corp Name:")}</span>
        <input id="ceo-name-input" type="text" value="${window.mpState.playerName}" style="flex:1; border:1.5px solid #92400e; border-radius:7px; padding:3px 6px; font-size:9px; font-weight:800; background:#fffbeb; color:#291507; user-select:text; -webkit-user-select:text;" />
        <button class="u-btn secondary" style="min-width:62px; padding:3.5px 7px;" onclick="saveCustomPlayerCeoName()">💾 ${L("Lưu Tên", "Save")}</button>
      </div>
    </div>

    <!-- 2. BẢNG XẾP HẠNG 3 TIÊU CHÍ (TÀI SẢN RÒNG • TRỤ SẠC • SỐ LÔ ĐẤT) & GIAO DỊCH BĐS VỚI BOT -->
    <div class="upgrade-card" style="flex-direction:column; align-items:stretch; gap:5px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px;">
        <div class="u-title">
          <span>${L("🏆 BẢNG XẾP HẠNG TẬP ĐOÀN ĐẠI ĐÔ THỊ NOVAVERDE", "🏆 NOVAVERDE METROPOLIS EV LEADERBOARD")}</span>
          <span class="u-badge area">📈 ${L(`Giá BĐS Phường: +${sampleLotVal.pctChange}%`, `Ward Land Index: +${sampleLotVal.pctChange}%`)}</span>
        </div>
      </div>
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:4px;">
        <button class="pop-btn ${rk.sortMode === 'netWorth' ? 'green' : ''}" onclick="setLeaderboardSortMode('netWorth')">💰 ${L("Tài Sản Ròng", "Net Worth")}</button>
        <button class="pop-btn ${rk.sortMode === 'chargers' ? 'green' : ''}" onclick="setLeaderboardSortMode('chargers')">⚡ ${L("Số Trụ Sạc", "Total Chargers")}</button>
        <button class="pop-btn ${rk.sortMode === 'lots' ? 'green' : ''}" onclick="setLeaderboardSortMode('lots')">🏢 ${L("Số Lô Đất", "Owned Lots")}</button>
      </div>
      ${rk.sorted.map((p, idx) => `
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:9.1px; padding:4px 5px; border-radius:7px; background:${p.isMe ? '#dcfce7' : 'transparent'}; border-bottom:1px dashed #d6d3d1; font-weight:${p.isMe ? '900' : '700'}; color:${p.isMe ? '#065f46' : '#291507'};">
          <div>
            <span>${idx === 0 ? '🥇' : (idx === 1 ? '🥈' : (idx === 2 ? '🥉' : `#${idx + 1}`))} <b>${p.name}</b></span>
            <div style="font-size:8px; color:#57534e; font-weight:700;">
              🏢 ${p.ownedLots} ${L("Lô", "Lots")} • 🔌 ${p.totalChargers} ${L("Trụ", "Bays")} • ⚡ ${formatVND(p.priceKwh)}/kWh
            </div>
          </div>
          <span style="font-size:9.6px; font-weight:900; color:${p.isMe ? '#047857' : '#b45309'};">${formatCompactVND(p.netWorth)}</span>
        </div>
      `).join("")}
      <div style="margin-top:3px; font-size:8.3px; color:#57534e; background:#fef3c7; border-radius:8px; padding:4px 7px; border:1px solid #d6d3d1;">
        <b>${L("📡 Bản tin Giao dịch BĐS & Đấu giá tự động của Bot:", "📡 Live Bot Real Estate Trades & Auction Feed:")}</b><br/>
        ${window.mpState.recentFeed.slice(0, 4).map(f => `• ${f}`).join("<br/>")}
      </div>
    </div>

    <!-- 3. SÀN ĐẤU GIÁ SỔ ĐỎ CẠNH TRANH CÙNG BOT CEO & BIẾN ĐỘNG GIÁ THỊ TRƯỜNG -->
    ${auc ? `
    <div class="upgrade-card expand-highlight">
      <div class="u-info">
        <div class="u-title">
          <span>🔨 ${L("Đấu Giá Sổ Đỏ:", "Red Book Auction:")} ${aucDisplayName}</span>
          <span class="u-badge rival">⏱️ ${auc.remainingSec}s</span>
          <span class="u-badge area">🤖 ${L("Bot cạnh tranh trực tiếp", "Live Bot Bidding")}</span>
        </div>
        <div class="u-desc">
          ${L("Giá hiện tại:", "Current Bid:")} <b style="color:#dc2626">${formatVND(auc.currentBid)}</b> • ${L("Dẫn đầu:", "Leader:")} <b>${auc.highestBidderName}</b><br/>
          ${L("Nếu Bot thắng đấu giá, bạn vẫn có thể bấm vào lô đất đó trên bản đồ để <b>Mua đứt / Thâu tóm lại theo Giá Thị Trường</b>!", "If a Bot wins the auction, you can still tap that lot on the map to <b>Buy It Out at Market Valuation</b>!")}
        </div>
      </div>
      <div style="display:flex; flex-direction:column; gap:4px;">
        <button class="u-btn warn" ${state.money < (auc.currentBid + auc.minIncrement - (auc.highestBidderId === window.mpState.playerId ? (auc.playerEscrow || 0) : 0)) ? "disabled" : ""} onclick="placeMultiplayerAuctionBid()">
          💰 ${L("Đặt Giá", "Place Bid")}<br/>(${formatCompactVND(auc.currentBid + auc.minIncrement)})
        </button>
        <button class="u-btn secondary" onclick="selectLot(${auc.lotId}, true)">
          📍 ${L("Xem Lô", "View Lot")}
        </button>
      </div>
    </div>
    ` : ""}

    <!-- 4. SIÊU TRẠM LIÊN MINH 30×240KW (GUILD MEGA-HUBS TẠI NÚT GIAO VÀNH ĐAI & METRO) -->
    ${GUILD_MEGA_HUBS.map(h => {
      const myShares = window.mpState.guildShares[h.id] || 0;
      return `
        <div class="upgrade-card guard-card">
          <div class="u-info">
            <div class="u-title">
              <span>${getItemName(h)}</span>
              <span class="u-badge taxi">${L("Cổ phần:", "Shares:")} ${myShares}/5</span>
              <span class="u-badge area">+${formatCompactVND(h.dailyDividend)}/${L("CP/ngày", "sh/day")}</span>
            </div>
            <div class="u-desc">${getItemDesc(h)}</div>
          </div>
          <button class="u-btn ${myShares >= 5 ? 'maxed' : 'purple'}" ${myShares >= 5 || state.money < h.shareCost ? 'disabled' : ''} onclick="buyGuildMegaHubShare('${h.id}', ${h.shareCost}, ${h.dailyDividend})">
            ${myShares >= 5 ? L('✅ Tối Đa 5 CP', '✅ Max 5 Shares') : `🤝 ${L("Mua 1 CP", "Buy 1 Share")}<br/>(${formatCompactVND(h.shareCost)})`}
          </button>
        </div>
      `;
    }).join("")}

    <!-- 5. CHIẾN TRANH GIÁ BÁN LẺ ĐIỆN ĐỘNG (DYNAMIC PRICING WAR) -->
    <div class="upgrade-card guard-card">
      <div class="u-info">
        <div class="u-title">
          <span>⚡ ${L("Giá Bán Điện Của Bạn:", "Your Retail Electricity Rate:")} ${formatVND(window.mpState.retailPriceKwh)}/kWh</span>
          <span class="u-badge ${trafficBoostPct >= 0 ? 'taxi' : 'rival'}">
            ${trafficBoostPct >= 0 ? L(`🚀 Hút xe +${trafficBoostPct}%`, `🚀 Traffic +${trafficBoostPct}%`) : L(`⚠️ Khách giảm ${trafficBoostPct}%`, `⚠️ Traffic ${trafficBoostPct}%`)}
          </span>
        </div>
        <div class="u-desc">
          ${L(
            `Hạ giá thấp hơn đối thủ (${formatVND(3650)}/kWh) để kéo làn sóng xe Taxi & Gia đình về trạm của bạn, hoặc tăng giá giờ cao điểm để tối đa biên lợi nhuận!`,
            `Undercut rival stations (${formatVND(3650)}/kWh) to attract more Taxis & Private EVs, or raise prices during rush hour for maximum margin!`
          )}
        </div>
      </div>
      <div style="display:flex; gap:4px;">
        <button class="u-btn secondary" style="min-width:56px" onclick="adjustPlayerElectricityPrice(-100)">-0.10 G$</button>
        <button class="u-btn" style="min-width:56px" onclick="adjustPlayerElectricityPrice(100)">+0.10 G$</button>
      </div>
    </div>

    <!-- 6. HỢP ĐỒNG ĐỘI XE B2B ĐỘC QUYỀN (FLEET CONTRACTS) -->
    ${B2B_CONTRACTS_CATALOG.map(c => {
      const signed = Boolean(window.mpState.signedContracts[c.id]);
      return `
        <div class="upgrade-card amenity-card ${signed ? 'owned' : ''}">
          <div class="u-info">
            <div class="u-title">
              <span>${getItemName(c)}</span>
              <span class="u-badge taxi">+${formatCompactVND(c.dailyBonusVnd)}/${L("ngày", "day")}</span>
            </div>
            <div class="u-desc">${getItemDesc(c)}</div>
          </div>
          <button class="u-btn ${signed ? 'maxed' : ''}" ${signed || state.money < c.signingFee || totalChargers < c.reqChargers ? 'disabled' : ''} onclick="signB2BContract('${c.id}')">
            ${signed ? L('✅ Đã Ký', '✅ Signed') : `🤝 ${L("Ký HĐ", "Sign B2B")}<br/>(${formatCompactVND(c.signingFee)})`}
          </button>
        </div>
      `;
    }).join("")}

    <!-- 7. NHIỆM VỤ NGÀY (DAILY QUESTS) -->
    ${quests.map(q => {
      const claimed = Boolean(window.mpState.claimedQuests[q.id]);
      return `
        <div class="upgrade-card">
          <div class="u-info">
            <div class="u-title">
              <span>🎯 ${q.title}</span>
              <span class="u-badge area">${L("Thưởng", "Reward")} +${formatCompactVND(q.reward)}</span>
            </div>
          </div>
          <button class="u-btn ${claimed ? 'maxed' : 'warn'}" ${(!q.done || claimed) ? 'disabled' : ''} onclick="claimDailyQuest('${q.id}', ${q.reward})">
            ${claimed ? L('✅ Đã Nhận', '✅ Claimed') : (q.done ? L('🎁 Nhận Thưởng', '🎁 Claim') : L('Đang làm', 'In Progress'))}
          </button>
        </div>
      `;
    }).join("")}

    <!-- 8. DANH SÁCH 8 TRẠM ĐỐI THỦ TRONG PHƯỜNG HIỆN TẠI -->
    ${curRivals.map(rv => {
      const rvName = isEn() ? (rv.nameEn || rv.name) : rv.name;
      const rvAm = isEn() ? (rv.amenitiesTextEn || rv.amenitiesText) : rv.amenitiesText;
      const rvStrat = isEn() ? (rv.strategyEn || rv.strategy) : rv.strategy;
      return `
        <div class="upgrade-card rival-card">
          <div class="u-info">
            <div class="u-title">
              <span>⚔️ ${rvName}</span>
              <span class="u-badge rival">${rv.chargers}×${rv.kw}kW</span>
              <span class="u-badge taxi">🚕${rv.taxiAppeal}${L("đ", "pt")}</span>
              <span class="u-badge casual">🚗${rv.casualAppeal}${L("đ", "pt")}</span>
            </div>
            <div class="u-desc">
              ${rvAm} • ${L("Giá:", "Rate:")} <b>${formatVND(rv.priceKwh)}/kWh</b>
              <span class="detail-toggle-link" onclick="toggleCardDetail('rv-detail-${rv.id}')">ℹ️ ${L("Chiến thuật", "Strategy")}</span>
            </div>
            <div class="more-detail-box" id="rv-detail-${rv.id}">${rvStrat}</div>
          </div>
          <button class="u-btn secondary" onclick="camera.x=${rv.x}; camera.y=${rv.y}; camera.zoom=0.82;">
            📍 ${L("Xem", "View")}
          </button>
        </div>
      `;
    }).join("")}
  `;

  rvEl.innerHTML = html;
}


// Đăng ký vào globalThis để tương thích ngược với HTML event handlers & các module liên kết
Object.assign(globalThis, {
  renderMultiplayerAndRivalsTab
});
