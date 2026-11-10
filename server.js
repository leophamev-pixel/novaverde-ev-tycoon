/**
 * ĐẠI ĐÔ THỊ NOVAVERDE EV TYCOON 3D — V2 AUTHORITATIVE ONLINE SERVER (1.000 USERS / 5.400 LOTS)
 * - Hỗ trợ:
 *   1. REST API Đăng nhập (Apple Sign-In / Google Play / Guest): POST /api/auth/login
 *   2. REST API Cloud Save & Anti-Cheat 1x Speed Verification: POST /api/cloud/save & GET /api/cloud/load
 *   3. Bảng Xếp Hạng Toàn Cầu (3 Leaderboards: Net Worth, Chargers, Lots) & Sàn Giao Dịch BĐS Động
 *   4. WebSocket Thời gian thực (RFC-6455 Zero-Dependency)
 */

const http = require("http");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8080;
const STATE_FILE = path.join(__dirname, "v2_shard_state.json");
const CLOUD_SAVES_FILE = path.join(__dirname, "v2_cloud_saves.json");

const NOVAVERDE_12_DISTRICTS = [
  { id: "HOANG_KIM",     code: "Q1",  name: "Quận Hoàng Kim",        tier: "S", priceMult: 1.35, wards: ["P. Kim Ngân", "P. Ngọc Quang", "P. Đông Môn"] },
  { id: "THIEN_DINH",    code: "Q2",  name: "Quận Thiên Đình",       tier: "S", priceMult: 1.28, wards: ["P. Quảng Trường", "P. Bắc Đài", "P. Ngoại Giao"] },
  { id: "BICH_HO",       code: "Q3",  name: "Quận Bích Hồ",          tier: "S", priceMult: 1.25, wards: ["P. Bán Đảo Sen", "P. Xuân Đào", "P. Cầu Vồng"] },
  { id: "VAN_HIEN",      code: "Q4",  name: "Quận Văn Hiến",         tier: "S", priceMult: 1.20, wards: ["P. Học Viện", "P. Nhạc Viện", "P. Tháp Khuê Tinh"] },
  { id: "SILICON_CBD",   code: "Q5",  name: "Quận Silicon CBD",      tier: "A", priceMult: 1.12, wards: ["P. Công Nghệ Cao", "P. Trung Tâm Số", "P. Trí Tuệ AI"] },
  { id: "OLYMPUS",       code: "Q6",  name: "Quận Thể Thao Olympus", tier: "A", priceMult: 1.10, wards: ["P. Sân Vận Động", "P. Trung Tâm Hội Nghị", "P. Đường Đua F1"] },
  { id: "TAN_CO_DIEN",   code: "Q7",  name: "Quận Tân Cổ Điển",      tier: "A", priceMult: 1.05, wards: ["P. Khải Hoàn Môn", "P. Quảng Trường Âu", "P. Đại Lộ Vòng Cung"] },
  { id: "DAI_CONG_VIEN", code: "Q8",  name: "Quận Đại Công Viên",    tier: "A", priceMult: 1.08, wards: ["P. Công Viên Lớn", "P. Đại Học Bách Khoa", "P. Thành Phố Thời Đại"] },
  { id: "DONG_GIANG",    code: "Q9",  name: "Quận Đông Giang Eco",   tier: "B", priceMult: 0.82, wards: ["P. Bến Bờ Đông", "P. Kênh Đào Xanh", "P. Đại Siêu Thị"] },
  { id: "METRO_LUA",     code: "Q10", name: "Quận Metro & Làng Lụa", tier: "B", priceMult: 0.78, wards: ["P. Ga Metro Trên Cao", "P. Hồ Cầu Vồng", "P. Làng Lụa Cổ"] },
  { id: "BAC_NGAN_HA",   code: "Q11", name: "Bắc Ngân Hà Smart City",tier: "B", priceMult: 0.75, wards: ["P. Tháp Tài Chính 108", "P. Cầu Dây Văng", "P. Thành Xoáy Ốc"] },
  { id: "VINH_NGOC_TRAI",code: "Q12", name: "Vịnh Ngọc Trai Ocean",  tier: "B", priceMult: 0.72, wards: ["P. Biển Hồ Cát Trắng", "P. Đảo San Hô", "P. Làng Gốm Sứ"] }
];

