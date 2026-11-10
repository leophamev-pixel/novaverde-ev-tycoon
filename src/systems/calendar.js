/**
 * src/systems/calendar.js
 * Hệ thống Lịch trình Tuần (Thứ 2 - Chủ Nhật), Sự kiện Đô thị & Chuyển ngày
 */
export function getHanoiWeeklyTimelineState() {
  const dayIdx = Math.max(0, ((state.totalDaysElapsed || 1) - 1) % 7);
  const wd = HANOI_WEEKDAYS[dayIdx] || HANOI_WEEKDAYS[0];
  const wName = isEn() ? (wd.nameEn || wd.name) : wd.name;
  const wShort = isEn() ? (wd.shortEn || wd.short) : wd.short;
  const hour = (state.simMinute || 0) / 60;
  const greenGrowthBonus = Math.min(20, ((state.year || 1) - 1) * 6);

  let phaseLabel = L("☀️ Lưu thông Nội Đô bình thường", "☀️ Normal Urban Traffic Flow");
  let trafficMult = 1.15;
  let evSharePct = 35 + greenGrowthBonus;
  let amenityMult = 1.0;
  let iceSquatProb = 0.09;
  let preferredDistricts = [0, 1, 3, 4, 7];

  if (!wd.isWeekend) {
    if (hour >= 6.5 && hour <= 9.5) {
      phaseLabel = L(
        `🌅 ${wName} • Cao điểm Sáng: Vượt cầu vào Nội Đô & CBD (×2.2 xe)`,
        `🌅 ${wName} • Morning Rush: Crossing Bridges to Core & CBD (×2.2 Traffic)`
      );
      trafficMult = 2.2;
      evSharePct = 34 + greenGrowthBonus;
      amenityMult = 1.15;
      preferredDistricts = [0, 1, 3, 4, 5];
    } else if (hour >= 11.5 && hour <= 13.5) {
      phaseLabel = L(
        `🍜 ${wName} • Nghỉ trưa Công sở: Ăn Phở & Café (+35% DV)`,
        `🍜 ${wName} • Office Lunch Rush: Pho & Egg Coffee (+35% Amenity Rev)`
      );
      trafficMult = 1.45;
      evSharePct = 38 + greenGrowthBonus;
      amenityMult = 1.35;
      iceSquatProb = 0.14;
      preferredDistricts = [0, 1, 3, 4, 7];
    } else if (hour >= 17.0 && hour <= 19.5) {
      phaseLabel = L(
        `🌆 ${wName} • Tan tầm Chiều: Tắc đường Vành Đai về Khu dân cư (×2.5 xe)`,
        `🌆 ${wName} • Evening Commute: Ring Road Rush to Residential Zones (×2.5 Traffic)`
      );
      trafficMult = 2.5;
      evSharePct = 35 + greenGrowthBonus;
      amenityMult = 1.25;
      preferredDistricts = [2, 5, 6, 8, 9];
    } else if (wd.idx === 4 && hour > 19.5 && hour <= 23.5) {
      phaseLabel = L(
        `🏮 Tối Thứ 6 • Khai mạc Phố Đi Bộ Hồ Tinh Cầu & Ẩm thực Đêm (+60% DV)`,
        `🏮 Friday Night • Starlight Lake Walking Street & Night Dining (+60% Amenity Rev)`
      );
      trafficMult = 2.1;
      evSharePct = 42 + greenGrowthBonus;
      amenityMult = 1.60;
      preferredDistricts = [0, 2, 7];
    } else if (hour > 19.5 || hour < 6.0) {
      phaseLabel = L(
        `🌙 Đêm ${wName} • Sạc Đêm Chung Cư & Ca Đêm Taxi Lục Bảo`,
        `🌙 ${wName} Night • Overnight Condo Charging & Emerald EV Taxi Shift`
      );
      trafficMult = 0.85;
      evSharePct = 52 + greenGrowthBonus;
      amenityMult = 1.05;
      preferredDistricts = [5, 6, 8, 9, 10];
    } else {
      phaseLabel = L(
        `☀️ ${wName} • Giờ Hành chính: Taxi Lục Bảo & Shipper hoạt động mạnh`,
        `☀️ ${wName} • Business Hours: High Emerald EV Taxi & Courier Activity`
      );
      trafficMult = 1.25;
      evSharePct = 36 + greenGrowthBonus;
    }
  } else if (wd.idx === 5) {
    if (hour >= 18.0 && hour <= 23.5) {
      phaseLabel = L(
        `🏮 Tối Thứ 7 • Đỉnh điểm Phố Đi Bộ Hoàng Kim & Bích Hồ (+65% DV)`,
        `🏮 Saturday Night • Peak Aurum Walking Street & Azure Lake Nightlife (+65% Amenity Rev)`
      );
      trafficMult = 2.25;
      evSharePct = 42 + greenGrowthBonus;
      amenityMult = 1.65;
      iceSquatProb = 0.15;
      preferredDistricts = [0, 2, 3, 7];
    } else if (hour >= 8.0 && hour < 18.0) {
      phaseLabel = L(
        `🛍️ Thứ 7 Cuối Tuần • Mua sắm, Café Phố Cổ & Dạo Hồ`,
        `🛍️ Saturday Weekend • Shopping, Heritage Egg Café & Lake Cruise`
      );
      trafficMult = 1.75;
      evSharePct = 39 + greenGrowthBonus;
      amenityMult = 1.40;
      preferredDistricts = [0, 2, 4, 7, 8];
    } else {
      phaseLabel = L(
        `🌙 Đêm Thứ 7 • Taxi Lục Bảo chở khách đêm Khu Phố Cổ`,
        `🌙 Late Saturday • Emerald EV Taxis Serving Heritage Quarter Nightlife`
      );
      trafficMult = 0.95;
      evSharePct = 54 + greenGrowthBonus;
      preferredDistricts = [0, 2, 6, 9];
    }
  } else {
    if (hour >= 7.5 && hour <= 17.5) {
      phaseLabel = L(
        `🌳 Chủ Nhật • Dã ngoại Ven Đô (Vịnh Ngọc Trai/Bắc Ngân Hà) & Công Viên (+50% SUV)`,
        `🌳 Sunday • Suburban Resort Trip (Pearl Lagoon/North Galaxy) & Parks (+50% SUVs)`
      );
      trafficMult = 1.70;
      evSharePct = 40 + greenGrowthBonus;
      amenityMult = 1.45;
      preferredDistricts = [2, 8, 10, 11];
    } else if (hour > 17.5 && hour <= 23.5) {
      phaseLabel = L(
        `⚡ Tối Chủ Nhật • Đêm Tổng Sạc Pin Chuẩn Bị Sáng Thứ 2 (+75% Sạc!)`,
        `⚡ Sunday Evening • Citywide Pre-Monday Full Battery Recharge (+75% Charging!)`
      );
      trafficMult = 2.05;
      evSharePct = 48 + greenGrowthBonus;
      amenityMult = 1.30;
      preferredDistricts = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    } else {
      phaseLabel = L(
        `🌙 Đêm Chủ Nhật • Sạc Đầy Pin Đón Tuần Mới`,
        `🌙 Sunday Night • Overnight Charging for the New Week`
      );
      trafficMult = 0.90;
      evSharePct = 55 + greenGrowthBonus;
      preferredDistricts = [5, 6, 8, 9, 10, 11];
    }
  }

  evSharePct = Math.min(75, Math.max(25, evSharePct));
  const iceSharePct = 100 - evSharePct;

  return {
    weekdayIdx: wd.idx,
    weekdayShort: wShort,
    weekdayName: wName,
    isWeekend: wd.isWeekend,
    phaseLabel,
    trafficMult,
    evSharePct,
    iceSharePct,
    amenityMult,
    iceSquatProb,
    preferredDistricts
  };
}


