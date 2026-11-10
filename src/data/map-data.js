/**
 * src/data/map-data.js
 * Dữ liệu Lưới đường phố 11x11, 8 Công viên & Hồ, 36 Công trình di sản, 12 Quận & 36 Phường
 */
import { SECTOR_SPAN_X, SECTOR_SPAN_Y, WORLD_BOUNDS } from "./balance.js";


export const V_ROADS = [
  { idx: 0,  x: -1840, name: "ĐẠI LỘ THIÊN HÀ - THÁP ĐÔI CBD (2 CHIỀU)", nameEn: "GALAXY - TWIN TOWERS CBD BLVD (2-WAY)", width: 44, oneWay: 0 },
  { idx: 1,  x: -1480, name: "ĐƯỜNG NGOẠI GIAO - BÍCH NGỌC (2 CHIỀU)", nameEn: "DIPLOMAT - SAPPHIRE AVE (2-WAY)", width: 40, oneWay: 0 },
  { idx: 2,  x: -1120, name: "ĐƯỜNG KINH ĐÔ - GA TRUNG TÂM (2 CHIỀU)", nameEn: "CAPITOL - CENTRAL STATION AVE (2-WAY)", width: 40, oneWay: 0 },
  { idx: 3,  x: -760,  name: "PHỐ CỔ THÁP - QUANG MINH (2 CHIỀU)", nameEn: "OLD ARCH - BRIGHTWAY ST (2-WAY)", width: 36, oneWay: 0 },
  { idx: 4,  x: -400,  name: "PHỐ KIM NGÂN - MINH CHÂU (2 CHIỀU)", nameEn: "GOLDLEAF - PEARLVIEW ST (2-WAY)", width: 36, oneWay: 0 },
  { idx: 5,  x: -40,   name: "PHỐ TRƯỜNG THỊNH - NGỌC CHÂU (1 CHIỀU ⬆)", nameEn: "GRAND GALLERIA - JADESTONE ST (1-WAY ⬆)", width: 36, oneWay: -1 },
  { idx: 6,  x: 320,   name: "PHỐ THÁI DƯƠNG - NGỌC HỒ (1 CHIỀU ⬇)", nameEn: "SOLARIS - LAKEVIEW ST (1-WAY ⬇)", width: 36, oneWay: 1 },
  { idx: 7,  x: 680,   name: "PHỐ HOÀNG GIA - BẠCH NGÂN (2 CHIỀU)", nameEn: "IMPERIAL - SILVERCREST ST (2-WAY)", width: 38, oneWay: 0 },
  { idx: 8,  x: 1040,  name: "ĐƯỜNG BẾN NGỌC - VEN SÔNG NGÂN HÀ (2 CHIỀU)", nameEn: "JADE WHARF - SILVERSTAR DYKE RD (2-WAY)", width: 44, oneWay: 0 },
  { idx: 9,  x: 1400,  name: "ĐẠI LỘ CẢNG NGÂN HÀ (2 CHIỀU)", nameEn: "SILVERSTAR RIVER PORT BLVD (2-WAY)", width: 40, oneWay: 0 },
  { idx: 10, x: 1760,  name: "ĐẠI LỘ ĐÔNG GIANG - KÊNH ĐÀO (2 CHIỀU)", nameEn: "EASTBANK - EMERALD CANAL BLVD (2-WAY)", width: 44, oneWay: 0 }
];

export const H_ROADS = [
  { idx: 0,  y: -1700, name: "ĐƯỜNG CỔ NGƯ - BÍCH HỒ - BÁN ĐẢO SEN (2 CHIỀU)", nameEn: "CAUSEWAY - AZURE LAKE - LOTUS RD (2-WAY)", width: 42, oneWay: 0 },
  { idx: 1,  y: -1360, name: "PHỐ BẮC MÔN - THƯỢNG UYỂN (1 CHIỀU ➔)", nameEn: "NORTHGATE - BOTANICA ST (1-WAY ➔)", width: 38, oneWay: 1 },
  { idx: 2,  y: -1020, name: "PHỐ CỔ THỤ - THỦY ĐÀI (2 CHIỀU)", nameEn: "SYCAMORE - WATERTOWER ST (2-WAY)", width: 38, oneWay: 0 },
  { idx: 3,  y: -680,  name: "PHỐ ĐÈN LỒNG - CHỢ LỚN HOÀNG KIM (2 CHIỀU)", nameEn: "LANTERN - AURUM GRAND MARKET ST (2-WAY)", width: 36, oneWay: 0 },
  { idx: 4,  y: -340,  name: "PHỐ ẨM THỰC - NHẬT NGUYỆT (1 CHIỀU ➔)", nameEn: "CULINARY - SUNMOON NIGHT ST (1-WAY ➔)", width: 34, oneWay: 1 },
  { idx: 5,  y: 0,     name: "PHỐ THIÊN TINH - HỒNG NHẬT (2 CHIỀU)", nameEn: "STARLIGHT - CRIMSON BRIDGE ST (2-WAY)", width: 36, oneWay: 0 },
  { idx: 6,  y: 340,   name: "PHỐ NGỌC QUANG - TRƯỜNG THỊNH (1 CHIỀU ➔)", nameEn: "JADEPLAZA - GALLERIA ST (1-WAY ➔)", width: 38, oneWay: 1 },
  { idx: 7,  y: 680,   name: "PHỐ TRIỂN LÃM - ĐẠI HỌC (1 CHIỀU ⬅)", nameEn: "EXPO - ACADEMY ST (1-WAY ⬅)", width: 38, oneWay: -1 },
  { idx: 8,  y: 1020,  name: "ĐẠI LỘ TÀI CHÍNH ÁNH DƯƠNG (2 CHIỀU)", nameEn: "SOLARIS FINANCIAL BLVD (2-WAY)", width: 42, oneWay: 0 },
  { idx: 9,  y: 1360,  name: "ĐƯỜNG VÀNH ĐAI TRONG - ĐẠI LỘ MỚI (2 CHIỀU)", nameEn: "INNER RING - NEW BOULEVARD (2-WAY)", width: 44, oneWay: 0 },
  { idx: 10, y: 1700,  name: "ĐẠI LỘ NAM ĐÔ - ĐẠI CÔNG VIÊN (2 CHIỀU)", nameEn: "SOUTHGATE - CENTRAL PARK BLVD (2-WAY)", width: 44, oneWay: 0 }
];

// 8 QUẦN THỂ ĐẠI CÔNG VIÊN & HỒ CẢNH QUAN 3D ĐẠI ĐÔ THỊ NOVAVERDE (SONG NGỮ VI / EN)
export const MAJOR_PARKS = [
  { col: 5, row: 5, id: "HO_GUOM",          name: "HỒ TINH CẦU & ĐỀN THÁI DƯƠNG",         nameEn: "STARLIGHT LAKE & SUN TEMPLE",          type: "hoan_kiem",     hasLake: true,  hasFountain: false, hasBoats: false },
  { col: 2, row: 0, id: "CV_BACH_THAO",     name: "CÔNG VIÊN BÁCH THẢO & BÍCH HỒ",        nameEn: "BOTANICA PARK & AZURE LAKE",           type: "lake_park",     hasLake: true,  hasFountain: true,  hasBoats: true  },
  { col: 6, row: 0, id: "HO_TRUC_BACH",     name: "HỒ NGỌC BÍCH & ĐẢO BẠCH LIÊN",         nameEn: "JADE LAGOON & WHITE LOTUS ISLAND",     type: "lake_park",     hasLake: true,  hasFountain: true,  hasBoats: true  },
  { col: 1, row: 2, id: "CV_THU_LE",        name: "CÔNG VIÊN THƯỢNG UYỂN (HỒ MINH CHÂU)", nameEn: "ROYAL GARDEN PARK (PEARL LAKE)",       type: "lake_park",     hasLake: true,  hasFountain: false, hasBoats: true  },
  { col: 2, row: 4, id: "CV_LENIN",         name: "QUẢNG TRƯỜNG THÁP KỲ ĐÀI",             nameEn: "GRAND FLAGPOLE PLAZA",                 type: "fountain_park", hasLake: false, hasFountain: true,  hasBoats: false },
  { col: 4, row: 9, id: "CV_THONG_NHAT_W",  name: "ĐẠI CÔNG VIÊN TRUNG TÂM (HỒ LỤC THỦY)", nameEn: "GRAND CENTRAL PARK (EMERALD LAKE)",    type: "lake_park",     hasLake: true,  hasFountain: true,  hasBoats: true  },
  { col: 5, row: 9, id: "CV_THONG_NHAT_E",  name: "ĐẢO HÒA BÌNH - ĐẠI CÔNG VIÊN",         nameEn: "PEACE ISLAND - CENTRAL PARK",          type: "lake_park",     hasLake: true,  hasFountain: true,  hasBoats: true  },
  { col: 9, row: 5, id: "CV_LONG_BIEN",     name: "CÔNG VIÊN SINH THÁI ĐÔNG GIANG",       nameEn: "EASTBANK RIVERSIDE ECO-PARK",          type: "lake_park",     hasLake: true,  hasFountain: true,  hasBoats: true  }
];