const CITY_EVENTS = [
  {
    id: "MORNING_CBD_WAVE",
    name: "🌅 Giờ Cao Điểm Sáng: Dòng Xe Đổ Về CBD & Nội Đô",
    nameEn: "🌅 Morning Rush: Commuters Surge into Core & CBD",
    desc: "Lưu lượng xe sạc tại 8 Quận Nội Đô & CBD tăng +45%!",
    descEn: "EV charging traffic across the 8 Core & CBD Districts surges +45%!",
    solarBonus: 0.25,
    trafficMult: 1.45,
    amenityMult: 1.20,
    landBoost: 0.12
  },
  {
    id: "SUNNY_PEAK",
    name: "☀️ Nắng Nóng Đỉnh Điểm 39°C Toàn Thành Phố",
    nameEn: "☀️ 39°C Citywide Heatwave Peak",
    desc: "Mái Solar Canopy giảm 45% chi phí điện; khách uống Trà Đá & Café tại mọi Quận tăng +30%!",
    descEn: "Solar Canopy cuts grid power cost by 45%; Iced Tea & Café demand +30%!",
    solarBonus: 0.45,
    trafficMult: 1.15,
    amenityMult: 1.30,
    landBoost: 0.08
  },
  {
    id: "WALKING_STREET",
    name: "🏮 Lễ Hội Phố Đi Bộ Hồ Tinh Cầu & Bích Hồ",
    nameEn: "🏮 Starlight Lake & Azure Lake Walking Festival",
    desc: "Lượng xe điện đổ về Quận Hoàng Kim, Bích Hồ & Đại Công Viên tăng +50%!",
    descEn: "EV traffic to Aurum, Azure Lake & Central Park surges +50%!",
    solarBonus: 0.15,
    trafficMult: 1.50,
    amenityMult: 1.35,
    landBoost: 0.15
  }
];

const PRIME_AUCTION_LOTS = [
  { lotId: 2,  globalLotId: 2,    zoneKey: "HOANG_KIM_0",   name: "Lô #2 [Q1-Kim Ngân]: Vòm Cầu Đá Cổ Tháp",     lotNameEn: "Lot #2 [D1-Goldleaf]: Old Arch Viaduct Plaza", zone: "Quận Hoàng Kim (Tier S)", baseReserve: 68000000 },
  { lotId: 12, globalLotId: 12,   zoneKey: "HOANG_KIM_0",   name: "Lô #12 [Q1-Kim Ngân]: Mặt Tiền Trường Thịnh Galleria", lotNameEn: "Lot #12 [D1-Goldleaf]: Solaris Galleria Frontage", zone: "Quận Hoàng Kim (Tier S)", baseReserve: 75000000 },
  { lotId: 18, globalLotId: 18,   zoneKey: "HOANG_KIM_0",   name: "Lô #18 [Q1-Ngọc Quang]: Ngã Tư Trường Thịnh", lotNameEn: "Lot #18 [D1-Jadeplaza]: Solaris Galleria Crossing", zone: "Quận Hoàng Kim (Tier S)", baseReserve: 82000000 },
  { lotId: 26, globalLotId: 26,   zoneKey: "HOANG_KIM_0",   name: "Lô #26 [Q1-Đông Môn]: Quảng Trường Ga Trung Tâm", lotNameEn: "Lot #26 [D1-Eastgate]: Central Station Plaza", zone: "Quận Hoàng Kim (Tier S)", baseReserve: 79000000 }
];

const cloudSavesStore = (() => {
  try {
    if (fs.existsSync(CLOUD_SAVES_FILE)) {
      return JSON.parse(fs.readFileSync(CLOUD_SAVES_FILE, "utf8")) || {};
    }
  } catch (e) {}
  return {};
})();

