/**
 * src/data/skin-catalog.js
 * Danh mục Công cụ VIP GreenCoin, Vật phẩm công nghệ & 3 Skin Trạm sạc
 */
// DANH MỤC GREENCOIN (🪙 GC): VIP TOOLS (KHÔNG CÓ TUA THỜI GIAN CHỐNG GIAN LẬN), VẬT PHẨM & SKIN TRẠM SẠC 3D
export const GREENCOIN_TOOLS_CATALOG = [
  {
    id: "tool_instant_charge",
    icon: "⚡",
    name: "Siêu Tụ Điện Bơm Đầy Pin Mọi Xe Ngay Lập Tức",
    nameEn: "Quantum Hyper-Charge All Active EVs Instantly",
    gcCost: 10,
    desc: "Sạc đầy 100% pin ngay lập tức cho toàn bộ xe điện đang cắm sạc tại mọi trạm của bạn + thưởng hiệu suất +25,000 G$ (Không tua thời gian Server)!",
    descEn: "Instantly completes 100% charging for all EVs plugged in across your stations + awards +25,000 G$ performance bonus (No server time warp)!"
  },
  {
    id: "tool_ai_sweep",
    icon: "🚓",
    name: "Đội Đặc Nhiệm Cứu Hộ & Bảo Vệ AI Toàn Bản Đồ",
    nameEn: "Citywide AI Tow & Security Sweep",
    gcCost: 8,
    desc: "Quét toàn bộ 5.400 lô: Đuổi sạch mọi xe xăng đỗ lấn chỗ, thu phạt xe điện quá giờ ngay lập tức & thưởng +15,000 G$!",
    descEn: "Sweeps all 5,400 lots: Evicts all gas squatters, collects all EV overstay fines & awards +15,000 G$!"
  },
  {
    id: "tool_weather_boost",
    icon: "☀️",
    name: "Vệ Tinh Điều Khiển Thời Tiết & Kích Cầu Sạc",
    nameEn: "Weather Control Satellite & Traffic Surge",
    gcCost: 5,
    desc: "Chuyển đổi thời tiết theo ý muốn + kích hoạt Sự kiện Đô thị tăng +45% nhu cầu sạc & tiện ích trong 120s!",
    descEn: "Cycle weather mode + trigger a 120s City Event boosting charging & amenity demand by +45%!"
  },
  {
    id: "tool_capital_inject",
    icon: "💵",
    name: "Gói Giải Ngân Quỹ Xanh Cấp Tốc (+150,000 G$)",
    nameEn: "Express Green Fund Injection (+150,000 G$)",
    gcCost: 25,
    desc: "Quy đổi 25 GreenCoin nhận ngay +150,000 GreenDollar (G$) tiền mặt để thâu tóm Sổ Đỏ & đấu giá!",
    descEn: "Exchange 25 GreenCoin for +150,000 GreenDollar (G$) instant capital for land acquisition & auctions!"
  }
];

export const GREENCOIN_ITEMS_CATALOG = [
  {
    id: "item_quantum_core",
    icon: "🔋",
    name: "Lõi Siêu Tụ Điện Quantum (Vĩnh viễn)",
    nameEn: "Quantum Super-Capacitor Core (Permanent)",
    gcCost: 35,
    desc: "Tăng vĩnh viễn +35% tốc độ sạc (kW) và +20% biên lợi nhuận sạc điện (G$/kWh) trên toàn hệ thống!",
    descEn: "Permanently boosts charging speed by +35% (kW) and charging profit margin by +20% (G$/kWh) across all stations!"
  },
  {
    id: "item_mega_pr",
    icon: "📢",
    name: "Chiến Dịch Đại Sứ Thương Hiệu NovaVerde (Vĩnh viễn)",
    nameEn: "NovaVerde Brand Ambassador Mega-PR (Permanent)",
    gcCost: 40,
    desc: "Tăng vĩnh viễn +25 điểm thu hút 🚕Taxi & 🚗Xe gia đình cho mọi lô đất bạn sở hữu!",
    descEn: "Permanently adds +25 Appeal points for both 🚕Taxis & 🚗Private EVs across all your owned lots!"
  },
  {
    id: "item_solar_nano",
    icon: "☀️",
    name: "Màng Phủ Nano Quang Điện Gen-3 (Vĩnh viễn)",
    nameEn: "Gen-3 Nano Solar Coating (Permanent)",
    gcCost: 45,
    desc: "Giảm vĩnh viễn 50% chi phí thuê đất & thuế môn bài dịch vụ hàng tháng cho mọi trạm sạc!",
    descEn: "Permanently cuts monthly land lease rent & service license taxes by 50% across all stations!"
  },
  {
    id: "item_ai_guard_net",
    icon: "🤖",
    name: "Camera AI Tự Động Đuổi Xe Xăng Toàn Mạng Lưới",
    nameEn: "AI Camera Auto-Evict Gas Squatters Network",
    gcCost: 60,
    desc: "Mọi trạm sạc chưa thuê Bảo vệ cũng tự động phát loa đuổi Xe Xăng đỗ lấn chỗ sau 2 giây!",
    descEn: "Automatically evicts Gas Cars blocking EV bays within 2 seconds even at stations without a human Guard!"
  }
];

