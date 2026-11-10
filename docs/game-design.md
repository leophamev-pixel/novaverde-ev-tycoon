# TÀI LIỆU THIẾT KẾ GAME (GAME DESIGN DOCUMENT)
## NovaVerde: EV Charging & Urban Real Estate Tycoon (Modular v3.0)

## 1. Vòng Lặp Cốt Lõi (Core Gameplay Loop)

1. **Khởi tạo & Định vị Bất động sản:** Người chơi khởi nghiệp với **65.000 G$** và **250 GC**, sở hữu Lô đất #1 tại Quận 1 (Hoàng Kim) với 2 trụ sạc AC Eco 11kW.
2. **Vận hành Trạm sạc & Thu hút Lưu lượng:**
   - Phương tiện điện (EV cá nhân, Taxi điện, Xe máy điện) di chuyển trên lưới đường phố 11×11 theo thuật toán tìm đường A*.
   - Khi đi ngang qua lô đất có trụ trống, xe đánh giá **Điểm Thu Hút (Appeal Score)** dựa trên: Công suất trụ sạc (`11kW -> 120kW`), Tổ hợp Tiện ích (`Trà đá, Đổi pin, Café, Phòng nghỉ, Phở bò, Nhà hàng`), Buff cảnh quan (`Công viên, Hồ, Cao ốc CBD`) và Skin Trạm sạc.
3. **Quản lý Không gian Vật lý (m² Conflict Loop):**
   - Mỗi lô đất có diện tích giới hạn (`80–160 m²` ban đầu, mở rộng tối đa `~400 m²`).
   - Trụ sạc chiếm `20 m²/trụ`, Tiện ích chiếm `6–38 m²/tiện ích`. Người chơi phải cân đối giữa việc lắp nhiều trụ sạc (tăng thông lượng kWh) hay xây Tiện ích (tăng doanh thu phụ trợ trên mỗi xe ghé trạm).
4. **Cơ chế Mô hình Kinh doanh & Tài chính:**
   - **Nhượng quyền (Franchise):** Chi phí lắp trụ thấp (`10.000 G$/trụ`), biên lợi nhuận `+0.75 G$/kWh`.
   - **Tự doanh (Direct Sale):** Đóng phí trạm biến áp riêng (`15.000 G$`), chi phí lắp trụ `18.000 G$/trụ`, biên lợi nhuận cao `+1.35 G$/kWh` (+80%).
5. **Thuế, Tiền Thuê Đất & Rủi ro Đô thị:**
   - Cuối mỗi tháng (30 ngày game): Trừ tiền thuê mặt bằng và phí môn bài tiện ích.
   - Cuối mỗi năm (360 ngày game): Quyết toán Thuế Thu nhập Doanh nghiệp (CIT lũy tiến `10%–20%`) và Thuế Đất.
   - Xe xăng đỗ lấn (ICE Squatters) chiếm chuồng sạc: Người chơi phải tự đuổi/phạt hoặc thuê **Bảo vệ 24/7 (`hasGuard`)** tự động xử lý.

## 2. Công Thức Kinh Tế Trọng Tâm (`src/data/balance.js`)

| Thông số | Hằng số trong `balance.js` | Giá trị | Ý nghĩa thiết kế |
| :--- | :--- | :--- | :--- |
| Đơn vị tiền tệ | `GREEN_DOLLAR_UNIT` | `1.000` | `1 G$` hiển thị = `1.000` đơn vị tính toán nội bộ |
| Diện tích hạ tầng gốc | `INFRA_BASE_M2` | `10 m²` | Tủ điện tổng & lối đi kỹ thuật bắt buộc trên mỗi lô |
| Diện tích mỗi trụ sạc | `M2_PER_CHARGER_BAY` | `20 m²` | Chuồng đỗ tiêu chuẩn + hành lang an toàn |
| Biên lãi Nhượng quyền | `FRANCHISE_MARGIN_PER_KWH` | `750` (`0.75 G$`) | Hoàn vốn sau ~180 lượt sạc ở giai đoạn đầu |
| Biên lãi Tự doanh | `DIRECT_MARGIN_PER_KWH` | `1350` (`1.35 G$`) | Tăng +80% biên lãi khi đầu tư hạ tầng trạm biến áp |
| Sàn thưởng Offline | `OFFLINE_MIN_FLOOR_PER_BAY_PER_MIN` | `280.000` (`280 G$`) | Đảm bảo mỗi trụ hoạt động mang về tối thiểu `280 G$/phút` khi nghỉ |
| Trần tích lũy Offline | `OFFLINE_MAX_HOURS_CAP` | `12 giờ` | Khuyến khích người chơi quay lại game tối thiểu 2 lần/ngày |

## 3. Phân Cấp Trụ Sạc & Tiện Ích

### 3.1. 5 Cấp Trụ Sạc (`src/data/charger-tiers.js`)
* **Cấp 0:** Chưa lắp (`0 kW`)
* **Cấp 1 (AC Eco 11kW):** Phù hợp xe máy điện & xe cỡ nhỏ, vốn thấp.
* **Cấp 2 (DC Nhanh 30kW):** Phù hợp Taxi phổ thông (`JadeCab E5`).
* **Cấp 3 (DC Cao Cấp 60kW):** Sạc nhanh cho SUV & đội xe hợp đồng B2B.
* **Cấp 4 (Siêu Trụ 120kW):** Tốc độ sạc cực đại, thu hút nhóm xe hạng sang (`VinaVolt Lux S7`).

### 3.2. 6 Loại Tiện Ích (`src/data/amenity-catalog.js`)
* `tra_da` (**Quầy Trà Đá** — `6 m²`): Vốn nhỏ, thu hút tài xế taxi bình dân (`+18 điểm`).
* `doi_pin` (**Tủ Đổi Pin EcoVolt** — `12 m²`): Phục vụ đội xe máy điện & shipper (`+22 điểm`).
* `cafe` (**Quán Café Cổ Điển** — `16 m²`): Thu hút xe cá nhân khu Phố Cổ.
* `phong_nghi` (**Phòng Nghỉ Tài Xế VIP** — `18 m²`): Điểm hút taxi cao (`+26 điểm`).
* `nha_an` (**Nhà Ăn Phở Bò** — `26 m²`): Doanh thu/xe cao (`42 G$/xe`), điểm hút taxi mạnh nhất (`+32 điểm`).
* `nha_hang` (**Nhà Hàng Sân Vườn** — `38 m²`): Doanh thu/xe cao nhất (`75 G$/xe`) cho nhóm khách VIP/SUV.