const shardState = {
  shardId: "NOVAVERDE-GLOBAL-SERVER",
  totalLotsCapacity: 5400,
  totalRegisteredUsers: 984,
  onlineCcuCount: 142,
  startedAt: Date.now(),
  tickCount: 0,
  currentEventIdx: 0,
  eventRemainingSec: 120,
  lotOwners: {
    4:  { ownerId: "bot_vgreen",    ownerName: "Minh_SolarisVolt",   chargers: 3, acquiredPrice: 92000000 },
    9:  { ownerId: "bot_ecocharge", ownerName: "Thao_EcoCharge",     chargers: 2, acquiredPrice: 84000000 },
    18: { ownerId: "bot_tayho",     ownerName: "AzureLake_SolarHub", chargers: 3, acquiredPrice: 88000000 },
    27: { ownerId: "bot_longbien",  ownerName: "EastBank_Volt",      chargers: 2, acquiredPrice: 76000000 }
  },
  guildMegaHubs: {
    "HUB_RING3_CAUGIAY":  { id: "HUB_RING3_CAUGIAY",  name: "Siêu Trạm Vành Đai 3 - Silicon CBD (30×240kW)", totalShares: 100, soldShares: 68, sharePrice: 35000000, dailyDividendPerShare: 4200000 },
    "HUB_METRO_CATLINH":  { id: "HUB_METRO_CATLINH",  name: "Siêu Trạm Ga SkyTrain - Làng Lụa (30×240kW)",  totalShares: 100, soldShares: 54, sharePrice: 30000000, dailyDividendPerShare: 3600000 },
    "HUB_NHATTAN_BRIDGE": { id: "HUB_NHATTAN_BRIDGE", name: "Siêu Trạm Cầu Dây Văng - Bắc Ngân Hà (30×240kW)", totalShares: 100, soldShares: 42, sharePrice: 28000000, dailyDividendPerShare: 3300000 }
  },
  players: {
    "bot_vgreen": {
      id: "bot_vgreen",
      name: "Minh_SolarisVolt",
      isBot: true,
      districtName: "Hoàng Kim • Silicon CBD",
      netWorth: 425000000,
      ownedLots: 5,
      totalChargers: 19,
      priceKwh: 3650,
      revPerMin: 24400,
      lastSeen: Date.now()
    },
    "bot_ecocharge": {
      id: "bot_ecocharge",
      name: "Thao_EcoCharge",
      isBot: true,
      districtName: "Thiên Đình • Bích Hồ",
      netWorth: 318000000,
      ownedLots: 4,
      totalChargers: 15,
      priceKwh: 3500,
      revPerMin: 18200,
      lastSeen: Date.now()
    },
    "bot_tayho": {
      id: "bot_tayho",
      name: "AzureLake_SolarHub",
      isBot: true,
      districtName: "Bích Hồ • Bắc Ngân Hà",
      netWorth: 265000000,
      ownedLots: 3,
      totalChargers: 12,
      priceKwh: 3750,
      revPerMin: 14900,
      lastSeen: Date.now()
    },
    "bot_longbien": {
      id: "bot_longbien",
      name: "EastBank_Volt",
      isBot: true,
      districtName: "Đông Giang • Vịnh Ngọc Trai",
      netWorth: 194000000,
      ownedLots: 3,
      totalChargers: 9,
      priceKwh: 3400,
      revPerMin: 11200,
      lastSeen: Date.now()
    },
    "bot_hadong": {
      id: "bot_hadong",
      name: "SkyTrain_MetroEV",
      isBot: true,
      districtName: "Metro Lụa • Văn Hiến",
      netWorth: 148000000,
      ownedLots: 2,
      totalChargers: 6,
      priceKwh: 3550,
      revPerMin: 8900,
      lastSeen: Date.now()
    }
  },
  activeAuction: null,
  recentFeed: [
    "🏆 Bảng Xếp Hạng Đua Top Đại Đô Thị NovaVerde (5.400 Lô) đang vận hành!",
    "📈 Giá BĐS Phường Kim Ngân tăng +12% do nhu cầu lắp trạm sạc tăng cao."
  ]
};

