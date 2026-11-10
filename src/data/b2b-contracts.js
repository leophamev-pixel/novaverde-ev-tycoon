/**
 * src/data/b2b-contracts.js
 * Danh mục Hợp đồng Đội xe B2B, Cổ phần Siêu Trạm Liên Minh & Cấu hình Slot Quảng cáo
 */
export const SPONSOR_BANNERS_POOL = [
  {
    brand: "EcoBank Green EV Credit",
    titleVi: "🏦 Vay Vốn Mở Trạm Sạc Lãi Suất 0% • Giải Ngân 35,000 G$!",
    titleEn: "🏦 0% APR Green EV Station Credit • Instant 35,000 G$ Grant!",
    ctaVi: "🎬 Xem Quảng Cáo",
    ctaEn: "🎬 Watch Ad",
    bg: "linear-gradient(90deg, #064e3b, #047857)",
    border: "#34d399",
    adType: "ad_cash"
  },
  {
    brand: "VinaVolt Solar & Battery",
    titleVi: "☀️ Pin Mặt Trời Nano & Tủ Đổi Pin Siêu Tốc • Tặng 15 GC!",
    titleEn: "☀️ Nano Solar Canopy & Hyper Battery Swap • Claim +15 GC!",
    ctaVi: "🎬 Nhận +15 GC",
    ctaEn: "🎬 Claim +15 GC",
    bg: "linear-gradient(90deg, #78350f, #b45309)",
    border: "#fbbf24",
    adType: "ad_gc"
  },
  {
    brand: "JadeCab Pro Fleet Partner",
    titleVi: "🚕 Kết Nối Đội Xe Taxi Lục Bảo • Nhân Đôi (X2) Doanh Thu 3 Phút!",
    titleEn: "🚕 JadeCab EV Taxi Priority Dispatch • 2X Revenue for 3 Mins!",
    ctaVi: "🎬 Kích Hoạt X2",
    ctaEn: "🎬 Activate 2X",
    bg: "linear-gradient(90deg, #0c4a6e, #0284c7)",
    border: "#38bdf8",
    adType: "ad_x2"
  }
];

export const REWARDED_AD_SLOTS_CONFIG = [
  {
    id: "ad_cash",
    icon: "💵",
    name: "AdMob Tiếp Vốn Khẩn Cấp (+35,000 G$)",
    nameEn: "AdMob Emergency Capital (+35,000 G$)",
    desc: "Xem quảng cáo Google AdMob Rewarded Video để nhận +35,000 G$ vào quỹ tiền mặt mở đất & lắp trụ.",
    descEn: "Watch a Google AdMob Rewarded Video to receive +35,000 G$ cash for land & chargers.",
    dailyLimit: 5,
    usedKey: "cashUsed",
    iosAdUnitId: "ca-app-pub-7182007818337262/9536750608",
    androidAdUnitId: "ca-app-pub-7182007818337262/4507785207",
    badgeVi: "+35,000 G$",
    badgeEn: "+35,000 G$"
  },
  {
    id: "ad_gc",
    icon: "🪙",
    name: "AdMob Săn Xu GreenCoin (+15 GC)",
    nameEn: "AdMob GreenCoin Reward (+15 GC)",
    desc: "Xem quảng cáo Google AdMob Rewarded Video để nhận +15 GC miễn phí (Tối đa 45 GC/ngày).",
    descEn: "Watch a Google AdMob Rewarded Video to earn +15 GC free (Up to 45 GC/day).",
    dailyLimit: 3,
    usedKey: "gcUsed",
    iosAdUnitId: "ca-app-pub-7182007818337262/9536750608",
    androidAdUnitId: "ca-app-pub-7182007818337262/4507785207",
    badgeVi: "+15 GC",
    badgeEn: "+15 GC"
  },
  {
    id: "ad_x2",
    icon: "⚡",
    name: "AdMob Kích Hoạt X2 Doanh Thu (3 Phút)",
    nameEn: "AdMob 2X Revenue Boost (3 Mins)",
    desc: "Xem quảng cáo Google AdMob để nhân đôi (×2.0) toàn bộ tiền sạc điện & tiện ích trong 180 giây!",
    descEn: "Watch a Google AdMob video to double (2.0×) all EV charging & amenity revenue for 180 seconds!",
    dailyLimit: 3,
    usedKey: "x2Used",
    iosAdUnitId: "ca-app-pub-7182007818337262/9536750608",
    androidAdUnitId: "ca-app-pub-7182007818337262/4507785207",
    badgeVi: "⚡ X2 Doanh Thu (180s)",
    badgeEn: "⚡ 2X Revenue (180s)"
  },
  {
    id: "ad_box",
    icon: "🎁",
    name: "AdMob Hộp Quà Bí Ẩn (Lucky Box)",
    nameEn: "AdMob Mystery Gift Box (Lucky Box)",
    desc: "Xem quảng cáo Google AdMob mở ngẫu nhiên: 25,000–60,000 G$, 12–30 GC hoặc Dọn sạch xe đỗ lấn!",
    descEn: "Watch a Google AdMob video to randomly win: 25,000–60,000 G$, 12–30 GC, or Squatter Sweep!",
    dailyLimit: 2,
    usedKey: "boxUsed",
    iosAdUnitId: "ca-app-pub-7182007818337262/9536750608",
    androidAdUnitId: "ca-app-pub-7182007818337262/4507785207",
    badgeVi: "🎁 Quà Ngẫu Nhiên",
    badgeEn: "🎁 Mystery Prize"
  }
];


