/**
 * src/systems/progression.js
 * HỆ THỐNG TIẾN TRÌNH GIAI ĐOẠN 2:
 * 1. Cây Công Nghệ Mở Khóa (Tech/Unlock Tree DAG)
 * 2. Chuỗi Tài Nguyên Trung Gian (Điện năng lưới EVN & Pin BESS, Điểm Danh Tiếng ⭐, Giấy Phép Mở Rộng 📜)
 * 3. Quản lý Nhân sự Trạm sạc (Bảo vệ, Kỹ thuật viên Điện, Quản lý Dịch vụ)
 * 4. Sự kiện Đô thị Ngẫu nhiên có Lựa chọn & Hậu quả (Interactive Decision Events)
 */

import {
  GRID_TARIFF_OFFPEAK_VND,
  GRID_TARIFF_NORMAL_VND,
  GRID_TARIFF_PEAK_VND,
  BESS_BASE_CAPACITY_KWH,
  BESS_UPGRADE_STEP_KWH,
  BESS_UPGRADE_COST_VND,
  BESS_DISCHARGE_MARGIN_BONUS,
  PERMIT_EXPAND_DISCOUNT_RATE,
  STAFF_TECH_HIRE_COSTS,
  STAFF_TECH_SPEED_BONUS,
  STAFF_MANAGER_HIRE_COSTS,
  STAFF_MANAGER_AMENITY_BONUS
} from "../data/balance.js";
import { UNLOCK_TREE_DAG } from "../data/unlock-tree.js";

// =========================================================================
// 1. KHỞI TẠO & ĐỒNG BỘ TRẠNG THÁI TIẾN TRÌNH (PROGRESSION STATE)
// =========================================================================
export function ensureProgressionState() {
  const st = globalThis.state;
  if (!st) return null;
  if (!st.progression || typeof st.progression !== "object") {
    st.progression = {
      unlockedTechIds: {
        tech_charger_t1: true,
        tech_am_tra_da: true,
        tech_am_doi_pin: true
      },
      gridKwhStored: 350, // Khởi đầu có sẵn 350 kWh trong Pin lưu trữ BESS
      gridKwhCapacity: BESS_BASE_CAPACITY_KWH,
      bessLevel: 1,
      autoBuyOffPeak: false,
      totalGridKwhPurchased: 0,
      driverReputation: 12, // Khởi đầu 12⭐ Danh tiếng
      expansionPermits: 1,  // Khởi đầu tặng 1 📜 Giấy phép mở rộng
      activeChoiceEvent: null
    };
  }
  return st.progression;
}

// =========================================================================
// 2. CÂY CÔNG NGHỆ & ĐỒ THỊ MỞ KHÓA (TECH / UNLOCK TREE DAG)
// =========================================================================
export function syncNaturalTechUnlocks() {
  const st = globalThis.state;
  if (!st || !Array.isArray(st.lots)) return;
  const prog = ensureProgressionState();
  const unlocked = prog.unlockedTechIds;

  // Đếm tổng số trụ theo từng cấp và cấp tiện ích cao nhất trên toàn mạng lưới
  let baysT1Plus = 0;
  let baysT2Plus = 0;
  let baysT3Plus = 0;
  const maxAmenityLvl = {};

  for (const lot of st.lots) {
    if (!lot.owned) continue;
    for (const b of lot.bays || []) {
      const t = b.tier || 1;
      if (t >= 1) baysT1Plus++;
      if (t >= 2) baysT2Plus++;
      if (t >= 3) baysT3Plus++;
    }
    if (lot.amenities) {
      for (const [k, v] of Object.entries(lot.amenities)) {
        if ((v || 0) > (maxAmenityLvl[k] || 0)) maxAmenityLvl[k] = v || 0;
      }
    }
  }

  for (const node of UNLOCK_TREE_DAG) {
    if (node.defaultUnlocked) {
      unlocked[node.id] = true;
      continue;
    }
    const parentsOk = (node.parents || []).every(pid => Boolean(unlocked[pid]));
    if (!parentsOk) continue;

    if (node.category === "charger") {
      if (node.targetTier === 2 && baysT1Plus >= (node.reqBaysCount || 2)) unlocked[node.id] = true;
      if (node.targetTier === 3 && baysT2Plus >= (node.reqBaysCount || 2)) unlocked[node.id] = true;
      if (node.targetTier === 4 && baysT3Plus >= (node.reqBaysCount || 2)) unlocked[node.id] = true;
    } else if (node.category === "amenity" && node.reqAmenityId) {
      if ((maxAmenityLvl[node.reqAmenityId] || 0) >= (node.reqAmenityLevel || 1)) {
        unlocked[node.id] = true;
      }
    }
  }
}

