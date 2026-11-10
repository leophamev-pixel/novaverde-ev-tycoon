/**
 * src/systems/quest.js
 * HỆ THỐNG NHIỆM VỤ CÓ CẤU TRÚC & HƯỚNG DẪN TÂN THỦ (QUEST & TUTORIAL SYSTEM — BƯỚC 2.3 BÁO CÁO)
 * Bao gồm:
 * - 6 Nhiệm vụ Chính tuyến (Main Progression Quests) nối tiếp nhau dẫn dắt người chơi mới
 * - Phần thưởng liên kết trực tiếp với Tiền (G$), GreenCoin (GC), Điểm Danh Tiếng (⭐), Điện dự trữ (kWh) & Giấy phép mở rộng (📜)
 */

export const MAIN_QUESTS_CHAIN = [
  {
    id: "MQ_01_INSTALL_BAY3",
    step: 1,
    icon: "🔌",
    title: "Bước 1/6: Lắp thêm Trụ Sạc thứ 3 tại Lô #1",
    titleEn: "Step 1/6: Install Charger Bay #3 on Lot #1",
    desc: "Lô #1 đang còn trống 34m² (mỗi trụ cần 20m²). Hãy bấm nút '🔌 +Trụ' để tăng công suất phục vụ!",
    descEn: "Lot #1 has 34m² free space (20m² per bay). Tap '🔌 +Bay' to expand charging capacity!",
    rewardMoney: 15000000,   // +15,000 G$
    rewardGc: 10,            // +10 GC
    rewardReputation: 15,    // +15 ⭐
    rewardKwh: 300,          // +300 kWh Pin BESS
    rewardPermits: 0,
    checkCompleted(st) {
      const lot1 = st && st.lots && st.lots[0];
      return Boolean(lot1 && Array.isArray(lot1.bays) && lot1.bays.length >= 3);
    }
  },
  {
    id: "MQ_02_UPGRADE_AMENITY",
    step: 2,
    icon: "🍵",
    title: "Bước 2/6: Mở khóa Chuỗi Tiện Ích (Trà Đá Cấp 2 / Đổi Pin)",
    titleEn: "Step 2/6: Upgrade Iced Tea Lv2 or Build Battery Swap",
    desc: "Vào tab '☕ Tiện Ích', nâng Quầy Trà Đá lên Cấp 2 (để mở khóa công nghệ Quán Café) hoặc lắp Tủ Đổi Pin.",
    descEn: "Open '☕ Amenities', upgrade Iced Tea to Lv2 (unlocks Egg Café tech) or build a Battery Swap.",
    rewardMoney: 22000000,   // +22,000 G$
    rewardGc: 15,
    rewardReputation: 20,
    rewardKwh: 400,
    rewardPermits: 1,
    checkCompleted(st) {
      if (!st || !Array.isArray(st.lots)) return false;
      return st.lots.some(l => l.owned && l.amenities && ((l.amenities.tra_da || 0) >= 2 || (l.amenities.doi_pin || 0) >= 1 || (l.amenities.cafe || 0) >= 1));
    }
  },
  {
    id: "MQ_03_FAST_CHARGER_30KW",
    step: 3,
    icon: "⚡",
    title: "Bước 3/6: Nâng cấp lên Sạc Nhanh DC 30kW (Cấp 2)",
    titleEn: "Step 3/6: Upgrade a Bay to DC Fast 30kW (Tier 2)",
    desc: "Nâng cấp bất kỳ trụ sạc nào lên Cấp 2 (DC Nhanh 30kW) để tăng tốc độ sạc gấp 2.7 lần!",
    descEn: "Upgrade any charger bay to Tier 2 (DC Fast 30kW) for 2.7x faster charging!",
    rewardMoney: 30000000,   // +30,000 G$
    rewardGc: 20,
    rewardReputation: 25,
    rewardKwh: 500,
    rewardPermits: 1,
    checkCompleted(st) {
      if (!st || !Array.isArray(st.lots)) return false;
      return st.lots.some(l => l.owned && Array.isArray(l.bays) && l.bays.some(b => (b.tier || 1) >= 2));
    }
  },
  {
    id: "MQ_04_GRID_AND_STAFF",
    step: 4,
    icon: "🔋",
    title: "Bước 4/6: Nạp Điện Pin BESS hoặc Thuê Nhân Sự Trạm",
    titleEn: "Step 4/6: Buy Grid Power for BESS or Hire Station Staff",
    desc: "Mua sỉ điện năng tích vào Pin BESS hoặc thuê Bảo vệ / Kỹ thuật viên / Quản lý cho trạm sạc.",
    descEn: "Buy wholesale grid kWh into BESS storage or hire a Guard / Technician / Manager.",
    rewardMoney: 35000000,   // +35,000 G$
    rewardGc: 25,
    rewardReputation: 30,
    rewardKwh: 600,
    rewardPermits: 1,
    checkCompleted(st) {
      if (!st) return false;
      const hasStaff = Array.isArray(st.lots) && st.lots.some(l => l.owned && (l.hasGuard || (l.techStaffLevel || 0) > 0 || (l.managerStaffLevel || 0) > 0));
      const boughtGrid = Boolean(st.progression && st.progression.totalGridKwhPurchased > 0);
      return hasStaff || boughtGrid;
    }
  },
  {
    id: "MQ_05_SECOND_LOT",
    step: 5,
    icon: "🏘️",
    title: "Bước 5/6: Mở rộng Đế chế — Sở hữu Lô Đất thứ 2",
    titleEn: "Step 5/6: Expand Empire — Acquire Your 2nd Lot",
    desc: "Chạm vào một lô đất trống trên bản đồ (hoặc vào tab '🏘️ 5.400 Lô') để Thuê hoặc Mua Sổ đỏ lô thứ 2!",
    descEn: "Tap an unowned plot on the map (or '🏘️ 5,400 Lots' tab) to Lease or Buy your 2nd station lot!",
    rewardMoney: 55000000,   // +55,000 G$
    rewardGc: 35,
    rewardReputation: 45,
    rewardKwh: 800,
    rewardPermits: 2,
    checkCompleted(st) {
      if (!st || !Array.isArray(st.lots)) return false;
      return st.lots.filter(l => l.owned).length >= 2;
    }
  },
  {
    id: "MQ_06_HIGH_TECH_EMPIRE",
    step: 6,
    icon: "🏆",
    title: "Bước 6/6: Mở khóa Công nghệ Cao (DC 60kW+ hoặc Hợp đồng B2B)",
    titleEn: "Step 6/6: High-Tech Tycoon (DC 60kW+ or B2B Fleet Contract)",
    desc: "Nâng cấp trụ DC 60kW (Cấp 3), mở khóa Nhà Ăn Phở Bò hoặc ký 1 Hợp đồng Đội xe B2B!",
    descEn: "Upgrade to a DC 60kW charger, unlock Beef Pho Canteen, or sign a B2B Fleet Contract!",
    rewardMoney: 100000000,  // +100,000 G$
    rewardGc: 60,
    rewardReputation: 80,
    rewardKwh: 1200,
    rewardPermits: 3,
    checkCompleted(st) {
      if (!st || !Array.isArray(st.lots)) return false;
      const hasT3 = st.lots.some(l => l.owned && Array.isArray(l.bays) && l.bays.some(b => (b.tier || 1) >= 3));
      const hasPho = st.lots.some(l => l.owned && l.amenities && (l.amenities.nha_an || 0) >= 1);
      const hasB2B = Boolean(globalThis.mpState && globalThis.mpState.signedContracts && Object.keys(globalThis.mpState.signedContracts).length > 0);
      return hasT3 || hasPho || hasB2B;
    }
  }
];

