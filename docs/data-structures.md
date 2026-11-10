# TÀI LIỆU CẤU TRÚC DỮ LIỆU (DATA STRUCTURES SPECIFICATION)
## NovaVerde: EV Charging Tycoon (Modular v3.0)

## 1. Kiến Trúc Trạng Thái (`src/state/`)

Trạng thái toàn cục được phân tách logic qua 4 module truy xuất trong `src/state/`:

1. **`src/state/game-state.js` (`getState()`, `setState()`, `subscribeStateChange()`):**
   - `money` *(number)*: Số dư tiền mặt hiện tại (đơn vị nội bộ, chia `1.000` = `G$`).
   - `greenCoins` *(number)*: Số dư GreenCoin (`GC`).
   - `businessMode` *("franchise" | "direct")*: Chế độ mặc định khi mở lô mới.
   - `ownedItems` *(Record<string, boolean>)*: Danh sách công nghệ đã mua vĩnh viễn.
   - `ownedSkins` *(Record<string, boolean>)* & `equippedSkin` *(string)*: Skin trạm sạc đang sở hữu và trang bị.
   - `totalRevenueAllTime`, `totalProfitAllTime`, `yearlyGrossRevenue`, `yearlyOperatingProfit`, `yearlyPrepaidTax` *(number)*: Các chỉ số kế toán lũy kế.
   - `lastSavedAt` *(number)*, `unclaimedOfflineRealSec` *(number)*, `pendingOfflineReward` *(number)*: Quản lý thời gian và phần thưởng Offline chờ nhận.
   - `lots` *(Array<Lot>)*: Danh sách 150 đối tượng Lô đất trong phường hiện tại.

2. **`src/state/ui-state.js` (`getUiState()`):**
   - `selectedLotId` *(number)*: ID lô đất đang mở bảng điều khiển (`1..150`).
   - `lotZoneFilter` *(string)*: Bộ lọc vùng (`ALL`, `HO_GUOM`, `PHAP_CO`, `CAO_OC_CBD`, `CONG_VIEN`, `SONG_HONG`).
   - `lotListPage` *(number)*: Trang hiện tại trong danh sách lô đất.
   - `sheetMode` *("normal" | "expanded" | "minimized")*: Độ mở của ngăn kéo điều khiển dưới.
   - `isoView` *(boolean)*: Chế độ góc chiếu Isometric 2.5D (`true`) hoặc phẳng 2D (`false`).
   - `gameSpeed` *(number)*: Khóa cố định ở `1` (1x Real-Time Anti-Cheat).

3. **`src/state/calendar-state.js` (`getCalendarState()`):**
   - `year`, `month`, `dayOfMonth`, `totalDaysElapsed` *(number)*: Ngày tháng năm trong game.
   - `simMinute` *(number)*: Phút trong ngày (`0..1439`, tương ứng `00:00..23:59`).
   - `weatherMode` *("auto" | "sunny" | "rain")* & `isRaining` *(boolean)*.

4. **`src/state/network-state.js` (`getNetworkState()`):**
   - Quản lý `mpState`: Kết nối WebSocket, danh sách người chơi trực tuyến, phiên đấu giá Sổ Đỏ (`activeAuction`), và bảng xếp hạng.

## 2. Cấu Trúc Đối Tượng Lô Đất (`Lot`)

```javascript
{
  id: 1,                          // Mã lô đất (1..150 trong mỗi phường)
  name: "Số 18 Phố Kim Diệp",     // Tên tiếng Việt
  nameEn: "No. 18 Goldleaf St",   // Tên tiếng Anh
  zone: "HO_GUOM",                // Phân vùng quy hoạch
  x: -420, y: -310,               // Tọa độ tâm lô đất trên bản đồ (World Space)
  roadX: -420, roadY: -350,       // Tọa độ điểm đấu nối mặt đường
  inGateX: -435, outGateX: -405,  // Tọa độ cổng vào/ra Barie
  owned: true,                    // Đã thuộc sở hữu của người chơi hay chưa
  owner: "player",                // "player" | "free" | "bot"
  businessMode: "franchise",      // "franchise" | "direct"
  baseAreaM2: 120,                // Diện tích gốc (m²)
  areaM2: 165,                    // Diện tích hiện tại sau khi mở rộng (m²)
  expansionCount: 1,              // Số lần đã mở rộng diện tích
  maxExpansions: 4,               // Số lần mở rộng tối đa
  leaseCostInitial: 22000000,     // Chi phí mở lô ban đầu
  monthlyRent: 3500000,           // Tiền thuê mặt bằng hàng tháng
  unpaidDebt: 0,                  // Nợ tiền thuê/thuế quá hạn
  lockedByDebt: false,            // Trạng thái bị niêm phong do nợ quá hạn
  hasGuard: true,                 // Đã thuê bảo vệ 24/7 chống xe xăng đỗ lấn
  amenities: {                    // Cấp độ từng tiện ích trên lô (0..3)
    tra_da: 2,
    cafe: 1,
    doi_pin: 0,
    phong_nghi: 0,
    nha_an: 0,
    nha_hang: 0
  },
  bays: [                         // Danh sách các chuồng sạc trên lô
    {
      index: 0,
      tier: 2,                    // Cấp trụ sạc (0..4)
      kw: 30,                     // Công suất trụ (kW)
      occupied: true,             // Đang có phương tiện đỗ hay không
      car: {                      // Thông tin xe đang sạc hoặc đỗ lấn
        modelName: "JadeCab E5 Taxi",
        batteryKwh: 38,
        chargedKwh: 18.5,
        targetKwh: 32.0,
        isTaxi: true,
        isSquatter: false,
        isIceSquatter: false
      }
    }
  ]
}
```
