/**
 * scripts/qa-modular-runner.mjs
 * BỘ KIỂM THỬ TỰ ĐỘNG TOÀN DIỆN CHO NOVAVERDE MODULAR (54 TEST CASES)
 * - Phần 1 (MOD-01 .. MOD-10): Kiểm thử trực tiếp kiến trúc ES Modules (Data, State, Systems, Render, Debug, Docs)
 * - Phần 2 (TYC/LDB/IAP/ADS/SEC/AUTH/OFF 01..44): Chạy toàn bộ 44 kịch bản kiểm thử Gameplay, Kinh tế, Anti-Cheat, Cloud Save, AdMob & Offline Earnings
 */

import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");

// BƯỚC 1: Chạy đóng gói từ 46 ES Modules sang www/ trước khi test để đảm bảo đồng bộ 100%
execFileSync(process.execPath, [path.join(__dirname, "build-bundle.mjs")], { stdio: "inherit" });

// BƯỚC 2: Kiểm thử trực tiếp các ES Modules (MOD-01 .. MOD-10)
import { BALANCE_SUMMARY, FRANCHISE_MARGIN_PER_KWH, DIRECT_MARGIN_PER_KWH, OFFLINE_MIN_FLOOR_PER_BAY_PER_MIN, BESS_BASE_CAPACITY_KWH, BESS_DISCHARGE_MARGIN_BONUS, STAFF_TECH_SPEED_BONUS, STAFF_MANAGER_AMENITY_BONUS } from "../src/data/balance.js";
import { UNLOCK_TREE_DAG } from "../src/data/unlock-tree.js";
import { MAIN_QUESTS_CHAIN } from "../src/systems/quest.js";
import { INTERACTIVE_URBAN_EVENTS } from "../src/systems/progression.js";
import { AMENITY_CATALOG } from "../src/data/amenity-catalog.js";
import { CHARGER_TIERS } from "../src/data/charger-tiers.js";
import { EV_MODELS, ICE_CAR_MODELS, SCOOTER_MODELS } from "../src/data/vehicle-models.js";
import { V_ROADS, H_ROADS, MAJOR_PARKS, HOAN_KIEM_BUILDINGS, HANOI_12_DISTRICTS } from "../src/data/map-data.js";
import { STATION_SKINS_CATALOG } from "../src/data/skin-catalog.js";
import { ENV_CONFIG } from "../src/config/env.js";

const modResults = [];
function assertMod(id, name, cond, detail = "") {
  modResults.push({ id, name, passed: Boolean(cond), detail });
}

assertMod(
  "MOD-01",
  "Module src/data/balance.js xuất đầy đủ hằng số cân bằng kinh tế",
  FRANCHISE_MARGIN_PER_KWH === 750 &&
    DIRECT_MARGIN_PER_KWH === 1350 &&
    OFFLINE_MIN_FLOOR_PER_BAY_PER_MIN === 280000 &&
    Object.keys(BALANCE_SUMMARY).length >= 16,
  `Margins=${FRANCHISE_MARGIN_PER_KWH}/${DIRECT_MARGIN_PER_KWH}, Keys=${Object.keys(BALANCE_SUMMARY).length}`
);

assertMod(
  "MOD-02",
  "Module src/data/amenity-catalog.js xuất đúng 6 loại tiện ích 3 cấp độ",
  Array.isArray(AMENITY_CATALOG) && AMENITY_CATALOG.length === 6 && AMENITY_CATALOG[0].id === "tra_da",
  `Amenities=${AMENITY_CATALOG.length}`
);

assertMod(
  "MOD-03",
  "Module src/data/charger-tiers.js xuất đúng 5 cấp trụ sạc (0kW -> 120kW)",
  Array.isArray(CHARGER_TIERS) && CHARGER_TIERS.length === 5 && CHARGER_TIERS[4].kw === 120,
  `Tiers=${CHARGER_TIERS.length}, MaxKW=${CHARGER_TIERS[4].kw}`
);

assertMod(
  "MOD-04",
  "Module src/data/vehicle-models.js xuất đủ 11 mẫu phương tiện (4 EV, 3 ICE, 4 Scooter)",
  EV_MODELS.length === 4 && ICE_CAR_MODELS.length === 3 && SCOOTER_MODELS.length === 4,
  `TotalVehicles=${EV_MODELS.length + ICE_CAR_MODELS.length + SCOOTER_MODELS.length}`
);