export function isTechNodeUnlocked(nodeId) {
  syncNaturalTechUnlocks();
  const prog = ensureProgressionState();
  return Boolean(prog && prog.unlockedTechIds && prog.unlockedTechIds[nodeId]);
}

export function isChargerTierUnlocked(tierLevel) {
  if (tierLevel <= 1) return true;
  return isTechNodeUnlocked(`tech_charger_t${tierLevel}`);
}

export function isAmenityTechUnlocked(amenityId) {
  if (amenityId === "tra_da" || amenityId === "doi_pin") return true;
  return isTechNodeUnlocked(`tech_am_${amenityId}`);
}

export function researchTechNode(nodeId) {
  const st = globalThis.state;
  if (!st) return false;
  syncNaturalTechUnlocks();
  const prog = ensureProgressionState();
  const node = UNLOCK_TREE_DAG.find(n => n.id === nodeId);
  if (!node) return false;
  if (prog.unlockedTechIds[nodeId]) return true;

  const Lfn = globalThis.L || ((v) => v);
  const fmt = globalThis.formatCompactVND || ((v) => v);

  // Kiểm tra node cha trong DAG đã mở chưa
  const missingParent = (node.parents || []).find(pid => !prog.unlockedTechIds[pid]);
  if (missingParent) {
    const pNode = UNLOCK_TREE_DAG.find(n => n.id === missingParent);
    const pName = pNode ? (globalThis.isEn && globalThis.isEn() ? pNode.nameEn : pNode.name) : missingParent;
    if (typeof globalThis.logEvent === "function") {
      globalThis.logEvent(Lfn(`🔒 Cần mở khóa công nghệ nhánh trước: [${pName}]!`, `🔒 Must unlock prerequisite tech first: [${pName}]!`));
    }
    return false;
  }

  const cost = node.researchCostVnd || 0;
  if ((st.money || 0) < cost) {
    if (typeof globalThis.logEvent === "function") {
      globalThis.logEvent(Lfn(`⚠️ Không đủ ngân sách nghiên cứu công nghệ (Cần ${fmt(cost)})!`, `⚠️ Insufficient R&D funds (Need ${fmt(cost)})!`));
    }
    return false;
  }

  st.money -= cost;
  prog.unlockedTechIds[nodeId] = true;
  prog.driverReputation = (prog.driverReputation || 0) + 8;

  if (typeof globalThis.playSfx === "function") globalThis.playSfx("upgrade");
  if (typeof globalThis.triggerHaptic === "function") globalThis.triggerHaptic(30);
  if (typeof globalThis.saveGameToStorage === "function") globalThis.saveGameToStorage(false);
  if (typeof globalThis.refreshAllUI === "function") globalThis.refreshAllUI();

  if (typeof globalThis.logEvent === "function") {
    const title = globalThis.isEn && globalThis.isEn() ? node.nameEn : node.name;
    globalThis.logEvent(Lfn(`🔬 Đã nghiên cứu & mở khóa thành công công nghệ: [${node.icon} ${title}] (+8⭐ Danh tiếng)!`, `🔬 Researched & unlocked tech: [${node.icon} ${title}] (+8⭐ Rep)!`));
  }
  return true;
}