export const B2B_CONTRACTS_CATALOG = [
  {
    id: "xanh_taxi_300",
    name: "🚕 Hợp Đồng Đội Xe Taxi Lục Bảo (300 Xe)",
    nameEn: "🚕 Emerald EV Taxi Fleet Contract (300 Cars)",
    reqChargers: 3,
    signingFee: 25000000,
    dailyBonusVnd: 8500000,
    desc: "Cam kết tối thiểu 3 trụ sạc hoạt động. Nhận cố định +8,500 G$/ngày & +25% luồng xe Taxi!",
    descEn: "Requires 3+ active chargers. Receive fixed +8,500 G$/day & +25% Emerald EV Taxi flow!"
  },
  {
    id: "ho_guom_tour_ev",
    name: "🚌 Tuyến Xe Điện Du Lịch Hoàng Kim - Hồ Tinh Cầu",
    nameEn: "🚌 Aurum - Starlight Lake EV Shuttle Line",
    reqChargers: 5,
    signingFee: 45000000,
    dailyBonusVnd: 16500000,
    desc: "Cam kết tối thiểu 5 trụ sạc. Nhận cố định +16,500 G$/ngày từ hợp đồng sạc đêm!",
    descEn: "Requires 5+ active chargers. Receive fixed +16,500 G$/day from overnight shuttle charging!"
  },
  {
    id: "e_express_logistics",
    name: "📦 Đội Xe Giao Hàng Nội Đô E-Express",
    nameEn: "📦 E-Express Urban Delivery Fleet",
    reqChargers: 8,
    signingFee: 80000000,
    dailyBonusVnd: 32000000,
    desc: "Cam kết tối thiểu 8 trụ sạc. Nhận cố định +32,000 G$/ngày cho toàn mạng lưới!",
    descEn: "Requires 8+ active chargers. Receive fixed +32,000 G$/day across your charging network!"
  }
];


export const GUILD_MEGA_HUBS = [
  { id: "HUB_RING3_CAUGIAY", name: "⚡ Siêu Trạm Vành Đai 3 - Silicon CBD (30×240kW)", nameEn: "⚡ Ring Road 3 - Silicon CBD Mega-Hub (30×240kW)", shareCost: 35000000, dailyDividend: 4200000, desc: "Nút giao cao tốc Vành Đai 3: Góp cổ phần Liên Minh (tối đa 5 cổ phần/người) nhận cổ tức +4,200 G$/ngày!", descEn: "Ring Road 3 Expressway Node: Buy Guild Shares (max 5/CEO) for +4,200 G$/day dividend!" },
  { id: "HUB_METRO_CATLINH", name: "🚇 Siêu Trạm Ga SkyTrain - Làng Lụa (30×240kW)", nameEn: "🚇 SkyTrain - Silk District Mega-Hub (30×240kW)", shareCost: 30000000, dailyDividend: 3600000, desc: "Trung tâm trung chuyển SkyTrain & Taxi Điện: Nhận cổ tức Liên Minh +3,600 G$/ngày!", descEn: "SkyTrain & EV Taxi Transit Hub: Receive +3,600 G$/day Guild dividend!" },
  { id: "HUB_NHATTAN_BRIDGE", name: "🌉 Siêu Trạm Cầu Dây Văng - Bắc Ngân Hà (30×240kW)", nameEn: "🌉 Cable Bridge - North Galaxy Airport Mega-Hub (30×240kW)", shareCost: 28000000, dailyDividend: 3300000, desc: "Đón trọn dòng xe Sân bay Quốc tế & Bắc Ngân Hà: Nhận cổ tức Liên Minh +3,300 G$/ngày!", descEn: "Captures International Airport & Cable Bridge traffic: Receive +3,300 G$/day dividend!" }
];


// Đăng ký vào globalThis để tương thích ngược với HTML event handlers & các module liên kết
Object.assign(globalThis, {
  SPONSOR_BANNERS_POOL,
  REWARDED_AD_SLOTS_CONFIG,
  B2B_CONTRACTS_CATALOG,
  GUILD_MEGA_HUBS
});
