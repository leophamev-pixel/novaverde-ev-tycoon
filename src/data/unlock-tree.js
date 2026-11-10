/**
 * src/data/unlock-tree.js
 * ĐỒ THỊ CÂY CÔNG NGHỆ & MỞ KHÓA TIẾN TRÌNH (TECH & UNLOCK TREE DAG — BƯỚC 2.2 BÁO CÁO)
 * Định nghĩa cấu trúc đồ thị có hướng (DAG) cho 2 nhánh:
 * 1. Nhánh Công Nghệ Trụ Sạc: AC 11kW -> DC 30kW -> DC 60kW -> Siêu Trụ 120kW
 * 2. Nhánh Chuỗi Tiện Ích:
 *    - Trà Đá (Lv1) -> Quán Café Cổ Điển (yêu cầu Trà Đá Lv2) -> Nhà Ăn Phở Bò (yêu cầu Café Lv2) -> Nhà Hàng Sân Vườn (yêu cầu Nhà Ăn Lv2 + Phòng Nghỉ Lv2)
 *    - Tủ Đổi Pin (Lv1) -> Phòng Nghỉ Tài Xế VIP (yêu cầu Đổi Pin Lv1)
 */

export const UNLOCK_TREE_DAG = [
  // ================= NHÁNH 1: CÔNG NGHỆ TRỤ SẠC (CHARGER TECH BRANCH) =================
  {
    id: "tech_charger_t1",
    category: "charger",
    targetTier: 1,
    icon: "🔌",
    name: "Trụ Sạc AC Eco 11kW",
    nameEn: "AC Eco 11kW Charger",
    parents: [],
    defaultUnlocked: true,
    researchCostVnd: 0,
    reqReputation: 0,
    reqDesc: "Mở sẵn khi khởi nghiệp",
    reqDescEn: "Unlocked by default at start",
    benefitDesc: "Cho phép lắp đặt trụ sạc tiêu chuẩn AC 11kW.",
    benefitDescEn: "Allows installing standard AC 11kW chargers."
  },
  {
    id: "tech_charger_t2",
    category: "charger",
    targetTier: 2,
    icon: "⚡",
    name: "Công Nghệ Sạc Nhanh DC 30kW",
    nameEn: "DC Fast 30kW Tech",
    parents: ["tech_charger_t1"],
    defaultUnlocked: false,
    researchCostVnd: 12000000, // 12,000 G$ (hoặc tự mở khi có >= 2 trụ AC 11kW)
    reqReputation: 0,
    reqBaysCount: 2,
    reqBaysMinTier: 1,
    reqDesc: "Sở hữu ≥ 2 trụ AC 11kW (hoặc nghiên cứu 12,000 G$)",
    reqDescEn: "Own ≥ 2 AC 11kW bays (or research for 12,000 G$)",
    benefitDesc: "Mở khóa nâng cấp Trụ DC Nhanh 30kW (tốc độ sạc gấp 2.7 lần).",
    benefitDescEn: "Unlocks upgrading bays to DC Fast 30kW (2.7x charging speed)."
  },
  {
    id: "tech_charger_t3",
    category: "charger",
    targetTier: 3,
    icon: "🚀",
    name: "Trạm Biến Áp Cao Áp DC 60kW",
    nameEn: "High-Voltage DC 60kW Tech",
    parents: ["tech_charger_t2"],
    defaultUnlocked: false,
    researchCostVnd: 28000000, // 28,000 G$
    reqReputation: 15,
    reqBaysCount: 2,
    reqBaysMinTier: 2,
    reqDesc: "Cần mở DC 30kW + có ≥ 2 trụ DC 30kW (hoặc 15⭐ Danh tiếng + 28K G$)",
    reqDescEn: "Requires DC 30kW + ≥ 2 DC 30kW bays (or 15⭐ Rep + 28K G$)",
    benefitDesc: "Mở khóa Trụ DC Cao Cấp 60kW chuyên trị dòng xe Taxi VIP & SUV.",
    benefitDescEn: "Unlocks DC 60kW chargers for VIP Taxis & SUVs."
  },
  {
    id: "tech_charger_t4",
    category: "charger",
    targetTier: 4,
    icon: "💎",
    name: "Siêu Trụ Làm Mát Chất Lỏng 120kW",
    nameEn: "Liquid-Cooled 120kW Supercharger",
    parents: ["tech_charger_t3"],
    defaultUnlocked: false,
    researchCostVnd: 55000000, // 55,000 G$
    reqReputation: 35,
    reqBaysCount: 2,
    reqBaysMinTier: 3,
    reqDesc: "Cần mở DC 60kW + có ≥ 2 trụ DC 60kW (hoặc 35⭐ Danh tiếng + 55K G$)",
    reqDescEn: "Requires DC 60kW + ≥ 2 DC 60kW bays (or 35⭐ Rep + 55K G$)",
    benefitDesc: "Mở khóa Siêu Trụ 120kW — tốc độ sạc cực đại, +15% điểm thu hút toàn trạm.",
    benefitDescEn: "Unlocks 120kW Superchargers — max speed & +15% station appeal."
  },

  // ================= NHÁNH 2: CHUỖI TIỆN ÍCH ĐÔ THỊ (AMENITY DAG BRANCH) =================
  {
    id: "tech_am_tra_da",
    category: "amenity",
    targetAmenityId: "tra_da",
    icon: "🍵",
    name: "Quầy Trà Đá Vỉa Hè",
    nameEn: "Sidewalk Iced Tea Kiosk",
    parents: [],
    defaultUnlocked: true,
    researchCostVnd: 0,
    reqReputation: 0,
    reqDesc: "Mở sẵn khi khởi nghiệp",
    reqDescEn: "Unlocked by default at start",
    benefitDesc: "Tiện ích cơ bản 6m², thu hút tài xế Taxi bình dân (+18 điểm).",
    benefitDescEn: "Starter 6m² kiosk, attracts EV Taxis (+18 appeal)."
  },
  {
    id: "tech_am_doi_pin",
    category: "amenity",
    targetAmenityId: "doi_pin",
    icon: "🔋",
    name: "Tủ Đổi Pin EcoVolt",
    nameEn: "EcoVolt Battery Swap Cabinet",
    parents: [],
    defaultUnlocked: true,
    researchCostVnd: 0,
    reqReputation: 0,
    reqDesc: "Mở sẵn khi khởi nghiệp",
    reqDescEn: "Unlocked by default at start",
    benefitDesc: "Tủ đổi pin 12m² phục vụ xe máy điện & shipper (+22 điểm).",
    benefitDescEn: "12m² battery swap station for e-scooters & delivery riders."
  },
  {
    id: "tech_am_cafe",
    category: "amenity",
    targetAmenityId: "cafe",
    icon: "☕",
    name: "Quán Café Cổ Điển Phố Cổ",
    nameEn: "Heritage Egg Coffee Roastery",
    parents: ["tech_am_tra_da"],
    defaultUnlocked: false,
    researchCostVnd: 15000000,
    reqReputation: 10,
    reqAmenityId: "tra_da",
    reqAmenityLevel: 2,
    reqDesc: "Cần nâng cấp Quầy Trà Đá lên Cấp 2 (hoặc nghiên cứu 15,000 G$)",
    reqDescEn: "Requires Iced Tea Kiosk Lv2 (or research for 15,000 G$)",
    benefitDesc: "Mở khóa xây dựng Quán Café Cổ Điển (+28,000 G$/xe).",
    benefitDescEn: "Unlocks building Heritage Egg Coffee Roastery (+28,000 G$/car)."
  },
  {
    id: "tech_am_phong_nghi",
    category: "amenity",
    targetAmenityId: "phong_nghi",
    icon: "🛋️",
    name: "Phòng Nghỉ Tài Xế Máy Lạnh VIP",
    nameEn: "VIP Driver AC Lounge",
    parents: ["tech_am_doi_pin"],
    defaultUnlocked: false,
    researchCostVnd: 18000000,
    reqReputation: 12,
    reqAmenityId: "doi_pin",
    reqAmenityLevel: 1,
    reqDesc: "Cần lắp Tủ Đổi Pin Cấp 1 (hoặc nghiên cứu 18,000 G$)",
    reqDescEn: "Requires Battery Swap Lv1 (or research for 18,000 G$)",
    benefitDesc: "Mở khóa Phòng Nghỉ Tài Xế VIP (+26 điểm hút Taxi).",
    benefitDescEn: "Unlocks VIP Driver AC Lounge (+26 Taxi appeal)."
  },
  {
    id: "tech_am_nha_an",
    category: "amenity",
    targetAmenityId: "nha_an",
    icon: "🍜",
    name: "Nhà Ăn Canteen Phở Bò",
    nameEn: "Artisan Beef Pho Canteen",
    parents: ["tech_am_cafe"],
    defaultUnlocked: false,
    researchCostVnd: 32000000,
    reqReputation: 25,
    reqAmenityId: "cafe",
    reqAmenityLevel: 2,
    reqDesc: "Cần nâng cấp Quán Café lên Cấp 2 (Café Lv2 ➔ Nhà Ăn)",
    reqDescEn: "Requires Egg Coffee Roastery Lv2 (Café Lv2 ➔ Canteen)",
    benefitDesc: "Mở khóa Nhà Ăn Phở Bò (+42,000 G$/xe, +32 điểm hút Taxi).",
    benefitDescEn: "Unlocks Beef Pho Canteen (+42,000 G$/car, +32 Taxi appeal)."
  },
  {
    id: "tech_am_nha_hang",
    category: "amenity",
    targetAmenityId: "nha_hang",
    icon: "🍽️",
    name: "Nhà Hàng Sân Vườn Bistro",
    nameEn: "Luxury Garden Bistro Restaurant",
    parents: ["tech_am_nha_an", "tech_am_phong_nghi"],
    defaultUnlocked: false,
    researchCostVnd: 60000000,
    reqReputation: 50,
    reqAmenityId: "nha_an",
    reqAmenityLevel: 2,
    reqDesc: "Cần Nhà Ăn Phở Bò Cấp 2 + Phòng Nghỉ VIP (hoặc nghiên cứu 60K G$)",
    reqDescEn: "Requires Pho Canteen Lv2 + VIP Lounge (or research for 60K G$)",
    benefitDesc: "Mở khóa đỉnh cao ẩm thực Nhà Hàng Sân Vườn (+75,000 G$/xe).",
    benefitDescEn: "Unlocks top-tier Luxury Garden Bistro (+75,000 G$/car)."
  }
];

Object.assign(globalThis, { UNLOCK_TREE_DAG });