// =========================================================================
// 3. CHUỖI TÀI NGUYÊN TRUNG GIAN: ĐIỆN LƯỚI EVN & PIN LƯU TRỮ BESS
// =========================================================================
export function getCurrentGridTariffInfo() {
  const st = globalThis.state || {};
  const hour = Math.floor((st.simMinute || 480) / 60);
  const Lfn = globalThis.L || ((v) => v);

  if (hour >= 22 || hour < 6) {
    return {
      period: "OFF_PEAK",
      label: Lfn("🌙 Giờ Thấp Điểm (Giá rẻ -33%)", "🌙 Off-Peak (Cheap -33%)"),
      pricePerKwhVnd: GRID_TARIFF_OFFPEAK_VND,
      color: "#10b981"
    };
  }
  if ((hour >= 9 && hour < 12) || (hour >= 17 && hour < 20)) {
    return {
      period: "PEAK",
      label: Lfn("🔥 Giờ Cao Điểm (+48%)", "🔥 Peak Hours (+48%)"),
      pricePerKwhVnd: GRID_TARIFF_PEAK_VND,
      color: "#ef4444"
    };
  }
  return {
    period: "NORMAL",
    label: Lfn("☀️ Giờ Bình Thường", "☀️ Standard Hours"),
    pricePerKwhVnd: GRID_TARIFF_NORMAL_VND,
    color: "#0284c7"
  };
}

export function buyWholesaleGridKwh(amountKwh = 500) {
  const st = globalThis.state;
  if (!st) return false;
  const prog = ensureProgressionState();
  const cap = prog.gridKwhCapacity || BESS_BASE_CAPACITY_KWH;
  const cur = prog.gridKwhStored || 0;
  const room = Math.max(0, cap - cur);
  const Lfn = globalThis.L || ((v) => v);
  const fmt = globalThis.formatCompactVND || ((v) => v);

  if (room < 10) {
    if (typeof globalThis.logEvent === "function") {
      globalThis.logEvent(Lfn("🔋 Hệ thống Pin lưu trữ BESS đã đầy 100%! Hãy nâng cấp dung lượng Pin nếu muốn tích trữ thêm.", "🔋 BESS Battery Storage is 100% full! Upgrade BESS capacity to store more."));
    }
    return false;
  }

  const buyKwh = Math.min(amountKwh, room);
  const tariff = getCurrentGridTariffInfo();
  const totalCost = Math.round(buyKwh * tariff.pricePerKwhVnd);

  if ((st.money || 0) < totalCost) {
    if (typeof globalThis.logEvent === "function") {
      globalThis.logEvent(Lfn(`⚠️ Không đủ tiền mua sỉ ${buyKwh} kWh điện lưới (Cần ${fmt(totalCost)})!`, `⚠️ Not enough cash to buy ${buyKwh} kWh grid power (Need ${fmt(totalCost)})!`));
    }
    return false;
  }

  st.money -= totalCost;
  prog.gridKwhStored = Math.round((cur + buyKwh) * 10) / 10;
  prog.totalGridKwhPurchased = (prog.totalGridKwhPurchased || 0) + buyKwh;

  if (typeof globalThis.playSfx === "function") globalThis.playSfx("cash");
  if (typeof globalThis.saveGameToStorage === "function") globalThis.saveGameToStorage(false);
  if (typeof globalThis.refreshAllUI === "function") globalThis.refreshAllUI();

  if (typeof globalThis.logEvent === "function") {
    globalThis.logEvent(
      Lfn(
        `⚡ Đã nạp +${Math.round(buyKwh)} kWh vào Pin BESS với giá ${tariff.label} (-${fmt(totalCost)}). Sạc từ Pin BESS giúp tăng +35% lợi nhuận!`,
        `⚡ Stored +${Math.round(buyKwh)} kWh in BESS at ${tariff.label} rate (-${fmt(totalCost)}). BESS power boosts charging profit by +35%!`
      )
    );
  }
  return true;
}