export function isRedRiverCorridor(c) {
  return c === 8;
}

export function isMajorParkBlock(c, r) {
  return MAJOR_PARKS.some(p => p.col === c && p.row === r);
}

// 36 CÔNG TRÌNH DI SẢN & TÒA THÁP CHỌC TRỜI CBD 3D ĐẠI ĐÔ THỊ NOVAVERDE (100% TÊN TỰ ĐẶT BẢN QUYỀN GỐC + SONG NGỮ)
export const HOAN_KIEM_BUILDINGS = [
  { x: -1065, y: -965, w: 130, h: 125, height3d: 32, shape: "city_gate",           title: "THÀNH CỔ HOÀNG KIM",   sub: "ĐÔNG MÔN THÀNH",      titleEn: "AURUM CITADEL GATE",   subEn: "EAST CITADEL ARCH",   wall: "#e7e5e4", wallDark: "#a8a29e", roof: "#78716c" },
  { x: -215,  y: -965, w: 125, h: 120, height3d: 44, shape: "cylinder_tower",      title: "THÁP NƯỚC THỦY ĐÀI",   sub: "DI SẢN ĐÁ CỔ 1894",   titleEn: "HERITAGE WATER TOWER", subEn: "STONE ROTUNDA 1894",  wall: "#d6d3d1", wallDark: "#a8a29e", roof: "#475569" },
  { x: 145,   y: -965, w: 135, h: 125, height3d: 28, shape: "five_gables",         title: "CHỢ LỚN HOÀNG KIM",    sub: "5 MÁI VÒM CỔ",        titleEn: "AURUM GRAND MARKET",   subEn: "5 HERITAGE GABLES",   wall: "#f5f5f4", wallDark: "#d6d3d1", roof: "#9a3412" },
  { x: 865,   y: -965, w: 130, h: 125, height3d: 28, shape: "city_gate",           title: "CỔNG THÀNH BẾN NGỌC",  sub: "CỬA Ô LỊCH SỬ",       titleEn: "JADE WHARF ARCHWAY",   subEn: "HISTORIC CITY GATE",  wall: "#e7e5e4", wallDark: "#a8a29e", roof: "#64748b" },
  { x: -935,  y: -625, w: 130, h: 125, height3d: 24, shape: "arches_viaduct",      title: "PHỐ VÒM BÍCH HỌA",     sub: "CẦU CẠN CỔ THÁP",     titleEn: "MURAL VIADUCT WALK",   subEn: "STONE ARCH GALLERY",  wall: "#d6d3d1", wallDark: "#78716c", roof: "#57534e" },
  { x: -575,  y: -625, w: 125, h: 125, height3d: 26, shape: "courtyard_bistro",    title: "PHỞ BÒ HOÀNG GIA",     sub: "ẨM THỰC GIA TRUYỀN",  titleEn: "IMPERIAL PHO KITCHEN", subEn: "ARTISAN NOODLE HALL", wall: "#f5f5f4", wallDark: "#d6d3d1", roof: "#9a3412", prop: "pho" },
  { x: -215,  y: -625, w: 125, h: 125, height3d: 28, shape: "corner_rotunda",      title: "CAFÉ ĐÈN LỒNG CỔ",     sub: "GÓC PHỐ KIM NGÂN",    titleEn: "LANTERN ROASTERY",     subEn: "GOLDLEAF CORNER",     wall: "#fef3c7", wallDark: "#d6d3d1", roof: "#78716c", prop: "coffee" },
  { x: 505,   y: -625, w: 130, h: 125, height3d: 26, shape: "temple_courtyard",    title: "ĐỀN KIM MÃ CỔ",        sub: "PHỐ NGỌC CHÂU",       titleEn: "GOLDEN STEED TEMPLE",  subEn: "JADESTONE SHRINE",    wall: "#e7e5e4", wallDark: "#a8a29e", roof: "#78350f" },
  { x: -575,  y: -285, w: 125, h: 125, height3d: 34, shape: "stepped_mall",        title: "THƯƠNG XÁ BẠCH NGÂN",  sub: "TRUNG TÂM TM",        titleEn: "SILVERCREST ARCADE",   subEn: "SHOPPING PLAZA",      wall: "#e2e8f0", wallDark: "#94a3b8", roof: "#475569" },
  { x: 505,   y: -285, w: 130, h: 125, height3d: 30, shape: "water_pavilion",      title: "NHÀ HÁT THỦY ĐÌNH",    sub: "BỜ HỒ TINH CẦU",      titleEn: "STARLIGHT WATER STAGE",subEn: "LAKEFRONT PAVILION",  wall: "#f5f5f4", wallDark: "#d6d3d1", roof: "#78350f" },
  { x: -215,  y: 195,  w: 125, h: 130, height3d: 48, shape: "twin_spires",         title: "THÁNH ĐƯỜNG ĐÔI",      sub: "QUẢNG TRƯỜNG CHUÔNG", titleEn: "TWIN SPIRES CATHEDRAL",subEn: "BELL TOWER SQUARE",   wall: "#d6d3d1", wallDark: "#78716c", roof: "#44403c" },
  { x: 505,   y: 55,   w: 130, h: 130, height3d: 36, shape: "mansard_hotel",       title: "KHÁCH SẠN HOÀNG GIA",  sub: "ĐẠI LỘ BẠCH NGÂN",    titleEn: "GRAND AURUM HOTEL",    subEn: "SILVERCREST LUXURY",  wall: "#f8fafc", wallDark: "#cbd5e1", roof: "#334155" },
  { x: 145,   y: 395,  w: 135, h: 125, height3d: 34, shape: "corner_rotunda",      title: "TRƯỜNG THỊNH GALLERIA",sub: "PHỐ NGỌC QUANG",      titleEn: "SOLARIS GALLERIA",     subEn: "JADEPLAZA LUXURY",    wall: "#fef9c3", wallDark: "#d6d3d1", roof: "#475569" },
  { x: 865,   y: 395,  w: 135, h: 130, height3d: 40, shape: "opera_dome",          title: "NHÀ HÁT LỚN ÁNH DƯƠNG",sub: "QUẢNG TRƯỜNG NGHỆ THUẬT", titleEn: "SOLARIS GRAND OPERA", subEn: "ROYAL ARTS PLAZA", wall: "#f5f5f4", wallDark: "#cbd5e1", roof: "#334155" },
  { x: -935,  y: 395,  w: 130, h: 125, height3d: 18, shape: "park_fountain",       title: "VƯỜN HOA TÂY MÔN",     sub: "ĐÀI PHUN NƯỚC",       titleEn: "WESTGATE FOUNTAIN",    subEn: "BOTANICAL GARDEN",    wall: "#e2e8f0", wallDark: "#94a3b8", roof: "#64748b" },
  { x: -575,  y: 395,  w: 125, h: 125, height3d: 32, shape: "h_wing_hospital",     title: "BV ĐA KHOA ÁNH DƯƠNG", sub: "PHỐ MINH CHÂU",       titleEn: "SOLARIS MEDICAL CENTER",subEn: "PEARLVIEW CLINIC",   wall: "#f1f5f9", wallDark: "#cbd5e1", roof: "#64748b" },
  { x: -935,  y: 735,  w: 130, h: 130, height3d: 34, shape: "train_station",       title: "GA TRUNG TÂM NOVAVERDE",sub: "ĐƯỜNG KINH ĐÔ",      titleEn: "NOVAVERDE CENTRAL STA",subEn: "CAPITOL RAIL HUB",    wall: "#e7e5e4", wallDark: "#a8a29e", roof: "#57534e" },
  { x: -215,  y: 735,  w: 125, h: 125, height3d: 30, shape: "temple_courtyard",    title: "CHÙA LIÊN HOA CỔ",     sub: "ĐẠI LỘ TÀI CHÍNH",    titleEn: "GOLDEN LOTUS SANCTUARY",subEn: "SOLARIS BLVD",       wall: "#e7e5e4", wallDark: "#a8a29e", roof: "#78350f" },

  // 18 TÒA THÁP CAO ỐC CHỌC TRỜI 3D (SKYSCRAPER CBD — 100% TÊN TỰ ĐẶT BẢN QUYỀN GỐC)
  { x: -1655, y: -1645, w: 140, h: 130, height3d: 104, shape: "twin_helipad_towers", title: "AZURE TWIN CBD",      sub: "THÁP ĐÔI THIÊN HÀ",    titleEn: "AZURE TWIN CBD",      subEn: "GALAXY TWIN TOWERS",   wall: "#bae6fd", wallDark: "#38bdf8", roof: "#0284c7", isSkyscraper: true },
  { x: -1295, y: -1305, w: 140, h: 130, height3d: 94,  shape: "stepped_green_tower", title: "BOTANICA GREEN TOWER",sub: "CAO ỐC VƯỜN TREO",     titleEn: "BOTANICA GREEN TOWER",subEn: "SKY GARDEN TOWER",     wall: "#f1f5f9", wallDark: "#94a3b8", roof: "#16a34a", isSkyscraper: true },
  { x: -1655, y: -965,  w: 140, h: 130, height3d: 112, shape: "twin_helipad_towers", title: "LUMINA CENTER 65T",   sub: "THÁP ĐÔI HELIPAD 65T", titleEn: "LUMINA CENTER 65F",   subEn: "65F HELIPAD TWIN",     wall: "#bae6fd", wallDark: "#0284c7", roof: "#0c4a6e", isSkyscraper: true },
  { x: -1295, y: -625,  w: 140, h: 130, height3d: 96,  shape: "stepped_green_tower", title: "SAPPHIRE ECO TOWER",  sub: "TÒA NHÀ XANH ESG",     titleEn: "SAPPHIRE ECO TOWER",  subEn: "ESG GREEN HIGHRISE",   wall: "#e2e8f0", wallDark: "#64748b", roof: "#15803d", isSkyscraper: true },
  { x: -1655, y: -285,  w: 140, h: 130, height3d: 102, shape: "twin_helipad_towers", title: "SOLARIS METROPOLIS",  sub: "THÁP ĐÔI NGOẠI GIAO",  titleEn: "SOLARIS METROPOLIS",  subEn: "DIPLOMAT TWIN HUB",    wall: "#e0f2fe", wallDark: "#7dd3fc", roof: "#0369a1", isSkyscraper: true },
  { x: -1295, y: 55,    w: 140, h: 130, height3d: 92,  shape: "stepped_green_tower", title: "EMERALD SKY HUB",     sub: "CAO ỐC VƯỜN TREO",     titleEn: "EMERALD SKY HUB",     subEn: "TERRACE SKY TOWER",    wall: "#f1f5f9", wallDark: "#94a3b8", roof: "#16a34a", isSkyscraper: true },
  { x: -1655, y: 735,   w: 140, h: 130, height3d: 98,  shape: "stepped_green_tower", title: "EXPO GREEN PLAZA",    sub: "TỔ HỢP THƯƠNG MẠI",    titleEn: "EXPO GREEN PLAZA",    subEn: "GRAND TRADE COMPLEX",  wall: "#e2e8f0", wallDark: "#64748b", roof: "#15803d", isSkyscraper: true },
  { x: -1295, y: 1415,  w: 140, h: 130, height3d: 104, shape: "twin_helipad_towers", title: "ACADEMICA TWIN PLAZA",sub: "THÁP ĐÔI ĐẠI LỘ MỚI",  titleEn: "ACADEMICA TWIN PLAZA",subEn: "NEW BLVD TWIN TOWER",  wall: "#bae6fd", wallDark: "#0284c7", roof: "#1e3a8a", isSkyscraper: true },
  { x: -575,  y: 1075,  w: 140, h: 130, height3d: 98,  shape: "twin_helipad_towers", title: "AURUM FINTECH TOWER", sub: "TRUNG TÂM TÀI CHÍNH",  titleEn: "AURUM FINTECH TOWER", subEn: "FINANCIAL CORE CBD",   wall: "#e0f2fe", wallDark: "#38bdf8", roof: "#0369a1", isSkyscraper: true },
  { x: 145,   y: 1075,  w: 140, h: 130, height3d: 108, shape: "twin_helipad_towers", title: "V-PLAZA THÁI DƯƠNG",  sub: "THÁP ĐÔI THƯƠNG MẠI",  titleEn: "V-PLAZA SOLARIS",     subEn: "COMMERCIAL TWIN HUB",  wall: "#e0f2fe", wallDark: "#38bdf8", roof: "#0369a1", isSkyscraper: true },
  { x: 865,   y: 1075,  w: 140, h: 130, height3d: 102, shape: "twin_helipad_towers", title: "NOVAVERDE EXCHANGE",  sub: "THÁP CHỨNG KHOÁN ĐÔNG",titleEn: "NOVAVERDE EXCHANGE",  subEn: "EAST FINANCIAL TOWER", wall: "#bae6fd", wallDark: "#0284c7", roof: "#0f172a", isSkyscraper: true },
  { x: -935,  y: 1415,  w: 140, h: 130, height3d: 96,  shape: "stepped_green_tower", title: "CAPITOL SMART TOWER", sub: "CAO ỐC NAM TRUNG TÂM", titleEn: "CAPITOL SMART TOWER", subEn: "SOUTH CORE HIGHRISE",  wall: "#e2e8f0", wallDark: "#64748b", roof: "#15803d", isSkyscraper: true },
  { x: 865,   y: 1415,  w: 140, h: 130, height3d: 96,  shape: "stepped_green_tower", title: "PARKVIEW ECO TOWER",  sub: "CAO ỐC VƯỜN TREO",     titleEn: "PARKVIEW ECO TOWER",  subEn: "CENTRAL PARK TOWER",   wall: "#f8fafc", wallDark: "#94a3b8", roof: "#16a34a", isSkyscraper: true },
  { x: -215,  y: -1645, w: 140, h: 130, height3d: 104, shape: "twin_helipad_towers", title: "AZURELAKE SKYVIEW",   sub: "THÁP ĐÔI BÍCH HỒ",     titleEn: "AZURELAKE SKYVIEW",   subEn: "LAKESIDE TWIN TOWER",  wall: "#bae6fd", wallDark: "#0284c7", roof: "#0c4a6e", isSkyscraper: true },
  { x: 865,   y: -1645, w: 140, h: 130, height3d: 94,  shape: "stepped_green_tower", title: "SILVERSTAR TOWER",    sub: "CAO ỐC BẮC NGÂN HÀ",   titleEn: "SILVERSTAR TOWER",    subEn: "NORTH RIVER HIGHRISE", wall: "#f1f5f9", wallDark: "#94a3b8", roof: "#16a34a", isSkyscraper: true },
  { x: 1585,  y: -1305, w: 140, h: 130, height3d: 98,  shape: "twin_helipad_towers", title: "EASTBANK NORTHERN",   sub: "THÁP ĐÔI ĐÔNG GIANG",  titleEn: "EASTBANK NORTHERN",   subEn: "EASTERN TWIN PLAZA",   wall: "#e0f2fe", wallDark: "#38bdf8", roof: "#0369a1", isSkyscraper: true },
  { x: 1585,  y: -285,  w: 140, h: 130, height3d: 96,  shape: "stepped_green_tower", title: "EMERALD CANAL TOWER", sub: "CAO ỐC KÊNH ĐÀO XANH", titleEn: "EMERALD CANAL TOWER", subEn: "CANAL ECO HIGHRISE",   wall: "#f1f5f9", wallDark: "#94a3b8", roof: "#16a34a", isSkyscraper: true },
  { x: 1585,  y: 735,   w: 140, h: 130, height3d: 104, shape: "twin_helipad_towers", title: "SAKURA SYMPHONY",     sub: "THÁP ĐÔI BỜ ĐÔNG",     titleEn: "SAKURA SYMPHONY",     subEn: "EASTBANK TWIN TOWER",  wall: "#bae6fd", wallDark: "#0284c7", roof: "#0c4a6e", isSkyscraper: true },
  { x: 1585,  y: 1415,  w: 140, h: 130, height3d: 94,  shape: "stepped_green_tower", title: "PEARL LAGOON TOWER",  sub: "CAO ỐC VỊNH NGỌC TRAI",titleEn: "PEARL LAGOON TOWER",  subEn: "LAGOON ECO HIGHRISE",  wall: "#e2e8f0", wallDark: "#64748b", roof: "#15803d", isSkyscraper: true }
];

