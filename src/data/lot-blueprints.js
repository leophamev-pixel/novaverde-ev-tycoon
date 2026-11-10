/**
 * src/data/lot-blueprints.js
 * Bản thiết kế 36 Lô đất trung tâm + Thuật toán sinh 150 Lô đất cân bằng
 */
import { V_ROADS, H_ROADS, isRedRiverCorridor, isMajorParkBlock, HOAN_KIEM_BUILDINGS, RIVAL_STATIONS, HANOI_12_DISTRICTS, MEGA_SECTORS_36 } from "./map-data.js";

// 36 LÔ ĐẤT LÕI TRUNG TÂM QUẬN HOÀNG KIM (100% TÊN TỰ ĐẶT BẢN QUYỀN GỐC + SONG NGỮ VI / EN)
export const CORE_36_BLUEPRINTS = [
  { id: 1,  zone: "PHO_CO", name: "Lô #1: Số 18 Phố Kim Ngân", nameEn: "Lot #1: No. 18 Goldleaf St", district: "P. Kim Ngân", col: 4, row: 4, posInBlock: "SE", areaM2: 90, stepM2: 45, maxExp: 3, rentM2: 620000, buyM2: 115000000, bays: 2, tier: 1, note: "Mặt bằng khởi nghiệp 90m² giữa Khu Phố Cổ Hoàng Kim (đang có 2 trụ + Trà đá, còn trống 34m² đủ lắp ngay Trụ #3!).", noteEn: "90m² flagship starter plot in Aurum Heritage Quarter (includes 2 chargers + Iced Tea, 34m² free for Bay #3!)." },
  { id: 2,  zone: "PHO_CO", name: "Lô #2: Vòm Cầu Đá Cổ Tháp", nameEn: "Lot #2: Old Arch Viaduct Plaza", district: "P. Kim Ngân", col: 3, row: 3, posInBlock: "SE", areaM2: 95, stepM2: 45, maxExp: 3, rentM2: 320000, buyM2: 86000000,  bays: 2, tier: 1, note: "Sát vòm cầu đá đường sắt Cổ Tháp, giá thuê mềm, rất hút cánh tài xế Taxi nghỉ trưa.", noteEn: "Next to the stone railway viaduct, affordable rent and a favorite lunch stop for EV Taxis." },
  { id: 3,  zone: "PHO_CO", name: "Lô #3: Góc Phố Đêm Nhật Nguyệt", nameEn: "Lot #3: Sunmoon Nightlife Corner", district: "P. Kim Ngân", col: 5, row: 3, posInBlock: "SE", areaM2: 75, stepM2: 40, maxExp: 3, rentM2: 680000, buyM2: 145000000, bays: 2, tier: 1, note: "Ngã tư Phố Đêm Nhật Nguyệt (đường 1 chiều Tây->Đông), cực đông xe cá nhân ban đêm.", noteEn: "Bustling Sunmoon Night Street intersection (1-way W->E), packed with evening private EVs." },
  { id: 4,  zone: "PHO_CO", name: "Lô #4: Cổng Chợ Lớn Hoàng Kim", nameEn: "Lot #4: Aurum Grand Market Gate", district: "P. Đông Môn", col: 5, row: 2, posInBlock: "SE", areaM2: 115, stepM2: 50, maxExp: 3, rentM2: 480000, buyM2: 128000000, bays: 3, tier: 1, note: "Bãi bốc xếp hàng hóa sát Chợ Lớn Hoàng Kim, xe dịch vụ và thương nhân ra vào tấp nập.", noteEn: "Loading plaza beside Aurum Grand Market with non-stop commercial and merchant EV traffic." },
  { id: 5,  zone: "PHO_CO", name: "Lô #5: Tháp Nước Thủy Đài - Cổ Thụ", nameEn: "Lot #5: Heritage Water Tower Plaza", district: "P. Đông Môn", col: 4, row: 2, posInBlock: "NW", areaM2: 105, stepM2: 45, maxExp: 3, rentM2: 450000, buyM2: 118000000, bays: 3, tier: 1, note: "Cửa ngõ phía Bắc Quận Hoàng Kim dưới hàng cây cổ thụ xanh mát.", noteEn: "Northern gateway of Aurum District beneath century-old sycamore trees." },
  { id: 6,  zone: "PHO_CO", name: "Lô #6: Ngã Tư Phố Đèn Lồng", nameEn: "Lot #6: Lantern Street Crossing", district: "P. Kim Ngân", col: 4, row: 2, posInBlock: "SE", areaM2: 80, stepM2: 40, maxExp: 3, rentM2: 540000, buyM2: 122000000, bays: 2, tier: 1, note: "Khu phố đèn lồng rực rỡ, khách đi dạo mua sắm ghé uống Café rất đông.", noteEn: "Vibrant lantern shopping street where visitors love stopping for artisan coffee." },
  { id: 7,  zone: "PHO_CO", name: "Lô #7: Phố Ngọc Châu - Kim Ngân", nameEn: "Lot #7: Jadestone - Goldleaf St", district: "P. Kim Ngân", col: 3, row: 3, posInBlock: "NW", areaM2: 80, stepM2: 40, maxExp: 3, rentM2: 520000, buyM2: 112000000, bays: 2, tier: 1, note: "Mặt phố cổ sầm uất, phù hợp mở Trà đá vỉa hè và Tủ đổi pin xe máy.", noteEn: "Busy heritage frontage ideal for a Sidewalk Iced Tea stall and E-Scooter Battery Swap." },
  { id: 8,  zone: "PHO_CO", name: "Lô #8: Sân Thành Cổ Đông Môn", nameEn: "Lot #8: East Citadel Courtyard", district: "P. Đông Môn", col: 2, row: 2, posInBlock: "SE", areaM2: 110, stepM2: 45, maxExp: 3, rentM2: 390000, buyM2: 95000000,  bays: 3, tier: 1, note: "Cạnh Thành cổ Đông Môn, mặt bằng thoáng rộng hiếm có ở khu phía Tây Bắc.", noteEn: "Spacious courtyard plot next to the historic East Citadel Gate." },
  { id: 9,  zone: "PHO_CO", name: "Lô #9: Thương Xá Bạch Ngân", nameEn: "Lot #9: Silvercrest Arcade Lot", district: "P. Kim Ngân", col: 3, row: 4, posInBlock: "SE", areaM2: 105, stepM2: 45, maxExp: 3, rentM2: 510000, buyM2: 118000000, bays: 3, tier: 1, note: "Bãi đỗ xe trung tâm thương mại Bạch Ngân, lưu lượng ổn định cả ngày.", noteEn: "Shopping arcade parking lot with steady all-day charging demand." },
  { id: 10, zone: "PHO_CO", name: "Lô #10: Phố Kim Hoàn - Bạch Ngân", nameEn: "Lot #10: Goldsmith - Silvercrest St", district: "P. Kim Ngân", col: 4, row: 3, posInBlock: "SE", areaM2: 75, stepM2: 35, maxExp: 3, rentM2: 560000, buyM2: 125000000, bays: 2, tier: 1, note: "Khu phố kim hoàn & thương mại truyền thống sầm uất bậc nhất Quận Hoàng Kim.", noteEn: "Traditional jewelry and craft guild street in the heart of Aurum District." },
  { id: 11, zone: "PHO_CO", name: "Lô #11: Phố Ngọc Châu - Cầu Hồng Nhật", nameEn: "Lot #11: Jadestone - Crimson Bridge", district: "P. Kim Ngân", col: 5, row: 4, posInBlock: "NW", areaM2: 80, stepM2: 40, maxExp: 3, rentM2: 720000, buyM2: 185000000, bays: 2, tier: 2, note: "Đầu trục 1 chiều sát bờ Bắc Hồ Tinh Cầu, cực đông khách du lịch.", noteEn: "Prime 1-way corner right at the north shore of Starlight Lake." },
  { id: 12, zone: "PHO_CO", name: "Lô #12: Phố Phượng Hoàng - Đền Cổ", nameEn: "Lot #12: Phoenix - Heritage Shrine St", district: "P. Kim Ngân", col: 6, row: 3, posInBlock: "SE", areaM2: 85, stepM2: 40, maxExp: 3, rentM2: 610000, buyM2: 138000000, bays: 2, tier: 1, note: "Tâm điểm ẩm thực phố cổ Phượng Hoàng, lắp thêm Nhà ăn hoặc Café rất sinh lời.", noteEn: "Culinary hotspot on Phoenix Street where Canteens and Cafés earn top margins." },
  { id: 13, zone: "PHO_CO", name: "Lô #13: Cổng Thành Bến Ngọc", nameEn: "Lot #13: Jade Wharf Historic Gate", district: "P. Đông Môn", col: 6, row: 2, posInBlock: "NW", areaM2: 95, stepM2: 45, maxExp: 3, rentM2: 420000, buyM2: 102000000, bays: 2, tier: 1, note: "Nằm ngay cửa ô lịch sử nối khu phố cổ ra đại lộ ven Sông Ngân Hà.", noteEn: "Historic archway connecting the Old Quarter to Silverstar River Dyke." },
  { id: 14, zone: "PHO_CO", name: "Lô #14: Phố Minh Châu - Bờ Đông", nameEn: "Lot #14: Pearlview - East Lakefront", district: "P. Ngọc Quang", col: 6, row: 4, posInBlock: "SE", areaM2: 95, stepM2: 45, maxExp: 3, rentM2: 590000, buyM2: 148000000, bays: 2, tier: 2, note: "Khu phố khách sạn boutique đón khách từ cầu lớn vào Hồ Tinh Cầu.", noteEn: "Boutique hotel street welcoming cross-river visitors to Starlight Lake." },

  { id: 15, zone: "HO_GUOM", name: "Lô #15: Ven Hồ Tinh Cầu (Bờ Tây) (Đất Kim Cương)", nameEn: "Lot #15: West Starlight Lakefront (Diamond Lot)", district: "P. Ngọc Quang", col: 4, row: 4, posInBlock: "NW", areaM2: 85, stepM2: 40, maxExp: 3, rentM2: 750000, buyM2: 245000000, bays: 2, tier: 2, note: "Đất kim cương sát Hồ Tinh Cầu! Giá đất cao nhất quận nhưng khách SUV chi tiêu cực mạnh.", noteEn: "Diamond lakefront plot by Starlight Lake! Highest land value with top-spending SUV drivers." },
  { id: 16, zone: "HO_GUOM", name: "Lô #16: Quảng Trường Thánh Đường Đôi", nameEn: "Lot #16: Twin Spires Cathedral Square", district: "P. Ngọc Quang", col: 4, row: 5, posInBlock: "NW", areaM2: 90, stepM2: 40, maxExp: 3, rentM2: 720000, buyM2: 215000000, bays: 2, tier: 2, note: "Sát Thánh Đường Đôi, mở Quầy Trà Đá & Café tại đây thu hút khách kỷ lục!", noteEn: "Right by Twin Spires Cathedral — Iced Tea & Café stalls here attract record crowds!" },
  { id: 17, zone: "HO_GUOM", name: "Lô #17: Vườn Hoa Hoàng Gia - Bờ Đông", nameEn: "Lot #17: Imperial Garden - East Shore", district: "P. Ngọc Quang", col: 6, row: 5, posInBlock: "NW", areaM2: 110, stepM2: 45, maxExp: 3, rentM2: 700000, buyM2: 225000000, bays: 3, tier: 2, note: "Đối diện Bờ Đông Hồ Tinh Cầu & Khách sạn Hoàng Gia, tụ điểm của dòng xe sang.", noteEn: "Opposite East Starlight Lake & Grand Aurum Hotel, a magnet for luxury EVs." },
  { id: 18, zone: "HO_GUOM", name: "Lô #18: Ngã Tư Trường Thịnh Galleria", nameEn: "Lot #18: Solaris Galleria Crossing", district: "P. Ngọc Quang", col: 5, row: 6, posInBlock: "NW", areaM2: 100, stepM2: 45, maxExp: 3, rentM2: 740000, buyM2: 235000000, bays: 3, tier: 2, note: "Nằm ngay giao lộ 1 chiều sầm uất cạnh Trung tâm thương mại Trường Thịnh Galleria.", noteEn: "Prime 1-way intersection right next to the luxury Solaris Galleria Mall." },
  { id: 19, zone: "HO_GUOM", name: "Lô #19: Quảng Trường Nhà Hát Lớn Ánh Dương", nameEn: "Lot #19: Solaris Grand Opera Square", district: "P. Ngọc Quang", col: 6, row: 6, posInBlock: "SE", areaM2: 120, stepM2: 50, maxExp: 3, rentM2: 660000, buyM2: 198000000, bays: 3, tier: 3, note: "Cuối trục 1 chiều Ngọc Quang, vị trí số 1 để mở Nhà Hàng Sân Vườn Bistro cao cấp.", noteEn: "At Solaris Grand Opera Square — the #1 location for a Luxury Garden Bistro." },
  { id: 20, zone: "HO_GUOM", name: "Lô #20: Phố Thiên Tinh - Bờ Hồ", nameEn: "Lot #20: Starlight Promenade Lot", district: "P. Ngọc Quang", col: 3, row: 5, posInBlock: "NW", areaM2: 95, stepM2: 45, maxExp: 3, rentM2: 580000, buyM2: 155000000, bays: 2, tier: 2, note: "Trục đường nối Tây Môn vào Hồ Tinh Cầu, luồng xe dịch vụ và cá nhân đan xen liên tục.", noteEn: "Direct artery linking Westgate to Starlight Lake with constant mixed EV flow." },

  { id: 21, zone: "PHAP_CO", name: "Lô #21: Ngã Năm Tây Môn - Ngọc Quang", nameEn: "Lot #21: Westgate Five-Way Junction", district: "P. Ngọc Quang", col: 2, row: 5, posInBlock: "SE", areaM2: 120, stepM2: 55, maxExp: 3, rentM2: 520000, buyM2: 142000000, bays: 3, tier: 2, note: "Đầu đường 1 chiều Ngọc Quang, đón toàn bộ luồng xe từ phía Tây đổ vào trung tâm.", noteEn: "Gateway of 1-way Jadeplaza St, capturing commuter traffic entering the city core." },
  { id: 22, zone: "PHAP_CO", name: "Lô #22: Cổng Bệnh Viện Đa Khoa Ánh Dương", nameEn: "Lot #22: Solaris Medical Center Gate", district: "P. Ngọc Quang", col: 3, row: 5, posInBlock: "SE", areaM2: 115, stepM2: 50, maxExp: 3, rentM2: 500000, buyM2: 138000000, bays: 3, tier: 2, note: "Sát cổng Bệnh viện Đa khoa Ánh Dương, nhu cầu sạc Taxi và ăn trưa cực kỳ lớn.", noteEn: "Beside Solaris Medical Center with massive 24/7 EV Taxi & lunch canteen demand." },
  { id: 23, zone: "PHAP_CO", name: "Lô #23: Phố Triển Lãm - Quang Minh", nameEn: "Lot #23: Expo - Brightway Corner", district: "P. Ngọc Quang", col: 3, row: 6, posInBlock: "SE", areaM2: 125, stepM2: 50, maxExp: 3, rentM2: 510000, buyM2: 145000000, bays: 3, tier: 2, note: "Đón luồng xe 1 chiều Đông -> Tây trên trục Phố Triển Lãm.", noteEn: "Captures 1-way East->West traffic along Expo Avenue." },
  { id: 24, zone: "PHAP_CO", name: "Lô #24: Giao Lộ Trường Thịnh - Triển Lãm", nameEn: "Lot #24: Galleria - Expo Crossroads", district: "P. Ngọc Quang", col: 4, row: 6, posInBlock: "SE", areaM2: 120, stepM2: 50, maxExp: 3, rentM2: 610000, buyM2: 175000000, bays: 3, tier: 2, note: "Giao điểm vàng của 2 đại lộ 1 chiều Trường Thịnh và Triển Lãm.", noteEn: "Golden crossroads of two major 1-way boulevards in the commercial core." },
  { id: 25, zone: "PHAP_CO", name: "Lô #25: Phố Thái Dương - Ngọc Hồ", nameEn: "Lot #25: Solaris - Lakeview Ave", district: "P. Ngọc Quang", col: 5, row: 6, posInBlock: "SE", areaM2: 125, stepM2: 50, maxExp: 3, rentM2: 580000, buyM2: 168000000, bays: 3, tier: 2, note: "Đón luồng xe 1 chiều Bắc -> Nam từ Hồ Tinh Cầu đổ xuống trục Thái Dương.", noteEn: "Captures North->South traffic flowing from Starlight Lake down Solaris Ave." },
  { id: 26, zone: "PHAP_CO", name: "Lô #26: Quảng Trường Ga Trung Tâm NovaVerde", nameEn: "Lot #26: NovaVerde Central Station Plaza", district: "P. Đông Môn", col: 2, row: 7, posInBlock: "NW", areaM2: 150, stepM2: 55, maxExp: 4, rentM2: 460000, buyM2: 132000000, bays: 4, tier: 2, note: "Mỏ vàng cho đoàn xe 🚕 Taxi xếp tài đón khách tàu cao tốc! Mở rộng tối đa tới 370m².", noteEn: "Goldmine for 🚕 EV Taxis queuing at Central Rail Station! Expandable up to 370m²." },
  { id: 27, zone: "PHAP_CO", name: "Lô #27: Đại Lộ Tài Chính - Chùa Liên Hoa", nameEn: "Lot #27: Financial Blvd - Lotus Sanctuary", district: "P. Ngọc Quang", col: 3, row: 7, posInBlock: "SE", areaM2: 130, stepM2: 55, maxExp: 3, rentM2: 500000, buyM2: 152000000, bays: 4, tier: 2, note: "Cạnh Chùa Liên Hoa Cổ & cụm cao ốc văn phòng Đại Lộ Tài Chính.", noteEn: "Next to Golden Lotus Sanctuary and Financial Boulevard office towers." },
  { id: 28, zone: "PHAP_CO", name: "Lô #28: Đại Lộ Tài Chính - Trường Thịnh", nameEn: "Lot #28: Financial Blvd - Galleria Node", district: "P. Ngọc Quang", col: 4, row: 7, posInBlock: "SE", areaM2: 140, stepM2: 55, maxExp: 3, rentM2: 530000, buyM2: 162000000, bays: 4, tier: 2, note: "Mặt đại lộ đôi rộng nhất phía Nam quận, xe cộ lưu thông 2 chiều tốc độ cao.", noteEn: "Wide dual-carriageway boulevard frontage with heavy 2-way executive traffic." },
  { id: 29, zone: "PHAP_CO", name: "Lô #29: Khu Ngân Hàng Hoàng Gia", nameEn: "Lot #29: Imperial Banking Quarter", district: "P. Ngọc Quang", col: 6, row: 7, posInBlock: "NW", areaM2: 135, stepM2: 55, maxExp: 3, rentM2: 520000, buyM2: 158000000, bays: 4, tier: 2, note: "Trung tâm ngân hàng & tài chính, khách đi xe điện công vụ và cá nhân sạc giờ hành chính.", noteEn: "Central banking quarter with strong business-hours EV charging demand." },
  { id: 30, zone: "PHAP_CO", name: "Lô #30: Ngã Tư Bạch Ngân - Tài Chính", nameEn: "Lot #30: Silvercrest - Financial Crossing", district: "P. Đông Môn", col: 6, row: 7, posInBlock: "SE", areaM2: 130, stepM2: 50, maxExp: 3, rentM2: 490000, buyM2: 148000000, bays: 3, tier: 2, note: "Cửa ngõ Đông Nam khu phố cổ điển, kết nối nhanh ra đại lộ ven sông.", noteEn: "Southeastern gateway connecting the classical quarter to the riverfront boulevard." },

  { id: 31, zone: "SONG_HONG", name: "Lô #31: Bến Đầu Cầu Cổ Tháp - Thủy Đài", nameEn: "Lot #31: Heritage Bridgehead Transit Lot", district: "P. Đông Môn", col: 7, row: 2, posInBlock: "NW", areaM2: 145, stepM2: 55, maxExp: 4, rentM2: 310000, buyM2: 78000000, bays: 4, tier: 2, note: "Điểm trung chuyển ngay chân cầu vượt Sông Ngân Hà, đất rộng giá thuê cực tốt.", noteEn: "Major transit hub at the Silverstar River bridgehead with spacious, low-rent land." },
  { id: 32, zone: "SONG_HONG", name: "Lô #32: Bãi Ven Đê Bến Ngọc", nameEn: "Lot #32: Jade Wharf Riverfront Lot", district: "P. Đông Môn", col: 7, row: 3, posInBlock: "NW", areaM2: 150, stepM2: 55, maxExp: 4, rentM2: 290000, buyM2: 74000000, bays: 4, tier: 2, note: "Bãi xe rộng rãi dọc bờ Sông Ngân Hà, lý tưởng mở Phòng nghỉ & Nhà ăn cho Taxi.", noteEn: "Spacious riverfront lot along Silverstar Dyke, ideal for Driver Lounges & Canteens." },
  { id: 33, zone: "SONG_HONG", name: "Lô #33: Nút Giao Cầu Lớn Ngân Hà", nameEn: "Lot #33: Silverstar Grand Bridge Node", district: "P. Đông Môn", col: 7, row: 4, posInBlock: "NW", areaM2: 160, stepM2: 60, maxExp: 4, rentM2: 280000, buyM2: 72000000, bays: 4, tier: 2, note: "Bãi đất lớn nhất quận (160m² -> mở rộng tới 400m², lắp tối đa 18 trụ sạc Mega Hub!).", noteEn: "Largest plot in the ward (160m² -> expandable to 400m² for an 18-bay Mega-Hub!)." },
  { id: 34, zone: "SONG_HONG", name: "Lô #34: Bến Du Thuyền Sông Ngân Hà", nameEn: "Lot #34: Silverstar River Cruise Pier", district: "P. Đông Môn", col: 7, row: 5, posInBlock: "SE", areaM2: 150, stepM2: 55, maxExp: 4, rentM2: 270000, buyM2: 70000000, bays: 4, tier: 2, note: "Sát bến du thuyền Sông Ngân Hà, giá thuê rẻ nhất Quận Hoàng Kim.", noteEn: "Next to the Silverstar River Cruise Pier with the lowest lease rate in Aurum District." },
  { id: 35, zone: "SONG_HONG", name: "Lô #35: Đại Lộ Ven Sông - Nhà Hát Lớn", nameEn: "Lot #35: Riverfront Blvd - Opera Backlot", district: "P. Đông Môn", col: 7, row: 6, posInBlock: "SE", areaM2: 145, stepM2: 55, maxExp: 4, rentM2: 300000, buyM2: 76000000, bays: 4, tier: 2, note: "Bãi đỗ xe sau Nhà Hát Lớn ven Sông Ngân Hà, đón cả Taxi lẫn xe du lịch.", noteEn: "Spacious parking lot behind the Grand Opera along the riverfront boulevard." },
  { id: 36, zone: "SONG_HONG", name: "Lô #36: Cửa Ngõ Cảng Nam Ngân Hà", nameEn: "Lot #36: South Silverstar Port Gateway", district: "P. Đông Môn", col: 7, row: 7, posInBlock: "SE", areaM2: 155, stepM2: 60, maxExp: 4, rentM2: 290000, buyM2: 75000000, bays: 4, tier: 2, note: "Cửa ngõ phía Đông Nam Quận Hoàng Kim, lưu lượng xe liên quận và Taxi cực lớn.", noteEn: "Southeastern river port gateway with heavy inter-district and EV Taxi traffic." }
];