export function upgradeBessCapacity() {
  const st = globalThis.state;
  if (!st) return false;
  const prog = ensureProgressionState();
  const lvl = prog.bessLevel || 1;
  const cost = BESS_UPGRADE_COST_VND * lvl;
  const Lfn = globalThis.L || ((v) => v);
  const fmt = globalThis.formatCompactVND || ((v) => v);

  if ((st.money || 0) < cost) {
    if (typeof globalThis.logEvent === "function") {
      globalThis.logEvent(Lfn(`⚠️ Cần ${fmt(cost)} để nâng cấp Trạm Pin lưu trữ BESS lên Cấp ${lvl + 1}!`, `⚠️ Need ${fmt(cost)} to upgrade BESS Storage to Lv${lvl + 1}!`));
    }
    return false;
  }

  st.money -= cost;
  prog.bessLevel = lvl + 1;
  prog.gridKwhCapacity = (prog.gridKwhCapacity || BESS_BASE_CAPACITY_KWH) + BESS_UPGRADE_STEP_KWH;
  prog.gridKwhStored = Math.min(prog.gridKwhCapacity, (prog.gridKwhStored || 0) + 300); // Tặng kèm 300 kWh khi lắp cell pin mới
  prog.driverReputation = (prog.driverReputation || 0) + 10;

  if (typeof globalThis.playSfx === "function") globalThis.playSfx("upgrade");
  if (typeof globalThis.saveGameToStorage === "function") globalThis.saveGameToStorage(false);
  if (typeof globalThis.refreshAllUI === "function") globalThis.refreshAllUI();

  if (typeof globalThis.logEvent === "function") {
    globalThis.logEvent(Lfn(`🔋 Đã nâng cấp Pin lưu trữ BESS lên Cấp ${prog.bessLevel} (Dung lượng: ${prog.gridKwhCapacity.toLocaleString()} kWh)!`, `🔋 Upgraded BESS Storage to Lv${prog.bessLevel} (Capacity: ${prog.gridKwhCapacity.toLocaleString()} kWh)!`));
  }
  return true;
}

export function toggleAutoBuyOffPeak() {
  const prog = ensureProgressionState();
  if (!prog) return false;
  prog.autoBuyOffPeak = !prog.autoBuyOffPeak;
  if (typeof globalThis.refreshAllUI === "function") globalThis.refreshAllUI();
  return prog.autoBuyOffPeak;
}

// Hàm được gọi trong mỗi nhịp sạc xe để tiêu thụ điện từ Pin BESS và trả về hệ số thưởng biên lợi nhuận
export function consumeBessKwhForCharging(kwhDelta) {
  const prog = ensureProgressionState();
  if (!prog || kwhDelta <= 0) return 1.0;

  // Nếu đang ở giờ thấp điểm và bật Tự động nạp Pin BESS
  if (prog.autoBuyOffPeak && (prog.gridKwhStored || 0) < (prog.gridKwhCapacity || 800) * 0.35) {
    const tariff = getCurrentGridTariffInfo();
    if (tariff.period === "OFF_PEAK" && (globalThis.state.money || 0) > 25000000) {
      buyWholesaleGridKwh(400);
    }
  }

  if ((prog.gridKwhStored || 0) >= kwhDelta) {
    prog.gridKwhStored = Math.max(0, prog.gridKwhStored - kwhDelta);
    return BESS_DISCHARGE_MARGIN_BONUS; // +35% lợi nhuận sạc khi dùng điện từ Pin BESS
  }
  return 1.0;
}

// =========================================================================
// 4. HỆ THỐNG QUẢN LÝ NHÂN SỰ TRẠM SẠC (STAFF MANAGEMENT — MỤC 6.4 BÁO CÁO)
// =========================================================================
export function getLotTechSpeedMultiplier(lot) {
  if (!lot) return 1.0;
  const lvl = Math.max(0, Math.min(3, Number(lot.techStaffLevel) || 0));
  return 1.0 + (STAFF_TECH_SPEED_BONUS[lvl] || 0);
}

export function getLotManagerAmenityMultiplier(lot) {
  if (!lot) return 1.0;
  const lvl = Math.max(0, Math.min(3, Number(lot.managerStaffLevel) || 0));
  return 1.0 + (STAFF_MANAGER_AMENITY_BONUS[lvl] || 0);
}

