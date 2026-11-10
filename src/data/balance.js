/**
 * src/data/balance.js
 * BẢNG CÂN BẰNG KINH TẾ & THÔNG SỐ MÔ PHỎNG TẬP TRUNG (GAME BALANCE CONFIGURATION)
 * Mọi con số cân bằng của game đều được định nghĩa và giải thích rõ tại đây.
 */

// 1. Khóa lưu trữ LocalStorage mặc định
export const SAVE_STORAGE_KEY = "HOAN_KIEM_EV_TYCOON_SAVE_V6_150_BALANCED";

// 2. Quy chuẩn Diện tích Vật lý của Trạm Sạc (m²)
export const INFRA_BASE_M2 = 10;          // 10 m² diện tích tủ điện hạ thế & lối đi kỹ thuật cơ sở
export const M2_PER_CHARGER_BAY = 20;     // 20 m² cho mỗi chuồng đỗ xe + trụ sạc tiêu chuẩn

// 3. Chi phí Đầu tư Trụ Sạc & Chuyển đổi Mô hình Kinh doanh (Đơn vị nội bộ: 1,000 = 1 G$)
export const GREEN_DOLLAR_UNIT = 1000;    // 1 G$ hiển thị = 1,000 đơn vị nội bộ
export const USD_EXCHANGE_RATE = 25000;   // Tỷ giá quy đổi tham chiếu
export const NEW_BAY_INSTALL_COST = 15000000;       // 15,000 G$ chi phí lắp trụ tiêu chuẩn
export const FRANCHISE_BAY_INSTALL_COST = 10000000; // 10,000 G$/trụ (Mô hình Nhượng quyền: hãng trợ giá ~45%)
export const DIRECT_BAY_INSTALL_COST = 18000000;    // 18,000 G$/trụ (Mô hình Tự doanh 100% vốn)
export const DIRECT_TRANSFORMER_FEE = 15000000;     // 15,000 G$ phí trạm biến áp riêng khi lên Tự doanh

// 4. Biên lợi nhuận bán điện trên mỗi kWh (Margin per kWh)
// - Lý do chọn 750 (0.75 G$/kWh) cho Nhượng quyền: Vốn đầu tư ban đầu thấp, thu hồi vốn an toàn sau ~180 lượt sạc.
// - Lý do chọn 1350 (1.35 G$/kWh) cho Tự doanh: Biên lãi cao hơn +80% để thưởng cho người chơi bỏ vốn nâng cấp trạm biến áp.
export const FRANCHISE_MARGIN_PER_KWH = 750;        // +0.75 G$/kWh
export const DIRECT_MARGIN_PER_KWH = 1350;          // +1.35 G$/kWh

// 5. Thông số Góc chiếu Đồ họa Isometric 2.5D & Giao thông
export const ISO_ROT_RAD = -0.66;         // Góc xoay bản đồ Isometric (-38 độ)
export const ISO_SCALE_Y = 0.58;          // Tỷ lệ nén trục dọc Y tạo chiều sâu 2.5D
export const LANE_OFFSET = 9.5;           // Khoảng cách lệch làn đường bên phải (px)
export const STOP_LINE_DIST = 30;         // Khoảng cách vạch dừng đèn đỏ tại ngã tư (px)

// 6. Kích thước Thế giới Mở 12 Quận / 36 Phường (World Bounds)
export const SECTOR_SPAN_X = 3960;
export const SECTOR_SPAN_Y = 3740;
export const WORLD_BOUNDS = { minX: -10140, maxX: 14100, minY: -9460, maxY: 13200 };

// 7. Thông số Cân bằng Thu nhập Offline & Thuế Doanh nghiệp (CIT)
export const OFFLINE_MAX_HOURS_CAP = 12;            // Tối đa 12 giờ tích lũy Offline mỗi phiên
export const OFFLINE_MIN_FLOOR_PER_BAY_PER_MIN = 280000; // Đảm bảo tối thiểu 280 G$/phút/trụ đang hoạt động
export const STARTER_MONEY_VND = 65000000;          // 65,000 G$ vốn khởi nghiệp ban đầu
export const STARTER_GREEN_COINS = 250;             // 250 GC khởi nghiệp

export const BALANCE_SUMMARY = {
  SAVE_STORAGE_KEY,
  INFRA_BASE_M2,
  M2_PER_CHARGER_BAY,
  GREEN_DOLLAR_UNIT,
  USD_EXCHANGE_RATE,
  NEW_BAY_INSTALL_COST,
  FRANCHISE_BAY_INSTALL_COST,
  DIRECT_BAY_INSTALL_COST,
  DIRECT_TRANSFORMER_FEE,
  FRANCHISE_MARGIN_PER_KWH,
  DIRECT_MARGIN_PER_KWH,
  ISO_ROT_RAD,
  ISO_SCALE_Y,
  LANE_OFFSET,
  STOP_LINE_DIST,
  SECTOR_SPAN_X,
  SECTOR_SPAN_Y,
  WORLD_BOUNDS,
  OFFLINE_MAX_HOURS_CAP,
  OFFLINE_MIN_FLOOR_PER_BAY_PER_MIN,
  STARTER_MONEY_VND,
  STARTER_GREEN_COINS
};

Object.assign(globalThis, BALANCE_SUMMARY, { BALANCE_SUMMARY });