// 8 TRẠM SẠC ĐỐI THỦ CẠNH TRANH TRÊN ĐẠI ĐÔ THỊ NOVAVERDE (100% TÊN TỰ ĐẶT + SONG NGỮ VI / EN)
export const RIVAL_STATIONS = [
  {
    id: "rival_1",
    brand: "Starlight FastCharge",
    name: "Starlight FastCharge (Phố Thiên Tinh)",
    nameEn: "Starlight FastCharge (Starlight St)",
    x: -285,
    y: 255,
    vLeftIdx: 4,
    vRightIdx: 5,
    hIdx: 5,
    chargers: 4,
    kw: 60,
    priceKwh: 3800,
    taxiAppeal: 44,
    casualAppeal: 52,
    amenitiesText: "🍵 Trà đá Cấp 1 • ☕ Café Cấp 2",
    amenitiesTextEn: "🍵 Iced Tea Lv1 • ☕ Egg Café Lv2",
    strategy: "Nằm sát bờ Hồ Tinh Cầu (Phía Tây) & Thánh Đường Đôi, mạnh về hút xe cá nhân đi dạo phố.",
    strategyEn: "Located right west of Starlight Lake & Twin Spires Cathedral, strong appeal for private EVs."
  },
  {
    id: "rival_2",
    brand: "SilverRiver EV Hub",
    name: "SilverRiver EV Hub (Bến Ngọc)",
    nameEn: "SilverRiver EV Hub (Jade Wharf)",
    x: 925,
    y: -255,
    vLeftIdx: 7,
    vRightIdx: 8,
    hIdx: 4,
    chargers: 6,
    kw: 120,
    priceKwh: 3650,
    taxiAppeal: 74,
    casualAppeal: 38,
    amenitiesText: "🍵 Trà đá Cấp 2 • 🛋️ Phòng nghỉ Cấp 2 • 🍜 Nhà ăn Cấp 1",
    amenitiesTextEn: "🍵 Iced Tea Lv2 • 🛋️ VIP Lounge Lv2 • 🍜 Noodle Canteen Lv1",
    strategy: "Trạm quy mô lớn ven Sông Ngân Hà, cạnh tranh trực tiếp tệp Taxi qua cầu.",
    strategyEn: "Large riverside hub along Silverstar Dyke, competing for cross-bridge EV Taxis."
  },
  {
    id: "rival_3",
    brand: "Solaris Volt",
    name: "Solaris Volt (Tây Môn - Triển Lãm)",
    nameEn: "Solaris Volt (Westgate - Expo St)",
    x: -1005,
    y: 595,
    vLeftIdx: 2,
    vRightIdx: 3,
    hIdx: 7,
    chargers: 5,
    kw: 60,
    priceKwh: 3750,
    taxiAppeal: 62,
    casualAppeal: 46,
    amenitiesText: "🍵 Trà đá Cấp 2 • 🔋 Đổi pin Cấp 1",
    amenitiesTextEn: "🍵 Iced Tea Lv2 • 🔋 Battery Swap Lv1",
    strategy: "Đón lõng luồng xe từ trục Kinh Đô - Ga Trung Tâm và Phố Triển Lãm.",
    strategyEn: "Intercepts heavy traffic along Capitol Ave - Central Station & Expo St."
  },
  {
    id: "rival_4",
    brand: "Metropolis SkyCharge",
    name: "Metropolis SkyCharge (Đại Lộ Thiên Hà CBD)",
    nameEn: "Metropolis SkyCharge (Galaxy CBD Blvd)",
    x: -1725,
    y: -425,
    vLeftIdx: 0,
    vRightIdx: 1,
    hIdx: 4,
    chargers: 8,
    kw: 120,
    priceKwh: 3900,
    taxiAppeal: 82,
    casualAppeal: 76,
    amenitiesText: "☕ Café Cấp 3 • 🛋️ Phòng nghỉ Cấp 2 • 🍽️ Nhà hàng Cấp 2",
    amenitiesTextEn: "☕ Egg Café Lv3 • 🛋️ VIP Lounge Lv2 • 🍽️ Garden Bistro Lv2",
    strategy: "Siêu trạm dưới chân Tháp Đôi CBD, hưởng trọn Buff Cao Ốc hút xe văn phòng & Taxi VIP.",
    strategyEn: "Flagship hub beneath CBD Twin Towers, enjoying full Skyscraper Buff for executive EVs & Taxis."
  },
  {
    id: "rival_5",
    brand: "AzureLake EcoVolt",
    name: "AzureLake EcoVolt (Đường Cổ Ngư - Bích Hồ)",
    nameEn: "AzureLake EcoVolt (Causeway - Azure Lake)",
    x: -645,
    y: -1445,
    vLeftIdx: 3,
    vRightIdx: 4,
    hIdx: 1,
    chargers: 6,
    kw: 60,
    priceKwh: 3850,
    taxiAppeal: 54,
    casualAppeal: 84,
    amenitiesText: "☕ Café Cấp 3 • 🍽️ Nhà hàng Sân vườn Cấp 2",
    amenitiesTextEn: "☕ Egg Café Lv3 • 🍽️ Garden Bistro Lv2",
    strategy: "Trạm sinh thái sát Công viên Bách Thảo & Bích Hồ, hút mạnh xe SUV gia đình đi dạo cuối tuần.",
    strategyEn: "Scenic eco-station near Botanica Park & Azure Lake, magnet for weekend family SUVs."
  },
  {
    id: "rival_6",
    brand: "CentralPark Hub",
    name: "CentralPark Hub (Đại Công Viên Trung Tâm)",
    nameEn: "CentralPark Hub (Grand Central Park)",
    x: -645,
    y: 1615,
    vLeftIdx: 3,
    vRightIdx: 4,
    hIdx: 10,
    chargers: 7,
    kw: 120,
    priceKwh: 3700,
    taxiAppeal: 68,
    casualAppeal: 80,
    amenitiesText: "🍵 Trà đá Cấp 3 • ☕ Café Cấp 2 • 🔋 Đổi pin Cấp 2",
    amenitiesTextEn: "🍵 Iced Tea Lv3 • ☕ Egg Café Lv2 • 🔋 Battery Swap Lv2",
    strategy: "Nằm ngay cổng Đại Công Viên Trung Tâm (Hồ Lục Thủy), đón lượng lớn xe gia đình & Taxi phía Nam.",
    strategyEn: "Right at Grand Central Park (Emerald Lake) gate, capturing southern family & taxi traffic."
  },
  {
    id: "rival_7",
    brand: "EastBank MegaStation",
    name: "EastBank MegaStation (Đại Lộ Đông Giang)",
    nameEn: "EastBank MegaStation (Eastbank Blvd)",
    x: 1515,
    y: -95,
    vLeftIdx: 9,
    vRightIdx: 10,
    hIdx: 5,
    chargers: 8,
    kw: 120,
    priceKwh: 3600,
    taxiAppeal: 88,
    casualAppeal: 44,
    amenitiesText: "🍜 Nhà ăn Phở Cấp 3 • 🛋️ Phòng nghỉ Cấp 3 • 🔋 Đổi pin Cấp 2",
    amenitiesTextEn: "🍜 Noodle Canteen Lv3 • 🛋️ VIP Lounge Lv3 • 🔋 Battery Swap Lv2",
    strategy: "Trạm diện tích khủng phía Đông Sông Ngân Hà, giá sạc rẻ nhất server chuyên gom đoàn xe Taxi đường dài.",
    strategyEn: "Massive Eastbank station with lowest kWh rate on the server, dominating long-haul EV Taxi fleets."
  },
  {
    id: "rival_8",
    brand: "Capitol GreenCharge",
    name: "Capitol GreenCharge (Ngoại Giao - Thượng Uyển)",
    nameEn: "Capitol GreenCharge (Diplomat - Botanica)",
    x: -1365,
    y: -1105,
    vLeftIdx: 1,
    vRightIdx: 2,
    hIdx: 2,
    chargers: 6,
    kw: 60,
    priceKwh: 3780,
    taxiAppeal: 64,
    casualAppeal: 74,
    amenitiesText: "☕ Café Cấp 2 • 🍜 Nhà ăn Cấp 2 • 🍵 Trà đá Cấp 2",
    amenitiesTextEn: "☕ Egg Café Lv2 • 🍜 Noodle Canteen Lv2 • 🍵 Iced Tea Lv2",
    strategy: "Kẹp giữa Công viên Thượng Uyển và khu Ngoại giao đoàn, cân bằng cả khách gia đình lẫn Taxi.",
    strategyEn: "Nestled between Royal Garden Park and the Diplomatic Quarter, balanced for families & Taxis."
  }
];


