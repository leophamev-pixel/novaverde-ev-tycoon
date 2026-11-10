# TÀI LIỆU PIPELINE ĐỒ HỌA 2.5D (RENDER PIPELINE SPECIFICATION)
## NovaVerde: EV Charging Tycoon (Modular v3.0)

## 1. Tổng Quan Kiến Trúc Render (`src/render/`)

Toàn bộ tầng hiển thị Canvas 2D Isometric 2.5D được tách rời khỏi logic kinh tế và chia thành **10 module chuyên biệt** trong `src/render/`:

```
src/render/render-loop.js (drawCartoonMap)
│
├── 1. src/render/iso-utils.js        ← Phép chiếu Isometric (isoPt), Ánh sáng Ngày/Đêm & 3 mức LOD
├── 2. src/render/camera.js           ← Biến đổi khung nhìn (Pan/Zoom) & Screen-to-World Raycasting
├── 3. src/render/draw-ground.js      ← Nướng mặt đất tĩnh (Offscreen Baking) & Lưới đường 11x11
├── 4. src/render/draw-environment.js ← Sông Ngân Hà, Cầu 3D, Tàu điện, 8 Công viên & Cây cổ thụ
├── 5. src/render/draw-buildings.js   ← 36 Công trình di sản & Cụm cao ốc kính 3D (Skyscrapers)
├── 6. src/render/draw-station.js     ← Trạm sạc Người chơi (5 hàm con) & Trạm đối thủ AI
├── 7. src/render/draw-charger.js     ← Trụ sạc 3D chi tiết cao (AC 11kW -> Siêu trụ 120kW)
├── 8. src/render/draw-vehicles.js    ← Xe điện, Taxi, SUV, Xe máy xoay 4 hướng kèm xi-nhan
└── 9. src/render/draw-minimap.js     ← Radar bản đồ thu nhỏ góc trên & chuyển nhanh khu vực
```

## 2. Quy Trình 6 Bước Trong Mỗi Khung Hình (`drawCartoonMap`)

1. **Tính toán Môi trường Ánh sáng & LOD (`iso-utils.js`):**
   - Dựa trên `state.simMinute` và `state.isRaining`, hàm `getLightingEnvironment()` xác định độ sáng ban ngày/ban đêm, màu bầu trời và bật/tắt đèn đường.
   - Hàm `getSemanticZoomLOD()` trả về 3 mức chi tiết dựa theo `camera.zoom`:
     - **LOD 1 (`zoom < 0.45`):** Góc nhìn toàn cảnh đô thị, ẩn chi tiết nhỏ để giữ 60 FPS.
     - **LOD 2 (`0.45 <= zoom <= 1.05`):** Góc nhìn tiêu chuẩn, hiển thị đầy đủ tòa nhà 3D, trụ sạc, xe cộ và bảng hiệu.
     - **LOD 3 (`zoom > 1.05`):** Góc nhìn cận cảnh, vẽ thêm khách hàng đi bộ uống trà đá/ăn phở, lưới tế bào pin mặt trời và chi tiết nội thất.

2. **Lớp Nền Tĩnh Đã Nướng Sẵn (`draw-ground.js` — Offscreen Canvas Baking):**
   - Thay vì vẽ lại hàng nghìn ô cỏ, vỉa hè và mặt đường mỗi frame, `getOrBakeStaticGroundCanvas(isNight, districtIdx)` nướng toàn bộ lớp địa hình tĩnh vào một `OffscreenCanvas` và tái sử dụng bằng 1 lệnh `ctx.drawImage` duy nhất.
   - Chỉ các hộp đèn tín hiệu giao thông đổi màu Xanh/Vàng/Đỏ được vẽ động qua `drawDynamicTrafficLightBoxesOnly()`.

3. **Lớp Cảnh Quan Công Viên, Hồ Nước & Sông Ngân Hà (`draw-environment.js`):**
   - Vẽ mặt nước gợn sóng, đảo đền giữa hồ, đài phun nước, cầu thép 3D bắc qua sông và đoàn tàu hỏa chuyển động theo thời gian thực.

4. **Thuật Toán Xếp Lớp Chiều Sâu 3D (`Painter's Algorithm Depth-Sorting`):**
   - Toàn bộ thực thể nổi 3D (Tòa nhà di sản, Cụm kiến trúc phố, Trạm sạc đối thủ, 150 Lô đất người chơi, Cây xanh, Cột đèn) được gom vào danh sách khả kiến (`isIsoVisible`) và sắp xếp theo khóa chiều sâu Isometric `(wx + wy)` tăng dần (từ xa tới gần) để các khối nhà phía trước che khuất tự nhiên các khối phía sau.

5. **Pipeline 5 Hàm Con Vẽ Trạm Sạc Người Chơi (`draw-station.js`):**
   - `drawUnownedPlot25D()`: Vẽ đế bê tông quy hoạch, cọc tiêu 4 góc và bảng giá thuê/đấu giá cho lô chưa mở.
   - `drawStationPadAndGates25D()`: Vẽ nền sân trạm sạc, vỉa hè nội khu, khách đi bộ (LOD 3), cổng Barie tự động và bốt bảo vệ 24/7.
   - `drawStationAmenities25D()`: Vẽ 6 mô hình tiện ích 3D (Dù trà đá, Tủ pin LED, Ly cà phê bốc khói, Phòng lạnh VIP, Tô phở sứ 3D, Biệt thự nhà hàng).
   - `drawStationChargingBays25D()`: Vẽ vạch kẻ chuồng sạc, 5 cấp trụ sạc 3D (`drawHighDetail3DCharger`), cáp sạc nối vào xe và thanh phần trăm pin.
   - `drawStationCanopyAndCallout25D()`: Vẽ mái đón Pin Mặt Trời (Solar Canopy) chữ Y, biểu tượng 3D trên đỉnh mái theo Skin, tường hào quang xung quanh lô và thẻ nổi `OUR STATION`.

6. **Lớp Giao Thông Động, Hiệu Ứng Thời Tiết & Radar Minimap (`draw-vehicles.js`, `draw-minimap.js`):**
   - Vẽ toàn bộ phương tiện đang lưu thông trên đường (`drawEV25DRotated`), chữ bay cộng tiền (`floatTexts`), hạt mưa nhiệt đới (`rainDrops`) và cập nhật khung Radar Minimap.