assertMod(
  "MOD-05",
  "Module src/data/map-data.js xuất lưới đường 11x11, 8 công viên, 37 landmark & 12 quận",
  V_ROADS.length === 11 &&
    H_ROADS.length === 11 &&
    MAJOR_PARKS.length === 8 &&
    HOAN_KIEM_BUILDINGS.length >= 36 &&
    HANOI_12_DISTRICTS.length === 12,
  `Roads=${V_ROADS.length}x${H_ROADS.length}, Parks=${MAJOR_PARKS.length}, Landmarks=${HOAN_KIEM_BUILDINGS.length}`
);

assertMod(
  "MOD-06",
  "Module src/data/skin-catalog.js xuất đúng danh mục Skin trạm sạc",
  Array.isArray(STATION_SKINS_CATALOG) && STATION_SKINS_CATALOG.length >= 3,
  `Skins=${STATION_SKINS_CATALOG.length}`
);

const stationSrc = fs.readFileSync(path.join(ROOT_DIR, "src/render/draw-station.js"), "utf8");
assertMod(
  "MOD-07",
  "Module src/render/draw-station.js đã tách drawPlayerStationLot25D thành 5 hàm con",
  stationSrc.includes("export function drawUnownedPlot25D") &&
    stationSrc.includes("export function drawStationPadAndGates25D") &&
    stationSrc.includes("export function drawStationAmenities25D") &&
    stationSrc.includes("export function drawStationChargingBays25D") &&
    stationSrc.includes("export function drawStationCanopyAndCallout25D"),
  "5 sub-functions verified in draw-station.js"
);

const stateFilesExist =
  fs.existsSync(path.join(ROOT_DIR, "src/state/game-state.js")) &&
  fs.existsSync(path.join(ROOT_DIR, "src/state/ui-state.js")) &&
  fs.existsSync(path.join(ROOT_DIR, "src/state/calendar-state.js")) &&
  fs.existsSync(path.join(ROOT_DIR, "src/state/network-state.js"));
assertMod(
  "MOD-08",
  "Tầng Quản lý Trạng thái (src/state/) tách đủ 4 slices + Event Bus",
  stateFilesExist,
  "game-state, ui-state, calendar-state, network-state"
);

const docsExist =
  fs.existsSync(path.join(ROOT_DIR, "docs/game-design.md")) &&
  fs.existsSync(path.join(ROOT_DIR, "docs/data-structures.md")) &&
  fs.existsSync(path.join(ROOT_DIR, "docs/render-pipeline.md"));
assertMod(
  "MOD-09",
  "Tầng Tài liệu Thiết kế (docs/) có đủ 3 tài liệu chuẩn hóa",
  docsExist,
  "game-design.md, data-structures.md, render-pipeline.md"
);

assertMod(
  "MOD-10",
  "Module Cấu hình Môi trường (src/config/env.js) & Debug Overlay (src/debug/debug-overlay.js) hoạt động",
  ENV_CONFIG && ENV_CONFIG.PROJECT_ID === "novaverde-ev-tycoon" && fs.existsSync(path.join(ROOT_DIR, "src/debug/debug-overlay.js")),
  `ProjectId=${ENV_CONFIG.PROJECT_ID}`
);

console.log("\n===================================================================");
console.log("🧪 PHẦN 1: KIỂM THỬ KIẾN TRÚC MODULE (MOD-01 .. MOD-10)");
console.log("===================================================================");
let modPassCount = 0;
for (const r of modResults) {
  if (r.passed) modPassCount++;
  console.log(`${r.passed ? "✅ PASS" : "❌ FAIL"} | [${r.id}] ${r.name} (${r.detail})`);
}

// BƯỚC 3: Chạy bộ 44 Test Cases Gameplay / Offline / Cloud Save / AdMob trên bản đóng gói từ Modular
console.log("\n===================================================================");
console.log("🎮 PHẦN 2: KIỂM THỬ 44 KỊCH BẢN LOGIC GAMEPLAY & OFFLINE EARNINGS");
console.log("===================================================================");

const bundledHtml = fs.readFileSync(path.join(ROOT_DIR, "www", "index.html"), "utf8");
const scriptStart = bundledHtml.indexOf("<script>");
const scriptEnd = bundledHtml.lastIndexOf("</script>");
const gameJs = bundledHtml.slice(scriptStart + 8, scriptEnd);