// DANH MỤC 12 QUẬN ĐẠI ĐÔ THỊ NOVAVERDE (100% TÊN TỰ ĐẶT BẢN QUYỀN GỐC + SONG NGỮ TUYỆT ĐỐI VI / EN)
export const HANOI_12_DISTRICTS = [
  {
    idx: 0, id: "HOANG_KIM", code: "Q1", codeEn: "D1", name: "Quận Hoàng Kim", nameEn: "Aurum Heritage District",
    tier: "Tier S • Lõi Di Sản 36 Phố Cổ Hoàng Kim", tierEn: "Tier S • 36 Heritage Guild Streets Core", priceMult: 1.35, rushMode: "ALL_DAY",
    hasRiver: true, hasRailway: true, archStyle: "OLD_QUARTER",
    centralWonderName: "🐢 Hồ Tinh Cầu • Tháp Ngọc Lục Bảo • Đền Thái Dương & Cầu Hồng Nhật",
    centralWonderNameEn: "🐢 Starlight Lake • Emerald Spire • Sun Temple & Crimson Bridge",
    archDesc: "Nhà ống cổ mái ngói đỏ giật cấp, Biệt thự cổ điển, Phố đi bộ & Đê Sông Ngân Hà",
    archDescEn: "Stepped red-tile shophouses, Classical villas, Walking Promenade & Silverstar River Dyke",
    wards: ["P. Kim Ngân", "P. Ngọc Quang", "P. Đông Môn"],
    wardsEn: ["Goldleaf Ward", "Jadeplaza Ward", "Eastgate Ward"],
    streets: ["Kim Ngân", "Ngọc Châu", "Hoàng Gia", "Bạch Ngân", "Thiên Tinh", "Nhật Nguyệt", "Phượng Hoàng", "Thái Dương", "Ngọc Hồ", "Trường Thịnh", "Minh Châu", "Cổ Tháp", "Thủy Đài", "Chợ Lớn", "Đông Môn"],
    streetsEn: ["Goldleaf", "Jadestone", "Imperial", "Silvercrest", "Starlight", "Sunmoon", "Phoenix", "Solaris", "Lakeview", "Galleria", "Pearlview", "Oldarch", "Watertower", "Grandmarket", "Eastgate"]
  },
  {
    idx: 1, id: "THIEN_DINH", code: "Q2", codeEn: "D2", name: "Quận Thiên Đình", nameEn: "Celestia Capitol District",
    tier: "Tier S • Trung Tâm Hành Chính & Ngoại Giao Đoàn", tierEn: "Tier S • Capitol & Diplomatic Center", priceMult: 1.28, rushMode: "MORNING",
    hasRiver: false, hasRailway: true, archStyle: "FRENCH_ADMIN",
    centralWonderName: "🏛️ Quảng Trường Thiên Đình • Cung Điện Trung Tâm & Đài Liên Hoa",
    centralWonderNameEn: "🏛️ Celestia Grand Square • Capitol Hall & One-Pillar Lotus Pavilion",
    archDesc: "Quảng trường cỏ ô vuông lịch sử, Dinh thự mái Mansard vàng kem, Đại sứ quán & Hồ Ngọc Bích",
    archDescEn: "Historic grid lawn square, Mansard roof ministries, Embassies & Jade Lagoon",
    wards: ["P. Quảng Trường", "P. Bắc Đài", "P. Ngoại Giao"],
    wardsEn: ["Capitol Square Ward", "Northcitadel Ward", "Embassy Ward"],
    streets: ["Tự Do", "Thái Bình", "Cổ Thụ", "Bắc Môn", "Hoàng Thành", "Kinh Đô", "Ngoại Giao", "Thiên Lộ", "Bích Ngọc", "Thượng Uyển", "Triển Lãm", "Ngân Hà", "Nghệ Thuật", "An Hòa", "Vạn Lộc"],
    streetsEn: ["Liberty", "Pacifica", "Sycamore", "Northgate", "Citadel", "Capitol", "Diplomat", "Skyway", "Sapphire", "Botanica", "Expo", "Galaxy", "Finearts", "Harmony", "Prosperity"]
  },
  {
    idx: 2, id: "BICH_HO", code: "Q3", codeEn: "D3", name: "Quận Bích Hồ", nameEn: "Azure Lake District",
    tier: "Tier S • Bán Đảo Bích Hồ & Biệt Thự Ven Hồ", tierEn: "Tier S • Azure Lake Peninsula & Resort Villas", priceMult: 1.25, rushMode: "EVENING",
    hasRiver: true, hasRailway: false, archStyle: "LAKE_RESORT",
    centralWonderName: "🌊 Đại Bích Hồ • Bảo Tháp Liên Hoa 11 Tầng & Đầm Sen Ngọc Bích",
    centralWonderNameEn: "🌊 Grand Azure Lake • 11-Story Lotus Stupa & Jade Lotus Lagoon",
    archDesc: "Mặt nước Bích Hồ mênh mông, Bảo tháp sen 11 tầng, Bến du thuyền, Đầm sen hồng & Biệt thự nghỉ dưỡng",
    archDescEn: "Vast Azure Lake waters, 11-tier crimson lotus stupa, Yacht marina, Pink lotus pond & Resort villas",
    wards: ["P. Bán Đảo Sen", "P. Xuân Đào", "P. Cầu Vồng"],
    wardsEn: ["Lotus Peninsula Ward", "Peachblossom Ward", "Rainbow Bridge Ward"],
    streets: ["Cổ Ngư", "Bán Đảo", "Xuân Hồng", "Bạch Liên", "Nguyệt Quế", "Thủy Tiên", "Ven Hồ", "Thụy Dương", "Long Vân", "Thiên Nga", "Đào Nguyên", "Cầu Vồng", "Bến Du Thuyền", "Sương Mai", "Đầm Sen"],
    streetsEn: ["Causeway", "Peninsula", "Rosewood", "Whitelotus", "Laurel", "Daffodil", "Lakeshore", "Sunbreeze", "Cloudragon", "Swanbay", "Peachgrove", "Rainbow", "Marina", "Morningdew", "Lotuspond"]
  },
  {
    idx: 3, id: "VAN_HIEN", code: "Q4", codeEn: "D4", name: "Quận Văn Hiến", nameEn: "Academica District",
    tier: "Tier S • Học Viện Cổ Điển & Thương Mại Sầm Uất", tierEn: "Tier S • Classical Academy & High-Density Hub", priceMult: 1.20, rushMode: "ALL_DAY",
    hasRiver: false, hasRailway: true, archStyle: "DENSE_URBAN",
    centralWonderName: "🎓 Học Viện Cổ Điển • Khuê Tinh Các & Vườn Bia Tri Thức",
    centralWonderNameEn: "🎓 Classical Academy • Starlight Pavilion & Scholars Stele Garden",
    archDesc: "Khuê Tinh Các 8 mái cổ kính, Hồ Tri Thức, Khu phố thời trang & Trung tâm thương mại sầm uất",
    archDescEn: "8-roof Starlight Pavilion, Wisdom Lake & bustling Fashion and Commercial avenues",
    wards: ["P. Học Viện", "P. Nhạc Viện", "P. Tháp Khuê Tinh"],
    wardsEn: ["Academy Ward", "Conservatory Ward", "Starpavilion Ward"],
    streets: ["Học Viện", "Tri Thức", "Danh Nhân", "Tây Đô", "Thời Trang", "Thương Mại", "Truyền Hình", "Hồ Xanh", "Đại Lộ Mới", "Ngã Sáu", "Thiên Văn", "Sông Xanh", "Ga Nhạc Viện", "Hào Quang", "Phố Trẻ"],
    streetsEn: ["Academy", "Wisdom", "Scholars", "Westplaza", "Fashion", "Commerce", "Media", "Greenlake", "Newboulevard", "Hexagon", "Astronomy", "Greenriver", "Metrohub", "Radiance", "Youth"]
  },
  {
    idx: 4, id: "SILICON_CBD", code: "Q5", codeEn: "D5", name: "Quận Silicon CBD", nameEn: "Silicon Valley CBD",
    tier: "Tier A • Thung Lũng Công Nghệ & Cao Ốc AI", tierEn: "Tier A • Tech Valley & AI Skyscrapers", priceMult: 1.12, rushMode: "MORNING",
    hasRiver: false, hasRailway: false, archStyle: "TECH_CBD",
    centralWonderName: "🏙️ Siêu Tháp Đôi Công Nghệ Silicon CBD & Quảng Trường AI",
    centralWonderNameEn: "🏙️ Silicon Twin Tech Towers, Glass Skybridge & AI Plaza",
    archDesc: "Rừng cao ốc kính Curtain-Wall, Trụ sở Tập đoàn Công nghệ, Cầu nối Skybridge & Helipad H",
    archDescEn: "Curtain-wall glass skyscrapers, High-Tech HQ cluster, Skybridge & Rooftop Helipads",
    wards: ["P. Công Nghệ Cao", "P. Trung Tâm Số", "P. Trí Tuệ AI"],
    wardsEn: ["High-Tech Ward", "Digital Core Ward", "AI Innovation Ward"],
    streets: ["Sáng Tạo", "Dữ Liệu", "Thung Lũng Số", "Quang Học", "Vi Mạch", "Trung Tâm Số", "Đại Lộ Kính", "Khoa Học", "Tương Lai", "Bán Dẫn", "Đổi Mới", "Khởi Nghiệp", "Điện Toán", "Vệ Tinh", "Trí Tuệ AI"],
    streetsEn: ["Innovation", "Datastream", "Techvalley", "Optics", "Microchip", "Digitalcore", "Glassblvd", "Science", "Futura", "Semicon", "Vanguard", "Startup", "Cloudcomputing", "Satellite", "Aptech"]
  },
  {
    idx: 5, id: "OLYMPUS", code: "Q6", codeEn: "D6", name: "Quận Thể Thao Olympus", nameEn: "Olympus Sports District",
    tier: "Tier A • Liên Hợp Thể Thao & Đường Đua F1", tierEn: "Tier A • International Sports & F1 Circuit Hub", priceMult: 1.10, rushMode: "MORNING",
    hasRiver: false, hasRailway: false, archStyle: "SPORTS_CBD",
    centralWonderName: "🏟️ Sân Vận Động Quốc Tế Olympus 3D & Đường Đua F1 Apex",
    centralWonderNameEn: "🏟️ Olympus International Stadium 3D & Apex Grand Prix Circuit",
    archDesc: "SVĐ Olympus mái vòm thép cong với mặt cỏ bóng đá chuẩn FIFA, Đỉnh Tháp Aera 72 & Đại lộ Mặt Trời",
    archDescEn: "Curved steel-truss Olympus Stadium with FIFA pitch, Aera Landmark 72 & Solar Blvd",
    wards: ["P. Sân Vận Động", "P. Trung Tâm Hội Nghị", "P. Đường Đua F1"],
    wardsEn: ["Grand Arena Ward", "Convention Center Ward", "Apex Circuit Ward"],
    streets: ["Khải Hoàn", "Vô Địch", "Hội Nghị", "Bảo Tàng", "Đường Đua F1", "Thể Thao", "Huy Chương", "Ngọn Đuốc", "Liên Đoàn", "Đại Lộ Mặt Trời", "Quán Quân", "Tốc Độ", "Vinh Quang", "Đấu Trường", "Tháp Cao 72"],
    streetsEn: ["Triumph", "Champion", "Convention", "Museum", "Grandprix", "Athletics", "Goldmedal", "Torchlight", "Federation", "Solarblvd", "Victory", "Velocity", "Glory", "Colosseum", "Apex72"]
  },
  {
    idx: 6, id: "TAN_CO_DIEN", code: "Q7", codeEn: "D7", name: "Quận Tân Cổ Điển", nameEn: "Imperia Plaza District",
    tier: "Tier A • Đại Đô Thị Tân Cổ Điển & Nút Giao Vành Đai 3", tierEn: "Tier A • Neoclassical Mega-Plaza & Ring Rd 3", priceMult: 1.05, rushMode: "EVENING",
    hasRiver: false, hasRailway: false, archStyle: "EURO_TOWERS",
    centralWonderName: "🏢 Khải Hoàn Môn Imperia Plaza & Quảng Trường Tượng Tứ Mã Vàng",
    centralWonderNameEn: "🏢 Imperia Arch Plaza & Golden Quadriga European Square",
    archDesc: "Cổng Khải Hoàn Môn trắng-vàng Imperia Plaza, Quảng trường điêu khắc Châu Âu & Tổ hợp chung cư cao tầng",
    archDescEn: "White-gold Imperia Archway, European sculpture plaza & high-rise residential towers",
    wards: ["P. Khải Hoàn Môn", "P. Quảng Trường Âu", "P. Đại Lộ Vòng Cung"],
    wardsEn: ["Imperial Arch Ward", "Europlaza Ward", "Grand Ring Ward"],
    streets: ["Hoàng Đế", "Vành Đai 3", "Tân Cổ Điển", "Phố Châu Âu", "Bạch Kim", "Cẩm Thạch", "Tháp Vàng", "Cung Đường Xanh", "Thượng Uyển Nam", "Suối Ngọc", "Đại Lộ Đôi", "Quảng Trường Lớn", "Nhân Hòa", "Bình Minh", "Phồn Vinh"],
    streetsEn: ["Emperor", "Ringroad", "Neoclassic", "Eurostreet", "Platinum", "Marble", "Goldtower", "Greenway", "Southgarden", "Crystalstream", "Twinavenue", "Grandplaza", "Concord", "Sunrise", "Affluence"]
  },
  {
    idx: 7, id: "DAI_CONG_VIEN", code: "Q8", codeEn: "D8", name: "Quận Đại Công Viên", nameEn: "Central Park District",
    tier: "Tier A • Đại Công Viên & Khu Đại Học Bách Khoa", tierEn: "Tier A • Grand Central Park & Polytechnic University", priceMult: 1.08, rushMode: "ALL_DAY",
    hasRiver: true, hasRailway: true, archStyle: "COMMERCIAL_PARK",
    centralWonderName: "🌳 Đại Công Viên Trung Tâm • Hồ Lục Thủy & Cổng Parabol Bách Khoa",
    centralWonderNameEn: "🌳 Grand Central Park • Emerald Lake & Polytechnic Parabolic Arch",
    archDesc: "Hồ Lục Thủy – Đảo Hòa Bình xanh mát, Cổng Parabol Đại học Bách Khoa, Tháp Đôi V-Plaza & Thời Đại City",
    archDescEn: "Emerald Lake & Peace Island, Polytechnic Parabolic Arch, V-Plaza Twin Towers & Chronos Park City",
    wards: ["P. Công Viên Lớn", "P. Đại Học Bách Khoa", "P. Thành Phố Thời Đại"],
    wardsEn: ["Central Park Ward", "Polytechnic Ward", "Chronos City Ward"],
    streets: ["Tháp Đôi", "Phố Thương Mại", "Đại Lộ Công Viên", "Vành Đai Trong", "Hoa Anh Đào", "Thời Đại", "Bách Khoa", "Kinh Tế", "Xây Dựng", "Cổ Thụ Xanh", "Bến Cảng Nam", "Sông Ngọc", "Nhạc Nước", "Mùa Xuân", "Cầu Lớn"],
    streetsEn: ["Twintowers", "Midtown", "Parkavenue", "Innerring", "Sakura", "Chronos", "Polytech", "Economics", "Engineering", "Greenoak", "Southport", "Jaderiver", "Fountain", "Springtime", "Grandbridge"]
  },
  {
    idx: 8, id: "DONG_GIANG", code: "Q9", codeEn: "D9", name: "Quận Đông Giang Eco", nameEn: "Eastbank Eco District",
    tier: "Tier B • Đô Thị Sinh Thái Ven Sông & Đại Siêu Thị", tierEn: "Tier B • Riverside Eco-Villas & Mega Mall", priceMult: 0.82, rushMode: "EVENING",
    hasRiver: true, hasRailway: true, archStyle: "RIVERSIDE_ECO",
    centralWonderName: "🌉 Đại Siêu Thị Sakura Mall & Khu Biệt Thự Kênh Đào Lục Bảo",
    centralWonderNameEn: "🌉 Sakura Mega Mall & Emerald Canal Riverside Eco-Villas",
    archDesc: "Cầu giàn thép lịch sử vượt Sông Ngân Hà, Đại siêu thị Sakura Mall & Biệt thự ven kênh đào Lục Bảo",
    archDescEn: "Historic cantilever river bridge, Sakura Mega Mall & white riverside canal villas",
    wards: ["P. Bến Bờ Đông", "P. Kênh Đào Xanh", "P. Đại Siêu Thị"],
    wardsEn: ["Eastbank Ward", "Emerald Canal Ward", "Sakura Mall Ward"],
    streets: ["Đông Giang", "Bến Ngọc", "Cổ Tháp Đông", "Anh Đào", "Kênh Đào Xanh", "Biệt Thự Sông", "Vườn Sinh Thái", "Công Nghệ Xanh", "Bình Minh Đông", "Thảo Nguyên", "Ngọc Thụy", "Bồ Đề Xanh", "Hồng Nhật", "Phong Lan", "Phượng Vĩ"],
    streetsEn: ["Eastbank", "Jadewharf", "Eastspire", "Cherryblossom", "Emeraldcanal", "Rivervilla", "Ecogarden", "Greentech", "Eastsunrise", "Meadow", "Gemstone", "Banyan", "Redsun", "Orchid", "Flamboyant"]
  },
  {
    idx: 9, id: "METRO_LUA", code: "Q10", codeEn: "D10", name: "Quận Metro & Làng Lụa", nameEn: "Metroline & Silk District",
    tier: "Tier B • Tuyến SkyTrain Trên Cao & Làng Lụa Cổ Truyền", tierEn: "Tier B • Elevated SkyTrain & Artisan Silk Village", priceMult: 0.78, rushMode: "EVENING",
    hasRiver: false, hasRailway: true, archStyle: "METRO_SILK",
    centralWonderName: "🚇 Ga Tàu Điện Trên Cao SkyTrain & Phố Ô Lụa Cổ Truyền Đa Sắc",
    centralWonderNameEn: "🚇 Elevated SkyTrain Station & Colorful Artisan Silk Umbrella Street",
    archDesc: "Cầu cạn & Đoàn tàu SkyTrain xanh lá hiện đại kết hợp Cổng làng cổ & Phố ô lụa đa sắc màu",
    archDescEn: "Elevated concrete viaduct & green SkyTrain alongside 1,000-year-old Artisan Silk Umbrella Street",
    wards: ["P. Ga Metro Trên Cao", "P. Hồ Cầu Vồng", "P. Làng Lụa Cổ"],
    wardsEn: ["Skytrain Station Ward", "Rainbow Lake Ward", "Artisan Silk Ward"],
    streets: ["Quang Minh", "Trục Bắc Nam", "Ga Trên Cao", "Làng Lụa Cổ", "Nghệ Nhân", "Hồ Cầu Vồng", "Tháp Tây Nam", "Vành Đai Tây", "Công Viên Thiên Văn", "Phố Dệt Lụa", "Chợ Tơ Tằm", "Khải Hoàn Nam", "Đầm Sen Xanh", "Đô Thị Mới", "Thương Gia"],
    streetsEn: ["Brightway", "Transitaxis", "Skytrain", "Silkville", "Artisan", "Rainbowlake", "Southwesttwin", "Westring", "Astropark", "Silkweave", "Mulberry", "Southtriumph", "Greenlotus", "Newtown", "Merchant"]
  },
  {
    idx: 10, id: "BAC_NGAN_HA", code: "Q11", codeEn: "D11", name: "Bắc Ngân Hà Smart City", nameEn: "North Galaxy Smart City",
    tier: "Tier B • Siêu Đô Thị Thông Minh Bắc Sông Ngân Hà", tierEn: "Tier B • North Silverstar Smart Megacity", priceMult: 0.75, rushMode: "EVENING",
    hasRiver: true, hasRailway: false, archStyle: "SMART_MEGA",
    centralWonderName: "🚀 Siêu Tháp Tài Chính Solaris 108 Tầng & Thành Xoáy Ốc Cổ Đại",
    centralWonderNameEn: "🚀 108-Story Solaris Financial Tower & Ancient Spiral Citadel",
    archDesc: "Tháp Tài Chính Thông Minh 108 tầng cao nhất NovaVerde, Cầu dây văng 5 trụ đỏ & Thành Xoáy Ốc",
    archDescEn: "108-story Smart Financial Supertall Tower, 5-pylon cable-stayed bridge & Spiral Citadel",
    wards: ["P. Tháp Tài Chính 108", "P. Cầu Dây Văng", "P. Thành Xoáy Ốc"],
    wardsEn: ["108F FinTower Ward", "Cable Bridge Ward", "Spiral Citadel Ward"],
    streets: ["Cao Tốc Sân Bay", "Bắc Ngân Hà", "Tháp Tài Chính", "Cầu Dây Văng", "Thành Xoáy Ốc", "Triển Lãm Quốc Tế", "Đô Thị Thông Minh", "Năng Lượng Xanh", "Cổng Mặt Trời", "Vệ Tinh Bắc", "Hồ Thiên Nga", "Bến Cảng Bắc", "Thung Lũng Hoa", "Kinh Đô Cổ", "Vành Đai Bắc"],
    streetsEn: ["Airportexp", "Northgalaxy", "Fintower", "Cablebridge", "Spiralcitadel", "Expocenter", "Smartcity", "Cleanenergy", "Sungate", "Northsat", "Swanlake", "Northharbor", "Flowervalley", "Oldcapital", "Northring"]
  },
  {
    idx: 11, id: "VINH_NGOC_TRAI", code: "Q12", codeEn: "D12", name: "Vịnh Ngọc Trai Ocean", nameEn: "Pearl Lagoon District",
    tier: "Tier B • Thành Phố Biển Hồ Nhân Tạo & Làng Gốm Sứ", tierEn: "Tier B • Saltwater Lagoon City & Ceramic Village", priceMult: 0.72, rushMode: "EVENING",
    hasRiver: true, hasRailway: false, archStyle: "OCEAN_LAGOON",
    centralWonderName: "🌴 Biển Hồ Nước Mặn Cát Trắng Vịnh Ngọc Trai & Làng Gốm Sứ Cổ",
    centralWonderNameEn: "🌴 Pearl White-Sand Saltwater Lagoon & Artisan Ceramic Kilns",
    archDesc: "Biển hồ nước mặn nhân tạo bãi cát trắng rặng dừa nhiệt đới, Bến du thuyền & Lò bầu gốm sứ cổ",
    archDescEn: "Turquoise artificial saltwater lagoon with white sandy beaches, Yachts & historic brick ceramic kilns",
    wards: ["P. Biển Hồ Cát Trắng", "P. Đảo San Hô", "P. Làng Gốm Sứ"],
    wardsEn: ["White-Sand Lagoon Ward", "Coral Island Ward", "Ceramic Kiln Ward"],
    streets: ["Đại Dương Xanh", "Biển Hồ", "San Hô", "Ngọc Trai", "Hải Âu", "Sao Biển", "Du Thuyền Đông", "Quảng Trường Biển", "Rặng Dừa", "Hải Đăng", "Làng Gốm Sứ", "Bến Thuyền Gốm", "Nghệ Nhân Gốm", "Lò Bầu Cổ", "Đông Nam"],
    streetsEn: ["Blueocean", "Lagoon", "Coral", "Pearl", "Seagull", "Starfish", "Eastmarina", "Oceanplaza", "Palmgrove", "Lighthouse", "Ceramicville", "Potterywharf", "Craftsman", "Oldkiln", "Southeast"]
  }
];

