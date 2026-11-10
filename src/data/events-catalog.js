/**
 * src/data/events-catalog.js
 * Chu kỳ 7 ngày trong tuần, Sự kiện Đô thị & Tiêu đề các Tab điều khiển
 */
export const HANOI_WEEKDAYS = [
  { idx: 0, short: "T2", shortEn: "Mon", name: "Thứ 2", nameEn: "Monday", isWeekend: false },
  { idx: 1, short: "T3", shortEn: "Tue", name: "Thứ 3", nameEn: "Tuesday", isWeekend: false },
  { idx: 2, short: "T4", shortEn: "Wed", name: "Thứ 4", nameEn: "Wednesday", isWeekend: false },
  { idx: 3, short: "T5", shortEn: "Thu", name: "Thứ 5", nameEn: "Thursday", isWeekend: false },
  { idx: 4, short: "T6", shortEn: "Fri", name: "Thứ 6", nameEn: "Friday", isWeekend: false },
  { idx: 5, short: "T7", shortEn: "Sat", name: "Thứ 7", nameEn: "Saturday", isWeekend: true },
  { idx: 6, short: "CN", shortEn: "Sun", name: "Chủ Nhật", nameEn: "Sunday", isWeekend: true }
];


export const TAB_TITLES = {
  "tab-lot-detail": "🔌 QUY HOẠCH M² ĐẤT & TRỤ SẠC",
  "tab-lot-amenities": "☕ TỔ HỢP TIỆN ÍCH 2.5D TRÊN SÂN",
  "tab-all-lots": "🏙️ ĐẠI ĐÔ THỊ NOVAVERDE 5.400 LÔ ĐẤT (12 QUẬN × 36 PHƯỜNG)",
  "tab-rivals": "🏆 BẢNG XẾP HẠNG ĐUA TOP, SÀN ĐẤU GIÁ SỔ ĐỎ & ĐỐI THỦ",
  "tab-finance": "🧾 THUẾ KINH DOANH, THUẾ NĂM & SỔ ĐỐI SOÁT"
};

export const TAB_TITLES_EN = {
  "tab-lot-detail": "🔌 LAND AREA M² & EV CHARGER BAYS",
  "tab-lot-amenities": "☕ 3D STATION AMENITIES & SERVICES",
  "tab-all-lots": "🏙️ NOVAVERDE 5,400 LOTS (12 DISTRICTS × 36 WARDS OPEN WORLD)",
  "tab-rivals": "🏆 LEADERBOARD, LAND AUCTION & RIVAL STATIONS",
  "tab-finance": "🧾 BUSINESS TAXES, ANNUAL CIT & FINANCIAL LEDGER"
};


// Đăng ký vào globalThis để tương thích ngược với HTML event handlers & các module liên kết
Object.assign(globalThis, {
  HANOI_WEEKDAYS,
  TAB_TITLES,
  TAB_TITLES_EN
});
