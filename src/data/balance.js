/**
 * src/data/balance.js
 * BẢNG CÂN BẰNG KINH TẾ & THÔNG SỐ MÔ PHỎNG TẬP TRUNG (GAME BALANCE CONFIGURATION — GIAI ĐOẠN 2)
 * Mọi con số cân bằng của game đều được định nghĩa, giải thích lý do và lập bảng so sánh tại đây.
 *
 * =========================================================================================
 * BẢNG 1: SO SÁNH HIỆU QUẢ ĐẦU TƯ 5 CẤP TRỤ SẠC (CHARGER TIER ROI COMPARISON)
 * -----------------------------------------------------------------------------------------
 * Cấp | Tên Trụ         | Công Suất | Vốn Franchise | Vốn Direct | Tốc độ Sạc | Doanh thu/Phút (Franchise) | Thời gian Hoàn vốn
 * ----+-----------------+-----------+---------------+------------+------------+----------------------------+-------------------
 *  0  | Chưa lắp        |    0 kW   |   10,000 G$   |  18,000 G$ |   0.0x     |         0 G$/phút          |        —
 *  1  | AC Eco 11kW     |   11 kW   |   16,000 G$   |  28,000 G$ |   1.0x     |      ~180 G$/phút          |    ~55 phút chơi
 *  2  | DC Nhanh 30kW   |   30 kW   |   32,000 G$   |  56,000 G$ |   2.7x     |      ~490 G$/phút (+172%)  |    ~65 phút chơi
 *  3  | DC Cao Cấp 60kW |   60 kW   |   55,000 G$   |  95,000 G$ |   5.4x     |      ~980 G$/phút (+100%)  |    ~56 phút chơi
 *  4  | Siêu Trụ 120kW  |  120 kW   |   Cấp Tối Đa  | Cấp Tối Đa |  10.9x     |    ~1,960 G$/phút (+100%)  |    ~48 phút chơi
 *
 * =========================================================================================
 * BẢNG 2: SO SÁNH 6 LOẠI TIỆN ÍCH CẤP 1 -> CẤP 3 (AMENITY TIER COMPARISON)
 * -----------------------------------------------------------------------------------------
 * Mã         | Tên Tiện Ích          | Diện Tích (Lv1/2/3) | Doanh Thu/Xe (Lv1 -> Lv3)   | Điểm Hút Taxi | Điểm Hút Xe Thường
 * -----------+-----------------------+---------------------+-----------------------------+---------------+-------------------
 * tra_da     | Quầy Trà Đá           |   6 /  8 / 10 m²    | 12K -> 19.2K -> 26.4K G$/xe |   +18 điểm    |     +10 điểm
 * doi_pin    | Tủ Đổi Pin EcoVolt    |  12 / 16 / 20 m²    | 26K -> 41.6K -> 57.2K G$/xe |   +22 điểm    |     +14 điểm
 * cafe       | Quán Café Cổ Điển     |  16 / 21 / 26 m²    | 28K -> 44.8K -> 61.6K G$/xe |   +10 điểm    |     +28 điểm
 * phong_nghi | Phòng Nghỉ Tài Xế VIP |  18 / 23 / 29 m²    | 25K -> 40.0K -> 55.0K G$/xe |   +26 điểm    |      +8 điểm
 * nha_an     | Nhà Ăn Phở Bò         |  26 / 34 / 42 m²    | 42K -> 67.2K -> 92.4K G$/xe |   +32 điểm    |     +18 điểm
 * nha_hang   | Nhà Hàng Sân Vườn     |  38 / 49 / 61 m²    | 75K -> 120K  -> 165K  G$/xe |    +5 điểm    |     +42 điểm
 * =========================================================================================
 */

// 1. Khóa lưu trữ LocalStorage mặc định
export const SAVE_STORAGE_KEY = "HOAN_KIEM_EV_TYCOON_SAVE_V6_150_BALANCED";

// 2. Quy chuẩn Diện tích Vật lý của Trạm Sạc (m²)
// - INFRA_BASE_M2 = 10m²: Diện tích tủ điện tổng & lối đi kỹ thuật bắt buộc trên mỗi lô đất.
// - M2_PER_CHARGER_BAY = 20m²: Chuồng đỗ tiêu chuẩn 2.5m x 5.5m + hành lang mở cửa xe.
export const INFRA_BASE_M2 = 10;
export const M2_PER_CHARGER_BAY = 20;