// XÂY DỰNG LƯỚI 6 × 6 = 36 PHÂN KHU PHƯỜNG LIỀN KỀ (SECTOR 0 = Q1. HOÀNG KIM - P. KIM NGÂN ĐẶT TẠI TÂM gx=2, gy=2 -> ox=0, oy=0)
export const SECTOR_GRID_LOOKUP = Array.from({ length: 6 }, () => Array(6).fill(null));
export const MEGA_SECTORS_36 = (() => {
  const gridCoords = [{ gx: 2, gy: 2 }];
  for (let gy = 0; gy < 6; gy++) {
    for (let gx = 0; gx < 6; gx++) {
      if (gx === 2 && gy === 2) continue;
      gridCoords.push({ gx, gy });
    }
  }
  const list = [];
  for (let sIdx = 0; sIdx < 36; sIdx++) {
    const dIdx = Math.floor(sIdx / 3);
    const wIdx = sIdx % 3;
    const d = HANOI_12_DISTRICTS[dIdx];
    const wName = d.wards[wIdx];
    const wNameEn = d.wardsEn ? d.wardsEn[wIdx] : wName.replace("P. ", "") + " Ward";
    const shortWard = wName.replace("P. ", "");
    const shortWardEn = wNameEn.replace(" Ward", "");
    const { gx, gy } = gridCoords[sIdx];
    const ox = (gx - 2) * SECTOR_SPAN_X;
    const oy = (gy - 2) * SECTOR_SPAN_Y;
    const sec = {
      sIdx,
      districtIdx: dIdx,
      wardIdx: wIdx,
      districtCode: d.code,
      districtCodeEn: d.codeEn || d.code.replace("Q", "D"),
      districtName: d.name,
      districtNameEn: d.nameEn,
      districtTier: d.tier,
      districtTierEn: d.tierEn,
      wardName: wName,
      wardNameEn: wNameEn,
      shortWard,
      shortWardEn,
      priceMult: d.priceMult,
      rushMode: d.rushMode,
      hasRiver: d.hasRiver,
      hasRailway: d.hasRailway,
      archStyle: d.archStyle,
      centralWonderName: d.centralWonderName,
      centralWonderNameEn: d.centralWonderNameEn,
      archDesc: d.archDesc,
      archDescEn: d.archDescEn,
      streets: d.streets,
      streetsEn: d.streetsEn || d.streets,
      gx,
      gy,
      ox,
      oy,
      startLot: sIdx * 150 + 1,
      endLot: (sIdx + 1) * 150
    };
    list.push(sec);
    SECTOR_GRID_LOOKUP[gy][gx] = sec;
  }
  return list;
})();

