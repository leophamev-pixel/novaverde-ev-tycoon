# 🏙️ NovaVerde Metropolis EV Tycoon 3D (Modular v3.0 — 53 ES Modules)

**Đại Đô Thị NovaVerde — Đế Chế Trạm Sạc Xe Điện 3D** (`NovaVerde Metropolis EV Tycoon 3D`) là tựa game mô phỏng quản lý kinh tế & bất động sản trạm sạc xe điện Isometric 2.5D quy mô **5.400 Lô Đất (12 Quận × 36 Phường)**, đã được tái cấu trúc toàn diện từ kiến trúc đơn khối sang **53 ES Modules** theo đúng chuẩn **Báo cáo Phân tích Cấu trúc Dự án (Giai đoạn 0 ➔ Giai đoạn 3)**.

## 🏗️ Kiến Trúc Thư Mục Chuẩn Hóa (53 ES Modules)

```text
novaverde-modular/
├── index.html                      # Entry HTML Shell nạp ES Modules (/src/main.js)
├── package.json                    # Scripts: dev (Hot-Reload), build (Bundle), test (76 QA Cases)
├── docs/                           # Giai đoạn 0: Bộ tài liệu thiết kế & kiến trúc chuẩn
│   ├── game-design.md              # Công thức kinh tế, ROI, BESS & Gameplay Core
│   ├── data-structures.md          # Sơ đồ cấu trúc State, Lot, Charger, DAG & Cloud Save
│   └── render-pipeline.md          # Quy trình vẽ Isometric 2.5D Painter's Algorithm & Culling
├── src/
│   ├── main.js                     # Điểm nhập trung tâm điều phối 53 ES Modules
│   ├── config/
│   │   └── env.js                  # Cấu hình môi trường & khóa kết nối
│   ├── data/                       # Tầng Dữ Liệu Tĩnh & Cân Bằng Kinh Tế (Giai đoạn 1 & 2)
│   │   ├── balance.js              # Bảng cân bằng kinh tế & So sánh ROI Trụ sạc / Tiện ích
│   │   ├── unlock-tree.js          # Đồ thị Cây Công Nghệ 10 Node (Tech DAG)
│   │   ├── amenity-catalog.js      # 6 loại Tiện ích 2.5D (Cấp 1..3)
│   │   ├── charger-tiers.js        # 5 cấp Trụ sạc EV (0kW -> 120kW Supercharger)
│   │   ├── vehicle-models.js       # 11 mẫu phương tiện (EV, Taxi, Xe xăng, Xe máy điện)
│   │   ├── events-catalog.js       # Sự kiện thời tiết & đô thị
│   │   ├── map-data.js             # Lưới đường 11x11, 8 Công viên, 37 Kỳ quan & 12 Quận
│   │   ├── lot-blueprints.js       # Quy hoạch 5.400 Lô đất (36 Phường)
│   │   ├── skin-catalog.js         # Danh mục Skin Trạm sạc 3D & Vật phẩm công nghệ
│   │   └── b2b-contracts.js        # Hợp đồng đội xe B2B, Siêu trạm Liên minh & Ad Slots
│   ├── lang/
│   │   └── lang-pack.js            # Hệ thống Đa ngôn ngữ tách biệt 100% VI ⇄ EN (kể cả Tab Title)
│   ├── state/                      # Tầng Quản Lý Trạng Thái (4 Slices + Event Bus)
│   │   ├── game-state.js           # Trạng thái Kinh tế, 5.400 Lô đất, Tiến trình & Event Bus
│   │   ├── ui-state.js             # Trạng thái Camera, Ngăn kéo HUD & Bộ lọc
│   │   ├── calendar-state.js       # Lịch trình 24h, Thứ 2 -> Chủ Nhật & Chu kỳ Thuế
│   │   └── network-state.js        # Trạng thái Multiplayer, Đấu giá Sổ Đỏ & BXH
│   ├── systems/                    # Tầng Logic Nghiệp Vụ & Mô Phỏng (Giai đoạn 1, 2 & 3)
│   │   ├── economy.js              # Vòng lặp mô phỏng doanh thu sạc, tiện ích & định giá BĐS
│   │   ├── progression.js          # Pin lưu trữ BESS, Điện EVN, 3 Nhân sự & Sự kiện A/B
│   │   ├── quest.js                # Chuỗi 6 Nhiệm vụ Chính tuyến & Hướng dẫn Tân thủ
│   │   ├── audio.js                # WebAudio Đa kênh: Nhạc nền Lo-fi Ngày/Đêm & 7 hiệu ứng SFX
│   │   ├── analytics.js            # Telemetry thời gian thực & Chẩn đoán Điểm nghẽn AI
│   │   ├── offline-earnings.js     # Tính toán doanh thu Offline (trần 12h, bảo toàn số dư)
│   │   ├── lot-actions.js          # Mua/Thuê đất, Mở rộng m², Lắp trụ, Nâng cấp & Đuổi xe xăng
│   │   ├── vehicle-spawn.js        # Sinh phương tiện theo nhịp sống đô thị
│   │   ├── vehicle-physics.js      # Vật lý di chuyển, rẽ ngã tư & vào/ra cổng Barie
│   │   ├── calendar.js             # Chu kỳ ngày/tháng/năm & Nhịp sống Thủ đô
│   │   ├── tax.js                  # Thuế đất, Thuế TNDN (CIT) & Lãi phạt nợ quá hạn
│   │   ├── weather.js              # Thời tiết Nắng / Mưa dông / Đêm & Mái Solar Canopy
│   │   └── save-load.js            # Lưu/Đọc LocalStorage, Anti-Cheat Checksum & JSON Backup
│   ├── render/                     # Tầng Đồ Họa Isometric 2.5D (60 FPS)
│   │   ├── dirty-tracker.js        # Viewport Dirty State, Frustum Culling & Đo Frame Time
│   │   ├── iso-utils.js            # Phép chiếu Isometric 2.5D & Chuyển đổi tọa độ
│   │   ├── camera.js               # Điều khiển Camera, Phóng to/Thu nhỏ & Quán tính vuốt
│   │   ├── draw-ground.js          # Nướng nền tĩnh Offscreen Canvas & Vạch sơn phân khu
│   │   ├── draw-environment.js     # Vẽ Công viên, Hồ nước, Sông Ngân Hà & Đoàn tàu
│   │   ├── draw-buildings.js       # Vẽ 37 Di tích 3D, Cao ốc CBD & Quần thể kiến trúc
│   │   ├── draw-charger.js         # Vẽ trụ sạc 3D theo cấp công suất
│   │   ├── draw-station.js         # 5 hàm con vẽ Trạm sạc 2.5D, Tiện ích, Chuồng sạc & Mái che
│   │   ├── draw-vehicles.js        # Vẽ xe điện, Taxi, xe xăng & xe máy xoay góc 2.5D
│   │   ├── draw-minimap.js         # Vẽ Radar Minimap 360° (Toàn thành phố & Chi tiết Phường)
│   │   └── render-loop.js          # Vòng lặp kết xuất chính theo thuật toán Painter's Algorithm
│   ├── ui/                         # Tầng Giao Diện Người Dùng (HUD & Modals)
│   │   ├── hud.js                  # Thanh trạng thái HUD, Định dạng tiền tệ & Cập nhật giao diện
│   │   ├── progression-panel.js    # Giao diện Nhiệm vụ Tân thủ, Pin BESS, Nhân sự & Cây DAG
│   │   ├── lot-panel.js            # Khung phân bổ m² đất, Chuồng sạc & Ngăn kéo dưới
│   │   ├── lot-list.js             # Tìm kiếm & Phân trang 5.400 Lô đất + Bản đồ 12 Quận
│   │   ├── finance-tab.js          # Sổ cái Kế toán, Thuế, Dư nợ & Trung tâm Phân tích Giai đoạn 3
│   │   ├── multiplayer-tab.js      # Bảng xếp hạng Đua Top, Đấu giá Sổ Đỏ & Hợp đồng B2B
│   │   ├── shop-modal.js           # Cửa hàng GreenCoin, VIP Tools, Skin 3D & Quảng cáo
│   │   └── offline-modal.js        # Hộp thoại nhận thưởng Offline & Quản lý Lưu trữ
│   ├── net/                        # Tầng Mạng, Đám Mây & Mobile SDK
│   │   ├── leaderboard.js          # Xếp hạng 3 tiêu chí, Bot CEO & Thưởng tuần Chủ Nhật
│   │   ├── websocket.js            # Kết nối WebSocket & Phòng chờ Hybrid tự động
│   │   └── mobile-sdk-bridge.js    # Cầu nối Firebase Auth, Firestore Cloud Save, AdMob & IAP
│   ├── debug/
│   │   └── debug-overlay.js        # Bảng 🛠️ BẢNG TEST / DEV TEST (Chỉ hiện trên Localhost)
│   └── styles/
│       └── main.css                # Hệ thống CSS giao diện Mobile-First & Cartoon 3D
├── scripts/
│   ├── dev-server.mjs              # Máy chủ phát triển cổng 3000 hỗ trợ Hot-Reload (SSE)
│   ├── build-bundle.mjs            # Trình đóng gói 53 ES Modules sang www/index.html
│   └── qa-modular-runner.mjs       # Bộ kiểm thử tự động 76/76 kịch bản (100% PASS)
└── www/                            # Thư mục bản dựng hoàn chỉnh sẵn sàng Deploy Web / Mobile
```

## 🚀 Hướng Dẫn Chạy & Kiểm Thử

1. **Chạy máy chủ phát triển (Local Dev Server có Hot-Reload tại cổng 3000):**
   ```bash
   npm run dev
   ```
2. **Đóng gói bản phát hành (`www/index.html`):**
   ```bash
   npm run build
   ```
3. **Chạy bộ 76 kịch bản kiểm thử tự động (Module + Gameplay + Stage 2 + Stage 3 + LangPack):**
   ```bash
   npm test
   ```
