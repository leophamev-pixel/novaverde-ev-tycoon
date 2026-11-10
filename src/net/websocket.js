/**
 * src/net/websocket.js
 * Kết nối Máy chủ WebSocket Multiplayer thời gian thực & Đấu giá Lô đất
 */
export function sendMpPacket(obj) {
  if (window.mpState.ws && window.mpState.ws.readyState === WebSocket.OPEN) {
    try {
      window.mpState.ws.send(JSON.stringify({
        ...obj,
        playerId: window.mpState.playerId,
        playerName: window.mpState.playerName
      }));
    } catch (e) {}
  }
}

export function connectMultiplayerWebSocket() {
  const wsProtocol = location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = (location.host && location.protocol.startsWith("http"))
    ? `${wsProtocol}//${location.host}/ws`
    : "ws://localhost:8080/ws";

  try {
    const ws = new WebSocket(wsUrl);
    window.mpState.ws = ws;

    ws.onopen = () => {
      window.mpState.connected = true;
      window.mpState.modeLabel = "BXH LIVE";
      getPlayerLeaderboardRankInfo();
      sendMpPacket({
        type: "JOIN_SHARD",
        netWorth: calcPlayerNetWorth(),
        ownedLots: state.lots.filter(l => l.owned).length,
        totalChargers: state.lots.reduce((s, l) => s + (l.owned ? l.bays.length : 0), 0),
        priceKwh: window.mpState.retailPriceKwh
      });
    };

    ws.onmessage = ev => {
      try {
        const data = JSON.parse(ev.data);
        if (data.type === "SHARD_DELTA") {
          window.mpState.onlineCount = data.onlineCount || 142;
          if (data.cityEvent) window.mpState.cityEvent = data.cityEvent;
          if (typeof data.eventRemainingSec === "number") window.mpState.eventRemainingSec = data.eventRemainingSec;
          if (data.activeAuction) window.mpState.activeAuction = data.activeAuction;
          if (data.leaderboard) window.mpState.leaderboard = data.leaderboard;
          if (data.lotOwners) window.mpState.lotOwners = data.lotOwners;
          if (data.recentFeed) window.mpState.recentFeed = data.recentFeed;
          if (document.getElementById("tab-rivals").classList.contains("active")) {
            renderMultiplayerAndRivalsTab();
          }
        } else if (data.type === "AUCTION_WON") {
          if (data.winnerId === window.mpState.playerId) {
            const wonLot = state.lots.find(l => l.id === data.lotId);
            if (wonLot && !wonLot.owned) {
              wonLot.owned = true;
              wonLot.ownershipType = "owned";
              playSfx("cash");
              triggerHaptic(40);
              logEvent(L(`🏆 CHÚC MỪNG! Bạn đã thắng Đấu Giá Sổ Đỏ ${getLotDisplayName(wonLot)}!`, `🏆 CONGRATS! You won the Freehold Red Book auction for ${getLotDisplayName(wonLot)}!`));
              refreshAllUI();
            }
          }
        }
      } catch (err) {}
    };

    ws.onclose = () => {
      window.mpState.connected = false;
      window.mpState.modeLabel = "BXH TOÀN CẦU";
      getPlayerLeaderboardRankInfo();
    };
  } catch (e) {}
}