export function getSectorAtWorldPos(wx, wy) {
  const gx = Math.max(0, Math.min(5, Math.round(wx / SECTOR_SPAN_X) + 2));
  const gy = Math.max(0, Math.min(5, Math.round(wy / SECTOR_SPAN_Y) + 2));
  return SECTOR_GRID_LOOKUP[gy][gx] || MEGA_SECTORS_36[0];
}

globalThis.SECTOR_LOTS_MAP = Array.from({ length: 36 }, () => []);
export const SECTOR_RIVALS_MAP = Array.from({ length: 36 }, () => []);
export const MEGA_RIVALS_288 = (() => {
  const allRivals = [];
  MEGA_SECTORS_36.forEach(sec => {
    RIVAL_STATIONS.forEach((rv, rIdx) => {
      const dStreet = sec.streets[(rIdx * 2 + sec.wardIdx) % sec.streets.length];
      const dStreetEn = (sec.streetsEn || sec.streets)[(rIdx * 2 + sec.wardIdx) % (sec.streetsEn || sec.streets).length];
      const customRivalName = sec.sIdx === 0
        ? rv.name
        : `[${sec.districtCode}-${sec.shortWard}] ${rv.brand} ${dStreet}`;
      const customRivalNameEn = sec.sIdx === 0
        ? (rv.nameEn || rv.name)
        : `[${sec.districtCodeEn}-${sec.shortWardEn || sec.shortWard}] ${rv.brand} ${dStreetEn} St`;
      const cloned = {
        ...rv,
        id: `rival_s${sec.sIdx}_${rIdx + 1}`,
        sectorIdx: sec.sIdx,
        districtIdx: sec.districtIdx,
        ox: sec.ox,
        oy: sec.oy,
        x: rv.x + sec.ox,
        y: rv.y + sec.oy,
        name: customRivalName,
        nameEn: customRivalNameEn
      };
      SECTOR_RIVALS_MAP[sec.sIdx].push(cloned);
      allRivals.push(cloned);
    });
  });
  return allRivals;
})();


