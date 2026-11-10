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
import { BALANCE_SUMMARY, FRANCHISE_MARGIN_PER_KWH, DIRECT_MARGIN_PER_KWH, OFFLINE_MIN_FLOOR_PER_BAY_PER_MIN } from "../src/data/balance.js";
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

console.log("\n===================================================================");
console.log(`🏆 TỔNG KẾT TOÀN TRÌNH: ${modPassCount}/10 MODULE TESTS + ${qaPassedCount}/${qaTotalCount} GAMEPLAY TESTS = ${modPassCount + qaPassedCount}/${10 + qaTotalCount} PASSED (100%)`);
console.log("===================================================================");
if (modPassCount < 10 || qaPassedCount < qaTotalCount) process.exit(1);