export function hireOrUpgradeLotStaff(lotId, role) {
  const st = globalThis.state;
  if (!st || !Array.isArray(st.lots)) return false;
  const lot = st.lots.find(l => l.id === lotId);
  if (!lot || !lot.owned) return false;

  const Lfn = globalThis.L || ((v) => v);
  const fmt = globalThis.formatCompactVND || ((v) => v);
  const prog = ensureProgressionState();

  if (role === "guard") {
    if (lot.hasGuard) {
      if (typeof globalThis.dismissGuardForLot === "function") {
        return globalThis.dismissGuardForLot(lotId);
      }
      return false;
    } else {
      if (typeof globalThis.hireGuardForLot === "function") {
        return globalThis.hireGuardForLot(lotId);
      }
      return false;
    }
  }

  if (role === "tech") {
    const curLvl = Math.max(0, Math.min(3, Number(lot.techStaffLevel) || 0));
    if (curLvl >= 3) return false;
    const nextLvl = curLvl + 1;
    const cost = STAFF_TECH_HIRE_COSTS[nextLvl] || 18000000;
    if ((st.money || 0) < cost) {
      if (typeof globalThis.logEvent === "function") {
        globalThis.logEvent(Lfn(`⚠️ Cần ${fmt(cost)} để tuyển/đào tạo Kỹ thuật viên Điện Cấp ${nextLvl}!`, `⚠️ Need ${fmt(cost)} to hire/train EV Technician Lv${nextLvl}!`));
      }
      return false;
    }
    st.money -= cost;
    lot.techStaffLevel = nextLvl;
    prog.driverReputation = (prog.driverReputation || 0) + 6;
    if (typeof globalThis.playSfx === "function") globalThis.playSfx("upgrade");
    if (typeof globalThis.saveGameToStorage === "function") globalThis.saveGameToStorage(false);
    if (typeof globalThis.refreshAllUI === "function") globalThis.refreshAllUI();
    if (typeof globalThis.logEvent === "function") {
      const pct = Math.round((STAFF_TECH_SPEED_BONUS[nextLvl] || 0) * 100);
      globalThis.logEvent(Lfn(`🔧 Đã nâng cấp Kỹ thuật viên Điện Cấp ${nextLvl} cho Lô #${lot.id} (+${pct}% tốc độ sạc kWh)!`, `🔧 Upgraded EV Technician Lv${nextLvl} on Lot #${lot.id} (+${pct}% charging speed)!`));
    }
    return true;
  }

  if (role === "manager") {
    const curLvl = Math.max(0, Math.min(3, Number(lot.managerStaffLevel) || 0));
    if (curLvl >= 3) return false;
    const nextLvl = curLvl + 1;
    const cost = STAFF_MANAGER_HIRE_COSTS[nextLvl] || 22000000;
    if ((st.money || 0) < cost) {
      if (typeof globalThis.logEvent === "function") {
        globalThis.logEvent(Lfn(`⚠️ Cần ${fmt(cost)} để bổ nhiệm Quản lý Dịch vụ Cấp ${nextLvl}!`, `⚠️ Need ${fmt(cost)} to appoint Service Manager Lv${nextLvl}!`));
      }
      return false;
    }
    st.money -= cost;
    lot.managerStaffLevel = nextLvl;
    prog.driverReputation = (prog.driverReputation || 0) + 8;
    if (typeof globalThis.playSfx === "function") globalThis.playSfx("upgrade");
    if (typeof globalThis.saveGameToStorage === "function") globalThis.saveGameToStorage(false);
    if (typeof globalThis.refreshAllUI === "function") globalThis.refreshAllUI();
    if (typeof globalThis.logEvent === "function") {
      const pct = Math.round((STAFF_MANAGER_AMENITY_BONUS[nextLvl] || 0) * 100);
      globalThis.logEvent(Lfn(`👩‍💼 Đã bổ nhiệm Quản lý Dịch vụ Cấp ${nextLvl} tại Lô #${lot.id} (+${pct}% doanh thu Tiện ích)!`, `👩‍💼 Appointed Service Manager Lv${nextLvl} on Lot #${lot.id} (+${pct}% Amenity revenue)!`));
    }
    return true;
  }

  return false;
}

