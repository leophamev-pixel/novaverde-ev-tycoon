# ⚡ NovaVerde: EV Charging Tycoon — Modular Architecture v3.0

Bản tái cấu trúc chuẩn hóa (**Modular Architecture Standard v3.0**) của **NovaVerde: EV Charging Tycoon**, tách từ file Monolith 15.434 dòng sang **46 ES Modules độc lập**, giữ nguyên **100% logic gameplay, công thức kinh tế, đồ họa Isometric 2.5D, Cloud Save và 54/54 bài kiểm thử tự động**.

## 🗂️ Cấu Trúc Thư Mục Chuẩn Hóa

```
novaverde-modular/
├── src/
│   ├── config/
│   │   └── env.js                ← Cấu hình môi trường tập trung (Firebase, AdMob, Dev Mode)
│   ├── debug/
│   │   └── debug-overlay.js      ← Bảng Debug (Ctrl+D / ?debug=1) & phím tắt Dev (Ctrl+M, Ctrl+T, Ctrl+R)
│   ├── data/                     ← 9 Module Dữ liệu & Cân bằng Game thuần túy
│   │   ├── balance.js            ← Tập trung toàn bộ magic numbers & công thức kinh tế
│   │   ├── amenity-catalog.js    ← 6 loại tiện ích × 3 cấp độ
│   │   ├── charger-tiers.js      ← 5 cấp trụ sạc (0kW -> 120kW)
│   │   ├── vehicle-models.js     ← 11 mẫu phương tiện (4 EV, 3 ICE, 4 Scooter)
│   │   ├── map-data.js           ← Lưới đường 11×11, 8 công viên, 37 công trình di sản, 12 Quận
│   │   ├── lot-blueprints.js     ← 36 lô đất trung tâm + bộ sinh 150 lô đất cân bằng
│   │   ├── skin-catalog.js       ← VIP Tools, Vật phẩm công nghệ & Skin trạm sạc
│   │   ├── b2b-contracts.js      ← Hợp đồng đội xe B2B, Siêu trạm Liên minh & Cấu hình Ad Slots
│   │   └── events-catalog.js     ← Lịch tuần T2–CN & Sự kiện đô thị
│   ├── lang/
│   │   └── lang-pack.js          ← Từ điển song ngữ Việt – Anh (VI / EN)
│   ├── state/                    ← 4 Module Quản lý Trạng thái + Event Bus
│   │   ├── game-state.js         ← Trạng thái kinh tế, 150 lô đất & Event Bus (subscribeStateChange)
│   │   ├── ui-state.js           ← Trạng thái giao diện, bộ lọc, góc chiếu Isometric
│   │   ├── calendar-state.js     ← Trạng thái lịch ngày/tháng/năm & thời tiết
│   │   └── network-state.js      ← Trạng thái Multiplayer, Bảng xếp hạng & Đấu giá (mpState)
│   ├── systems/                  ← 9 Module Hệ thống Logic (Thuần thuật toán)
│   │   ├── economy.js            ← Vòng lặp mô phỏng updateSimulation(dt), doanh thu & định giá
│   │   ├── calendar.js           ← Chu kỳ ngày/đêm & lịch tuần
│   │   ├── tax.js                ← Tiền thuê đất tháng, thuế TNDN (CIT) năm & quản lý nợ
│   │   ├── vehicle-spawn.js      ← Thuật toán sinh xe điện, taxi, xe xăng chiếm chỗ
│   │   ├── vehicle-physics.js    ← Tìm đường A*, đèn giao thông, vật lý xe & bảo vệ đuổi xe xăng
│   │   ├── offline-earnings.js   ← Tính toán doanh thu Offline lũy kế
│   │   ├── save-load.js          ← Quản lý LocalStorage tập trung & chữ ký Anti-Cheat Hash
│   │   ├── weather.js            ← Chuyển đổi thời tiết Nắng / Mưa / Tự động
│   │   └── lot-actions.js        ← Mua/thuê lô, mở rộng m², lắp trụ, nâng cấp tiện ích, ký B2B
│   ├── render/                   ← 10 Module Đồ họa Canvas 2.5D
│   │   ├── iso-utils.js          ← Toán học chiếu Isometric 2.5D, ánh sáng & 3 mức LOD
│   │   ├── camera.js             ← Camera Pan/Zoom quán tính & biến đổi tọa độ chạm
│   │   ├── render-loop.js        ← Vòng lặp vẽ chính drawCartoonMap() (Painter's Algorithm)
│   │   ├── draw-ground.js        ← Nướng nền mặt đất tĩnh (Offscreen Baking) & đường phố
│   │   ├── draw-environment.js   ← Sông Ngân Hà, cầu 3D, tàu điện, 8 công viên & cây xanh
│   │   ├── draw-buildings.js     ← 37 công trình di sản & cụm cao ốc kính 3D
│   │   ├── draw-station.js       ← Vẽ trạm sạc người chơi (đã tách thành 5 hàm con) & trạm đối thủ
│   │   ├── draw-charger.js       ← Vẽ 5 cấp trụ sạc 3D & thẻ thông tin nổi
│   │   ├── draw-vehicles.js      ← Vẽ xe điện, taxi, xe máy xoay 4 hướng
│   │   └── draw-minimap.js       ← Vẽ Radar Minimap góc trên
│   ├── ui/                       ← 7 Module Giao diện DOM & Âm thanh
│   │   ├── hud.js                ← Thanh trạng thái HUD, định dạng tiền tệ & âm thanh WebAudio
│   │   ├── lot-panel.js          ← Khung phân bổ diện tích (m²) & chuồng sạc
│   │   ├── lot-list.js           ← Danh sách 5.400 lô đất & bản đồ 12 Quận
│   │   ├── finance-tab.js        ← Sổ cái kế toán, thuế & thanh toán nợ
│   │   ├── multiplayer-tab.js    ← Đấu trường Multiplayer, đấu giá Sổ Đỏ & hợp đồng B2B
│   │   ├── shop-modal.js         ← Cửa hàng GreenCoin & hộp thoại Quảng cáo
│   │   └── offline-modal.js      ← Hộp thoại nhận tiền Offline & Lưu/Đọc dữ liệu
│   ├── net/                      ← 3 Module Mạng & Mobile SDK
│   │   ├── leaderboard.js        ← Xếp hạng thị phần & thưởng tuần
│   │   ├── websocket.js          ← Kết nối WebSocket Multiplayer
│   │   └── mobile-sdk-bridge.js  ← Firebase Auth, Cloud Save, AdMob 6 Slots & IAP
│   ├── styles/
│   │   └── main.css              ← Toàn bộ giao diện CSS tách biệt
│   └── main.js                   ← Điểm khởi chạy chính (Entry Point)
├── docs/                         ← Bộ 3 Tài liệu Thiết kế Chuẩn hóa
│   ├── game-design.md            ← Vòng lặp gameplay, bảng cân bằng & danh mục tài sản
│   ├── data-structures.md        ← Cấu trúc 4 nhánh State, Lot, Bay & Amenity
│   └── render-pipeline.md        ← Quy trình 6 bước vẽ Isometric 2.5D & 5 hàm con vẽ trạm
├── public/                       ← Tài nguyên tĩnh (Icons, Assets, PWA Manifest, Service Worker)
└── scripts/
    ├── dev-server.mjs            ← Máy chủ Local Dev (cổng 3000) hỗ trợ Hot Reload tự động
    ├── build-bundle.mjs          ← Trình đóng gói ra thư mục www/ cho Firebase & Mobile
    └── qa-modular-runner.mjs     ← Bộ kiểm thử tự động 54/54 Test Cases
```

## 🚀 Các Lệnh Sử Dụng Nhanh

* **Chạy máy chủ phát triển Local (có Hot Reload tự động tại `http://localhost:3000`):**
  ```bash
  npm run dev
  ```
* **Mở chế độ Debug Overlay:** Truy cập `http://localhost:3000/?debug=1` hoặc bấm `Ctrl+D` (`Ctrl+M` cộng tiền test, `Ctrl+T` tua +6 giờ, `Ctrl+R` reset).
* **Chạy bộ kiểm thử tự động 54/54 Test Cases (10 Module Tests + 44 Gameplay Tests):**
  ```bash
  npm test
  ```
* **Đóng gói bản phát hành ra thư mục `www/` (để đẩy lên Firebase Hosting hoặc Capacitor):**
  ```bash
  npm run build
  ```
