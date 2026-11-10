/**
 * src/data/charger-tiers.js
 * Danh mục 5 cấp Trụ sạc (0kW -> 120kW) & hàm tính chi phí đầu tư trụ
 */
import { FRANCHISE_BAY_INSTALL_COST, DIRECT_BAY_INSTALL_COST, DIRECT_TRANSFORMER_FEE, FRANCHISE_MARGIN_PER_KWH, DIRECT_MARGIN_PER_KWH } from "./balance.js";

export const CHARGER_TIERS = [
  { level: 0, name: "Chưa lắp trụ", nameEn: "Empty Bay", kw: 0, upgradeCost: 10000000, franchiseCost: 10000000, directCost: 18000000, color: "#94a3b8" },
  { level: 1, name: "Trụ AC Eco 11kW", nameEn: "AC Eco 11kW Charger", kw: 11, upgradeCost: 16000000, franchiseCost: 16000000, directCost: 28000000, color: "#10b981" },
  { level: 2, name: "Trụ DC Nhanh 30kW", nameEn: "DC Fast 30kW Charger", kw: 30, upgradeCost: 32000000, franchiseCost: 32000000, directCost: 56000000, color: "#06b6d4" },
  { level: 3, name: "Trụ DC Cao Cấp 60kW", nameEn: "DC Pro 60kW Charger", kw: 60, upgradeCost: 55000000, franchiseCost: 55000000, directCost: 95000000, color: "#3b82f6" },
  { level: 4, name: "Siêu Trụ DC 120kW", nameEn: "Ultra DC 120kW Supercharger", kw: 120, upgradeCost: null, franchiseCost: null, directCost: null, color: "#f59e0b" }
];

// CƠ CHẾ MÔ HÌNH KINH DOANH RIÊNG CHO TỪNG LÔ TRẠM SẠC (FRANCHISE TRỢ GIÁ vs DIRECT SALE TỰ ĐẦU TƯ 100%)

export function getLotBusinessMode(lot) {
  return (lot && lot.businessMode === "direct") ? "direct" : "franchise";
}

export function getLotMarginPerKwh(lot) {
  return getLotBusinessMode(lot) === "direct" ? DIRECT_MARGIN_PER_KWH : FRANCHISE_MARGIN_PER_KWH;
}

export function getBayInstallCostForLot(lot) {
  return getLotBusinessMode(lot) === "direct" ? DIRECT_BAY_INSTALL_COST : FRANCHISE_BAY_INSTALL_COST;
}

export function getBayUpgradeCostForLot(lot, curTierLevel) {
  const tObj = CHARGER_TIERS[curTierLevel];
  if (!tObj || tObj.upgradeCost === null) return null;
  return getLotBusinessMode(lot) === "direct" ? (tObj.directCost || tObj.upgradeCost) : (tObj.franchiseCost || tObj.upgradeCost);
}

// Tính tổng tiền đóng bù trợ giá (Trạm biến áp 15,000 G$ + Chênh lệch trợ giá của toàn bộ trụ hiện có trên lô) để nâng cấp từ Franchise -> Direct Sale
export function getLotSubsidyBuyoutCostToDirect(lot) {
  if (!lot) return DIRECT_TRANSFORMER_FEE;
  let totalDiff = DIRECT_TRANSFORMER_FEE;
  (lot.bays || []).forEach(b => {
    const lvl = b.tier || 1;
    if (lvl >= 1) totalDiff += (DIRECT_BAY_INSTALL_COST - FRANCHISE_BAY_INSTALL_COST); // +8,000 G$ lắp trụ
    if (lvl >= 2) totalDiff += (CHARGER_TIERS[1].directCost - CHARGER_TIERS[1].franchiseCost); // +12,000 G$
    if (lvl >= 3) totalDiff += (CHARGER_TIERS[2].directCost - CHARGER_TIERS[2].franchiseCost); // +24,000 G$
    if (lvl >= 4) totalDiff += (CHARGER_TIERS[3].directCost - CHARGER_TIERS[3].franchiseCost); // +40,000 G$
  });
  return totalDiff;
}


// Đăng ký vào globalThis để tương thích ngược với HTML event handlers & các module liên kết
Object.assign(globalThis, {
  getLotBusinessMode,
  getLotMarginPerKwh,
  getBayInstallCostForLot,
  getBayUpgradeCostForLot,
  getLotSubsidyBuyoutCostToDirect,
  CHARGER_TIERS
});