// =========================================================================
// 5. HỆ THỐNG SỰ KIỆN NGẪU NHIÊN CÓ LỰA CHỌN & HẬU QUẢ (MỤC 6.5 BÁO CÁO)
// =========================================================================
export const INTERACTIVE_URBAN_EVENTS = [
  {
    id: "EVT_STORM_SHIELD",
    icon: "⛈️",
    title: "Cảnh Báo Giông Lốc Nhiệt Đới Cấp Độ Mạnh",
    titleEn: "Severe Tropical Squall Warning",
    desc: "Dự báo gió giật mạnh tại khu vực nội đô. Bạn muốn gia cố mái Solar Canopy và kích hoạt trạm phát dự phòng hay giữ nguyên vận hành?",
    descEn: "Strong gusts forecast across the district. Reinforce Solar Canopy & backup power or keep standard operation?",
    optionA: {
      label: "🛡️ Gia cố & Bật Pin Dự Phòng (-12,000 G$)",
      labelEn: "🛡️ Reinforce & Backup Power (-12,000 G$)",
      costVnd: 12000000,
      rewardRep: 18,
      rewardKwh: 250,
      rewardPermits: 1,
      outcomeVi: "✅ Trạm sạc vượt bão an toàn tuyệt đối! Tài xế đánh giá cao (+18⭐ Danh tiếng, +250 kWh & +1📜 Giấy phép mở rộng).",
      outcomeEn: "✅ Station weathered the storm safely! Drivers praised your reliability (+18⭐ Rep, +250 kWh & +1📜 Permit)."
    },
    optionB: {
      label: "⚡ Giữ nguyên vận hành (0 G$)",
      labelEn: "⚡ Keep Standard Operation (0 G$)",
      costVnd: 0,
      repairFeeVnd: 8000000,
      outcomeVi: "⚠️ Gió lớn làm chập nhẹ tủ tụ điện, tốn -8,000 G$ chi phí bảo trì khẩn cấp.",
      outcomeEn: "⚠️ Gusts caused a minor capacitor surge, costing -8,000 G$ in emergency maintenance."
    }
  },
  {
    id: "EVT_EVN_SURPLUS_SALE",
    icon: "⚡",
    title: "EVN Xả Điện Năng Lượng Mặt Trời Dư Thừa (-50%)",
    titleEn: "Grid Solar Surplus Flash Sale (-50%)",
    desc: "Lưới điện quốc gia đang dư công suất điện mặt trời buổi trưa và chào bán lô 600 kWh giá ưu đãi đặc biệt!",
    descEn: "The national grid has midday solar surplus and offers a 600 kWh batch at a 50% discount!",
    optionA: {
      label: "🔋 Ôm trọn 600 kWh vào Pin BESS (-5,000 G$)",
      labelEn: "🔋 Buy 600 kWh into BESS (-5,000 G$)",
      costVnd: 5000000,
      rewardRep: 10,
      rewardKwh: 600,
      rewardPermits: 0,
      outcomeVi: "🔋 Đã nạp đầy +600 kWh điện giá rẻ vào Pin BESS (+10⭐ Danh tiếng)!",
      outcomeEn: "🔋 Stored +600 kWh low-cost solar energy into BESS (+10⭐ Rep)!"
    },
    optionB: {
      label: "⏭️ Bỏ qua đợt xả điện này",
      labelEn: "⏭️ Pass on this batch",
      costVnd: 0,
      repairFeeVnd: 0,
      outcomeVi: "ℹ️ Đã bỏ qua đợt mua sỉ điện năng ưu đãi.",
      outcomeEn: "ℹ️ Passed on the wholesale solar power batch."
    }
  },
  {
    id: "EVT_TAXI_CONVOY_RUSH",
    icon: "🚕",
    title: "Đoàn 50 Xe Taxi Điện Xin Sạc Nhanh Phục Vụ Hội Nghị",
    titleEn: "50-Car EV Taxi Convoy Requests Priority Charging",
    desc: "Đội xe JadeCab cần sạc gấp trong khung giờ tới cho đoàn đại biểu. Bạn có muốn chi thưởng tăng ca cho nhân sự để đón đoàn không?",
    descEn: "JadeCab fleet needs priority charging for summit delegates. Pay overtime bonus to host the convoy?",
    optionA: {
      label: "🚀 Tăng ca đón đoàn (-8,000 G$ ➔ Thu +26,000 G$)",
      labelEn: "🚀 Overtime Priority (-8,000 G$ ➔ Earn +26,000 G$)",
      costVnd: 8000000,
      grossBonusVnd: 26000000,
      rewardRep: 22,
      rewardKwh: 0,
      rewardPermits: 1,
      outcomeVi: "🚕 Đón đoàn Taxi thành công rực rỡ! Lãi ròng +18,000 G$, +22⭐ Danh tiếng & +1📜 Giấy phép!",
      outcomeEn: "🚕 Hosted the EV Taxi convoy! Net profit +18,000 G$, +22⭐ Rep & +1📜 Permit!"
    },
    optionB: {
      label: "🛑 Từ chối để giữ tải tiêu chuẩn",
      labelEn: "🛑 Decline to keep standard load",
      costVnd: 0,
      repairFeeVnd: 0,
      outcomeVi: "ℹ️ Đoàn xe di chuyển sang trạm khác, trạm của bạn giữ nhịp vận hành bình thường.",
      outcomeEn: "ℹ️ Convoy moved to another station; normal operations maintained."
    }
  }
];