// Nhịp đồng bộ 1Hz: Sàn Đấu Giá, Bot tự động giao dịch BĐS theo Giá Thị Trường, Đếm ngược Buff X2 Ads & Bảng Xếp Hạng
setInterval(() => {
  if (state.adX2RevRemainingSec && state.adX2RevRemainingSec > 0) {
    state.adX2RevRemainingSec = Math.max(0, state.adX2RevRemainingSec - 1);
  }
  getPlayerLeaderboardRankInfo();

  if (window.mpState.connected) {
    sendMpPacket({
      type: "SYNC_METRICS",
      netWorth: calcPlayerNetWorth(),
      ownedLots: state.lots.filter(l => l.owned).length,
      totalChargers: state.lots.reduce((s, l) => s + (l.owned ? l.bays.length : 0), 0),
      priceKwh: window.mpState.retailPriceKwh
    });
    return;
  }

  window.mpState.eventRemainingSec--;
  if (window.mpState.eventRemainingSec <= 0) {
    const events = [
      { id: "SUNNY_PEAK", name: "☀️ Nắng Nóng Đỉnh Điểm 39°C", nameEn: "☀️ 39°C Heatwave Peak", desc: "Mái Solar Canopy giảm 45% chi phí điện; khách uống Trà Đá & Café tăng +30%!", descEn: "Solar Canopy cuts grid power cost by 45%; Iced Tea & Café demand +30%!", landBoost: 0.08 },
      { id: "WALKING_STREET", name: "🏮 Lễ Hội Phố Đi Bộ Hồ Tinh Cầu", nameEn: "🏮 Starlight Lake Walking Street Festival", desc: "Lượng xe điện đổ về Hồ Tinh Cầu, Khu Phố Cổ & Công Viên tăng +45%; Giá đất trung tâm +15%!", descEn: "EV traffic to Starlight Lake, Heritage Quarter & Parks surges +45%; Core land value +15%!", landBoost: 0.15 },
      { id: "RUSH_HOUR", name: "🚕 Giờ Cao Điểm Đại Đô Thị NovaVerde", nameEn: "🚕 NovaVerde Metropolis Rush Hour Surge", desc: "Đội xe Taxi Lục Bảo hoạt động hết công suất (+50% nhu cầu sạc nhanh DC)!", descEn: "Emerald EV Taxi fleet operating at full capacity (+50% DC fast-charging demand)!", landBoost: 0.12 },
      { id: "TROPICAL_RAIN", name: "⛈️ Mưa Dông Nhiệt Đới", nameEn: "⛈️ Tropical Monsoon Storm", desc: "Doanh thu Phòng Nghỉ VIP, Phở Bò & Nhà Hàng tăng +40%!", descEn: "VIP Lounge, Pho Noodle & Bistro revenue surges +40%!", landBoost: 0.06 }
    ];
    window.mpState.cityEvent = events[Math.floor(Math.random() * events.length)];
    window.mpState.eventRemainingSec = 110;
    window.mpState.marketIndexMult = Number((1.04 + Math.random() * 0.18).toFixed(2));
    window.mpState.recentFeed.unshift(L(`📢 SỰ KIỆN & SÓNG BĐS: ${window.mpState.cityEvent.name}`, `📢 EVENT & LAND WAVE: ${window.mpState.cityEvent.nameEn}`));
  }

  if (window.mpState.eventRemainingSec % 22 === 0) {
    const bots = window.mpState.leaderboard;
    const buyer = bots[Math.floor(Math.random() * bots.length)];
    const botLotIds = Object.keys(window.mpState.lotOwners).map(Number);
    if (botLotIds.length > 0 && Math.random() < 0.55) {
      const tid = botLotIds[Math.floor(Math.random() * botLotIds.length)];
      const tLot = state.lots[tid - 1];
      const prevOwner = window.mpState.lotOwners[tid];
      if (tLot && !tLot.owned && prevOwner && prevOwner.ownerName !== buyer.name) {
        const mVal = getLotMarketValuation(tLot);
        const tradePrice = mVal.marketBuyPrice;
        const oldBot = bots.find(b => b.name === prevOwner.ownerName);
        if (oldBot) {
          oldBot.ownedLots = Math.max(1, oldBot.ownedLots - 1);
          oldBot.netWorth += Math.round(tradePrice * 0.18);
        }
        window.mpState.lotOwners[tid] = {
          ownerId: buyer.id,
          ownerName: buyer.name,
          chargers: Math.min(4, (prevOwner.chargers || 2) + 1),
          acquiredPrice: tradePrice
        };
        buyer.ownedLots = (buyer.ownedLots || 2) + 1;
        buyer.totalChargers = (buyer.totalChargers || 8) + 1;
        buyer.netWorth += Math.round(tradePrice * 0.12);
        window.mpState.recentFeed.unshift(L(
          `📈 GIAO DỊCH BĐS: ${buyer.name} mua lại Lô #${tid} từ ${prevOwner.ownerName} theo giá thị trường ${formatCompactVND(tradePrice)} (+${mVal.pctChange}%)!`,
          `📈 LAND TRADE: ${buyer.name} acquired Lot #${tid} from ${prevOwner.ownerName} at market value ${formatCompactVND(tradePrice)} (+${mVal.pctChange}%)!`
        ));
      }
    } else {
      buyer.totalChargers += 1;
      buyer.netWorth += (6500 + Math.floor(Math.random() * 8000)) * GREEN_DOLLAR_UNIT;
    }
  }

  const auc = window.mpState.activeAuction;
  if (auc) {
    auc.remainingSec--;
    if (auc.remainingSec > 10 && auc.remainingSec % 15 === 0 && Math.random() < 0.52) {
      const bots = window.mpState.leaderboard;
      const pickBot = bots[Math.floor(Math.random() * bots.length)];
      const aucLotObj = state.lots[auc.lotId - 1];
      const maxBotBid = aucLotObj ? Math.round(getLotMarketValuation(aucLotObj).marketBuyPrice * 1.15) : 140000000;
      if (pickBot && auc.highestBidderName !== pickBot.name && auc.currentBid < maxBotBid) {
        auc.currentBid += auc.minIncrement;
        auc.highestBidderId = pickBot.id;
        auc.highestBidderName = pickBot.name;
        window.mpState.recentFeed.unshift(L(`🤖 ${pickBot.name} trả giá ${formatCompactVND(auc.currentBid)} cho ${auc.lotName}!`, `🤖 ${pickBot.name} bid ${formatCompactVND(auc.currentBid)} for ${auc.lotNameEn || auc.lotName}!`));
      }
    }
    if (auc.remainingSec <= 0) {
      if (auc.highestBidderId === window.mpState.playerId) {
        const wonLot = state.lots.find(l => l.id === auc.lotId);
        if (wonLot && !wonLot.owned) {
          delete window.mpState.lotOwners[wonLot.id];
          wonLot.owned = true;
          wonLot.ownershipType = "owned";
          playSfx("cash");
          triggerHaptic(45);
          logEvent(L(`🏆 ĐẤU GIÁ THÀNH CÔNG: Bạn đã sở hữu Sổ Đỏ ${getLotDisplayName(wonLot)}!`, `🏆 AUCTION WON: You now own the Freehold Red Book for ${getLotDisplayName(wonLot)}!`));
        }
      } else if (auc.highestBidderId) {
        window.mpState.lotOwners[auc.lotId] = {
          ownerId: auc.highestBidderId,
          ownerName: auc.highestBidderName,
          chargers: 2 + Math.floor(Math.random() * 2),
          acquiredPrice: auc.currentBid
        };
        const winBot = window.mpState.leaderboard.find(b => b.name === auc.highestBidderName);
        if (winBot) {
          winBot.ownedLots += 1;
          winBot.totalChargers += 2;
        }
        window.mpState.recentFeed.unshift(L(`🏆 ${auc.highestBidderName} thắng đấu giá ${auc.lotName} (${formatCompactVND(auc.currentBid)})!`, `🏆 ${auc.highestBidderName} won auction for ${auc.lotNameEn || auc.lotName} (${formatCompactVND(auc.currentBid)})!`));
      }
      const candidates = state.lots.filter(l => !l.owned && !window.mpState.lotOwners[l.id]);
      const nextLot = candidates[Math.floor(Math.random() * Math.min(40, candidates.length))] || state.lots[11];
      const nextVal = getLotMarketValuation(nextLot);
      window.mpState.activeAuction = {
        auctionId: "AUC-" + Date.now().toString(36).toUpperCase(),
        lotId: nextLot.id,
        lotName: nextLot.name,
        lotNameEn: nextLot.nameEn || nextLot.name,
        zone: nextLot.district,
        currentBid: Math.round(nextVal.marketBuyPrice * 0.72),
        minIncrement: 5000000,
        highestBidderId: null,
        highestBidderName: L("Chưa có người đặt", "No bids yet"),
        remainingSec: 75
      };
    }
  }

  if (document.getElementById("tab-rivals").classList.contains("active")) {
    renderMultiplayerAndRivalsTab();
  }
}, 1000);