export function ensureQuestState() {
  const st = globalThis.state;
  if (!st) return null;
  if (!st.quests || typeof st.quests !== "object") {
    st.quests = {
      claimedMainIds: {},
      tutorialDismissed: false
    };
  }
  return st.quests;
}

export function getActiveMainQuest() {
  const st = globalThis.state;
  if (!st) return null;
  const qState = ensureQuestState();
  for (const q of MAIN_QUESTS_CHAIN) {
    if (!qState.claimedMainIds[q.id]) {
      return {
        ...q,
        isReadyToClaim: Boolean(q.checkCompleted(st))
      };
    }
  }
  return null;
}

export function claimMainQuestReward(questId) {
  const st = globalThis.state;
  if (!st) return false;
  const qState = ensureQuestState();
  const q = MAIN_QUESTS_CHAIN.find(item => item.id === questId);
  if (!q || qState.claimedMainIds[q.id]) return false;
  if (!q.checkCompleted(st)) return false;

  qState.claimedMainIds[q.id] = true;
  st.money = (st.money || 0) + (q.rewardMoney || 0);
  st.greenCoins = (st.greenCoins || 0) + (q.rewardGc || 0);

  if (typeof globalThis.ensureProgressionState === "function") {
    const prog = globalThis.ensureProgressionState();
    prog.driverReputation = (prog.driverReputation || 0) + (q.rewardReputation || 0);
    prog.expansionPermits = (prog.expansionPermits || 0) + (q.rewardPermits || 0);
    prog.gridKwhStored = Math.min(
      prog.gridKwhCapacity || 2000,
      (prog.gridKwhStored || 0) + (q.rewardKwh || 0)
    );
  }

  if (typeof globalThis.playSfx === "function") globalThis.playSfx("upgrade");
  if (typeof globalThis.triggerHaptic === "function") globalThis.triggerHaptic(35);
  if (typeof globalThis.updateGreenCoinHUD === "function") globalThis.updateGreenCoinHUD();
  if (typeof globalThis.saveGameToStorage === "function") globalThis.saveGameToStorage(false);
  if (typeof globalThis.refreshAllUI === "function") globalThis.refreshAllUI();

  if (typeof globalThis.logEvent === "function") {
    const Lfn = globalThis.L || ((v) => v);
    const fmt = globalThis.formatCompactVND || ((v) => v);
    globalThis.logEvent(
      Lfn(
        `🎁 Hoàn thành [${q.title}]! Nhận +${fmt(q.rewardMoney)}, +${q.rewardGc} GC, +${q.rewardReputation}⭐ Danh tiếng!`,
        `🎁 Completed [${q.titleEn}]! Claimed +${fmt(q.rewardMoney)}, +${q.rewardGc} GC, +${q.rewardReputation}⭐ Rep!`
      )
    );
  }
  return true;
}

Object.assign(globalThis, {
  MAIN_QUESTS_CHAIN,
  ensureQuestState,
  getActiveMainQuest,
  claimMainQuestReward
});