export const MINIMAP_DISTRICT_FILLS = [
  "rgba(180, 83, 9, 0.34)",   // Q1. Hoàn Kiếm (Phố cổ Hổ phách)
  "rgba(30, 64, 175, 0.34)",  // Q2. Ba Đình (Quảng trường Xanh Hoàng gia)
  "rgba(13, 148, 136, 0.36)", // Q3. Tây Hồ (Hồ Tây Xanh Ngọc)
  "rgba(157, 23, 77, 0.32)",  // Q4. Đống Đa (Văn Miếu Đỏ Hồng)
  "rgba(2, 132, 199, 0.36)",  // Q5. Cầu Giấy (Tech CBD Xanh Lam)
  "rgba(79, 70, 229, 0.34)",  // Q6. Mỹ Đình (Thể thao Tím Indigo)
  "rgba(5, 150, 105, 0.34)",  // Q7. Thanh Xuân (Đô thị Xanh Lục)
  "rgba(217, 119, 6, 0.32)",  // Q8. Hai Bà Trưng (Thương mại Vàng Đồng)
  "rgba(14, 116, 144, 0.36)", // Q9. Long Biên (Sinh thái Ven Sông)
  "rgba(124, 58, 237, 0.34)", // Q10. Hà Đông (Làng Lụa Tím)
  "rgba(16, 185, 129, 0.36)", // Q11. Đông Anh (Smart City Lục Bảo)
  "rgba(6, 182, 212, 0.36)"   // Q12. Gia Lâm (Biển Hồ Ngọc Bích)
];


// Đăng ký vào globalThis để tương thích ngược với HTML event handlers & các module liên kết
Object.assign(globalThis, {
  isRedRiverCorridor,
  isMajorParkBlock,
  getSectorAtWorldPos,
  V_ROADS,
  H_ROADS,
  MAJOR_PARKS,
  HOAN_KIEM_BUILDINGS,
  RIVAL_STATIONS,
  HANOI_12_DISTRICTS,
  SECTOR_GRID_LOOKUP,
  MEGA_SECTORS_36,
  SECTOR_RIVALS_MAP,
  MEGA_RIVALS_288,
  MINIMAP_DISTRICT_FILLS,
  SECTOR_LOTS_MAP
});