// 3. Chi phí Đầu tư Trụ Sạc & Chuyển đổi Mô hình Kinh doanh (Đơn vị nội bộ: 1,000 = 1 G$)
export const GREEN_DOLLAR_UNIT = 1000;
export const USD_EXCHANGE_RATE = 25000;
export const NEW_BAY_INSTALL_COST = 15000000;
export const FRANCHISE_BAY_INSTALL_COST = 10000000; // 10,000 G$/trụ (Hãng trợ giá 45% vốn lắp trụ ban đầu)
export const DIRECT_BAY_INSTALL_COST = 18000000;    // 18,000 G$/trụ (Tự đầu tư 100% thiết bị)
export const DIRECT_TRANSFORMER_FEE = 15000000;     // 15,000 G$ phí hạ tầng trạm biến áp riêng khi lên Tự doanh

// 4. Biên lợi nhuận bán điện trên mỗi kWh (Margin per kWh)
// - 750 (0.75 G$/kWh) cho Nhượng quyền: Giúp người mới dễ mở rộng trụ nhưng biên lãi vừa phải.
// - 1350 (1.35 G$/kWh) cho Tự doanh: Biên lãi cao hơn +80% khi người chơi tự bỏ vốn lớn.
export const FRANCHISE_MARGIN_PER_KWH = 750;
export const DIRECT_MARGIN_PER_KWH = 1350;

// 5. Thông số Góc chiếu Đồ họa Isometric 2.5D & Giao thông
export const ISO_ROT_RAD = -0.66;
export const ISO_SCALE_Y = 0.58;
export const LANE_OFFSET = 9.5;
export const STOP_LINE_DIST = 30;

// 6. Kích thước Thế giới Mở 12 Quận / 36 Phường (World Bounds)
export const SECTOR_SPAN_X = 3960;
export const SECTOR_SPAN_Y = 3740;
export const WORLD_BOUNDS = { minX: -10140, maxX: 14100, minY: -9460, maxY: 13200 };

// 7. Thông số Cân bằng Thu nhập Offline & Vốn Khởi Nghiệp
export const OFFLINE_MAX_HOURS_CAP = 12;
export const OFFLINE_MIN_FLOOR_PER_BAY_PER_MIN = 280000; // 280 G$/phút/trụ hoạt động
export const STARTER_MONEY_VND = 65000000;               // 65,000 G$
export const STARTER_GREEN_COINS = 250;                  // 250 GC

// 8. [GIAI ĐOẠN 2] Thông số Tài nguyên Trung gian (Điện năng lưới EVN & Pin BESS, Danh tiếng, Giấy phép)
export const GRID_TARIFF_OFFPEAK_VND = 1100;   // 1.10 G$/kWh giờ thấp điểm (22:00 - 06:00)
export const GRID_TARIFF_NORMAL_VND = 1650;    // 1.65 G$/kWh giờ bình thường
export const GRID_TARIFF_PEAK_VND = 2450;      // 2.45 G$/kWh giờ cao điểm (09:00-12:00 & 17:00-20:00)
export const BESS_BASE_CAPACITY_KWH = 800;     // Dung lượng Pin lưu trữ BESS cơ bản (800 kWh)
export const BESS_UPGRADE_STEP_KWH = 1000;     // Mỗi cấp nâng cấp Pin BESS tăng +1,000 kWh
export const BESS_UPGRADE_COST_VND = 25000000; // 25,000 G$ / lần nâng cấp dung lượng Pin BESS
export const BESS_DISCHARGE_MARGIN_BONUS = 1.35; // Dùng điện từ Pin BESS đã tích trữ tăng +35% biên lợi nhuận sạc
export const PERMIT_EXPAND_DISCOUNT_RATE = 0.30; // Dùng 1 Giấy phép mở rộng giảm 30% chi phí mở rộng m² đất

// 9. [GIAI ĐOẠN 2] Thông số Nhân sự Trạm sạc (Kỹ thuật viên & Quản lý Dịch vụ)
export const STAFF_TECH_HIRE_COSTS = [0, 18000000, 36000000, 68000000];      // Cấp 1..3: 18K / 36K / 68K G$
export const STAFF_TECH_SPEED_BONUS = [0, 0.15, 0.32, 0.50];                 // Tăng +15% / +32% / +50% tốc độ sạc kWh
export const STAFF_MANAGER_HIRE_COSTS = [0, 22000000, 45000000, 82000000];   // Cấp 1..3: 22K / 45K / 82K G$
export const STAFF_MANAGER_AMENITY_BONUS = [0, 0.20, 0.42, 0.68];            // Tăng +20% / +42% / +68% doanh thu Tiện ích

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
  STARTER_GREEN_COINS,
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
};

Object.assign(globalThis, BALANCE_SUMMARY, { BALANCE_SUMMARY });