export function triggerInteractiveUrbanEvent(forceIdx = -1) {
  const prog = ensureProgressionState();
  if (!prog) return null;
  const idx = forceIdx >= 0
    ? forceIdx % INTERACTIVE_URBAN_EVENTS.length
    : Math.floor(Math.random() * INTERACTIVE_URBAN_EVENTS.length);
  prog.activeChoiceEvent = INTERACTIVE_URBAN_EVENTS[idx].id;
  if (typeof globalThis.refreshAllUI === "function") globalThis.refreshAllUI();
  return INTERACTIVE_URBAN_EVENTS[idx];
}

export function resolveInteractiveUrbanEvent(choiceKey = "A") {
  const st = globalThis.state;
  if (!st) return false;
  const prog = ensureProgressionState();
  if (!prog || !prog.activeChoiceEvent) return false;

  const evt = INTERACTIVE_URBAN_EVENTS.find(e => e.id === prog.activeChoiceEvent);
  if (!evt) {
    prog.activeChoiceEvent = null;
    return false;
  }

  const Lfn = globalThis.L || ((v) => v);
  if (choiceKey === "A") {
    const opt = evt.optionA;
    if ((st.money || 0) < (opt.costVnd || 0)) {
      if (typeof globalThis.logEvent === "function") {
        globalThis.logEvent(Lfn("⚠️ Không đủ tiền mặt để chọn phương án A!", "⚠️ Not enough cash for Option A!"));
      }
      return false;
    }
    st.money = (st.money || 0) - (opt.costVnd || 0) + (opt.grossBonusVnd || 0);
    prog.driverReputation = (prog.driverReputation || 0) + (opt.rewardRep || 0);
    prog.expansionPermits = (prog.expansionPermits || 0) + (opt.rewardPermits || 0);
    if (opt.rewardKwh) {
      prog.gridKwhStored = Math.min(prog.gridKwhCapacity || 2000, (prog.gridKwhStored || 0) + opt.rewardKwh);
    }
    prog.activeChoiceEvent = null;
    if (typeof globalThis.playSfx === "function") globalThis.playSfx("cash");
    if (typeof globalThis.logEvent === "function") {
      globalThis.logEvent(Lfn(opt.outcomeVi, opt.outcomeEn));
    }
  } else {
    const opt = evt.optionB;
    const fee = opt.repairFeeVnd || 0;
    st.money = Math.max(0, (st.money || 0) - fee);
    prog.activeChoiceEvent = null;
    if (typeof globalThis.logEvent === "function") {
      globalThis.logEvent(Lfn(opt.outcomeVi, opt.outcomeEn));
    }
  }

  if (typeof globalThis.saveGameToStorage === "function") globalThis.saveGameToStorage(false);
  if (typeof globalThis.refreshAllUI === "function") globalThis.refreshAllUI();
  return true;
}

Object.assign(globalThis, {
  PERMIT_EXPAND_DISCOUNT_RATE,
  ensureProgressionState,
  syncNaturalTechUnlocks,
  isTechNodeUnlocked,
  isChargerTierUnlocked,
  isAmenityTechUnlocked,
  researchTechNode,
  getCurrentGridTariffInfo,
  buyWholesaleGridKwh,
  upgradeBessCapacity,
  toggleAutoBuyOffPeak,
  consumeBessKwhForCharging,
  getLotTechSpeedMultiplier,
  getLotManagerAmenityMultiplier,
  hireOrUpgradeLotStaff,
  INTERACTIVE_URBAN_EVENTS,
  triggerInteractiveUrbanEvent,
  resolveInteractiveUrbanEvent
});