export function placeMultiplayerAuctionBid() {
  const auc = window.mpState.activeAuction;
  if (!auc) return;
  const nextBid = auc.currentBid + auc.minIncrement;
  const aucLotName = isEn() ? (auc.lotNameEn || auc.lotName) : auc.lotName;
  if (state.money < nextBid) {
    logEvent(L(`⚠️ Cần ${formatVND(nextBid)} tiền mặt để đặt giá đấu thầu ${aucLotName}!`, `⚠️ Need ${formatVND(nextBid)} cash to place a bid on ${aucLotName}!`));
    return;
  }
  state.money -= auc.minIncrement;
  auc.currentBid = nextBid;
  auc.highestBidderId = window.mpState.playerId;
  auc.highestBidderName = window.mpState.playerName;
  auc.remainingSec = Math.max(auc.remainingSec, 18);
  playSfx("bid");
  triggerHaptic(25);
  sendMpPacket({ type: "PLACE_BID", bidAmount: nextBid });
  window.mpState.recentFeed.unshift(L(`💰 Bạn vừa đặt giá ${formatCompactVND(nextBid)} cho ${aucLotName}!`, `💰 You placed a ${formatCompactVND(nextBid)} bid on ${aucLotName}!`));
  logEvent(L(`🔨 Đã đặt giá ${formatVND(nextBid)} cho ${aucLotName}! Giữ vị trí dẫn đầu khi hết giờ để nhận Sổ Đỏ.`, `🔨 Bid ${formatVND(nextBid)} placed on ${aucLotName}! Hold the lead until time expires to win the Red Book.`));
  refreshAllUI();
}


// Đăng ký vào globalThis để tương thích ngược với HTML event handlers & các module liên kết
Object.assign(globalThis, {
  sendMpPacket,
  connectMultiplayerWebSocket,
  placeMultiplayerAuctionBid
});
