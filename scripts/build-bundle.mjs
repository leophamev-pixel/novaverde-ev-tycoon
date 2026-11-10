/**
 * scripts/build-bundle.mjs
 * Trình đóng gói từ 46 ES Modules (src/) sang thư mục phát hành www/
 * Tương thích 100% với Firebase Hosting, Capacitor Android/iOS & Bộ kiểm thử QA
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");
const WWW_DIR = path.join(ROOT_DIR, "www");

const MODULE_ORDER = [
  "src/config/env.js",
  "src/data/balance.js",
  "src/data/amenity-catalog.js",
  "src/data/charger-tiers.js",
  "src/data/vehicle-models.js",
  "src/data/events-catalog.js",
  "src/data/map-data.js",
  "src/data/lot-blueprints.js",
  "src/data/skin-catalog.js",
  "src/data/b2b-contracts.js",
  "src/data/unlock-tree.js",
  "src/lang/lang-pack.js",
  "src/state/game-state.js",
  "src/state/ui-state.js",
  "src/state/calendar-state.js",
  "src/state/network-state.js",
  "src/systems/save-load.js",
  "src/systems/calendar.js",
  "src/systems/tax.js",
  "src/systems/weather.js",
  "src/systems/vehicle-spawn.js",
  "src/systems/vehicle-physics.js",
  "src/systems/economy.js",
  "src/systems/offline-earnings.js",
  "src/systems/lot-actions.js",
  "src/systems/progression.js",
  "src/systems/quest.js",
  "src/systems/audio.js",
  "src/systems/analytics.js",
  "src/render/dirty-tracker.js",
  "src/render/iso-utils.js",
  "src/render/camera.js",
  "src/render/draw-ground.js",
  "src/render/draw-environment.js",
  "src/render/draw-buildings.js",
  "src/render/draw-charger.js",
  "src/render/draw-station.js",
  "src/render/draw-vehicles.js",
  "src/render/draw-minimap.js",
  "src/render/render-loop.js",
  "src/ui/hud.js",
  "src/ui/lot-panel.js",
  "src/ui/lot-list.js",
  "src/ui/finance-tab.js",
  "src/ui/multiplayer-tab.js",
  "src/ui/shop-modal.js",
  "src/ui/offline-modal.js",
  "src/ui/progression-panel.js",
  "src/net/leaderboard.js",
  "src/net/websocket.js",
  "src/debug/debug-overlay.js"
];

function stripEsModuleSyntax(code) {
  return code
    .replace(/^\s*import\s+[\s\S]*?from\s+["'][^"']+["'];?\s*$/gm, "")
    .replace(/^\s*import\s+["'][^"']+["'];?\s*$/gm, "")
    .split("\n")
    .map((line) => line.replace(/^\s*export\s+(function|const|let|var)\s+/, "$1 ").replace(/\bimport\.meta\b/g, "({})"))
    .join("\n");
}

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const sPath = path.join(src, entry.name);
    const dPath = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDirRecursive(sPath, dPath);
    else fs.copyFileSync(sPath, dPath);
  }
}

fs.mkdirSync(WWW_DIR, { recursive: true });
copyDirRecursive(path.join(ROOT_DIR, "public"), WWW_DIR);

const cssText = fs.readFileSync(path.join(ROOT_DIR, "src/styles/main.css"), "utf8");
const chunks = [];

for (const modRel of MODULE_ORDER) {
  const modPath = path.join(ROOT_DIR, modRel);
  const raw = fs.readFileSync(modPath, "utf8");
  chunks.push(`// =========================================================================\n// MODULE: ${modRel}\n// =========================================================================\n` + stripEsModuleSyntax(raw));
}

// Thêm initGame từ src/main.js và Mobile SDK Bridge từ src/net/mobile-sdk-bridge.js
const mainRaw = fs.readFileSync(path.join(ROOT_DIR, "src/main.js"), "utf8");
const initStart = mainRaw.indexOf("function initGame()");
const initBlock = mainRaw
  .slice(initStart)
  .replace(/import\("\.\/net\/mobile-sdk-bridge\.js"\)[\s\S]*$/, "");

const bridgeRaw = stripEsModuleSyntax(
  fs.readFileSync(path.join(ROOT_DIR, "src/net/mobile-sdk-bridge.js"), "utf8")
);

const indexShell = fs.readFileSync(path.join(ROOT_DIR, "index.html"), "utf8");
const bundledHtml = indexShell
  .replace(/<link rel="stylesheet" href="\.?\/src\/styles\/main\.css" \/>/, `<style>\n${cssText}\n</style>`)
  .replace(
    /<script type="module" src="\.?\/src\/main\.js"><\/script>/,
    `<script>\n${chunks.join("\n\n")}\n\n${initBlock}\n\n${bridgeRaw}\n</script>`
  );

fs.writeFileSync(path.join(WWW_DIR, "index.html"), bundledHtml, "utf8");
fs.writeFileSync(path.join(WWW_DIR, "PhoCo_EV_Tycoon_v2_Multiplayer.html"), bundledHtml, "utf8");
fs.writeFileSync(path.join(WWW_DIR, "mobile-sdk-bridge.js"), bridgeRaw, "utf8");

console.log(`✅ [NovaVerde Modular Build] Đã đóng gói thành công ${MODULE_ORDER.length + 2} modules vào www/index.html`);