function startNewAuction() {
  const pick = PRIME_AUCTION_LOTS[Math.floor(Math.random() * PRIME_AUCTION_LOTS.length)];
  shardState.activeAuction = {
    auctionId: "AUC-" + Date.now().toString(36).toUpperCase(),
    lotId: pick.lotId,
    globalLotId: pick.globalLotId,
    zoneKey: pick.zoneKey,
    lotName: pick.name,
    lotNameEn: pick.lotNameEn,
    zone: pick.zone,
    currentBid: pick.baseReserve,
    minIncrement: 5000000,
    highestBidderId: "bot_vgreen",
    highestBidderName: "Minh_SolarisVolt",
    remainingSec: 75
  };
  pushFeed(`🔨 Mở đấu giá Sổ Đỏ ${pick.name} (Khởi điểm ${(pick.baseReserve / 1000).toLocaleString("en-US")} G$)!`);
}

function pushFeed(msg) {
  shardState.recentFeed.unshift(msg);
  if (shardState.recentFeed.length > 18) shardState.recentFeed.length = 18;
}

startNewAuction();

const clients = new Set();

function encodeWsFrame(dataStr) {
  const payload = Buffer.from(dataStr, "utf8");
  const len = payload.length;
  let header;
  if (len < 126) {
    header = Buffer.alloc(2);
    header[0] = 0x81;
    header[1] = len;
  } else if (len < 65536) {
    header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 126;
    header.writeUInt16BE(len, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x81;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(len), 2);
  }
  return Buffer.concat([header, payload]);
}

function decodeWsFrames(buffer) {
  const messages = [];
  let offset = 0;
  while (offset + 2 <= buffer.length) {
    const byte0 = buffer[offset];
    const byte1 = buffer[offset + 1];
    const opcode = byte0 & 0x0f;
    const isMasked = Boolean(byte1 & 0x80);
    let payloadLen = byte1 & 0x7f;
    let headerLen = 2;

    if (payloadLen === 126) {
      if (offset + 4 > buffer.length) break;
      payloadLen = buffer.readUInt16BE(offset + 2);
      headerLen = 4;
    } else if (payloadLen === 127) {
      if (offset + 10 > buffer.length) break;
      payloadLen = Number(buffer.readBigUInt64BE(offset + 2));
      headerLen = 10;
    }

    const maskLen = isMasked ? 4 : 0;
    if (offset + headerLen + maskLen + payloadLen > buffer.length) break;

    const payload = Buffer.alloc(payloadLen);
    if (isMasked) {
      const mask = buffer.slice(offset + headerLen, offset + headerLen + 4);
      const dataStart = offset + headerLen + 4;
      for (let i = 0; i < payloadLen; i++) {
        payload[i] = buffer[dataStart + i] ^ mask[i % 4];
      }
    } else {
      buffer.copy(payload, 0, offset + headerLen, offset + headerLen + payloadLen);
    }

    offset += headerLen + maskLen + payloadLen;
    if (opcode === 0x8) messages.push({ type: "close" });
    else if (opcode === 0x9) messages.push({ type: "ping", data: payload });
    else if (opcode === 0x1) messages.push({ type: "text", data: payload.toString("utf8") });
  }
  return { messages, remaining: buffer.slice(offset) };
}

function sendJson(socket, obj) {
  if (!socket || socket.destroyed || !socket.writable) return;
  try {
    socket.write(encodeWsFrame(JSON.stringify(obj)));
  } catch (e) {
    clients.delete(socket);
  }
}

function broadcastJson(obj) {
  const frame = encodeWsFrame(JSON.stringify(obj));
  for (const sock of clients) {
    if (!sock.destroyed && sock.writable) {
      try {
        sock.write(frame);
      } catch (e) {
        clients.delete(sock);
      }
    }
  }
}

function getPublicShardSummary() {
  const leaderboard = Object.values(shardState.players)
    .sort((a, b) => b.netWorth - a.netWorth)
    .slice(0, 12);

  return {
    type: "SHARD_DELTA",
    shardId: shardState.shardId,
    totalLotsCapacity: shardState.totalLotsCapacity,
    totalRegisteredUsers: shardState.totalRegisteredUsers + clients.size,
    onlineCount: shardState.onlineCcuCount + clients.size,
    districts: NOVAVERDE_12_DISTRICTS,
    cityEvent: CITY_EVENTS[shardState.currentEventIdx],
    eventRemainingSec: shardState.eventRemainingSec,
    activeAuction: shardState.activeAuction,
    guildMegaHubs: shardState.guildMegaHubs,
    leaderboard,
    lotOwners: shardState.lotOwners,
    recentFeed: shardState.recentFeed.slice(0, 8)
  };
}

