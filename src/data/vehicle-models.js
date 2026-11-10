/**
 * src/data/vehicle-models.js
 * Danh mục 11 loại phương tiện: 4 Ô tô điện (EV), 3 Ô tô xăng (ICE Squatter), 4 Xe máy
 */
// DANH MỤC PHƯƠNG TIỆN ĐÃ ĐỔI TÊN PARODY TRÁNH BẢN QUYỀN 100% & HỖ TRỢ SONG NGỮ VI / EN
export const EV_MODELS = [
  { id: "vv_mini", name: "VinaVolt Mini E3", nameEn: "VinaVolt Mini E3", type: "Cá nhân", typeEn: "Compact EV", batteryKwh: 19, color: "#facc15", roof: "#fef08a", isTaxi: false, isICE: false, isScooter: false, squatterChance: 0.22 },
  { id: "jadecab_e5", name: "JadeCab E5 Taxi", nameEn: "JadeCab E5 Taxi", type: "Taxi Lục Bảo", typeEn: "Emerald EV Taxi", batteryKwh: 38, color: "#14b8a6", roof: "#99f6e4", isTaxi: true, isICE: false, isScooter: false, squatterChance: 0.08 },
  { id: "jadecab_e34", name: "JadeCab Pro E34", nameEn: "JadeCab Pro E34", type: "Taxi Lục Bảo", typeEn: "Emerald EV Taxi", batteryKwh: 42, color: "#06b6d4", roof: "#cffafe", isTaxi: true, isICE: false, isScooter: false, squatterChance: 0.10 },
  { id: "vv_lux7", name: "VinaVolt Lux S7", nameEn: "VinaVolt Lux S7", type: "SUV Gia đình", typeEn: "Family EV SUV", batteryKwh: 75, color: "#f43f5e", roof: "#fecdd3", isTaxi: false, isICE: false, isScooter: false, squatterChance: 0.35 }
];

// PHƯƠNG TIỆN XE XĂNG (ICE CARS & MOTORBIKES) + XE MÁY ĐIỆN ĐỔI PIN (TÊN THƯƠNG HIỆU PARODY AN TOÀN BẢN QUYỀN)
export const ICE_CAR_MODELS = [
  { id: "ice_sedan_w", name: "Sedan Xăng (Velo/Citi)", nameEn: "Gas Sedan (Velo/Citi)", type: "Ô tô Xăng", typeEn: "Gasoline Car", batteryKwh: 0, color: "#e2e8f0", roof: "#f8fafc", isTaxi: false, isICE: true, isScooter: false, squatterChance: 1.0 },
  { id: "ice_suv_blk", name: "SUV Xăng (Terra/Cruiser)", nameEn: "Gas SUV (Terra/Cruiser)", type: "SUV Xăng", typeEn: "Gasoline SUV", batteryKwh: 0, color: "#334155", roof: "#64748b", isTaxi: false, isICE: true, isScooter: false, squatterChance: 1.0 },
  { id: "ice_hatch_slv", name: "Hatchback Xăng (Aura/Swift)", nameEn: "Gas Hatchback (Aura/Swift)", type: "Ô tô Xăng", typeEn: "Gasoline Car", batteryKwh: 0, color: "#94a3b8", roof: "#cbd5e1", isTaxi: false, isICE: true, isScooter: false, squatterChance: 1.0 }
];

export const SCOOTER_MODELS = [
  { id: "ev_moto_feliz", name: "Xe Máy Điện V-Spark / EcoGo", nameEn: "E-Scooter (V-Spark / EcoGo)", type: "Xe máy Điện", typeEn: "Electric Scooter", batteryKwh: 3, color: "#10b981", roof: "#fde047", isTaxi: false, isICE: false, isScooter: true, squatterChance: 0 },
  { id: "ev_moto_shipper", name: "Shipper Xe Máy Điện", nameEn: "EV Delivery Rider", type: "Shipper Điện", typeEn: "EV Courier", batteryKwh: 3.5, color: "#06b6d4", roof: "#f97316", isTaxi: true, isICE: false, isScooter: true, squatterChance: 0 },
  { id: "ice_moto_wave", name: "Xe Số Xăng (V-Wave / Viva)", nameEn: "Gas Moped (V-Wave / Viva)", type: "Xe máy Xăng", typeEn: "Gas Moped", batteryKwh: 0, color: "#ef4444", roof: "#1e293b", isTaxi: false, isICE: true, isScooter: true, squatterChance: 0 },
  { id: "ice_moto_sh", name: "Xe Ga Xăng (S-Lux / Glide)", nameEn: "Gas Scooter (S-Lux / Glide)", type: "Xe máy Xăng", typeEn: "Gas Scooter", batteryKwh: 0, color: "#f8fafc", roof: "#334155", isTaxi: false, isICE: true, isScooter: true, squatterChance: 0 }
];


// Đăng ký vào globalThis để tương thích ngược với HTML event handlers & các module liên kết
Object.assign(globalThis, {
  EV_MODELS,
  ICE_CAR_MODELS,
  SCOOTER_MODELS
});