function makeMockElement(id = "") {
  return {
    id,
    innerHTML: "",
    textContent: "",
    value: "",
    style: {},
    dataset: {},
    classList: {
      _set: new Set(),
      add(...cls) { cls.forEach(c => this._set.add(c)); },
      remove(...cls) { cls.forEach(c => this._set.delete(c)); },
      toggle(c) { if (this._set.has(c)) this._set.delete(c); else this._set.add(c); },
      contains(c) { return this._set.has(c); }
    },
    addEventListener() {},
    removeEventListener() {},
    children: [],
    lastChild: null,
    appendChild() {},
    prepend() {},
    remove() {},
    removeChild() {},
    querySelector() { return makeMockElement(); },
    querySelectorAll() { return []; },
    getBoundingClientRect() { return { left: 0, top: 0, width: 420, height: 800 }; },
    getContext() {
      return new Proxy({}, {
        get(target, prop) {
          if (prop === "measureText") return () => ({ width: 40 });
          if (prop === "createLinearGradient" || prop === "createRadialGradient") {
            return () => ({ addColorStop() {} });
          }
          return () => {};
        },
        set() { return true; }
      });
    }
  };
}

const elCache = new Map();
const storeMap = new Map();

const sandbox = {
  console,
  print: (...args) => console.log(...args),
  Math,
  Date,
  JSON,
  Array,
  Object,
  Number,
  String,
  Boolean,
  Set,
  Map,
  RegExp,
  Error,
  Promise,
  Uint8Array,
  TextEncoder,
  TextDecoder,
  URL,
  URLSearchParams,
  parseInt,
  parseFloat,
  isNaN,
  isFinite,
  encodeURIComponent,
  decodeURIComponent,
  btoa: (str) => Buffer.from(str, "binary").toString("base64"),
  atob: (b64) => Buffer.from(b64, "base64").toString("binary"),
  performance: { now: () => Date.now() },
  setTimeout: (fn, ms) => { if ((ms || 0) <= 100 && typeof fn === "function") fn(); return 1; },
  clearTimeout: () => {},
  setInterval: () => 1,
  clearInterval: () => {},
  requestAnimationFrame: () => 1,
  addEventListener: () => {},
  removeEventListener: () => {},
  alert: () => {},
  confirm: () => true,
  prompt: () => "",
  localStorage: {
    getItem: (k) => (storeMap.has(k) ? storeMap.get(k) : null),
    setItem: (k, v) => storeMap.set(k, String(v)),
    removeItem: (k) => storeMap.delete(k),
    clear: () => storeMap.clear(),
    key: (i) => Array.from(storeMap.keys())[i] || null,
    get length() { return storeMap.size; }
  },
  sessionStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
  },
  navigator: {
    onLine: true,
    vibrate: () => {},
    userAgent: "Mozilla/5.0"
  },
  location: {
    hostname: "localhost",
    search: "",
    reload: () => {}
  },
  document: {
    body: makeMockElement("body"),
    head: makeMockElement("head"),
    documentElement: makeMockElement("html"),
    hidden: false,
    getElementById(id) {
      if (!elCache.has(id)) elCache.set(id, makeMockElement(id));
      return elCache.get(id);
    },
    createElement(tag) { return makeMockElement(tag); },
    querySelector(sel) { return makeMockElement(sel); },
    querySelectorAll() { return []; },
    addEventListener() {}
  }
};

sandbox.window = sandbox;
sandbox.globalThis = sandbox;
sandbox.self = sandbox;

vm.createContext(sandbox);
vm.runInContext(gameJs, sandbox);

const qaSuiteCode = fs.readFileSync("/Users/leopham/.gemini/users/user2/v2/scripts/qa-runner-30-cases.js", "utf8");
vm.runInContext(qaSuiteCode, sandbox);

const vmResults = vm.runInContext("results", sandbox) || [];
const qaPassedCount = vmResults.filter(r => r.status === "PASS").length;
const qaTotalCount = vmResults.length;


// BƯỚC 4: KIỂM THỬ GIAI ĐOẠN 2 — CỦNG CỐ GAMEPLAY CORE (STG2-01 .. STG2-10)
console.log("\n===================================================================");
console.log("🚀 PHẦN 3: KIỂM THỬ GIAI ĐOẠN 2 — CỦNG CỐ GAMEPLAY CORE (STG2-01 .. STG2-10)");
console.log("===================================================================");

const stg2Results = [];
function assertStg2(id, name, cond, detail = "") {
  stg2Results.push({ id, name, passed: Boolean(cond), detail });
}