export function getQuadWorldCenter(col, row, posInBlock) {
  const vxL = V_ROADS[col].x;
  const vxR = V_ROADS[col + 1].x;
  const hyT = H_ROADS[row].y;
  const hyB = H_ROADS[row + 1].y;
  if (posInBlock === "NW") return { x: vxL + 115, y: hyT + 84 };
  if (posInBlock === "NE") return { x: vxR - 115, y: hyT + 84 };
  if (posInBlock === "SW") return { x: vxL + 115, y: hyB - 84 };
  return { x: vxR - 115, y: hyB - 84 };
}

// THUẬT TOÁN PHÂN BỔ ĐỀU 150 LÔ ĐẤT KHẮP 82 Ô PHỐ XÂY DỰNG (SONG NGỮ 100% VI / EN & TÊN ĐÔ THỊ NOVAVERDE)
export const LOT_BLUEPRINTS_36 = (function build150BalancedMetropolisLots() {
  const list = [...CORE_36_BLUEPRINTS];
  let nextId = 37;

  const STREET_NAMES_BY_COL = [
    "Thiên Hà", "Ngoại Giao", "Kinh Đô", "Cổ Tháp", "Kim Ngân",
    "Trường Thịnh", "Thái Dương", "Bến Ngọc", "Ngân Hà", "Đông Giang"
  ];
  const STREET_NAMES_BY_COL_EN = [
    "Galaxy", "Diplomat", "Capitol", "Old Arch", "Goldleaf",
    "Galleria", "Solaris", "Jade Wharf", "Silverstar", "Eastbank"
  ];
  const WARD_NAMES_BY_ROW = [
    "Bích Hồ - Bán Đảo", "Bắc Đài - Thượng Uyển", "Cổ Thụ - Thủy Đài", "Đèn Lồng - Chợ Lớn", "Phố Cổ Hoàng Kim",
    "Hồ Tinh Cầu - Thiên Tinh", "Ngọc Quang - Trường Thịnh", "Triển Lãm - Học Viện", "Đại Lộ Tài Chính - CBD", "Vành Đai Trong - Công Viên"
  ];
  const WARD_NAMES_BY_ROW_EN = [
    "Azure Lake - Peninsula", "North Citadel - Botanica", "Sycamore - Watertower", "Lantern - Grand Market", "Aurum Heritage Core",
    "Starlight Lakefront", "Jadeplaza - Galleria", "Expo - Academy", "Financial Blvd - CBD", "Inner Ring - Central Park"
  ];

  function canPlaceLotAt(c, r, posCode) {
    if (list.some(bp => bp.col === c && bp.row === r && bp.posInBlock === posCode)) return false;
    const pt = getQuadWorldCenter(c, r, posCode);
    const hitBuilding = HOAN_KIEM_BUILDINGS.some(b => {
      const bcx = b.x + b.w / 2;
      const bcy = b.y + b.h / 2;
      return Math.abs(bcx - pt.x) < 76 && Math.abs(bcy - pt.y) < 72;
    });
    if (hitBuilding) return false;
    const hitRival = RIVAL_STATIONS.some(rv => Math.abs(rv.x - pt.x) < 76 && Math.abs(rv.y - pt.y) < 72);
    if (hitRival) return false;
    return true;
  }

  function addLotToBlock(c, r, posCode) {
    const pt = getQuadWorldCenter(c, r, posCode);
    const nearPark = MAJOR_PARKS.find(pk => Math.abs(pk.col - c) <= 1 && Math.abs(pk.row - r) <= 1);
    const nearSkyscraper = HOAN_KIEM_BUILDINGS.find(b => b.isSkyscraper && Math.hypot((b.x + b.w / 2) - pt.x, (b.y + b.h / 2) - pt.y) < 420);

    let zone = "PHAP_CO";
    let areaM2 = 120;
    let stepM2 = 50;
    let maxExp = 3;
    let rentM2 = 460000;
    let buyM2 = 135000000;
    let bays = 3;
    let tier = 2;
    let prefixTitle = "Phố";
    let prefixTitleEn = "Ave";

    if (nearPark) {
      zone = "CONG_VIEN";
      areaM2 = 125 + ((nextId * 7) % 30);
      stepM2 = 50;
      maxExp = 4;
      rentM2 = 440000 + ((nextId * 13) % 90000);
      buyM2 = 128000000 + ((nextId * 17) % 32000000);
      bays = 3;
      tier = 2;
      prefixTitle = "Ven Công Viên";
      prefixTitleEn = "Parkside";
    } else if (nearSkyscraper || c <= 1 || r >= 8) {
      zone = "CAO_OC_CBD";
      areaM2 = 135 + ((nextId * 11) % 35);
      stepM2 = 55;
      maxExp = 4;
      rentM2 = 520000 + ((nextId * 19) % 110000);
      buyM2 = 155000000 + ((nextId * 23) % 38000000);
      bays = 4;
      tier = 2;
      prefixTitle = "Cao Ốc CBD";
      prefixTitleEn = "CBD Tower";
    } else if (c >= 7) {
      zone = "SONG_HONG";
      areaM2 = 150 + ((nextId * 9) % 30);
      stepM2 = 60;
      maxExp = 4;
      rentM2 = 280000 + ((nextId * 11) % 50000);
      buyM2 = 72000000 + ((nextId * 13) % 18000000);
      bays = 4;
      tier = 2;
      prefixTitle = "Ven Sông Ngân Hà •";
      prefixTitleEn = "Silverstar Riverfront";
    } else if (r <= 3 && c >= 3 && c <= 6) {
      zone = "PHO_CO";
      areaM2 = 90 + ((nextId * 5) % 25);
      stepM2 = 45;
      maxExp = 3;
      rentM2 = 510000 + ((nextId * 15) % 90000);
      buyM2 = 118000000 + ((nextId * 19) % 25000000);
      bays = 2;
      tier = 1;
      prefixTitle = "Phố Cổ";
      prefixTitleEn = "Heritage";
    }

    const streetName = STREET_NAMES_BY_COL[c] || "Ánh Dương";
    const streetNameEn = STREET_NAMES_BY_COL_EN[c] || "Solaris";
    const wardName = WARD_NAMES_BY_ROW[r] || "NovaVerde";
    const wardNameEn = WARD_NAMES_BY_ROW_EN[r] || "NovaVerde";
    const buffDesc = nearPark
      ? `🌳 Sát ${nearPark.name}: Hưởng Buff Công Viên (+16🚗 Xe Gia Đình, +6🚕 Taxi, +15% doanh thu dịch vụ)!`
      : (nearSkyscraper
          ? `🏙️ Sát ${nearSkyscraper.title}: Hưởng Buff Cao Ốc CBD (+18🚕 Xe Văn Phòng/Taxi, +12🚗 Xe Cá Nhân, +15% dịch vụ)!`
          : `Mặt tiền trục ${streetName} — khu ${wardName}, quy hoạch hài hòa cùng cụm kiến trúc 3D xung quanh.`);
    const buffDescEn = nearPark
      ? `🌳 Adjacent to ${nearPark.nameEn || nearPark.name}: Grants Park Buff (+16🚗 Family EVs, +6🚕 Taxis, +15% Amenity Rev)!`
      : (nearSkyscraper
          ? `🏙️ Adjacent to ${nearSkyscraper.titleEn || nearSkyscraper.title}: Grants CBD Tower Buff (+18🚕 Executive/Taxi EVs, +12🚗 Private EVs, +15% Rev)!`
          : `Prime frontage along ${streetNameEn} Ave in ${wardNameEn}, integrated with surrounding 3D urban blocks.`);

    list.push({
      id: nextId,
      zone,
      name: `Lô #${nextId}: ${prefixTitle} ${streetName} (${posCode})`,
      nameEn: `Lot #${nextId}: ${prefixTitleEn} ${streetNameEn} (${posCode})`,
      district: `Khu ${wardName}`,
      districtEn: `${wardNameEn} Zone`,
      col: c,
      row: r,
      posInBlock: posCode,
      areaM2,
      stepM2,
      maxExp,
      rentM2,
      buyM2,
      bays,
      tier,
      note: buffDesc,
      noteEn: buffDescEn
    });
    nextId++;
  }

  const buildableBlocks = [];
  for (let r = 0; r < H_ROADS.length - 1; r++) {
    for (let c = 0; c < V_ROADS.length - 1; c++) {
      if (isRedRiverCorridor(c) || isMajorParkBlock(c, r)) continue;
      buildableBlocks.push({ c, r });
    }
  }

  buildableBlocks.forEach(({ c, r }) => {
    if (list.length >= 150) return;
    const countNow = list.filter(bp => bp.col === c && bp.row === r).length;
    if (countNow === 0) {
      const prefOrder = (c + r) % 2 === 0 ? ["NW", "SE", "NE", "SW"] : ["SE", "NW", "SW", "NE"];
      for (const qCode of prefOrder) {
        if (canPlaceLotAt(c, r, qCode)) {
          addLotToBlock(c, r, qCode);
          break;
        }
      }
    }
  });

  const strideBlocks = [...buildableBlocks].sort((a, b) => {
    const scoreA = ((a.c * 7 + a.r * 13) % 19);
    const scoreB = ((b.c * 7 + b.r * 13) % 19);
    return scoreA - scoreB;
  });

  strideBlocks.forEach(({ c, r }) => {
    if (list.length >= 150) return;
    const countNow = list.filter(bp => bp.col === c && bp.row === r).length;
    if (countNow < 2) {
      const prefOrder = (c + r) % 2 === 0 ? ["SE", "NW", "SW", "NE"] : ["NW", "SE", "NE", "SW"];
      for (const qCode of prefOrder) {
        if (canPlaceLotAt(c, r, qCode)) {
          addLotToBlock(c, r, qCode);
          break;
        }
      }
    }
  });

  return list;
})();