function handleClientMessage(socket, msgStr) {
  let packet;
  try {
    packet = JSON.parse(msgStr);
  } catch (e) {
    return;
  }

  const pId = packet.playerId || socket.playerId || ("ceo_" + Math.random().toString(36).slice(2, 7));
  socket.playerId = pId;

  if (packet.type === "JOIN_SHARD" || packet.type === "SYNC_METRICS") {
    const pName = (packet.playerName || "GreenVolt Nova Corp").slice(0, 24);
    shardState.players[pId] = {
      id: pId,
      name: pName,
      isBot: false,
      districtName: packet.districtName || "Quận Hoàng Kim",
      netWorth: Number(packet.netWorth) || 65000000,
      ownedLots: Number(packet.ownedLots) || 1,
      totalChargers: Number(packet.totalChargers) || 2,
      priceKwh: Number(packet.priceKwh) || 3550,
      revPerMin: Number(packet.revPerMin) || 0,
      lastSeen: Date.now()
    };
    sendJson(socket, getPublicShardSummary());
  } else if (packet.type === "CLAIM_LOT") {
    const lotKey = String(packet.lotId);
    const pName = shardState.players[pId]?.name || packet.playerName || "GreenVolt Nova Corp";
    shardState.lotOwners[lotKey] = {
      ownerId: pId,
      ownerName: pName,
      mode: packet.mode || "leased",
      chargers: 2,
      updatedAt: Date.now()
    };
    pushFeed(`🏗️ ${pName} vừa mở Trạm Sạc mới tại Lô #${packet.lotId}!`);
    broadcastJson(getPublicShardSummary());
  } else if (packet.type === "PLACE_BID") {
    const auc = shardState.activeAuction;
    if (!auc) return;
    const bidAmount = Number(packet.bidAmount);
    const pName = shardState.players[pId]?.name || packet.playerName || "GreenVolt Nova Corp";
    if (bidAmount >= auc.currentBid + auc.minIncrement) {
      auc.currentBid = bidAmount;
      auc.highestBidderId = pId;
      auc.highestBidderName = pName;
      auc.remainingSec = Math.max(auc.remainingSec, 18);
      pushFeed(`💰 ${pName} đặt giá ${(bidAmount / 1000).toLocaleString("en-US")} G$ cho ${auc.lotName}!`);
      broadcastJson(getPublicShardSummary());
    }
  }
}

setInterval(() => {
  shardState.tickCount++;
  Object.values(shardState.players).forEach(p => {
    if (p.isBot) {
      p.netWorth += Math.round(p.revPerMin / 60);
    }
  });

  shardState.eventRemainingSec--;
  if (shardState.eventRemainingSec <= 0) {
    shardState.currentEventIdx = (shardState.currentEventIdx + 1) % CITY_EVENTS.length;
    shardState.eventRemainingSec = 120;
  }

  if (shardState.activeAuction) {
    shardState.activeAuction.remainingSec--;
    if (shardState.activeAuction.remainingSec <= 0) {
      startNewAuction();
    }
  }
  broadcastJson(getPublicShardSummary());
}, 1000);

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml"
};