export function processDailyDebtAndCalendar() {
  state.lots.forEach(lot => {
    if (!lot.owned) return;
    if (lot.debtPrincipal > 0) {
      const dailyPenalty = Math.round(lot.debtPrincipal * 0.0003);
      lot.debtInterest = (lot.debtInterest || 0) + dailyPenalty;
      lot.debtDaysOverdue = (lot.debtDaysOverdue || 0) + 1;

      if (lot.debtDaysOverdue >= 360 && !lot.lockedByDebt) {
        lot.lockedByDebt = true;
        lot.bays.forEach(b => {
          b.car = null;
          b.incomingCarId = null;
        });
        logEvent(L(`🔒 NIÊM PHONG: ${getLotDisplayName(lot)} nợ quá hạn 360 ngày! Lô đất bị khóa cho đến khi thanh toán.`, `🔒 SEALED: ${getLotDisplayName(lot)} is 360 days overdue! Station locked until debt is paid.`));
      }
    }
  });

  if (state.dayOfMonth >= 30) {
    processMonthlyBilling();
    if (state.month >= 12) {
      processAnnualTaxSettlement();
      state.month = 1;
      state.year += 1;
      state.yearlyGrossRevenue = 0;
      state.yearlyOperatingProfit = 0;
      state.yearlyPrepaidTax = 0;
    } else {
      state.month += 1;
    }
    state.dayOfMonth = 1;
  } else {
    state.dayOfMonth += 1;
  }
  state.totalDaysElapsed += 1;
  // Làm mới giới hạn lượt xem Quảng Cáo Nhận Quà khi bước sang ngày mới
  if (state.adRewards) {
    state.adRewards.cashUsed = 0;
    state.adRewards.gcUsed = 0;
    state.adRewards.x2Used = 0;
    state.adRewards.boxUsed = 0;
  }
  // Trao thưởng Đua Top Bảng Xếp Hạng tự động vào mỗi cuối tuần (7 ngày/lần - tối Chủ Nhật)
  if (state.totalDaysElapsed % 7 === 0 && typeof processWeeklyLeaderboardReward === "function") {
    processWeeklyLeaderboardReward(false);
  }
  refreshAllUI();
}


// Đăng ký vào globalThis để tương thích ngược với HTML event handlers & các module liên kết
Object.assign(globalThis, {
  getHanoiWeeklyTimelineState,
  processDailyDebtAndCalendar
});