export function computeLotWorldAndDriveway(bp) {
  const vxLeft = V_ROADS[bp.col].x;
  const vxRight = V_ROADS[bp.col + 1].x;
  const hyTop = H_ROADS[bp.row].y;
  const hyBottom = H_ROADS[bp.row + 1].y;

  let x, y, roadHIdx, vLeftIdx, vRightIdx;
  if (bp.posInBlock === "NW") {
    x = vxLeft + 115;
    y = hyTop + 84;
    roadHIdx = bp.row;
  } else if (bp.posInBlock === "NE") {
    x = vxRight - 115;
    y = hyTop + 84;
    roadHIdx = bp.row;
  } else if (bp.posInBlock === "SW") {
    x = vxLeft + 115;
    y = hyBottom - 84;
    roadHIdx = bp.row + 1;
  } else {
    x = vxRight - 115;
    y = hyBottom - 84;
    roadHIdx = bp.row + 1;
  }
  vLeftIdx = bp.col;
  vRightIdx = bp.col + 1;

  const roadY = H_ROADS[roadHIdx].y;
  return {
    x,
    y,
    roadHIdx,
    vLeftIdx,
    vRightIdx,
    roadY,
    inGateX: x - 14,
    outGateX: x + 14,
    gateRoadY: roadY
  };
}