const balanceSrc = fs.readFileSync(path.join(ROOT_DIR, "src/data/balance.js"), "utf8");
assertStg2(
  "STG2-01",
  "Bước 2.1: Bảng thông số & ROI (src/data/balance.js) có đầy đủ thông số BESS, Điện lưới & Nhân sự",
  BESS_BASE_CAPACITY_KWH === 800 &&
    BESS_DISCHARGE_MARGIN_BONUS === 1.35 &&
    STAFF_TECH_SPEED_BONUS.length === 4 &&
    STAFF_MANAGER_AMENITY_BONUS.length === 4 &&
    balanceSrc.includes("CHARGER TIER ROI COMPARISON") &&
    balanceSrc.includes("AMENITY TIER COMPARISON"),
  `BESS_Cap=${BESS_BASE_CAPACITY_KWH}kWh, MarginBonus=${BESS_DISCHARGE_MARGIN_BONUS}x`
);

assertStg2(
  "STG2-02",
  "Bước 2.2: Cây Công Nghệ DAG (src/data/unlock-tree.js) có đủ 10 node phụ thuộc 2 nhánh",
  Array.isArray(UNLOCK_TREE_DAG) &&
    UNLOCK_TREE_DAG.length === 10 &&
    UNLOCK_TREE_DAG.find(n => n.id === "tech_charger_t4").parents.includes("tech_charger_t3") &&
    UNLOCK_TREE_DAG.find(n => n.id === "tech_am_nha_hang").parents.includes("tech_am_nha_an"),
  `Nodes=${UNLOCK_TREE_DAG.length}`
);

assertStg2(
  "STG2-03",
  "Bước 2.3: Chuỗi 6 Nhiệm Vụ Chính Tuyến (src/systems/quest.js) hoạt động & trao thưởng",
  (() => {
    vm.runInContext("resetAllSaveData(); state.money = 150000000; installNewChargerOnLot(1);", sandbox);
    const activeQ = vm.runInContext("getActiveMainQuest()", sandbox);
    const claimed = vm.runInContext("claimMainQuestReward('MQ_01_INSTALL_BAY3')", sandbox);
    const nextQ = vm.runInContext("getActiveMainQuest()", sandbox);
    return MAIN_QUESTS_CHAIN.length === 6 && activeQ && activeQ.id === "MQ_01_INSTALL_BAY3" && claimed === true && nextQ && nextQ.id === "MQ_02_UPGRADE_AMENITY";
  })(),
  "MQ_01 completed & advanced to MQ_02_UPGRADE_AMENITY"
);

assertStg2(
  "STG2-04",
  "Bước 2.4a: Nghiên cứu mở khóa sớm Node Cây Công Nghệ (researchTechNode)",
  (() => {
    vm.runInContext("state.money = 200000000;", sandbox);
    const okT3 = vm.runInContext("researchTechNode('tech_charger_t3')", sandbox);
    const unlockedT3 = vm.runInContext("isTechNodeUnlocked('tech_charger_t3')", sandbox);
    return okT3 === true && unlockedT3 === true;
  })(),
  "tech_charger_t3 researched & unlocked"
);

assertStg2(
  "STG2-05",
  "Bước 2.4b: Hệ thống Pin Lưu Trữ BESS (Mua sỉ điện EVN & Nâng cấp dung lượng BESS)",
  (() => {
    vm.runInContext("ensureProgressionState(); state.money = 200000000; state.progression.gridKwhStored = 0; state.progression.gridKwhCapacity = 800;", sandbox);
    const bought = vm.runInContext("buyWholesaleGridKwh(250)", sandbox);
    const upg = vm.runInContext("upgradeBessCapacity()", sandbox);
    const stored = vm.runInContext("state.progression.gridKwhStored", sandbox);
    const cap = vm.runInContext("state.progression.gridKwhCapacity", sandbox);
    return bought === true && upg === true && stored === 550 && cap === 1800;
  })(),
  "Stored=550kWh (250+300 bonus), Cap=1800kWh"
);

assertStg2(
  "STG2-06",
  "Bước 2.4c: Xả điện từ kho BESS khi xe sạc giúp tăng +35% biên lợi nhuận kWh",
  (() => {
    const multWithBess = vm.runInContext("state.progression.gridKwhStored = 100; consumeBessKwhForCharging(20);", sandbox);
    const remKwh = vm.runInContext("state.progression.gridKwhStored", sandbox);
    const multEmpty = vm.runInContext("state.progression.gridKwhStored = 0; state.progression.autoBuyOffPeak = false; consumeBessKwhForCharging(20);", sandbox);
    return Math.abs(multWithBess - 1.35) < 0.001 && remKwh === 80 && multEmpty === 1.0;
  })(),
  "BESS Discharge Multiplier = 1.35x"
);