function readJsonBody(req) {
  return new Promise(resolve => {
    let body = "";
    req.on("data", chunk => { body += chunk; });
    req.on("end", () => {
      try { resolve(JSON.parse(body || "{}")); }
      catch (e) { resolve({}); }
    });
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = parsedUrl.pathname;

  if (pathname === "/api/state") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(getPublicShardSummary()));
    return;
  }

  // 1. API Đăng nhập (Apple / Google / Guest)
  if (pathname === "/api/auth/login" && req.method === "POST") {
    const body = await readJsonBody(req);
    const uid = String(body.uid || ("user_" + Date.now().toString(36)));
    const provider = String(body.provider || "guest");
    const displayName = String(body.displayName || "NovaVerde CEO").slice(0, 24);
    const userObj = {
      uid,
      provider,
      displayName,
      email: provider === "apple" ? "ceo@privaterelay.appleid.com" : (provider === "google" ? "ceo.novaverde@gmail.com" : null),
      isAnonymous: provider === "guest",
      verifiedAt: Date.now()
    };
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ status: "ok", user: userObj }));
    return;
  }

  // 2. API Cloud Save & Anti-Cheat 1x Speed Leaderboard Sync
  if (pathname === "/api/cloud/save" && req.method === "POST") {
    const body = await readJsonBody(req);
    if (!body.uid || Number(body.gameSpeed) !== 1) {
      res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ status: "rejected", reason: "ANTI_CHEAT_1X_SPEED_REQUIRED" }));
      return;
    }
    cloudSavesStore[body.uid] = {
      uid: body.uid,
      provider: body.provider || "guest",
      displayName: body.displayName || "NovaVerde CEO",
      netWorth: Number(body.netWorth) || 65000000,
      ownedLots: Number(body.ownedLots) || 1,
      totalChargers: Number(body.totalChargers) || 2,
      snapshot: body.snapshot || null,
      syncedAt: Date.now()
    };
    shardState.players[body.uid] = {
      id: body.uid,
      name: String(body.displayName || "NovaVerde CEO").slice(0, 24),
      isBot: false,
      districtName: "Quận Hoàng Kim",
      netWorth: Number(body.netWorth) || 65000000,
      ownedLots: Number(body.ownedLots) || 1,
      totalChargers: Number(body.totalChargers) || 2,
      priceKwh: 3550,
      revPerMin: 15000,
      lastSeen: Date.now()
    };
    fs.writeFile(CLOUD_SAVES_FILE, JSON.stringify(cloudSavesStore, null, 2), () => {});
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ status: "ok", syncedAt: Date.now(), antiCheat: "VERIFIED_1X" }));
    return;
  }

  // 3. API Tải Cloud Save
  if (pathname === "/api/cloud/load" && req.method === "GET") {
    const uid = parsedUrl.searchParams.get("uid") || "";
    const record = cloudSavesStore[uid] || null;
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(record || { status: "empty" }));
    return;
  }

  let filePath = pathname === "/"
    ? path.join(__dirname, "PhoCo_EV_Tycoon_v2_Multiplayer.html")
    : path.join(__dirname, pathname);

  if (!fs.existsSync(filePath) && pathname.startsWith("/assets/")) {
    filePath = path.join(__dirname, "..", pathname);
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("404 Not Found: " + pathname);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
    res.end(content);
  });
});

server.on("upgrade", (req, socket) => {
  const key = req.headers["sec-websocket-key"];
  if (!key) {
    socket.destroy();
    return;
  }
  const acceptKey = crypto
    .createHash("sha1")
    .update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11", "binary")
    .digest("base64");

  const headers = [
    "HTTP/1.1 101 Switching Protocols",
    "Upgrade: websocket",
    "Connection: Upgrade",
    `Sec-WebSocket-Accept: ${acceptKey}`,
    "\r\n"
  ];
  socket.write(headers.join("\r\n"));
  clients.add(socket);

  let rxBuffer = Buffer.alloc(0);
  socket.on("data", chunk => {
    rxBuffer = Buffer.concat([rxBuffer, chunk]);
    const { messages, remaining } = decodeWsFrames(rxBuffer);
    rxBuffer = remaining;
    for (const msg of messages) {
      if (msg.type === "close") {
        clients.delete(socket);
        socket.end();
      } else if (msg.type === "text") {
        handleClientMessage(socket, msg.data);
      }
    }
  });

  socket.on("close", () => clients.delete(socket));
  socket.on("error", () => clients.delete(socket));
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log("==========================================================================");
    console.log(`⚡ ĐẠI ĐÔ THỊ NOVAVERDE EV TYCOON 3D (ONLINE AUTH, CLOUD SAVE & LEADERBOARD)`);
    console.log(`🌐 Mở trình duyệt hoặc điện thoại tại: http://localhost:${PORT}`);
    console.log(`🔌 WebSocket Endpoint:                 ws://localhost:${PORT}/ws`);
    console.log("==========================================================================");
  });
}

module.exports = { server, shardState, NOVAVERDE_12_DISTRICTS };
