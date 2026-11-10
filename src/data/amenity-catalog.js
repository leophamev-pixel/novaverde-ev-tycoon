/**
 * src/data/amenity-catalog.js
 * Danh mục 6 loại Tiện ích đi kèm trạm sạc (3 cấp độ nâng cấp/loại)
 */
export const AMENITY_CATALOG = [
  {
    id: "tra_da",
    icon: "🍵",
    shortLabel: "Trà Đá",
    shortLabelEn: "Iced Tea",
    name: "Quầy Trà Đá & Hướng Dương Vỉa Hè",
    nameEn: "Sidewalk Iced Tea & Sunflower Seeds Stall",
    footprintBaseM2: 6,
    footprintStepM2: 2,
    baseCost: 6000000,
    baseRevPerCar: 12000,
    taxiAppeal: 18,
    casualAppeal: 10,
    color: "#22c55e",
    roofColor: "#16a34a",
    desc: "Ghế nhựa xanh đỏ & ô che vỉa hè. Chiếm ít đất nhất (6–10 m²), cực hút tài xế Taxi Lục Bảo!",
    descEn: "Iconic plastic stools & umbrella stall. Minimal footprint (6–10 m²), huge magnet for Emerald EV Taxis!"
  },
  {
    id: "doi_pin",
    icon: "🔋",
    shortLabel: "Đổi Pin",
    shortLabelEn: "Battery Swap",
    name: "Tủ Đổi Pin Xe Máy EcoVolt & Rửa Xe Nhanh",
    nameEn: "EcoVolt E-Scooter Battery Swap & Express Wash",
    footprintBaseM2: 12,
    footprintStepM2: 3,
    baseCost: 32000000,
    baseRevPerCar: 26000,
    taxiAppeal: 22,
    casualAppeal: 12,
    color: "#0d9488",
    roofColor: "#0f766e",
    desc: "Tủ đổi pin thông minh EcoVolt 9 ngăn kèm khoang xịt rửa bọt tuyết tự động (12–18 m²).",
    descEn: "9-slot smart battery swap kiosk for E-Scooters & delivery riders plus foam wash bay (12–18 m²)."
  },
  {
    id: "cafe",
    icon: "☕",
    shortLabel: "Café",
    shortLabelEn: "Egg Café",
    name: "Quán Café Cổ Điển & Cà Phê Trứng Hoàng Kim",
    nameEn: "Heritage Egg Coffee & Artisan Roastery",
    footprintBaseM2: 16,
    footprintStepM2: 4,
    baseCost: 18000000,
    baseRevPerCar: 28000,
    taxiAppeal: 10,
    casualAppeal: 18,
    color: "#d97706",
    roofColor: "#b45309",
    desc: "Gian nhà mái ngói cổ & ly cà phê 3D bốc khói trên mái (16–24 m²), rất hút nhóm xe cá nhân.",
    descEn: "Heritage tiled café with a giant steaming 3D phin coffee cup on the roof (16–24 m²), loved by private EV owners."
  },
  {
    id: "phong_nghi",
    icon: "🛋️",
    shortLabel: "P.Nghỉ",
    shortLabelEn: "VIP Lounge",
    name: "Phòng Nghỉ Tài Xế Máy Lạnh (VIP Lounge)",
    nameEn: "Air-Conditioned Driver VIP Lounge",
    footprintBaseM2: 18,
    footprintStepM2: 4,
    baseCost: 28000000,
    baseRevPerCar: 25000,
    taxiAppeal: 26,
    casualAppeal: 12,
    color: "#0284c7",
    roofColor: "#0369a1",
    desc: "Phòng kính điều hòa mát lạnh có dàn nóng AC trên nóc (18–26 m²) cho tài xế nghỉ giao ca.",
    descEn: "Cool glass lounge with rooftop AC units & massage chairs (18–26 m²) for shift-changing taxi drivers."
  },
  {
    id: "nha_an",
    icon: "🍜",
    shortLabel: "Nhà Ăn",
    shortLabelEn: "Pho Canteen",
    name: "Nhà Ăn / Canteen (Phở Bò Gia Truyền & Cơm Nóng)",
    nameEn: "Artisan Beef Noodle Kitchen & Driver Canteen",
    footprintBaseM2: 26,
    footprintStepM2: 6,
    baseCost: 42000000,
    baseRevPerCar: 42000,
    taxiAppeal: 32,
    casualAppeal: 15,
    color: "#dc2626",
    roofColor: "#b91c1c",
    desc: "Gian bếp phở nóng có tô Phở Bò 3D khổng lồ trên mái (26–38 m²). Điểm thu hút Taxi cao nhất!",
    descEn: "Hot noodle kitchen topped with a giant 3D steaming Beef Pho bowl (26–38 m²). #1 Taxi attraction boost!"
  },
  {
    id: "nha_hang",
    icon: "🍽️",
    shortLabel: "Nhà Hàng",
    shortLabelEn: "Garden Bistro",
    name: "Nhà Hàng Sân Vườn & Bistro Cao Cấp",
    nameEn: "Luxury Garden Restaurant & Fine Bistro",
    footprintBaseM2: 38,
    footprintStepM2: 8,
    baseCost: 75000000,
    baseRevPerCar: 75000,
    taxiAppeal: 5,
    casualAppeal: 22,
    color: "#9333ea",
    roofColor: "#7e22ce",
    desc: "Tổ hợp ẩm thực sân vườn sang trọng (38–54 m²) đón chủ xe SUV gia đình đến ăn tối.",
    descEn: "Upscale pergola garden dining complex (38–54 m²) attracting high-spending family EV SUVs."
  }
];


export const COMMERCIAL_DINING_ARCHETYPES = new Set([
  "MEGA_SHOPPING_MALL",
  "BOUTIQUE_GALLERIA",
  "CINEMA_ENTERTAINMENT_HUB",
  "GARDEN_RESTAURANT_PLAZA",
  "NIGHT_FOOD_STREET",
  "ROOFTOP_SKYBAR_LOUNGE",
  "LUXURY_HOTEL_RESORT"
]);


// Đăng ký vào globalThis để tương thích ngược với HTML event handlers & các module liên kết
Object.assign(globalThis, {
  AMENITY_CATALOG,
  COMMERCIAL_DINING_ARCHETYPES
});