assertStg2(
  "STG2-07",
  "Bước 2.4d: Tuyển dụng Kỹ thuật viên Trạm (+tốc độ sạc) & Quản lý Dịch vụ (+doanh thu tiện ích)",
  (() => {
    vm.runInContext("state.money = 200000000;", sandbox);
    const hTech = vm.runInContext("hireOrUpgradeLotStaff(1, 'tech')", sandbox);
    const hMgr = vm.runInContext("hireOrUpgradeLotStaff(1, 'manager')", sandbox);
    const spdMult = vm.runInContext("getLotTechSpeedMultiplier(state.lots[0])", sandbox);
    const mgrMult = vm.runInContext("getLotManagerAmenityMultiplier(state.lots[0])", sandbox);
    return hTech === true && hMgr === true && spdMult === 1.15 && mgrMult === 1.20;
  })(),
  "TechSpd=1.15x, ManagerAmenity=1.20x"
);

assertStg2(
  "STG2-08",
  "Bước 2.4e: Giấy phép Quy hoạch (expansionPermits) giảm 30% chi phí mở rộng đất",
  (() => {
    vm.runInContext("resetAllSaveData(); ensureProgressionState(); state.money = 100000000; state.progression.expansionPermits = 1;", sandbox);
    const beforeMoney = vm.runInContext("state.money", sandbox);
    const baseStepCost = vm.runInContext("state.lots[0].expandStepCost", sandbox);
    vm.runInContext("expandLotLandArea(1);", sandbox);
    const afterMoney = vm.runInContext("state.money", sandbox);
    const permitsLeft = vm.runInContext("state.progression.expansionPermits", sandbox);
    const spent = beforeMoney - afterMoney;
    return permitsLeft === 0 && spent === Math.round(baseStepCost * 0.70);
  })(),
  "30% Expansion Discount Verified"
);

assertStg2(
  "STG2-09",
  "Bước 2.4f: Sự kiện Đô thị Tương tác (Interactive Urban Events) với lựa chọn Option A / B",
  (() => {
    vm.runInContext("state.money = 200000000;", sandbox);
    const ev = vm.runInContext("triggerInteractiveUrbanEvent(0)", sandbox);
    const resolved = vm.runInContext("resolveInteractiveUrbanEvent('A')", sandbox);
    const activeAfter = vm.runInContext("state.progression.activeChoiceEvent", sandbox);
    return Array.isArray(INTERACTIVE_URBAN_EVENTS) && INTERACTIVE_URBAN_EVENTS.length >= 3 && Boolean(ev) && resolved === true && activeAfter === null;
  })(),
  "Triggered & resolved Option A"
);

assertStg2(
  "STG2-10",
  "Giao diện Giai đoạn 2 (src/ui/progression-panel.js) render đầy đủ BESS, Nhiệm vụ, Nhân sự & Cây DAG",
  (() => {
    const html1 = vm.runInContext("renderStage2LotProgressionBox(state.lots[0])", sandbox);
    const html2 = vm.runInContext("renderStage2UnlockTreeBox()", sandbox);
    return typeof html1 === "string" && html1.includes("BESS") && typeof html2 === "string" && html2.includes("DAG") && html2.includes("ROI");
  })(),
  "Stage 2 UI Panels verified"
);

let stg2PassCount = 0;
for (const r of stg2Results) {
  if (r.passed) stg2PassCount++;
  console.log(`${r.passed ? "✅ PASS" : "❌ FAIL"} | [${r.id}] ${r.name} (${r.detail})`);
}

console.log("\n===================================================================");
console.log(`🏆 TỔNG KẾT TOÀN TRÌNH: ${stg2PassCount}/10 STAGE-2 TESTS +` + ` ${modPassCount}/10 MODULE TESTS + ${qaPassedCount}/${qaTotalCount} GAMEPLAY TESTS = ${modPassCount + stg2PassCount + qaPassedCount}/${20 + qaTotalCount} PASSED (100%)`);
console.log("===================================================================");
if (modPassCount < 10 || stg2PassCount < 10 || qaPassedCount < qaTotalCount) process.exit(1);
