/**
 * scripts/modularize.js
 * Trình tách tự động Monolith (15.434 dòng) sang Kiến trúc Chuẩn Modular (43 ES Modules)
 * Giữ nguyên 100% thuật toán, công thức kinh tế, đồ họa Isometric 2.5D và Cloud Save
 */

const fs = require("fs");
const path = require("path");

const V2_HTML_PATH = "/Users/leopham/.gemini/users/user2/v2/PhoCo_EV_Tycoon_v2_Multiplayer.html";
const OUT_ROOT = "/Users/leopham/.gemini/users/user2/novaverde-modular";

const rawHtml = fs.readFileSync(V2_HTML_PATH, "utf8");
const lines = rawHtml.split("\n");

// Helper: lấy các dòng từ startLine đến endLine (1-indexed, inclusive)
function sliceLines(startLine, endLine) {
  return lines
    .slice(startLine - 1, endLine)
    .map((l) => (l.startsWith("    ") ? l.slice(4) : l.startsWith("  ") ? l.slice(2) : l))
    .join("\n");
}

// Helper: tự động tìm tất cả hàm và hằng số cấp cao nhất để export ES Module + gắn vào globalThis
function wrapAsEsModule(moduleHeaderComment, codeBody, extraExports = [], importsList = []) {
  const fnNames = [];
  const constNames = [];

  // Chuyển top-level let/const của các biến chia sẻ toàn cục sang globalThis để không bị bóng (shadowing) giữa các module
  const SHARED_MUTABLES = new Set([
    "SECTOR_LOTS_MAP",
    "state",
    "roadCars",
    "floatTexts",
    "rainDrops",
    "spawnAccumulator",
    "carIdSeq",
    "autoSaveAccumSec",
    "uiRefreshAccumSec",
    "trafficLightTimer",
    "camera",
    "canvas",
    "ctx",
    "minimapCanvas",
    "mctx"
  ]);

  const processedLines = codeBody.split("\n").map((line) => {
    const fnMatch = line.match(/^function\s+([a-zA-Z0-9_$]+)\s*\(/);
    if (fnMatch) {
      fnNames.push(fnMatch[1]);
      return "export " + line;
    }
    const declMatch = line.match(/^(const|let|var)\s+([a-zA-Z0-9_$]+)\s*=/);
    if (declMatch) {
      const kind = declMatch[1];
      const name = declMatch[2];
      if (kind === "let" || kind === "var" || SHARED_MUTABLES.has(name)) {
        return line.replace(/^(const|let|var)\s+([a-zA-Z0-9_$]+)\s*=/, "globalThis.$2 =");
      }
      if (kind === "const") {
        constNames.push(name);
        return "export " + line;
      }
    }
    return line;
  });

  const allExports = Array.from(new Set([...fnNames, ...constNames, ...extraExports]));
  const importBlock = importsList.length > 0 ? importsList.join("\n") + "\n\n" : "";
  const globalBindBlock =
    allExports.length > 0
      ? `\n// Đăng ký vào globalThis để tương thích ngược với HTML event handlers & các module liên kết\nObject.assign(globalThis, {\n  ${allExports.join(",\n  ")}\n});\n`
      : "";

  return `${moduleHeaderComment}\n${importBlock}${processedLines.join("\n")}\n${globalBindBlock}`;
}

function writeMod(relPath, content) {
  const fullPath = path.join(OUT_ROOT, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, "utf8");
}

// 1. Tách CSS (Dòng 13..972)
const cssContent = sliceLines(13, 972);
writeMod(
  "src/styles/main.css",
  `/* ==========================================================================\n * src/styles/main.css — Toàn bộ giao diện Mobile Shell, HUD, Drawer & Modals\n * ========================================================================== */\n\n${cssContent}\n`
);

// 2. Tạo src/data/balance.js (Bước 1.1 & 2.1 của Báo Cáo: Tập trung toàn bộ magic numbers có giải thích)
const balanceContent = `/**
 * src/data/balance.js
 * BẢNG CÂN BẰNG KINH TẾ & THÔNG SỐ MÔ PHỎNG TẬP TRUNG (GAME BALANCE CONFIGURATION)
 * Mọi con số cân bằng của game đều được định nghĩa và giải thích rõ tại đây.
 */

// 1. Khóa lưu trữ LocalStorage mặc định
export const SAVE_STORAGE_KEY = "HOAN_KIEM_EV_TYCOON_SAVE_V6_150_BALANCED";

// 2. Quy chuẩn Diện tích Vật lý của Trạm Sạc (m²)
export const INFRA_BASE_M2 = 10;          // 10 m² diện tích tủ điện hạ thế & lối đi kỹ thuật cơ sở
export const M2_PER_CHARGER_BAY = 20;     // 20 m² cho mỗi chuồng đỗ xe + trụ sạc tiêu chuẩn

// 3. Chi phí Đầu tư Trụ Sạc & Chuyển đổi Mô hình Kinh doanh (Đơn vị nội bộ: 1,000 = 1 G$)
export const GREEN_DOLLAR_UNIT = 1000;    // 1 G$ hiển thị = 1,000 đơn vị nội bộ
export const USD_EXCHANGE_RATE = 25000;   // Tỷ giá quy đổi tham chiếu
export const NEW_BAY_INSTALL_COST = 15000000;       // 15,000 G$ chi phí lắp trụ tiêu chuẩn
export const FRANCHISE_BAY_INSTALL_COST = 10000000; // 10,000 G$/trụ (Mô hình Nhượng quyền: hãng trợ giá ~45%)
export const DIRECT_BAY_INSTALL_COST = 18000000;    // 18,000 G$/trụ (Mô hình Tự doanh 100% vốn)
export const DIRECT_TRANSFORMER_FEE = 15000000;     // 15,000 G$ phí trạm biến áp riêng khi lên Tự doanh

// 4. Biên lợi nhuận bán điện trên mỗi kWh (Margin per kWh)
// - Lý do chọn 750 (0.75 G$/kWh) cho Nhượng quyền: Vốn đầu tư ban đầu thấp, thu hồi vốn an toàn sau ~180 lượt sạc.
// - Lý do chọn 1350 (1.35 G$/kWh) cho Tự doanh: Biên lãi cao hơn +80% để thưởng cho người chơi bỏ vốn nâng cấp trạm biến áp.
export const FRANCHISE_MARGIN_PER_KWH = 750;        // +0.75 G$/kWh
export const DIRECT_MARGIN_PER_KWH = 1350;          // +1.35 G$/kWh

// 5. Thông số Góc chiếu Đồ họa Isometric 2.5D & Giao thông
export const ISO_ROT_RAD = -0.66;         // Góc xoay bản đồ Isometric (-38 độ)
export const ISO_SCALE_Y = 0.58;          // Tỷ lệ nén trục dọc Y tạo chiều sâu 2.5D
export const LANE_OFFSET = 9.5;           // Khoảng cách lệch làn đường bên phải (px)
export const STOP_LINE_DIST = 30;         // Khoảng cách vạch dừng đèn đỏ tại ngã tư (px)

// 6. Kích thước Thế giới Mở 12 Quận / 36 Phường (World Bounds)
export const SECTOR_SPAN_X = 3960;
export const SECTOR_SPAN_Y = 3740;
export const WORLD_BOUNDS = { minX: -10140, maxX: 14100, minY: -9460, maxY: 13200 };

// 7. Thông số Cân bằng Thu nhập Offline & Thuế Doanh nghiệp (CIT)
export const OFFLINE_MAX_HOURS_CAP = 12;            // Tối đa 12 giờ tích lũy Offline mỗi phiên
export const OFFLINE_MIN_FLOOR_PER_BAY_PER_MIN = 280000; // Đảm bảo tối thiểu 280 G$/phút/trụ đang hoạt động
export const STARTER_MONEY_VND = 65000000;          // 65,000 G$ vốn khởi nghiệp ban đầu
export const STARTER_GREEN_COINS = 250;             // 250 GC khởi nghiệp

export const BALANCE_SUMMARY = {
  SAVE_STORAGE_KEY,
  INFRA_BASE_M2,
  M2_PER_CHARGER_BAY,
  GREEN_DOLLAR_UNIT,
  USD_EXCHANGE_RATE,
  NEW_BAY_INSTALL_COST,
  FRANCHISE_BAY_INSTALL_COST,
  DIRECT_BAY_INSTALL_COST,
  DIRECT_TRANSFORMER_FEE,
  FRANCHISE_MARGIN_PER_KWH,
  DIRECT_MARGIN_PER_KWH,
  ISO_ROT_RAD,
  ISO_SCALE_Y,
  LANE_OFFSET,
  STOP_LINE_DIST,
  SECTOR_SPAN_X,
  SECTOR_SPAN_Y,
  WORLD_BOUNDS,
  OFFLINE_MAX_HOURS_CAP,
  OFFLINE_MIN_FLOOR_PER_BAY_PER_MIN,
  STARTER_MONEY_VND,
  STARTER_GREEN_COINS
};

Object.assign(globalThis, BALANCE_SUMMARY, { BALANCE_SUMMARY });
`;
writeMod("src/data/balance.js", balanceContent);

// 3. Tạo các module trong src/data/
writeMod(
  "src/data/amenity-catalog.js",
  wrapAsEsModule(
    `/**\n * src/data/amenity-catalog.js\n * Danh mục 6 loại Tiện ích đi kèm trạm sạc (3 cấp độ nâng cấp/loại)\n */`,
    sliceLines(1425, 1535) + "\n\n" + sliceLines(3539, 3548)
  )
);

writeMod(
  "src/data/charger-tiers.js",
  wrapAsEsModule(
    `/**\n * src/data/charger-tiers.js\n * Danh mục 5 cấp Trụ sạc (0kW -> 120kW) & hàm tính chi phí đầu tư trụ\n */`,
    sliceLines(1536, 1544) + "\n\n" + sliceLines(1551, 1582),
    [],
    [`import { FRANCHISE_BAY_INSTALL_COST, DIRECT_BAY_INSTALL_COST, DIRECT_TRANSFORMER_FEE, FRANCHISE_MARGIN_PER_KWH, DIRECT_MARGIN_PER_KWH } from "./balance.js";`]
  )
);

writeMod(
  "src/data/vehicle-models.js",
  wrapAsEsModule(
    `/**\n * src/data/vehicle-models.js\n * Danh mục 11 loại phương tiện: 4 Ô tô điện (EV), 3 Ô tô xăng (ICE Squatter), 4 Xe máy\n */`,
    sliceLines(1583, 1604)
  )
);

writeMod(
  "src/data/events-catalog.js",
  wrapAsEsModule(
    `/**\n * src/data/events-catalog.js\n * Chu kỳ 7 ngày trong tuần, Sự kiện Đô thị & Tiêu đề các Tab điều khiển\n */`,
    sliceLines(1605, 1614) + "\n\n" + sliceLines(4027, 4042)
  )
);

writeMod(
  "src/data/map-data.js",
  wrapAsEsModule(
    `/**\n * src/data/map-data.js\n * Dữ liệu Lưới đường phố 11x11, 8 Công viên & Hồ, 36 Công trình di sản, 12 Quận & 36 Phường\n */`,
    sliceLines(1619, 1874) +
      "\n\n" +
      sliceLines(2151, 2409) +
      "\n\n" +
      sliceLines(10106, 10120),
    ["SECTOR_LOTS_MAP"],
    [`import { SECTOR_SPAN_X, SECTOR_SPAN_Y, WORLD_BOUNDS } from "./balance.js";`]
  )
);

writeMod(
  "src/data/lot-blueprints.js",
  wrapAsEsModule(
    `/**\n * src/data/lot-blueprints.js\n * Bản thiết kế 36 Lô đất trung tâm + Thuật toán sinh 150 Lô đất cân bằng\n */`,
    sliceLines(1875, 2150) + "\n\n" + sliceLines(2410, 2522),
    [],
    [`import { V_ROADS, H_ROADS, isRedRiverCorridor, isMajorParkBlock, HOAN_KIEM_BUILDINGS, RIVAL_STATIONS, HANOI_12_DISTRICTS, MEGA_SECTORS_36 } from "./map-data.js";`]
  )
);

writeMod(
  "src/data/skin-catalog.js",
  wrapAsEsModule(
    `/**\n * src/data/skin-catalog.js\n * Danh mục Công cụ VIP GreenCoin, Vật phẩm công nghệ & 3 Skin Trạm sạc\n */`,
    sliceLines(2523, 2688)
  )
);

writeMod(
  "src/data/b2b-contracts.js",
  wrapAsEsModule(
    `/**\n * src/data/b2b-contracts.js\n * Danh mục Hợp đồng Đội xe B2B, Cổ phần Siêu Trạm Liên Minh & Cấu hình Slot Quảng cáo\n */`,
    sliceLines(11785, 11876) + "\n\n" + sliceLines(12106, 12138) + "\n\n" + sliceLines(12422, 12427)
  )
);

// 4. Tạo src/lang/lang-pack.js
writeMod(
  "src/lang/lang-pack.js",
  wrapAsEsModule(
    `/**\n * src/lang/lang-pack.js\n * Hệ thống Đa ngôn ngữ Song ngữ Việt - Anh (VI / EN) & đồng bộ nhãn DOM\n */`,
    sliceLines(1350, 1399) + "\n\n" + sliceLines(1401, 1424) + "\n\n" + sliceLines(2876, 3044),
    ["LANG_PACK"]
  )
);

// 5. Tạo các module trong src/state/ (game-state.js, ui-state.js, calendar-state.js, network-state.js)
const gameStateCode =
  sliceLines(2689, 2736) +
  `\n
// Hệ thống Event Bus & State Accessors chuẩn hóa (Bước 1.3 & 3.3 của Báo Cáo)
const stateListeners = new Set();

export function getState() {
  return globalThis.state;
}

export function setState(updater) {
  if (typeof updater === "function") {
    const next = updater(globalThis.state);
    if (next && typeof next === "object") globalThis.state = next;
  } else if (updater && typeof updater === "object") {
    Object.assign(globalThis.state, updater);
  }
  notifyStateListeners();
  return globalThis.state;
}

export function subscribeStateChange(listenerFn) {
  if (typeof listenerFn === "function") stateListeners.add(listenerFn);
  return () => stateListeners.delete(listenerFn);
}

export function notifyStateListeners(topic = "all") {
  for (const fn of stateListeners) {
    try { fn(globalThis.state, topic); } catch (e) {}
  }
}
`;

writeMod(
  "src/state/game-state.js",
  wrapAsEsModule(
    `/**\n * src/state/game-state.js\n * Quản lý trạng thái gốc của Game, Tiền tệ, Danh sách 150 Lô đất & Event Bus\n */`,
    gameStateCode,
    ["getState", "setState", "subscribeStateChange", "notifyStateListeners"],
    [
      `import { createInitialLots } from "../data/lot-blueprints.js";`,
      `import { STATION_SKINS_CATALOG } from "../data/skin-catalog.js";`
    ]
  )
);

writeMod(
  "src/state/ui-state.js",
  wrapAsEsModule(
    `/**\n * src/state/ui-state.js\n * Quản lý trạng thái Giao diện: Lô đang chọn, Bộ lọc vùng, Góc chiếu Isometric, Tốc độ Game\n */`,
    sliceLines(2864, 2875) +
      "\n\n" +
      sliceLines(10729, 10751) +
      `\n
export function getUiState() {
  const s = globalThis.state || {};
  return {
    selectedLotId: s.selectedLotId,
    lotZoneFilter: s.lotZoneFilter,
    lotListPage: s.lotListPage,
    sheetMode: s.sheetMode,
    isoView: s.isoView,
    gameSpeed: s.gameSpeed
  };
}
`,
    ["getUiState"]
  )
);

writeMod(
  "src/state/calendar-state.js",
  wrapAsEsModule(
    `/**\n * src/state/calendar-state.js\n * Quản lý trạng thái Lịch trình, Ngày/Tháng/Năm, Giờ mô phỏng & Thời tiết\n */`,
    `export function getCalendarState() {
  const s = globalThis.state || {};
  return {
    year: s.year,
    month: s.month,
    dayOfMonth: s.dayOfMonth,
    totalDaysElapsed: s.totalDaysElapsed,
    simMinute: s.simMinute,
    weatherMode: s.weatherMode,
    isRaining: s.isRaining
  };
}
`,
    ["getCalendarState"]
  )
);

writeMod(
  "src/state/network-state.js",
  wrapAsEsModule(
    `/**\n * src/state/network-state.js\n * Quản lý trạng thái Mạng Multiplayer, Bảng xếp hạng & Đấu giá Sổ Đỏ (Tách từ window.mpState)\n */`,
    sliceLines(11424, 11487) + "\n" + sliceLines(12428, 12432) + `\n
export function getNetworkState() {
  return globalThis.mpState || null;
}
`,
    ["getNetworkState"]
  )
);

// 6. Tạo các module trong src/systems/ (9 files thuần logic xử lý)
writeMod(
  "src/systems/economy.js",
  wrapAsEsModule(
    `/**\n * src/systems/economy.js\n * Hệ thống Kinh tế cốt lõi: Vòng lặp mô phỏng updateSimulation(dt), Doanh thu kWh, Buff cảnh quan & Định giá Lô đất\n */`,
    sliceLines(3494, 3538) +
      "\n\n" +
      sliceLines(3549, 3595) +
      "\n\n" +
      sliceLines(3743, 3825) +
      "\n\n" +
      sliceLines(5716, 5938) +
      "\n\n" +
      sliceLines(11491, 11645) +
      "\n\n" +
      sliceLines(12139, 12150),
    [],
    [
      `import { INFRA_BASE_M2, M2_PER_CHARGER_BAY } from "../data/balance.js";`,
      `import { AMENITY_CATALOG, COMMERCIAL_DINING_ARCHETYPES } from "../data/amenity-catalog.js";`,
      `import { CHARGER_TIERS } from "../data/charger-tiers.js";`
    ]
  )
);

writeMod(
  "src/systems/calendar.js",
  wrapAsEsModule(
    `/**\n * src/systems/calendar.js\n * Hệ thống Lịch trình Tuần (Thứ 2 - Chủ Nhật), Sự kiện Đô thị & Chuyển ngày\n */`,
    sliceLines(3596, 3742) + "\n\n" + sliceLines(4474, 4523)
  )
);

writeMod(
  "src/systems/tax.js",
  wrapAsEsModule(
    `/**\n * src/systems/tax.js\n * Hệ thống Thuế đất, Tiền thuê mặt bằng hàng tháng, Thuế TNDN (CIT) & Quản lý Nợ\n */`,
    sliceLines(3826, 3888) + "\n\n" + sliceLines(4524, 4729)
  )
);

writeMod(
  "src/systems/vehicle-spawn.js",
  wrapAsEsModule(
    `/**\n * src/systems/vehicle-spawn.js\n * Hệ thống Sinh phương tiện giao thông (EV, Taxi, Xe xăng chiếm chỗ, Xe máy) & Tọa độ Chuồng sạc\n */`,
    sliceLines(5036, 5449)
  )
);

writeMod(
  "src/systems/vehicle-physics.js",
  wrapAsEsModule(
    `/**\n * src/systems/vehicle-physics.js\n * Hệ thống Tìm đường A* trên lưới phố, Đèn giao thông, Vật lý di chuyển xe & Bảo vệ đuổi xe xăng\n */`,
    sliceLines(3391, 3449) + "\n\n" + sliceLines(3452, 3493) + "\n\n" + sliceLines(5450, 5715) + "\n\n" + sliceLines(5939, 6015),
    [],
    [`import { LANE_OFFSET, STOP_LINE_DIST } from "../data/balance.js";`]
  )
);

writeMod(
  "src/systems/offline-earnings.js",
  wrapAsEsModule(
    `/**\n * src/systems/offline-earnings.js\n * Hệ thống Tính toán Doanh thu Offline lũy kế & Báo cáo Chi tiết khi mở lại Game\n */`,
    sliceLines(4251, 4373)
  )
);

writeMod(
  "src/systems/save-load.js",
  wrapAsEsModule(
    `/**\n * src/systems/save-load.js\n * Hệ thống Lưu/Đọc dữ liệu tập trung, Chữ ký Anti-Cheat Hash & Xuất/Nhập Base64 Snapshot\n */`,
    `// Hàm quản lý LocalStorage tập trung (Thay thế các lệnh gọi lẻ tẻ)
export function storageGetItem(key, fallback = null) {
  try {
    const val = localStorage.getItem(key);
    return val !== null ? val : fallback;
  } catch (e) {
    return fallback;
  }
}

export function storageSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    return false;
  }
}

export function storageRemoveItem(key) {
  try {
    localStorage.removeItem(key);
  } catch (e) {}
}
\n` +
      sliceLines(4065, 4250) +
      "\n\n" +
      sliceLines(4439, 4473),
    ["storageGetItem", "storageSetItem", "storageRemoveItem"]
  )
);

writeMod(
  "src/systems/weather.js",
  wrapAsEsModule(
    `/**\n * src/systems/weather.js\n * Hệ thống Thời tiết (Nắng / Mưa rào nhiệt đới / Tự động) & khởi tạo hạt mưa\n */`,
    sliceLines(2755, 2762) + "\n\n" + sliceLines(4781, 4805)
  )
);

writeMod(
  "src/systems/lot-actions.js",
  wrapAsEsModule(
    `/**\n * src/systems/lot-actions.js\n * Các thao tác của người chơi trên Lô đất: Mua/Thuê, Mở rộng diện tích, Lắp trụ, Mua tiện ích, Thuê bảo vệ, Ký B2B\n */`,
    sliceLines(10412, 10728) +
      "\n\n" +
      sliceLines(10752, 10787) +
      "\n\n" +
      sliceLines(12377, 12421) +
      "\n\n" +
      sliceLines(12433, 12470) +
      "\n\n" +
      sliceLines(12561, 12580)
  )
);

// 7. Tạo các module trong src/render/ (10 files thuần vẽ Canvas 2.5D)
writeMod(
  "src/render/iso-utils.js",
  wrapAsEsModule(
    `/**\n * src/render/iso-utils.js\n * Các hàm Toán học Chiếu trục đo Isometric 2.5D, Nội suy tứ giác, Ánh sáng Ngày/Đêm & Mức độ chi tiết (LOD)\n */`,
    sliceLines(6049, 6093) + "\n\n" + sliceLines(6193, 6229),
    [],
    [`import { ISO_ROT_RAD, ISO_SCALE_Y } from "../data/balance.js";`]
  )
);

const cameraSetupCode = `
globalThis.camera = {
  x: -280,
  y: -180,
  zoom: 0.65,
  minZoom: 0.22,
  maxZoom: 1.65,
  isDragging: false,
  dragMoved: false,
  lastX: 0,
  lastY: 0,
  pinchDist: null
};

export function bindCanvasElements() {
  globalThis.canvas = document.getElementById("hanoiCanvas");
  globalThis.ctx = globalThis.canvas ? globalThis.canvas.getContext("2d") : null;
  globalThis.minimapCanvas = document.getElementById("minimapCanvas");
  globalThis.mctx = globalThis.minimapCanvas ? globalThis.minimapCanvas.getContext("2d") : null;
}
bindCanvasElements();
\n`;

writeMod(
  "src/render/camera.js",
  wrapAsEsModule(
    `/**\n * src/render/camera.js\n * Quản lý Camera bản đồ, Phóng to/Thu nhỏ (Zoom), Chuyển đổi tọa độ Màn hình <-> Thế giới & Bắt sự kiện chạm\n */`,
    cameraSetupCode + sliceLines(4730, 4780) + "\n\n" + sliceLines(4807, 4876) + "\n\n" + sliceLines(4971, 5035),
    ["bindCanvasElements"]
  )
);

writeMod(
  "src/render/draw-ground.js",
  wrapAsEsModule(
    `/**\n * src/render/draw-ground.js\n * Nướng nền mặt đất tĩnh (Offscreen Canvas Baking), Vẽ lưới đường phố & Đèn giao thông ngã tư\n */`,
    sliceLines(6230, 6342) + "\n\n" + sliceLines(8677, 8760)
  )
);

writeMod(
  "src/render/render-loop.js",
  wrapAsEsModule(
    `/**\n * src/render/render-loop.js\n * Vòng lặp Render chính drawCartoonMap() với thuật toán xếp lớp chiều sâu Painter's Algorithm\n */`,
    sliceLines(6343, 6542).replace(
    "const vw = wrap.clientWidth;\n  const vh = wrap.clientHeight;",
    "const vw = wrap.clientWidth || 420;\n  const vh = wrap.clientHeight || 800;\n  const _dpr = window.devicePixelRatio || 1;\n  if (canvas && (canvas.width !== Math.round(vw * _dpr) || canvas.height !== Math.round(vh * _dpr))) { resizeCanvas(); }"
  )
  )
);

writeMod(
  "src/render/draw-environment.js",
  wrapAsEsModule(
    `/**\n * src/render/draw-environment.js\n * Vẽ Cây xanh 3D, Đèn đường, Công viên, Hồ nước, Sông Ngân Hà, Cầu 3D & Tàu điện\n */`,
    sliceLines(6543, 6670) + "\n\n" + sliceLines(7584, 8676)
  )
);

writeMod(
  "src/render/draw-buildings.js",
  wrapAsEsModule(
    `/**\n * src/render/draw-buildings.js\n * Vẽ các Công trình Kiến trúc Di sản, Tòa nhà Phố cổ & Cao ốc Kính 3D (Skyscrapers)\n */`,
    sliceLines(6016, 6048) + "\n\n" + sliceLines(6094, 6192) + "\n\n" + sliceLines(6671, 7583) + "\n\n" + sliceLines(8761, 9254)
  )
);

writeMod(
  "src/render/draw-charger.js",
  wrapAsEsModule(
    `/**\n * src/render/draw-charger.js\n * Vẽ chi tiết 5 cấp Trụ sạc 3D & Thẻ thông tin nổi (Callout Card)\n */`,
    sliceLines(9255, 9387)
  )
);

// Bước 1.5 của Báo Cáo: Tách hàm drawPlayerStationLot25D (~480 dòng) thành 5 hàm con độc lập trong src/render/draw-station.js
const stationRivalCode = sliceLines(9388, 9447);
const stationUnownedBody = sliceLines(9466, 9549);
const stationPadAndGatesBody = sliceLines(9555, 9615);
const stationAmenitiesBody = sliceLines(9616, 9749);
const stationChargingBaysBody = sliceLines(9750, 9816);
const stationCanopyAndCalloutBody = sliceLines(9817, 9924);

const modularStationCode = `${stationRivalCode}

// ============================================================================
// TÁCH HÀM VẼ TRẠM SẠC 480 DÒNG THÀNH 5 HÀM CON ĐỘC LẬP (BƯỚC 1.5 BÁO CÁO)
// ============================================================================

// Hàm con 1/5: Vẽ Lô đất chưa mở khóa ("BUY PLOT" / Đấu giá / Lô người chơi khác)
function drawUnownedPlot25D(lot, env, x, y, w, h, bNW, bNE, bSE, bSW, isSelected, pulse) {
${stationUnownedBody}
}

// Hàm con 2/5: Vẽ Đế bê tông 3D, Mặt sân trạm sạc, Khách đi bộ (LOD 3), Cổng Barie & Bốt Bảo vệ
function drawStationPadAndGates25D(lot, env, x, y, w, h, bNW, bNE, bSE, bSW, isSelected, pulse) {
${stationPadAndGatesBody}
}

// Hàm con 3/5: Vẽ Tổ hợp 6 Tiện ích 3D (Trà đá, Đổi pin, Café, Phòng nghỉ VIP, Phở bò, Nhà hàng)
function drawStationAmenities25D(lot, env, x, y, w, h) {
${stationAmenitiesBody}
}

// Hàm con 4/5: Vẽ Các Ô đỗ xe, Trụ sạc 3D, Xe đang sạc / Xe xăng đỗ lấn & Thanh tiến độ pin
function drawStationChargingBays25D(lot, env) {
${stationChargingBaysBody}
}

// Hàm con 5/5: Vẽ Mái đón Pin Mặt Trời (Solar Canopy 3D), Hào quang Skin & Thẻ Callout "OUR STATION"
function drawStationCanopyAndCallout25D(lot, env, x, y, w, h, bNW, bNE, bSE, bSW, sp, isSelected, pulse) {
${stationCanopyAndCalloutBody}
}

// Hàm điều phối chính (Coordinator) gọi 5 hàm con theo đúng thứ tự chiều sâu 2.5D
function drawPlayerStationLot25D(lot, env) {
  const isSelected = lot.id === state.selectedLotId;
  const dim = getLotBoxDimensions(lot);
  const w = dim.w, h = dim.h;
  const sp = getLotSpatialBreakdown(lot);
  const pulse = 0.5 + 0.5 * Math.sin(performance.now() * 0.0045);
  const x = lot.x - w / 2;
  const y = lot.y - h / 2;

  const bNW = isoPt(x, y, 0);
  const bNE = isoPt(x + w, y, 0);
  const bSE = isoPt(x + w, y + h, 0);
  const bSW = isoPt(x, y + h, 0);

  if (!lot.owned) {
    drawUnownedPlot25D(lot, env, x, y, w, h, bNW, bNE, bSE, bSW, isSelected, pulse);
    return;
  }

  drawStationPadAndGates25D(lot, env, x, y, w, h, bNW, bNE, bSE, bSW, isSelected, pulse);
  drawStationAmenities25D(lot, env, x, y, w, h);
  drawStationChargingBays25D(lot, env);
  drawStationCanopyAndCallout25D(lot, env, x, y, w, h, bNW, bNE, bSE, bSW, sp, isSelected, pulse);
}
`;

writeMod(
  "src/render/draw-station.js",
  wrapAsEsModule(
    `/**\n * src/render/draw-station.js\n * Vẽ Trạm Sạc Người Chơi (đã tách thành 5 hàm con rõ ràng) & Trạm Đối Thủ AI\n */`,
    modularStationCode
  )
);

writeMod(
  "src/render/draw-vehicles.js",
  wrapAsEsModule(
    `/**\n * src/render/draw-vehicles.js\n * Vẽ Phương tiện 3D Isometric xoay theo góc di chuyển (EV, Taxi, Xe xăng, Xe máy)\n */`,
    sliceLines(9928, 10105)
  )
);

writeMod(
  "src/render/draw-minimap.js",
  wrapAsEsModule(
    `/**\n * src/render/draw-minimap.js\n * Vẽ Bản đồ thu nhỏ (Minimap Radar) & xử lý chạm/kéo để di chuyển nhanh Camera\n */`,
    sliceLines(3889, 3920) + "\n\n" + sliceLines(4879, 4970) + "\n\n" + sliceLines(10121, 10411)
  )
);

// 8. Tạo các module trong src/ui/ (7 files quản lý DOM & âm thanh)
writeMod(
  "src/ui/hud.js",
  wrapAsEsModule(
    `/**\n * src/ui/hud.js\n * Cập nhật Thanh trạng thái HUD, Định dạng tiền tệ, Hiệu ứng Âm thanh WebAudio & Rung Haptics\n */`,
    sliceLines(2768, 2863) +
      "\n\n" +
      sliceLines(10788, 10802) +
      "\n\n" +
      sliceLines(10862, 11422) +
      "\n\n" +
      sliceLines(12921, 12942),
    [],
    [`import { GREEN_DOLLAR_UNIT } from "../data/balance.js";`]
  )
);

writeMod(
  "src/ui/lot-panel.js",
  wrapAsEsModule(
    `/**\n * src/ui/lot-panel.js\n * Hiển thị Khung Phân bổ Diện tích (m²), Trạng thái Chuồng sạc & Thanh ngăn kéo dưới (Bottom Sheet)\n */`,
    sliceLines(3979, 4026) + "\n\n" + sliceLines(10821, 10861) + "\n\n" + sliceLines(12883, 12920)
  )
);

writeMod(
  "src/ui/lot-list.js",
  wrapAsEsModule(
    `/**\n * src/ui/lot-list.js\n * Thanh nhảy nhanh Lô đất, Bộ lọc Khu vực, Phân trang 5.400 Lô & Bản đồ 12 Quận\n */`,
    sliceLines(3921, 3978) +
      "\n\n" +
      sliceLines(4043, 4064) +
      "\n\n" +
      sliceLines(10803, 10820) +
      "\n\n" +
      sliceLines(12471, 12560)
  )
);

writeMod(
  "src/ui/finance-tab.js",
  wrapAsEsModule(
    `/**\n * src/ui/finance-tab.js\n * Hiển thị Tab Sổ Cái Kế Toán, Thuế TNDN (CIT), Tiền thuê mặt bằng & Thanh toán Nợ\n */`,
    sliceLines(12815, 12882)
  )
);

writeMod(
  "src/ui/multiplayer-tab.js",
  wrapAsEsModule(
    `/**\n * src/ui/multiplayer-tab.js\n * Hiển thị Tab Đấu trường Multiplayer, Đấu giá Sổ Đỏ, Hợp đồng B2B & Nhiệm vụ Ngày\n */`,
    sliceLines(12581, 12814)
  )
);

writeMod(
  "src/ui/shop-modal.js",
  wrapAsEsModule(
    `/**\n * src/ui/shop-modal.js\n * Cửa hàng GreenCoin (VIP Tools, Vật phẩm, Skin 3D) & Hộp thoại Quảng cáo Nhận thưởng\n */`,
    sliceLines(3045, 3390) + "\n\n" + sliceLines(11877, 12105)
  )
);

writeMod(
  "src/ui/offline-modal.js",
  wrapAsEsModule(
    `/**\n * src/ui/offline-modal.js\n * Hộp thoại Báo cáo & Nhận Doanh thu Offline (claimOfflineModal) và Hộp thoại Lưu/Đọc Game\n */`,
    sliceLines(4374, 4438)
  )
);

// 9. Tạo các module trong src/net/ (leaderboard.js, websocket.js, mobile-sdk-bridge.js)
writeMod(
  "src/net/leaderboard.js",
  wrapAsEsModule(
    `/**\n * src/net/leaderboard.js\n * Tính toán Xếp hạng Thị phần Người chơi vs Tập đoàn AI & Thưởng Tuần\n */`,
    sliceLines(11646, 11784)
  )
);

writeMod(
  "src/net/websocket.js",
  wrapAsEsModule(
    `/**\n * src/net/websocket.js\n * Kết nối Máy chủ WebSocket Multiplayer thời gian thực & Đấu giá Lô đất\n */`,
    sliceLines(12151, 12376)
  )
);

writeMod(
  "src/net/mobile-sdk-bridge.js",
  `/**\n * src/net/mobile-sdk-bridge.js\n * Tích hợp Firebase Auth, Cloud Save (Firestore), Google AdMob (6 Slots), IAP & Màn hình chờ\n */\nimport { ENV_CONFIG } from "../config/env.js";\n\n` +
    sliceLines(13043, 15430)
);

// 10. Tạo Entry Point src/main.js (kết nối toàn bộ module, khởi chạy game loop & debug overlay)
const initGameRaw = sliceLines(12943, 13042).replace(
  "drawCartoonMap();",
  "drawCartoonMap();\n        if (typeof tickDebugOverlay === 'function') tickDebugOverlay();"
);

const mainJsContent = `/**
 * src/main.js — ENTRY POINT CHÍNH CỦA NOVAVERDE EV TYCOON (KIẾN TRÚC MODULAR)
 * Nạp tuần tự các tầng: Config -> Data -> Lang -> State -> Systems -> Render -> UI -> Net -> Debug
 */

import "./config/env.js";
import "./data/balance.js";
import "./data/amenity-catalog.js";
import "./data/charger-tiers.js";
import "./data/vehicle-models.js";
import "./data/events-catalog.js";
import "./data/map-data.js";
import "./data/lot-blueprints.js";
import "./data/skin-catalog.js";
import "./data/b2b-contracts.js";

import "./lang/lang-pack.js";

import "./state/game-state.js";
import "./state/ui-state.js";
import "./state/calendar-state.js";
import "./state/network-state.js";

import "./systems/save-load.js";
import "./systems/calendar.js";
import "./systems/tax.js";
import "./systems/weather.js";
import "./systems/vehicle-spawn.js";
import "./systems/vehicle-physics.js";
import "./systems/economy.js";
import "./systems/offline-earnings.js";
import "./systems/lot-actions.js";

import "./render/iso-utils.js";
import "./render/camera.js";
import "./render/draw-ground.js";
import "./render/draw-environment.js";
import "./render/draw-buildings.js";
import "./render/draw-charger.js";
import "./render/draw-station.js";
import "./render/draw-vehicles.js";
import "./render/draw-minimap.js";
import "./render/render-loop.js";

import "./ui/hud.js";
import "./ui/lot-panel.js";
import "./ui/lot-list.js";
import "./ui/finance-tab.js";
import "./ui/multiplayer-tab.js";
import "./ui/shop-modal.js";
import "./ui/offline-modal.js";

import "./net/leaderboard.js";
import "./net/websocket.js";

import { initDebugTools, tickDebugOverlay } from "./debug/debug-overlay.js";
globalThis.tickDebugOverlay = tickDebugOverlay;

${initGameRaw}
globalThis.initGame = initGame;
initDebugTools();

// Trên Localhost Dev Server: tự động gỡ Service Worker cũ & xóa Cache để luôn nạp module mới nhất
if (typeof navigator !== "undefined" && "serviceWorker" in navigator && (location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
  navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister())).catch(() => {});
  if (typeof caches !== "undefined") {
    caches.keys().then(keys => keys.forEach(k => caches.delete(k))).catch(() => {});
  }
}

import("./net/mobile-sdk-bridge.js").catch((err) => {
  console.warn("[NovaVerde] Mobile SDK Bridge load warning:", err);
});
`;
writeMod("src/main.js", mainJsContent);

// 11. Tạo index.html (Root & public/index.html) chỉ chứa HTML Shell sạch + link CSS + <script type="module" src="/src/main.js">
const htmlHead = lines.slice(0, 11).join("\n");
const htmlBody = lines.slice(974, 1325).join("\n");
const cleanIndexHtml = `${htmlHead}
  <link rel="stylesheet" href="/src/styles/main.css" />
</head>
${htmlBody}
  <script type="module" src="/src/main.js"></script>
</body>
</html>
`;

writeMod("index.html", cleanIndexHtml);
writeMod("public/index.html", cleanIndexHtml);

console.log("✅ Đã tách thành công toàn bộ Monolith sang kiến trúc Modular tại:", OUT_ROOT);