export function getLotDisplayName(lot) {
  if (!lot) return "";
  return (window.currentLang === "en" && lot.nameEn) ? lot.nameEn : lot.name;
}

export function getLotDisplayNote(lot) {
  if (!lot) return "";
  return (window.currentLang === "en" && lot.noteEn) ? lot.noteEn : lot.note;
}

export function createInitialLots() {
  const all5400 = new Array(5400);
  SECTOR_LOTS_MAP = Array.from({ length: 36 }, () => []);

  for (let sIdx = 0; sIdx < 36; sIdx++) {
    const sec = MEGA_SECTORS_36[sIdx];
    const pMult = sec.priceMult;
    const dStreets = sec.streets || HANOI_12_DISTRICTS[0].streets;
    const dStreetsEn = sec.streetsEn || HANOI_12_DISTRICTS[0].streetsEn || dStreets;

    for (let bIdx = 0; bIdx < LOT_BLUEPRINTS_36.length; bIdx++) {
      const bp = LOT_BLUEPRINTS_36[bIdx];
      const globalId = sIdx * 150 + bp.id;
      const geom = computeLotWorldAndDriveway(bp);
      const baysArr = [];
      for (let i = 0; i < bp.bays; i++) {
        baysArr.push({ id: i, tier: bp.tier, car: null, incomingCarId: null });
      }

      const rentM2 = Math.round(bp.rentM2 * pMult);
      const buyM2 = Math.round(bp.buyM2 * pMult);
      const leaseCostInitial = globalId === 1 ? 0 : Math.round(bp.areaM2 * rentM2 * 0.42);
      const buyLandCost = Math.round(bp.areaM2 * buyM2 * 0.012);
      const expandStepCost = Math.round(bp.stepM2 * buyM2 * 0.0065);

      let streetAddress = "";
      let streetAddressEn = "";
      if (sIdx === 0) {
        streetAddress = bp.name.includes(":") ? bp.name.split(":")[1].trim() : bp.name;
        streetAddressEn = (bp.nameEn && bp.nameEn.includes(":")) ? bp.nameEn.split(":")[1].trim() : (bp.nameEn || `No. ${((bIdx * 7) % 168) + 2} ${dStreetsEn[bIdx % dStreetsEn.length]} St`);
      } else {
        const stName = dStreets[(bIdx + sec.wardIdx * 5) % dStreets.length];
        const stNameEn = dStreetsEn[(bIdx + sec.wardIdx * 5) % dStreetsEn.length];
        const houseNo = ((bIdx * 7 + sIdx * 13) % 188) + 2;
        const prefix = bp.areaM2 >= 260 ? "Tổ hợp Sạc" : (bp.areaM2 >= 165 ? "Trạm" : "Số");
        const prefixEn = bp.areaM2 >= 260 ? "EV Hub" : (bp.areaM2 >= 165 ? "Station" : "No.");
        streetAddress = `${prefix} ${houseNo} Phố ${stName}`;
        streetAddressEn = `${prefixEn} ${houseNo} ${stNameEn} St`;
      }

      const customNote = sIdx === 0
        ? bp.note
        : `Đặc trưng ${sec.districtName}: Gần ${sec.centralWonderName.replace(/^[^\s]+\s/, "")} (${sec.archDesc}).`;
      const customNoteEn = sIdx === 0
        ? (bp.noteEn || `Prime ${sec.districtNameEn} location near ${(sec.centralWonderNameEn || "").replace(/^[^\s]+\s/, "")} (${sec.archDescEn}).`)
        : `Prime ${sec.districtNameEn} location near ${(sec.centralWonderNameEn || "").replace(/^[^\s]+\s/, "")} (${sec.archDescEn}).`;

      const lotObj = {
        id: globalId,
        localId: bp.id,
        sectorIdx: sIdx,
        districtIdx: sec.districtIdx,
        wardIdx: sec.wardIdx,
        districtCode: sec.districtCode,
        districtCodeEn: sec.districtCodeEn,
        ox: sec.ox,
        oy: sec.oy,
        zone: bp.zone,
        name: `Lô #${globalId} [${sec.districtCode}-${sec.shortWard}]: ${streetAddress}`,
        nameEn: `Lot #${globalId} [${sec.districtCodeEn}-${sec.shortWardEn || sec.shortWard}]: ${streetAddressEn}`,
        district: `${sec.districtName} • ${sec.wardName} (Lô #${globalId}/5.400)`,
        districtEn: `${sec.districtNameEn} • ${sec.wardNameEn} (Lot #${globalId}/5,400)`,
        x: geom.x + sec.ox,
        y: geom.y + sec.oy,
        roadHIdx: geom.roadHIdx,
        vLeftIdx: geom.vLeftIdx,
        vRightIdx: geom.vRightIdx,
        roadY: geom.roadY + sec.oy,
        inGateX: geom.inGateX + sec.ox,
        outGateX: geom.outGateX + sec.ox,
        owned: globalId === 1,
        ownershipType: globalId === 1 ? "owned" : null,
        businessMode: "franchise",
    pendingNewLotBizMode: "franchise",
        areaM2: bp.areaM2,
        expansionCount: 0,
        maxExpansions: bp.maxExp,
        expandStepAreaM2: bp.stepM2,
        expandStepCost,
        leaseCostInitial,
        monthlyRentPerM2: rentM2,
        buyLandCost,
        officialLandPricePerM2: buyM2,
        hasGuard: false,
        guardMonthlyWage: 6000000,
        debtPrincipal: 0,
        debtInterest: 0,
        debtDaysOverdue: 0,
        lockedByDebt: false,
        monthlyAmenityRev: 0,
        amenities: { tra_da: globalId === 1 ? 1 : 0, cafe: 0, phong_nghi: 0, nha_an: 0, nha_hang: 0, doi_pin: 0 },
        bays: baysArr,
        note: customNote,
        noteEn: customNoteEn
      };

      all5400[globalId - 1] = lotObj;
      SECTOR_LOTS_MAP[sIdx].push(lotObj);
    }
  }
  return all5400;
}


// Đăng ký vào globalThis để tương thích ngược với HTML event handlers & các module liên kết
Object.assign(globalThis, {
  getQuadWorldCenter,
  computeLotWorldAndDriveway,
  getLotDisplayName,
  getLotDisplayNote,
  createInitialLots,
  CORE_36_BLUEPRINTS,
  LOT_BLUEPRINTS_36
});
