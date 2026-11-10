/**
 * src/state/network-state.js
 * Quản lý trạng thái Mạng Multiplayer, Bảng xếp hạng & Đấu giá Sổ Đỏ (Tách từ window.mpState)
 */
// HỆ THỐNG ĐUA BẢNG XẾP HẠNG (3 LEADERBOARDS), ĐỊNH GIÁ THỊ TRƯỜNG BĐS ĐỘNG VỚI BOT & KIẾM TIỀN TỪ QUẢNG CÁO (ADS)
window.mpState = {
  connected: false,
  modeLabel: "BXH TOÀN CẦU",
  ws: null,
  playerId: localStorage.getItem("HN_EV_MP_PLAYER_ID") || ("ceo_" + Math.random().toString(36).slice(2, 8)),
  playerName: localStorage.getItem("HN_EV_MP_PLAYER_NAME") || (window.currentLang === "en" ? "GreenVolt Nova Corp" : "Tập Đoàn GreenVolt Nova"),
  retailPriceKwh: Number(localStorage.getItem("HN_EV_MP_PRICE_KWH")) || 3550,
  signedContracts: JSON.parse(localStorage.getItem("HN_EV_MP_CONTRACTS") || "{}"),
  claimedQuests: JSON.parse(localStorage.getItem("HN_EV_MP_QUESTS") || "{}"),
  onlineCount: 142,
  marketIndexMult: 1.08,
  leaderboardSort: "netWorth", // "netWorth" | "chargers" | "lots"
  cityEvent: {
    id: "SUNNY_PEAK",
    name: "☀️ Nắng Nóng Đỉnh Điểm 39°C",
    nameEn: "☀️ 39°C Heatwave Peak",
    desc: "Mái Solar Canopy giảm 45% chi phí điện; khách uống Trà Đá & Café tăng +30%!",
    descEn: "Solar Canopy cuts grid power cost by 45%; Iced Tea & Café demand +30%!",
    solarBonus: 0.45,
    trafficMult: 1.15,
    amenityMult: 1.30,
    landBoost: 0.08
  },
  eventRemainingSec: 95,
  activeAuction: {
    auctionId: "AUC-LIVE",
    lotId: 12,
    lotName: "Lô #12: Mặt Tiền Trường Thịnh Galleria",
    lotNameEn: "Lot #12: Solaris Galleria Frontage",
    zone: "Khu Cổ Điển",
    currentBid: 75000000,
    minIncrement: 5000000,
    highestBidderId: "bot_vgreen",
    highestBidderName: "Minh_SolarisVolt",
    remainingSec: 65
  },
  lotOwners: {
    4:  { ownerId: "bot_vgreen",    ownerName: "Minh_SolarisVolt",   chargers: 3, acquiredPrice: 92000000 },
    9:  { ownerId: "bot_ecocharge", ownerName: "Thao_EcoCharge",     chargers: 2, acquiredPrice: 84000000 },
    18: { ownerId: "bot_tayho",     ownerName: "AzureLake_SolarHub", chargers: 3, acquiredPrice: 88000000 },
    27: { ownerId: "bot_longbien",  ownerName: "EastBank_Volt",      chargers: 2, acquiredPrice: 76000000 }
  },
  leaderboard: [
    { id: "bot_vgreen",    name: "Minh_SolarisVolt",   netWorth: 425000000, ownedLots: 5, totalChargers: 19, priceKwh: 3650 },
    { id: "bot_ecocharge", name: "Thao_EcoCharge",     netWorth: 318000000, ownedLots: 4, totalChargers: 15, priceKwh: 3500 },
    { id: "bot_tayho",     name: "AzureLake_SolarHub", netWorth: 265000000, ownedLots: 3, totalChargers: 12, priceKwh: 3750 },
    { id: "bot_longbien",  name: "EastBank_Volt",      netWorth: 194000000, ownedLots: 3, totalChargers: 9,  priceKwh: 3400 },
    { id: "bot_hadong",    name: "SkyTrain_MetroEV",   netWorth: 148000000, ownedLots: 2, totalChargers: 6,  priceKwh: 3550 }
  ],
  recentFeed: window.currentLang === "en"
    ? [
        "🏆 NovaVerde Metropolis Leaderboard (5,400 Lots) is live!",
        "📈 Goldleaf Ward land value rose +12% due to surging EV charger demand.",
        "🔨 Freehold Red Book Auction open for Lot #12: Solaris Galleria Frontage."
      ]
    : [
        "🏆 Bảng Xếp Hạng Đua Top Đại Đô Thị NovaVerde (5.400 Lô) đã sẵn sàng!",
        "📈 Giá BĐS Phường Kim Ngân tăng +12% do nhu cầu lắp trạm sạc tăng cao.",
        "🔨 Đang mở phiên đấu giá Sổ Đỏ Lô #12: Mặt Tiền Trường Thịnh Galleria."
      ]
};
localStorage.setItem("HN_EV_MP_PLAYER_ID", window.mpState.playerId);

window.mpState.currentDistrictIdx = 0;
window.mpState.currentWardIdx = 0;
window.mpState.wardLotsStore = JSON.parse(localStorage.getItem("HN_EV_MP_WARD_STORE") || "{}");
window.mpState.guildShares = JSON.parse(localStorage.getItem("HN_EV_MP_GUILD_SHARES") || "{}");


export function getNetworkState() {
  return globalThis.mpState || null;
}


// Đăng ký vào globalThis để tương thích ngược với HTML event handlers & các module liên kết
Object.assign(globalThis, {
  getNetworkState
});