export const STATION_SKINS_CATALOG = [
  {
    id: "skin_emerald",
    icon: "🌿",
    crestIcon: "⚡",
    name: "Skin Mặc Định: Ngọc Lục Bảo Cổ Điển",
    nameEn: "Default Skin: Classic Emerald Canopy",
    gcCost: 0,
    appealBonus: 0,
    amenityRevMult: 1.0,
    bevelLeft: "#10b981",
    bevelFront: "#059669",
    bevelStroke: "#064e3b",
    glassFill: "rgba(37, 99, 235, 0.88)",
    glassStroke: "#6ee7b7",
    crestBg: "#6ee7b7",
    crestCircle: "#059669",
    curtainRgb: "16, 185, 129",
    curtainBorder: "#34d399",
    desc: "Mái pin mặt trời Sapphire xanh ngọc tiêu chuẩn của mạng lưới trạm sạc đô thị.",
    descEn: "Standard Sapphire solar canopy with Emerald glowing perimeter walls."
  },
  {
    id: "skin_royal_gold",
    icon: "👑",
    crestIcon: "👑",
    name: "Skin Hoàng Gia: Mái Vàng Ròng 24K Imperial",
    nameEn: "Imperial Skin: 24K Royal Gold Canopy",
    gcCost: 80,
    appealBonus: 12,
    amenityRevMult: 1.10,
    bevelLeft: "#f59e0b",
    bevelFront: "#d97706",
    bevelStroke: "#78350f",
    glassFill: "rgba(180, 83, 9, 0.90)",
    glassStroke: "#fef08a",
    crestBg: "#fef08a",
    crestCircle: "#b45309",
    curtainRgb: "245, 158, 11",
    curtainBorder: "#fde047",
    desc: "Mái Solar mạ vàng 24K + Hào quang Kim Hoàng 3D + Vương miện đỉnh mái (+12đ thu hút & +10% doanh thu tiện ích)!",
    descEn: "24K Gold-plated Solar Canopy + Golden 3D aura walls + Royal Crown crest (+12pt appeal & +10% amenity revenue)!"
  },
  {
    id: "skin_cyber_plasma",
    icon: "🔮",
    crestIcon: "🔮",
    name: "Skin Tương Lai: Cyberpunk Tím Neon Plasma",
    nameEn: "Futuristic Skin: Cyberpunk Neon Plasma",
    gcCost: 120,
    appealBonus: 20,
    amenityRevMult: 1.20,
    bevelLeft: "#a855f7",
    bevelFront: "#7e22ce",
    bevelStroke: "#3b0764",
    glassFill: "rgba(88, 28, 135, 0.90)",
    glassStroke: "#67e8f9",
    crestBg: "#e879f9",
    crestCircle: "#6b21a8",
    curtainRgb: "168, 85, 247",
    curtainBorder: "#f0abfc",
    desc: "Mái năng lượng Tím Plasma viền Cyan phát sáng + Tinh cầu Quantum trên đỉnh mái (+20đ thu hút & +20% doanh thu tiện ích)!",
    descEn: "Glowing Purple Plasma & Cyan energy canopy + Quantum Orb crest (+20pt appeal & +20% amenity revenue)!"
  },
  {
    id: "skin_lotus_ruby",
    icon: "🏮",
    crestIcon: "🏮",
    name: "Skin Di Sản: Hồng Ngọc Sen Vàng Hoàng Kim",
    nameEn: "Heritage Skin: Aurum Ruby & Golden Lotus",
    gcCost: 100,
    appealBonus: 15,
    amenityRevMult: 1.15,
    bevelLeft: "#e11d48",
    bevelFront: "#be123c",
    bevelStroke: "#4c0519",
    glassFill: "rgba(159, 18, 57, 0.90)",
    glassStroke: "#fde047",
    crestBg: "#fecdd3",
    crestCircle: "#be123c",
    curtainRgb: "244, 63, 94",
    curtainBorder: "#fda4af",
    desc: "Mái Đỏ Chu Sa viền Vàng Hoàng Cung + Đèn Lồng Đỏ 3D trên đỉnh mái (+15đ thu hút & +15% doanh thu tiện ích)!",
    descEn: "Imperial Vermilion Red & Gold canopy + 3D Red Lantern crest (+15pt appeal & +15% amenity revenue)!"
  }
];


// Đăng ký vào globalThis để tương thích ngược với HTML event handlers & các module liên kết
Object.assign(globalThis, {
  GREENCOIN_TOOLS_CATALOG,
  GREENCOIN_ITEMS_CATALOG,
  STATION_SKINS_CATALOG
});
