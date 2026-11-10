/**
 * src/render/draw-buildings.js
 * Vẽ các Công trình Kiến trúc Di sản, Tòa nhà Phố cổ & Cao ốc Kính 3D (Skyscrapers)
 */
export const NEUTRAL_WALL_PALETTE = [
  { front: "#f5f5f4", side: "#d6d3d1", trim: "#78716c" }, // 0. Đá trắng kem
  { front: "#e7e5e4", side: "#c7c2be", trim: "#57534e" }, // 1. Be xám ấm
  { front: "#fef3c7", side: "#fcd34d", trim: "#92400e" }, // 2. Vàng kem Pháp cổ
  { front: "#f1f5f9", side: "#cbd5e1", trim: "#475569" }, // 3. Đá xám thanh lịch
  { front: "#ffedd5", side: "#fdba74", trim: "#9a3412" }, // 4. Kem đất nung nhạt
  { front: "#dcfce7", side: "#86efac", trim: "#166534" }, // 5. Xanh ngọc lục bảo nhạt
  { front: "#e0f2fe", side: "#7dd3fc", trim: "#0369a1" }, // 6. Xanh băng Bắc Âu
  { front: "#fce7f3", side: "#f9a8d4", trim: "#9d174d" }  // 7. Hồng san hô Art Deco
];

export const NEUTRAL_ROOF_COLORS = [
  { light: "#b45309", dark: "#9a3412" }, // 0. Ngói đất nung trầm (Muted Terracotta)
  { light: "#475569", dark: "#334155" }, // 1. Mái đá phiến Pháp cổ (Slate Mansard)
  { light: "#78716c", dark: "#57534e" }, // 2. Mái ngói nâu xám cổ
  { light: "#dc2626", dark: "#991b1b" }, // 3. Ngói đỏ tươi Hà Nội
  { light: "#0284c7", dark: "#0369a1" }, // 4. Mái kính xanh dương thương mại
  { light: "#059669", dark: "#065f46" }, // 5. Mái xanh sinh thái Eco
  { light: "#7c3aed", dark: "#5b21b6" }, // 6. Mái tím hoàng gia Boutique
  { light: "#d97706", dark: "#92400e" }  // 7. Mái đồng vàng Hoàng gia
];

export const GLASS_TOWER_PALETTES = [
  { g1: "#38bdf8", g2: "#0284c7", accent: "#10b981" }, // 0. Sapphire Blue & Emerald
  { g1: "#34d399", g2: "#059669", accent: "#fde047" }, // 1. Emerald Eco Glass & Gold
  { g1: "#fcd34d", g2: "#d97706", accent: "#fef08a" }, // 2. Champagne Gold Luxury
  { g1: "#c084fc", g2: "#7c3aed", accent: "#38bdf8" }, // 3. Cyber Amethyst & Neon Cyan
  { g1: "#fb7185", g2: "#e11d48", accent: "#fde047" }, // 4. Sunset Coral Rose
  { g1: "#67e8f9", g2: "#0891b2", accent: "#f43f5e" }, // 5. Aqua Marine & Ruby
  { g1: "#e2e8f0", g2: "#475569", accent: "#38bdf8" }, // 6. Platinum Silver Titanium
  { g1: "#fdba74", g2: "#ea580c", accent: "#22c55e" }  // 7. Amber Solar Bronze
];


export const ARCHITECTURAL_CLUSTERS = (function generateDiverseHanoiArchitecture() {
  const clusters = [];
  let seed = 42;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  const ARCHETYPES_16 = [
    "MEGA_SHOPPING_MALL",       // 0. Đại Siêu Thị & TTTM Mái Vòm Kính 3D
    "GARDEN_RESTAURANT_PLAZA",  // 1. Khu Nhà Hàng Sân Vườn & Lẩu Nướng BBQ (6 dù che đa sắc)
    "STEPPED_TOWER",            // 2. Tổ hợp Cao ốc Kính đa sắc xoay 4 góc + Hồ bơi sân thượng
    "NIGHT_FOOD_STREET",        // 3. Phố Bia Hơi & Ẩm Thực Đêm Hà Nội (Đèn lồng & Cốc bia 3D)
    "BOUTIQUE_GALLERIA",        // 4. Khu Phố Thời Trang & Showroom Kính Cầu Nối
    "VILLA_L_SHAPE",            // 5. Biệt Thự Chữ L xoay 4 hướng + Hồ bơi / Đài phun nước
    "ROOFTOP_SKYBAR_LOUNGE",    // 6. Tổ Hợp Rooftop Skybar & Café Sân Thượng
    "SPORTS_PICKLEBALL_CLUB",   // 7. Tổ Hợp 2 Sân Pickleball / Tennis & Đèn Cao Áp
    "LUXURY_HOTEL_RESORT",      // 8. Khách Sạn 5 Sao & Bể Bơi Vô Cực Resort
    "HERITAGE_PAGODA_POND",     // 9. Đền Chùa Cổ 2 Tầng Mái Đao & Hồ Sen Hồng
    "CINEMA_ENTERTAINMENT_HUB", // 10. Rạp Chiếu Phim IMAX & Trung Tâm Giải Trí Đèn LED
    "FOUNTAIN_PLAZA_ART",       // 11. Quảng Trường Nhạc Nước 3 Tầng & Tượng Nghệ Thuật
    "SHOPHOUSE_COURTYARD",      // 12. Quần Thể Nhà Phố Thương Mại Đa Sắc (Xoay ngang/dọc)
    "CAMPUS_TECH_PLAZA",        // 13. Học Viện Quốc Tế & Trung Tâm Công Nghệ Quả Cầu Số
    "BOTANICAL_PAVILION",       // 14. Vườn Hoa Bốn Mùa & Chòi Nghỉ Bát Giác
    "U_COURTYARD_HALL"          // 15. Dinh Thự / Tòa Nhà Chữ U Đa Hướng + Sân Cờ
  ];

  // Mở rộng sang cả Cột biên giới c = 10 (1760..2120) và Hàng biên giới r = 10 (1700..2040) + Cột c = 8 cho các Quận nội địa (Phương án 1C: Không còn bất kỳ ô phố xám trống nào giữa các Quận!)
  const xBlockEdges = [...V_ROADS.map(v => v.x), 2120];
  const yBlockEdges = [...H_ROADS.map(h => h.y), 2040];

  for (let c = 0; c < xBlockEdges.length - 1; c++) {
    for (let r = 0; r < yBlockEdges.length - 1; r++) {
      if (isMajorParkBlock(c, r)) continue;
      const onlyInland = isRedRiverCorridor(c);
      const vxL = xBlockEdges[c];
      const vxR = xBlockEdges[c + 1];
      const hyT = yBlockEdges[r];
      const hyB = yBlockEdges[r + 1];

      const quads = [
        { code: "NW", x: vxL + 38,  y: hyT + 38,  w: 132, h: 102, cx: vxL + 104, cy: hyT + 89 },
        { code: "NE", x: vxR - 170, y: hyT + 38,  w: 132, h: 102, cx: vxR - 104, cy: hyT + 89 },
        { code: "SW", x: vxL + 38,  y: hyB - 140, w: 132, h: 102, cx: vxL + 104, cy: hyB - 89 },
        { code: "SE", x: vxR - 170, y: hyB - 140, w: 132, h: 102, cx: vxR - 104, cy: hyB - 89 }
      ];

      quads.forEach((q, qIdx) => {
        const hasLot = LOT_BLUEPRINTS_36.some(bp => bp.col === c && bp.row === r && bp.posInBlock === q.code);
        if (hasLot) return;

        const hasLandmark = HOAN_KIEM_BUILDINGS.some(b => {
          const bcx = b.x + b.w / 2;
          const bcy = b.y + b.h / 2;
          return Math.abs(bcx - q.cx) < 84 && Math.abs(bcy - q.cy) < 80;
        });
        if (hasLandmark) return;

        const hasRival = RIVAL_STATIONS.some(rv => Math.abs(rv.x - q.cx) < 84 && Math.abs(rv.y - q.cy) < 80);
        if (hasRival) return;

        // Phân bổ 16 kiểu công trình bằng hàm băm phi tuyến theo (c, r, qIdx) để các góc kề nhau không bao giờ lặp lại cùng 1 mẫu nhà!
        const hashIdx = (c * 7 + r * 13 + qIdx * 5 + Math.floor(rand() * 16)) % ARCHETYPES_16.length;
        const archetype = ARCHETYPES_16[hashIdx];

        const pal = NEUTRAL_WALL_PALETTE[Math.floor(rand() * NEUTRAL_WALL_PALETTE.length)];
        const pal2 = NEUTRAL_WALL_PALETTE[Math.floor(rand() * NEUTRAL_WALL_PALETTE.length)];
        const roof = NEUTRAL_ROOF_COLORS[Math.floor(rand() * NEUTRAL_ROOF_COLORS.length)];
        const roof2 = NEUTRAL_ROOF_COLORS[Math.floor(rand() * NEUTRAL_ROOF_COLORS.length)];
        const glassPal = GLASS_TOWER_PALETTES[Math.floor(rand() * GLASS_TOWER_PALETTES.length)];
        const orient = (c * 3 + r * 5 + qIdx + Math.floor(rand() * 4)) % 4; // 0..3 xoay hướng bố cục
        const heightDelta = Math.floor(rand() * 34) - 10; // Biến thiên độ cao tầng (-10..+24px)

        clusters.push({
          col: c,
          row: r,
          code: q.code,
          onlyInland,
          x: q.x,
          y: q.y,
          w: q.w,
          h: q.h,
          cx: q.cx,
          cy: q.cy,
          archetype,
          pal,
          pal2,
          roof,
          roof2,
          glassPal,
          orient,
          heightDelta
        });
      });
    }
  }
  return clusters;
})();


export function drawIso3DSolidBuilding(x, y, w, h, h3d, wallFront, wallSide, roofLight, roofDark, env, opts = {}) {
  const bNW = isoPt(x, y, 0);
  const bNE = isoPt(x + w, y, 0);
  const bSE = isoPt(x + w, y + h, 0);
  const bSW = isoPt(x, y + h, 0);

  const tNW = isoPt(x, y, h3d);
  const tNE = isoPt(x + w, y, h3d);
  const tSE = isoPt(x + w, y + h, h3d);
  const tSW = isoPt(x, y + h, h3d);

  // 0. Bóng đổ chân công trình trên mặt đất
  if (!opts.noShadow && h3d >= 14) {
    const sNW = isoPt(x - 3, y + 3, 0);
    const sNE = isoPt(x + w + 4, y + 3, 0);
    const sSE = isoPt(x + w + 5, y + h + 5, 0);
    const sSW = isoPt(x - 3, y + h + 5, 0);
    fillStrokePoly([sNW, sNE, sSE, sSW], "rgba(15, 23, 42, 0.22)", null, 0);
  }

  // 1. Mặt tường Trái (Tây-Nam: bNW -> bSW -> tSW -> tNW) đón sáng
  fillStrokePoly([bNW, bSW, tSW, tNW], wallFront, "#1e293b", 1.35);

  // 2. Mặt tường Phải (Đông-Nam: bSW -> bSE -> tSE -> tSW) đổ bóng
  fillStrokePoly([bSW, bSE, tSE, tSW], wallSide, "#1e293b", 1.35);

  const isArchitecturalBuilding = !opts.isSimpleBox && w >= 18 && h >= 16 && h3d >= 18;

  if (isArchitecturalBuilding) {
    // 2a. Chân đế đá vát cạnh (Stone Plinth Base) cao 12% tầng trệt
    const plinthV = Math.min(0.14, 3.8 / h3d);
    const pL0 = quadLerp(bNW, bSW, tSW, tNW, 0, plinthV);
    const pL1 = quadLerp(bNW, bSW, tSW, tNW, 1, plinthV);
    const pR1 = quadLerp(bSW, bSE, tSE, tSW, 1, plinthV);
    fillStrokePoly([bNW, bSW, pL1, pL0], "#94a3b8", "#334155", 0.9);
    fillStrokePoly([bSW, bSE, pR1, pL1], "#64748b", "#334155", 0.9);

    // 2b. Gờ phào chỉ phân tầng (Horizontal Cornice Moldings) & Gờ cổ mái
    const floors = Math.max(1, Math.min(6, Math.floor(h3d / 10)));
    for (let fl = 1; fl <= floors; fl++) {
      const vf = fl / floors;
      const cL0 = quadLerp(bNW, bSW, tSW, tNW, 0, vf);
      const cL1 = quadLerp(bNW, bSW, tSW, tNW, 1, vf);
      const cR1 = quadLerp(bSW, bSE, tSE, tSW, 1, vf);
      ctx.strokeStyle = fl === floors ? "#1e293b" : "rgba(71, 85, 105, 0.55)";
      ctx.lineWidth = fl === floors ? 1.8 : 1.0;
      ctx.beginPath();
      ctx.moveTo(cL0.x, cL0.y);
      ctx.lineTo(cL1.x, cL1.y);
      ctx.lineTo(cR1.x, cR1.y);
      ctx.stroke();
    }

    // 3. Hệ thống Cửa Hiệu Tầng 1, Cửa Vòm, Cửa Sổ Khung Đôi & Ban Công Sắt Hoa
    const colsL = Math.max(1, Math.min(5, Math.floor(h / 20)));
    const colsR = Math.max(1, Math.min(5, Math.floor(w / 20)));
    const hashSeed = Math.abs(Math.round(x * 0.37 + y * 0.53));

    for (let fl = 0; fl < floors; fl++) {
      const vBot = (fl + 0.18) / floors;
      const vTop = (fl + 0.74) / floors;

      // Tường Trái (NW -> SW)
      for (let c = 0; c < colsL; c++) {
        const u1 = (c + 0.20) / colsL;
        const u2 = (c + 0.78) / colsL;
        const w0 = quadLerp(bNW, bSW, tSW, tNW, u1, vBot);
        const w1 = quadLerp(bNW, bSW, tSW, tNW, u2, vBot);
        const w2 = quadLerp(bNW, bSW, tSW, tNW, u2, vTop);
        const w3 = quadLerp(bNW, bSW, tSW, tNW, u1, vTop);

        const isLitNight = env.isNight && ((hashSeed + fl * 3 + c) % 4 !== 0);
        const paneCol = (fl === 0 && c === Math.floor(colsL / 2))
          ? (env.isNight ? "#fbbf24" : "#78350f") // Cửa chính tầng trệt
          : (isLitNight ? "#fef08a" : (env.isNight ? "#1e293b" : "#334155"));

        fillStrokePoly([w0, w1, w2, w3], paneCol, "#1e293b", 0.85);

        // Nan cửa sổ chữ thập mảnh & Bệ cửa sổ đá trắng (Window Sill)
        const mB = quadLerp(bNW, bSW, tSW, tNW, (u1 + u2) * 0.5, vBot);
        const mT = quadLerp(bNW, bSW, tSW, tNW, (u1 + u2) * 0.5, vTop);
        ctx.strokeStyle = isLitNight ? "#ca8a04" : "#94a3b8";
        ctx.lineWidth = 0.65;
        ctx.beginPath();
        ctx.moveTo(mB.x, mB.y);
        ctx.lineTo(mT.x, mT.y);
        ctx.stroke();

        if (fl > 0) {
          ctx.strokeStyle = "#f8fafc";
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.moveTo(w0.x, w0.y + 0.6);
          ctx.lineTo(w1.x, w1.y + 0.6);
          ctx.stroke();
        }
      }

      // Tường Phải (SW -> SE) — Mặt tiền chính hướng ra phố
      for (let c = 0; c < colsR; c++) {
        const u1 = (c + 0.20) / colsR;
        const u2 = (c + 0.78) / colsR;
        const w0 = quadLerp(bSW, bSE, tSE, tSW, u1, vBot);
        const w1 = quadLerp(bSW, bSE, tSE, tSW, u2, vBot);
        const w2 = quadLerp(bSW, bSE, tSE, tSW, u2, vTop);
        const w3 = quadLerp(bSW, bSE, tSE, tSW, u1, vTop);

        const isLitNight = env.isNight && ((hashSeed + fl * 5 + c * 2) % 4 !== 0);
        const paneCol = (fl === 0)
          ? (env.isNight ? "#fde047" : "#0f172a") // Tủ kính / Cửa hiệu tầng 1
          : (isLitNight ? "#fef08a" : (env.isNight ? "#1e293b" : "#1e3a8a"));

        fillStrokePoly([w0, w1, w2, w3], paneCol, "#1e293b", 0.85);

        // Khung chia cánh cửa sổ & Bệ đá
        const mB = quadLerp(bSW, bSE, tSE, tSW, (u1 + u2) * 0.5, vBot);
        const mT = quadLerp(bSW, bSE, tSE, tSW, (u1 + u2) * 0.5, vTop);
        ctx.strokeStyle = isLitNight ? "#ca8a04" : "#94a3b8";
        ctx.lineWidth = 0.65;
        ctx.beginPath();
        ctx.moveTo(mB.x, mB.y);
        ctx.lineTo(mT.x, mT.y);
        ctx.stroke();

        // Ban công sắt hoa & Bồn cây cảnh trên tầng 2 (fl === 1)
        if (fl === 1 && (c + hashSeed) % 2 === 0) {
          ctx.strokeStyle = "#1e293b";
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(w0.x, w0.y);
          ctx.lineTo(w0.x + 1.5, w0.y - 3.2);
          ctx.lineTo(w1.x + 1.5, w1.y - 3.2);
          ctx.lineTo(w1.x, w1.y);
          ctx.stroke();
          // Chậu hoa ban công xanh-đỏ
          ctx.fillStyle = "#16a34a";
          ctx.beginPath();
          ctx.arc((w0.x + w1.x) * 0.5 + 1, (w0.y + w1.y) * 0.5 - 1.5, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 3b. Mái hiên di động kẻ sọc 3D tầng 1 (Ground-floor Storefront Striped Awning) cho nhà phố
    if (!opts.noAwning && floors >= 2 && (hashSeed % 3 !== 0 || opts.forceAwning)) {
      const vAwTop = 0.95 / floors;
      const vAwBot = 0.72 / floors;
      const a0 = quadLerp(bSW, bSE, tSE, tSW, 0.08, vAwTop);
      const a1 = quadLerp(bSW, bSE, tSE, tSW, 0.92, vAwTop);
      const a2 = { x: quadLerp(bSW, bSE, tSE, tSW, 0.92, vAwBot).x + 3.5, y: quadLerp(bSW, bSE, tSE, tSW, 0.92, vAwBot).y + 2.5 };
      const a3 = { x: quadLerp(bSW, bSE, tSE, tSW, 0.08, vAwBot).x + 3.5, y: quadLerp(bSW, bSE, tSE, tSW, 0.08, vAwBot).y + 2.5 };
      const awColors = ["#dc2626", "#0284c7", "#16a34a", "#d97706"];
      const awCol = opts.awningColor || awColors[hashSeed % awColors.length];
      fillStrokePoly([a0, a1, a2, a3], awCol, "#1e293b", 1.0);
      // Sọc trắng trên mái hiên
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.2;
      for (let s = 0.25; s <= 0.75; s += 0.25) {
        ctx.beginPath();
        ctx.moveTo(a0.x + (a1.x - a0.x) * s, a0.y + (a1.y - a0.y) * s);
        ctx.lineTo(a3.x + (a2.x - a3.x) * s, a3.y + (a2.y - a3.y) * s);
        ctx.stroke();
      }
    }
  }

  // 4. Vẽ Mái 3D Chi Tiết Cao (Mái ngói dốc có sóng ngói âm dương, Mái Mansard có cửa sổ mái Dormer, Mái bằng có Bồn nước Inox & Giàn hoa)
  const roofType = opts.roofType || "gable_ns";
  const roofH = opts.roofH || 14;

  if (roofType === "gable_ns") {
    const rBack = isoPt(x + w / 2, y, h3d + roofH);
    const rFront = isoPt(x + w / 2, y + h, h3d + roofH);
    fillStrokePoly([tNW, rBack, rFront, tSW], roofLight, "#1e293b", 1.35);
    fillStrokePoly([rBack, tNE, tSE, rFront], roofDark, "#1e293b", 1.35);
    fillStrokePoly([tSW, rFront, tSE], wallSide, "#1e293b", 1.35);

    // Sóng ngói âm dương kẻ sọc trên mái dốc & Ô thông gió tròn trên trán tường tam giác
    if (isArchitecturalBuilding) {
      ctx.strokeStyle = "rgba(30, 41, 59, 0.32)";
      ctx.lineWidth = 0.85;
      for (let u = 0.2; u <= 0.8; u += 0.2) {
        const pTop = { x: tNW.x + (rBack.x - tNW.x) * u, y: tNW.y + (rBack.y - tNW.y) * u };
        const pBot = { x: tSW.x + (rFront.x - tSW.x) * u, y: tSW.y + (rFront.y - tSW.y) * u };
        ctx.beginPath();
        ctx.moveTo(pTop.x, pTop.y);
        ctx.lineTo(pBot.x, pBot.y);
        ctx.stroke();
      }
      // Bờ nóc mái ngói (Ridge Beam)
      ctx.strokeStyle = "#fef3c7";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(rBack.x, rBack.y);
      ctx.lineTo(rFront.x, rFront.y);
      ctx.stroke();

      // Ô cửa sổ thông gió tròn trên trán tường tam giác (Gable Vent)
      const ventX = (tSW.x + rFront.x + tSE.x) / 3;
      const ventY = (tSW.y + rFront.y + tSE.y) / 3;
      ctx.fillStyle = "#334155";
      ctx.strokeStyle = "#f8fafc";
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.arc(ventX, ventY, 2.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

  } else if (roofType === "gable_ew") {
    const rLeft = isoPt(x, y + h / 2, h3d + roofH);
    const rRight = isoPt(x + w, y + h / 2, h3d + roofH);
    fillStrokePoly([tNW, tNE, rRight, rLeft], roofLight, "#1e293b", 1.35);
    fillStrokePoly([rLeft, rRight, tSE, tSW], roofDark, "#1e293b", 1.35);
    fillStrokePoly([tNW, rLeft, tSW], wallFront, "#1e293b", 1.35);

    if (isArchitecturalBuilding) {
      ctx.strokeStyle = "rgba(30, 41, 59, 0.32)";
      ctx.lineWidth = 0.85;
      for (let u = 0.2; u <= 0.8; u += 0.2) {
        const pTop = { x: rLeft.x + (rRight.x - rLeft.x) * u, y: rLeft.y + (rRight.y - rLeft.y) * u };
        const pBot = { x: tSW.x + (tSE.x - tSW.x) * u, y: tSW.y + (tSE.y - tSW.y) * u };
        ctx.beginPath();
        ctx.moveTo(pTop.x, pTop.y);
        ctx.lineTo(pBot.x, pBot.y);
        ctx.stroke();
      }
      ctx.strokeStyle = "#fef3c7";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(rLeft.x, rLeft.y);
      ctx.lineTo(rRight.x, rRight.y);
      ctx.stroke();

      const ventX = (tNW.x + rLeft.x + tSW.x) / 3;
      const ventY = (tNW.y + rLeft.y + tSW.y) / 3;
      ctx.fillStyle = "#334155";
      ctx.strokeStyle = "#f8fafc";
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.arc(ventX, ventY, 2.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

  } else if (roofType === "mansard") {
    const ins = Math.min(w, h) * 0.18;
    const mNW = isoPt(x + ins, y + ins, h3d + roofH);
    const mNE = isoPt(x + w - ins, y + ins, h3d + roofH);
    const mSE = isoPt(x + w - ins, y + h - ins, h3d + roofH);
    const mSW = isoPt(x + ins, y + h - ins, h3d + roofH);

    fillStrokePoly([tNW, mNW, mNE, tNE], "#475569", "#1e293b", 1.2);
    fillStrokePoly([tNE, mNE, mSE, tSE], "#334155", "#1e293b", 1.2);
    fillStrokePoly([tNW, tSW, mSW, mNW], "#475569", "#1e293b", 1.35);
    fillStrokePoly([tSW, tSE, mSE, mSW], "#334155", "#1e293b", 1.35);
    fillStrokePoly([mNW, mNE, mSE, mSW], "#1e293b", "#94a3b8", 1.2);

    // Cửa sổ mái vòm Pháp cổ (Dormer Windows) & Ống khói gạch trên mái Mansard
    if (isArchitecturalBuilding) {
      [0.32, 0.68].forEach(u => {
        const dL = quadLerp(tNW, tSW, mSW, mNW, u, 0.45);
        const dR = quadLerp(tSW, tSE, mSE, mSW, u, 0.45);
        [dL, dR].forEach(dp => {
          ctx.fillStyle = "#fef3c7";
          ctx.strokeStyle = "#1e293b";
          ctx.lineWidth = 1;
          ctx.fillRect(dp.x - 2.6, dp.y - 4.5, 5.2, 5.2);
          ctx.strokeRect(dp.x - 2.6, dp.y - 4.5, 5.2, 5.2);
          ctx.fillStyle = env.isNight ? "#fde047" : "#0f172a";
          ctx.fillRect(dp.x - 1.4, dp.y - 3.2, 2.8, 3.2);
        });
      });
      // Ống khói gạch đỏ kiểu Pháp trên đỉnh mái Mansard
      const pChim = isoPt(x + ins + 5, y + h - ins - 5, h3d + roofH);
      ctx.fillStyle = "#b45309";
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 1;
      ctx.fillRect(pChim.x - 2.5, pChim.y - 7, 5, 7);
      ctx.strokeRect(pChim.x - 2.5, pChim.y - 7, 5, 7);
    }

  } else {
    // Mái bằng hiện đại có thành lan can Parapet + Bồn nước Inox Sơn Hà & Giàn cây sân thượng
    fillStrokePoly([tNW, tNE, tSE, tSW], roofLight, "#1e293b", 1.35);
    const ins = Math.min(4.5, Math.min(w, h) * 0.14);
    const iNW = isoPt(x + ins, y + ins, h3d);
    const iNE = isoPt(x + w - ins, y + ins, h3d);
    const iSE = isoPt(x + w - ins, y + h - ins, h3d);
    const iSW = isoPt(x + ins, y + h - ins, h3d);
    fillStrokePoly([iNW, iNE, iSE, iSW], roofDark, "#334155", 1);

    if (isArchitecturalBuilding && !opts.noRoofProps && w >= 24 && h >= 22) {
      // Bồn nước Inox Sơn Hà nằm ngang có khung chân sắt trên sân thượng Hà Nội
      const pTank = isoPt(x + w * 0.35, y + h * 0.35, h3d + 2);
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pTank.x - 4, pTank.y + 3); ctx.lineTo(pTank.x - 4, pTank.y);
      ctx.moveTo(pTank.x + 4, pTank.y + 3); ctx.lineTo(pTank.x + 4, pTank.y);
      ctx.stroke();

      ctx.fillStyle = "#e2e8f0";
      ctx.strokeStyle = "#0284c7";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.roundRect(pTank.x - 6, pTank.y - 4.5, 12, 5.5, 2.8);
      ctx.fill();
      ctx.stroke();

      // Giàn hoa giấy / Bồn cây sân thượng góc đối diện
      const pGarden = isoPt(x + w * 0.72, y + h * 0.68, h3d + 1);
      ctx.fillStyle = "#16a34a";
      ctx.strokeStyle = "#14532d";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(pGarden.x, pGarden.y - 2, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#ec4899";
      ctx.beginPath();
      ctx.arc(pGarden.x - 1.5, pGarden.y - 3.5, 1.6, 0, Math.PI * 2);
      ctx.arc(pGarden.x + 2, pGarden.y - 2, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// CHUYÊN DỤNG CHO CAO ỐC CHỌC TRỜI CBD & THÁP KÍNH HIỆN ĐẠI (AST_SKY_01..06):
// Vẽ mặt dựng kính Curtain-Wall 12–20 tầng sắc nét, đố nhôm dọc/ngang, vệt phản chiếu bầu trời chéo & dải đèn văn phòng ban đêm
export function drawIsoGlassSkyscraper3D(x, y, w, h, h3d, glassFront, glassSide, roofDeckCol, env, opts = {}) {
  const bNW = isoPt(x, y, 0);
  const bNE = isoPt(x + w, y, 0);
  const bSE = isoPt(x + w, y + h, 0);
  const bSW = isoPt(x, y + h, 0);

  const tNW = isoPt(x, y, h3d);
  const tNE = isoPt(x + w, y, h3d);
  const tSE = isoPt(x + w, y + h, h3d);
  const tSW = isoPt(x, y + h, h3d);

  // 1. Mặt kính Trái (Tây-Nam) có Gradient phản chiếu bầu trời
  const gFront = ctx.createLinearGradient(tNW.x, tNW.y, bSW.x, bSW.y);
  gFront.addColorStop(0, env.isNight ? "#0284c7" : "#bae6fd");
  gFront.addColorStop(0.45, env.isNight ? "#0369a1" : (glassFront || "#38bdf8"));
  gFront.addColorStop(1, env.isNight ? "#1e3a8a" : "#0284c7");
  fillStrokePoly([bNW, bSW, tSW, tNW], gFront, "#0f172a", 1.5);

  // 2. Mặt kính Phải (Đông-Nam) đổ bóng sâu
  const gSide = ctx.createLinearGradient(tSW.x, tSW.y, bSE.x, bSE.y);
  gSide.addColorStop(0, env.isNight ? "#075985" : (glassSide || "#0284c7"));
  gSide.addColorStop(0.6, env.isNight ? "#0c4a6e" : "#0369a1");
  gSide.addColorStop(1, "#0f172a");
  fillStrokePoly([bSW, bSE, tSE, tSW], gSide, "#0f172a", 1.5);

  // 3. Dải đèn văn phòng sáng theo tầng vào ban đêm (tránh hoàn toàn kiểu ô vuông vàng thô!)
  const stories = Math.max(6, Math.floor(h3d / 5.5));
  const seed = Math.abs(Math.round(x * 0.19 + y * 0.31));
  if (env.isNight) {
    for (let s = 1; s < stories; s++) {
      if ((seed + s * 3) % 3 === 0) continue;
      const v0 = (s + 0.15) / stories;
      const v1 = (s + 0.72) / stories;
      const litColor = (s + seed) % 4 === 0 ? "rgba(103, 232, 249, 0.72)" : "rgba(254, 240, 138, 0.78)";
      const l0 = quadLerp(bNW, bSW, tSW, tNW, 0.08, v0);
      const l1 = quadLerp(bNW, bSW, tSW, tNW, 0.92, v0);
      const l2 = quadLerp(bNW, bSW, tSW, tNW, 0.92, v1);
      const l3 = quadLerp(bNW, bSW, tSW, tNW, 0.08, v1);
      fillStrokePoly([l0, l1, l2, l3], litColor, null, 0);

      const r0 = quadLerp(bSW, bSE, tSE, tSW, 0.08, v0);
      const r1 = quadLerp(bSW, bSE, tSE, tSW, 0.92, v0);
      const r2 = quadLerp(bSW, bSE, tSE, tSW, 0.92, v1);
      const r3 = quadLerp(bSW, bSE, tSE, tSW, 0.08, v1);
      fillStrokePoly([r0, r1, r2, r3], litColor, null, 0);
    }
  }

  // 4. Vệt sáng chéo phản chiếu kính (Specular Glass Sheen)
  const sh0 = quadLerp(bNW, bSW, tSW, tNW, 0.15, 0.20);
  const sh1 = quadLerp(bNW, bSW, tSW, tNW, 0.42, 0.20);
  const sh2 = quadLerp(bNW, bSW, tSW, tNW, 0.78, 0.88);
  const sh3 = quadLerp(bNW, bSW, tSW, tNW, 0.52, 0.88);
  fillStrokePoly([sh0, sh1, sh2, sh3], "rgba(255, 255, 255, 0.24)", null, 0);

  // 5. Hệ khung đố nhôm ngang theo từng tầng (12-20 tầng) & Đố dọc Curtain-Wall
  ctx.strokeStyle = env.isNight ? "rgba(148, 163, 184, 0.52)" : "rgba(241, 245, 249, 0.68)";
  ctx.lineWidth = 0.75;
  for (let s = 1; s < stories; s++) {
    const vf = s / stories;
    const pL0 = quadLerp(bNW, bSW, tSW, tNW, 0, vf);
    const pL1 = quadLerp(bNW, bSW, tSW, tNW, 1, vf);
    const pR1 = quadLerp(bSW, bSE, tSE, tSW, 1, vf);
    ctx.beginPath();
    ctx.moveTo(pL0.x, pL0.y);
    ctx.lineTo(pL1.x, pL1.y);
    ctx.lineTo(pR1.x, pR1.y);
    ctx.stroke();
  }

  const mCols = Math.max(4, Math.floor(w / 7));
  ctx.strokeStyle = "rgba(15, 23, 42, 0.45)";
  ctx.lineWidth = 0.8;
  for (let m = 1; m < mCols; m++) {
    const u = m / mCols;
    const bL = quadLerp(bNW, bSW, tSW, tNW, u, 0);
    const tL = quadLerp(bNW, bSW, tSW, tNW, u, 1);
    const bR = quadLerp(bSW, bSE, tSE, tSW, u, 0);
    const tR = quadLerp(bSW, bSE, tSE, tSW, u, 1);
    ctx.beginPath();
    ctx.moveTo(bL.x, bL.y); ctx.lineTo(tL.x, tL.y);
    ctx.moveTo(bR.x, bR.y); ctx.lineTo(tR.x, tR.y);
    ctx.stroke();
  }

  // 6. Cột trụ khung thép trắng ở 3 cạnh đứng của tòa tháp
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1.8;
  [[bNW, tNW], [bSW, tSW], [bSE, tSE]].forEach(([p0, p1]) => {
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();
  });

  // 7. Sân thượng tòa tháp có viền LED Crown phát sáng & Hộp kỹ thuật thang máy
  fillStrokePoly([tNW, tNE, tSE, tSW], "#cbd5e1", "#0f172a", 1.5);
  const ins = Math.min(4.5, w * 0.14);
  const iNW = isoPt(x + ins, y + ins, h3d);
  const iNE = isoPt(x + w - ins, y + ins, h3d);
  const iSE = isoPt(x + w - ins, y + h - ins, h3d);
  const iSW = isoPt(x + ins, y + h - ins, h3d);
  fillStrokePoly([iNW, iNE, iSE, iSW], roofDeckCol || "#475569", "#38bdf8", 1.2);
}

// VẼ 16 KIỂU QUẦN THỂ KIẾN TRÚC THƯƠNG MẠI, NHÀ HÀNG, GIẢI TRÍ, THỂ THAO & TIỂU CẢNH TRANG TRÍ 3D ĐA SẮC (KHÔNG TRÙNG LẶP GIỮA CÁC Ô PHỐ & CÁC QUẬN)
export function drawIsoPatioUmbrella3D(wx, wy, wz, radius, colTop, colStripe) {
  const pBase = isoPt(wx, wy, wz);
  const pTop = isoPt(wx, wy, wz + 11);
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(pBase.x, pBase.y);
  ctx.lineTo(pTop.x, pTop.y);
  ctx.stroke();

  ctx.fillStyle = colTop;
  ctx.strokeStyle = colStripe || "#fffbeb";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(pTop.x, pTop.y, radius, radius * 0.58, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

export function drawDiverseArchitecturalCluster25D(cl, env) {
  const { x, y, w, h } = cl;
  const dIdx = cl.districtIdx || 0;
  const clIdx = cl.clIdx || 0;
  const orient = ((cl.orient || 0) + dIdx) % 4;
  const hDelta = cl.heightDelta || 0;

  // Xoay bảng màu tường, mái và kính theo từng Quận (dIdx) + vị trí cụm (clIdx) để mỗi Quận và mỗi góc phố có sắc thái riêng biệt
  const pal = NEUTRAL_WALL_PALETTE[(clIdx + dIdx * 3) % NEUTRAL_WALL_PALETTE.length] || cl.pal;
  const pal2 = NEUTRAL_WALL_PALETTE[(clIdx * 2 + dIdx * 5 + 3) % NEUTRAL_WALL_PALETTE.length] || cl.pal2;
  const roof = NEUTRAL_ROOF_COLORS[(clIdx + dIdx * 2) % NEUTRAL_ROOF_COLORS.length] || cl.roof;
  const roof2 = NEUTRAL_ROOF_COLORS[(clIdx * 3 + dIdx + 4) % NEUTRAL_ROOF_COLORS.length] || cl.roof2;
  const gPal = GLASS_TOWER_PALETTES[(clIdx + dIdx * 2) % GLASS_TOWER_PALETTES.length] || cl.glassPal || GLASS_TOWER_PALETTES[0];

  const archetype = cl.archetype;

  // Đế sân nội khu lát đá sạch đẹp cho mọi cụm công trình
  const cNW = isoPt(x + 2, y + 2, 0);
  const cNE = isoPt(x + w - 2, y + 2, 0);
  const cSE = isoPt(x + w - 2, y + h - 2, 0);
  const cSW = isoPt(x + 2, y + h - 2, 0);
  fillStrokePoly([cNW, cNE, cSE, cSW], env.isNight ? "#334155" : "#e7e5e4", "#94a3b8", 1.0);

  if (archetype === "MEGA_SHOPPING_MALL") {
    // KIỂU 1: ĐẠI SIÊU THỊ & TRUNG TÂM THƯƠNG MẠI MÁI VÒM KÍNH SKYLIGHT 3D + BIỂN LED RỰC RỠ
    const mallH = 32 + (clIdx % 3) * 4;
    drawIso3DSolidBuilding(x + 6, y + 8, w - 12, h - 18, mallH, "#f8fafc", "#e2e8f0", gPal.g1, gPal.g2, env, {
      roofType: "flat",
      forceAwning: true,
      awningColor: gPal.accent,
      noRoofProps: true
    });
    // Mái vòm kính Skylight ở giữa tầng thượng TTTM
    const dNW = isoPt(x + 26, y + 22, mallH + 1), dNE = isoPt(x + w - 26, y + 22, mallH + 1);
    const dSE = isoPt(x + w - 26, y + h - 30, mallH + 1), dSW = isoPt(x + 26, y + h - 30, mallH + 1);
    const dTop = isoPt(x + w / 2, y + h / 2 - 4, mallH + 18);
    fillStrokePoly([dNW, dNE, dTop], "#bae6fd", "#0284c7", 1.1);
    fillStrokePoly([dNE, dSE, dTop], "#38bdf8", "#0284c7", 1.1);
    fillStrokePoly([dSE, dSW, dTop], "#7dd3fc", "#0284c7", 1.1);
    fillStrokePoly([dSW, dNW, dTop], "#e0f2fe", "#0284c7", 1.1);

    // Sảnh đón khách & đài phun nước mini trước TTTM
    const pPlz = isoPt(x + w / 2, y + h - 9, 0);
    ctx.fillStyle = "#38bdf8";
    ctx.strokeStyle = "#fde047";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(pPlz.x, pPlz.y, 13, 6.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    drawIso3DTree(x + 14, y + h - 8, 0.88, 1);
    drawIso3DTree(x + w - 14, y + h - 8, 0.88, 2);

  } else if (archetype === "BOUTIQUE_GALLERIA") {
    // KIỂU 2: KHU PHỐ THỜI TRANG BOUTIQUE & SHOWROOM KÍNH ĐÔI CÓ CẦU KÍNH TRÊN KHÔNG (SKYBRIDGE)
    const h1 = 38 + (orient % 2) * 8;
    const h2 = 34 + ((orient + 1) % 2) * 8;
    drawIso3DSolidBuilding(x + 6, y + 10, 48, h - 20, h1, pal.front, pal.side, roof.light, roof.dark, env, {
      roofType: "mansard",
      roofH: 10,
      forceAwning: true,
      awningColor: "#ec4899"
    });
    drawIso3DSolidBuilding(x + w - 54, y + 10, 48, h - 20, h2, pal2.front, pal2.side, roof2.light, roof2.dark, env, {
      roofType: "mansard",
      roofH: 10,
      forceAwning: true,
      awningColor: "#8b5cf6"
    });
    // Cầu kính Skybridge nối tầng 2 giữa 2 tòa Boutique
    drawIso3DSolidBuilding(x + 50, y + 36, w - 100, 26, 8, "#bae6fd", "#38bdf8", "#e0f2fe", "#0284c7", env, {
      baseZ: 18,
      roofType: "flat",
      noAwning: true,
      noRoofProps: true
    });
    drawIsoPatioUmbrella3D(x + w / 2, y + h - 14, 0, 8, "#ec4899", "#fef08a");
    drawIso3DTree(x + w / 2, y + 14, 0.85, 3);

  } else if (archetype === "CINEMA_ENTERTAINMENT_HUB") {
    // KIỂU 3: TỔ HỢP RẠP CHIẾU PHIM IMAX & GIẢI TRÍ ĐÈN NEON CYBER
    const cinH = 36 + (clIdx % 3) * 5;
    drawIso3DSolidBuilding(x + 8, y + 10, w - 16, h - 20, cinH, "#1e293b", "#0f172a", "#7c3aed", "#4c1d95", env, {
      roofType: "flat",
      forceAwning: true,
      awningColor: "#f43f5e",
      noRoofProps: true
    });
    // Khối sảnh IMAX nổi bật phía trước với màn hình Poster LED phát sáng
    drawIso3DSolidBuilding(x + 28, y + h - 32, w - 56, 22, cinH - 8, "#f43f5e", "#be123c", "#fde047", "#ca8a04", env, {
      roofType: "flat",
      noAwning: true,
      noRoofProps: true
    });
    const ledCenter = isoPt(x + w / 2, y + h / 2, cinH + 6);
    ctx.fillStyle = env.isNight ? "#fef08a" : "#f43f5e";
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(ledCenter.x, ledCenter.y, 16, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    drawIso3DStreetLamp(x + 14, y + h - 8, env);
    drawIso3DStreetLamp(x + w - 14, y + h - 8, env);

  } else if (archetype === "GARDEN_RESTAURANT_PLAZA") {
    // KIỂU 4: KHU NHÀ HÀNG SÂN VƯỜN & LẨU NƯỚNG BBQ NGOÀI TRỜI (CÓ 6 DÙ CHE ĐA SẮC & VƯỜN CÂY)
    const restOnLeft = (orient % 2 === 0);
    const rx = restOnLeft ? x + 6 : x + w - 58;
    const gx = restOnLeft ? x + 62 : x + 8;
    // Sân cỏ ấm cúng đặt bàn tiệc ngoài trời
    const gNW = isoPt(gx, y + 8, 0), gNE = isoPt(gx + 62, y + 8, 0);
    const gSE = isoPt(gx + 62, y + h - 8, 0), gSW = isoPt(gx, y + h - 8, 0);
    fillStrokePoly([gNW, gNE, gSE, gSW], "#65a30d", "#3f6212", 1.2);

    drawIso3DSolidBuilding(rx, y + 10, 52, h - 20, 26, "#ffedd5", "#fdba74", "#c2410c", "#9a3412", env, {
      roofType: "gable_ns",
      roofH: 13,
      forceAwning: true,
      awningColor: "#ea580c"
    });

    const umbCols = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#ec4899", "#8b5cf6"];
    for (let u = 0; u < 6; u++) {
      const ux = gx + 16 + (u % 2) * 30;
      const uy = y + 22 + Math.floor(u / 2) * 28;
      drawIsoPatioUmbrella3D(ux, uy, 0, 7.5, umbCols[(u + clIdx) % umbCols.length], "#fffbeb");
    }
    drawIso3DTree(gx + 8, y + h - 10, 0.88, 1);
    drawIso3DTree(gx + 54, y + 12, 0.85, 2);

  } else if (archetype === "NIGHT_FOOD_STREET") {
    // KIỂU 5: PHỐ BIA HƠI & ẨM THỰC ĐÊM HÀ NỘI (2 DÃY QUÁN + PHỐ ĐI BỘ ĐÈN LỒNG & THÁP BIA BỌT TRẮNG 3D)
    drawIso3DSolidBuilding(x + 5, y + 6, w - 10, 30, 26, "#fef08a", "#eab308", "#dc2626", "#991b1b", env, {
      roofType: "gable_ew",
      roofH: 10,
      forceAwning: true,
      awningColor: "#dc2626"
    });
    drawIso3DSolidBuilding(x + 5, y + h - 34, w - 10, 28, 24, "#ffedd5", "#f97316", "#b45309", "#78350f", env, {
      roofType: "gable_ew",
      roofH: 9,
      forceAwning: true,
      awningColor: "#16a34a"
    });
    // Dãy bàn ghế & ô dù Bia Hơi ở hẻm ẩm thực giữa 2 dãy nhà
    for (let k = 0; k < 4; k++) {
      const bx = x + 22 + k * 28;
      drawIsoPatioUmbrella3D(bx, y + h / 2 + 2, 0, 7, k % 2 === 0 ? "#dc2626" : "#eab308", "#fef08a");
    }
    // Biểu tượng Cốc Bia Hơi Hà Nội bọt trắng 3D trên mái quán
    const mugBase = isoPt(x + w / 2, y + 20, 36);
    ctx.fillStyle = "#fbbf24";
    ctx.strokeStyle = "#78350f";
    ctx.lineWidth = 1.3;
    ctx.fillRect(mugBase.x - 5, mugBase.y - 11, 10, 11);
    ctx.strokeRect(mugBase.x - 5, mugBase.y - 11, 10, 11);
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(mugBase.x, mugBase.y - 12, 6.5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

  } else if (archetype === "ROOFTOP_SKYBAR_LOUNGE") {
    // KIỂU 6: TỔ HỢP ROOFTOP SKYBAR & CAFÉ SÂN THƯỢNG (QUẦY BAR PHÁT SÁNG + DÙ SÂN THƯỢNG)
    const barH = 42 + (clIdx % 3) * 6;
    drawIso3DSolidBuilding(x + 10, y + 10, w - 20, h - 20, barH, pal.front, pal.side, "#334155", "#1e293b", env, {
      roofType: "flat",
      forceAwning: true,
      awningColor: "#06b6d4",
      noRoofProps: true
    });
    // Sàn gỗ Skybar & Hồ nước tràn trên sân thượng
    const rNW = isoPt(x + 14, y + 14, barH + 0.5), rNE = isoPt(x + w - 14, y + 14, barH + 0.5);
    const rSE = isoPt(x + w - 14, y + h - 14, barH + 0.5), rSW = isoPt(x + 14, y + h - 14, barH + 0.5);
    fillStrokePoly([rNW, rNE, rSE, rSW], "#b45309", "#fde047", 1.2);
    // Quầy Bar Neon phát sáng trên đỉnh
    drawIso3DSolidBuilding(x + 22, y + 18, 38, 18, 9, "#22d3ee", "#0891b2", "#fde047", "#ca8a04", env, {
      baseZ: barH + 1,
      roofType: "flat",
      noAwning: true,
      noRoofProps: true
    });
    drawIsoPatioUmbrella3D(x + w - 34, y + 32, barH + 1, 7.5, "#f43f5e", "#fef08a");
    drawIsoPatioUmbrella3D(x + w - 34, y + h - 28, barH + 1, 7.5, "#a855f7", "#fef08a");

  } else if (archetype === "LUXURY_HOTEL_RESORT") {
    // KIỂU 7: KHÁCH SẠN 5 SAO & BỂ BƠI VÔ CỰC RESORT NHIỆT ĐỚI
    const htlH = 58 + (clIdx % 4) * 7;
    const poolLeft = (orient % 2 === 1);
    const hx = poolLeft ? x + 56 : x + 8;
    const px = poolLeft ? x + 8 : x + 70;
    // Hồ bơi Resort xanh ngọc bích ở sân dưới
    const pNW = isoPt(px, y + 14, 0.5), pNE = isoPt(px + 48, y + 14, 0.5);
    const pSE = isoPt(px + 48, y + h - 14, 0.5), pSW = isoPt(px, y + h - 14, 0.5);
    fillStrokePoly([pNW, pNE, pSE, pSW], "#06b6d4", "#f8fafc", 1.6);
    drawIsoPatioUmbrella3D(px + 12, y + 24, 0.5, 6.5, "#fde047", "#ffffff");
    drawIsoPatioUmbrella3D(px + 12, y + h - 24, 0.5, 6.5, "#fb7185", "#ffffff");

    // Tháp khách sạn 5 sao mặt kính vàng Champagne hoặc Sapphire
    drawIsoGlassSkyscraper3D(hx, y + 10, 62, h - 20, htlH, gPal.g1, gPal.g2, gPal.accent, env);
    drawIso3DTree(px + 38, y + h - 12, 0.92, 1);

  } else if (archetype === "CAMPUS_TECH_PLAZA") {
    // KIỂU 8: HỌC VIỆN QUỐC TẾ & TRUNG TÂM CÔNG NGHỆ QUẢ CẦU SỐ
    drawIso3DSolidBuilding(x + 8, y + 8, w - 16, 36, 36, "#e0f2fe", "#7dd3fc", "#0284c7", "#0369a1", env, {
      roofType: "flat",
      forceAwning: true,
      awningColor: "#10b981",
      noRoofProps: true
    });
    drawIso3DSolidBuilding(x + 8, y + 46, 38, h - 54, 28, "#f1f5f9", "#cbd5e1", "#0284c7", "#0369a1", env, {
      roofType: "flat",
      noAwning: true,
      noRoofProps: true
    });
    // Quảng trường Quả Cầu Công Nghệ Vàng ở sân trước
    const pGlobe = isoPt(x + 82, y + 70, 0);
    ctx.fillStyle = "#bae6fd";
    ctx.strokeStyle = "#0284c7";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.ellipse(pGlobe.x, pGlobe.y, 16, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    const pOrb = isoPt(x + 82, y + 70, 12);
    ctx.fillStyle = "#fbbf24";
    ctx.strokeStyle = "#fffbeb";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(pOrb.x, pOrb.y, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    drawIso3DTree(x + w - 14, y + h - 12, 0.88, 2);

  } else if (archetype === "SPORTS_PICKLEBALL_CLUB") {
    // KIỂU 9: TỔ HỢP 2 SÂN PICKLEBALL / TENNIS HIỆN ĐẠI KẺ VẠCH TRẮNG & ĐÈN CAO ÁP
    drawIso3DSolidBuilding(x + 6, y + 6, w - 12, 24, 20, "#f8fafc", "#cbd5e1", "#10b981", "#047857", env, {
      roofType: "flat",
      forceAwning: true,
      awningColor: "#10b981",
      noRoofProps: true
    });
    // 2 Sân Pickleball xanh dương viền xanh lá chuẩn thi đấu quốc tế
    for (let ct = 0; ct < 2; ct++) {
      const cx0 = x + 10 + ct * 58;
      const cy0 = y + 36;
      const cw = 52, ch = h - 44;
      const oNW = isoPt(cx0, cy0, 0.4), oNE = isoPt(cx0 + cw, cy0, 0.4);
      const oSE = isoPt(cx0 + cw, cy0 + ch, 0.4), oSW = isoPt(cx0, cy0 + ch, 0.4);
      fillStrokePoly([oNW, oNE, oSE, oSW], "#16a34a", "#ffffff", 1.2);

      const iNW = isoPt(cx0 + 5, cy0 + 5, 0.6), iNE = isoPt(cx0 + cw - 5, cy0 + 5, 0.6);
      const iSE = isoPt(cx0 + cw - 5, cy0 + ch - 5, 0.6), iSW = isoPt(cx0 + 5, cy0 + ch - 5, 0.6);
      fillStrokePoly([iNW, iNE, iSE, iSW], "#0284c7", "#ffffff", 1.1);

      // Lưới giữa sân Pickleball
      const nW = isoPt(cx0 + 4, cy0 + ch / 2, 3.5);
      const nE = isoPt(cx0 + cw - 4, cy0 + ch / 2, 3.5);
      ctx.strokeStyle = "#f8fafc";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(nW.x, nW.y);
      ctx.lineTo(nE.x, nE.y);
      ctx.stroke();
    }
    drawIso3DStreetLamp(x + 8, y + h - 6, env);
    drawIso3DStreetLamp(x + w - 8, y + h - 6, env);

  } else if (archetype === "HERITAGE_PAGODA_POND") {
    // KIỂU 10: ĐỀN CHÙA CỔ 2 TẦNG MÁI ĐAO & HỒ SEN HỒNG HÀ NỘI
    const lNW = isoPt(x + 6, y + 6, 0), lNE = isoPt(x + w - 6, y + 6, 0);
    const lSE = isoPt(x + w - 6, y + h - 6, 0), lSW = isoPt(x + 6, y + h - 6, 0);
    fillStrokePoly([lNW, lNE, lSE, lSW], "#0d9488", "#115e59", 1.5);

    // Hoa sen hồng nở trên mặt hồ
    [[x + 22, y + 24], [x + w - 24, y + 26], [x + 26, y + h - 22], [x + w - 22, y + h - 24]].forEach(([lx, ly]) => {
      const lp = isoPt(lx, ly, 0.5);
      ctx.fillStyle = "#16a34a";
      ctx.beginPath();
      ctx.ellipse(lp.x, lp.y, 6, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f472b6";
      ctx.beginPath();
      ctx.arc(lp.x, lp.y - 1.5, 2.8, 0, Math.PI * 2);
      ctx.fill();
    });

    // Đảo đá & Chùa Cổ 2 tầng mái đao đỏ vàng ở trung tâm hồ sen
    drawIso3DSolidBuilding(x + w / 2 - 20, y + h / 2 - 16, 40, 32, 18, "#fef08a", "#eab308", "#b91c1c", "#7f1d1d", env, {
      roofType: "gable_ew",
      roofH: 10,
      noAwning: true
    });
    drawIso3DSolidBuilding(x + w / 2 - 12, y + h / 2 - 10, 24, 20, 30, "#fffbeb", "#fde047", "#dc2626", "#991b1b", env, {
      roofType: "gable_ns",
      roofH: 9,
      noAwning: true
    });
    drawIso3DTree(x + 14, y + 14, 0.85, 1);
    drawIso3DTree(x + w - 14, y + h - 14, 0.85, 3);

  } else if (archetype === "FOUNTAIN_PLAZA_ART") {
    // KIỂU 11: QUẢNG TRƯỜNG NHẠC NƯỚC 3 TẦNG & TƯỢNG NGHỆ THUẬT ĐƯƠNG ĐẠI
    const pNW = isoPt(x + 6, y + 6, 0), pNE = isoPt(x + w - 6, y + 6, 0);
    const pSE = isoPt(x + w - 6, y + h - 6, 0), pSW = isoPt(x + 6, y + h - 6, 0);
    fillStrokePoly([pNW, pNE, pSE, pSW], "#cbd5e1", "#64748b", 1.3);

    // 4 bồn cỏ xanh ở 4 góc quảng trường
    [[x + 12, y + 12], [x + w - 36, y + 12], [x + 12, y + h - 32], [x + w - 36, y + h - 32]].forEach(([gx, gy], gi) => {
      const bNW = isoPt(gx, gy, 0.5), bNE = isoPt(gx + 24, gy, 0.5);
      const bSE = isoPt(gx + 24, gy + 20, 0.5), bSW = isoPt(gx, gy + 20, 0.5);
      fillStrokePoly([bNW, bNE, bSE, bSW], "#4d7c0f", "#15803d", 1.0);
      drawIso3DTree(gx + 12, gy + 10, 0.85, (gi % 3) + 1);
    });

    // Đài phun nước 3 tầng ở chính giữa
    const f1 = isoPt(x + w / 2, y + h / 2, 1);
    const f2 = isoPt(x + w / 2, y + h / 2, 8);
    const f3 = isoPt(x + w / 2, y + h / 2, 16);
    ctx.fillStyle = "#0284c7";
    ctx.strokeStyle = "#f8fafc";
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.ellipse(f1.x, f1.y, 24, 13.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#38bdf8";
    ctx.beginPath(); ctx.ellipse(f2.x, f2.y, 15, 8.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#bae6fd";
    ctx.beginPath(); ctx.ellipse(f3.x, f3.y, 8, 4.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // Đỉnh tượng vàng trên đài nhạc nước
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath(); ctx.arc(f3.x, f3.y - 6, 4.5, 0, Math.PI * 2); ctx.fill();

  } else if (archetype === "BOTANICAL_PAVILION" || archetype === "POCKET_PARK_PLAZA") {
    // KIỂU 12: VƯỜN HOA BỐN MÙA ĐA SẮC & CHÒI NGHỈ BÁT GIÁC
    const pNW = isoPt(x + 5, y + 5, 0), pNE = isoPt(x + w - 5, y + 5, 0);
    const pSE = isoPt(x + w - 5, y + h - 5, 0), pSW = isoPt(x + 5, y + h - 5, 0);
    fillStrokePoly([pNW, pNE, pSE, pSW], "#4d7c0f", "#15803d", 1.4);

    // 4 Thảm hoa Bốn Mùa rực rỡ (Hồng đào, Vàng cúc, Tím oải hương, Đỏ trạng nguyên)
    const flCols = ["#f472b6", "#facc15", "#c084fc", "#fb7185"];
    [[x + 14, y + 14], [x + w - 42, y + 14], [x + 14, y + h - 34], [x + w - 42, y + h - 34]].forEach(([fx, fy], fi) => {
      const fNW = isoPt(fx, fy, 0.6), fNE = isoPt(fx + 28, fy, 0.6);
      const fSE = isoPt(fx + 28, fy + 20, 0.6), fSW = isoPt(fx, fy + 20, 0.6);
      fillStrokePoly([fNW, fNE, fSE, fSW], flCols[(fi + clIdx) % 4], "#fef08a", 1.0);
    });

    drawIso3DSolidBuilding(x + w / 2 - 14, y + h / 2 - 12, 28, 24, 16, "#fef3c7", "#fde68a", roof.light, roof.dark, env, { roofType: "gable_ew", roofH: 9, noAwning: true });
    drawIso3DSolidBuilding(x + w / 2 - 9, y + h / 2 - 8, 18, 16, 26, "#fffbeb", "#fef3c7", roof2.light, roof2.dark, env, { roofType: "gable_ns", roofH: 8, noAwning: true });
    drawIso3DTree(x + w / 2, y + 14, 0.9, 1);
    drawIso3DTree(x + w / 2, y + h - 14, 0.9, 3);

  } else if (archetype === "VILLA_L_SHAPE") {
    // KIỂU 13: BIỆT THỰ CHỮ L XOAY 4 HƯỚNG + HỒ BƠI HOẶC ĐÀI PHUN NƯỚC SÂN VƯỜN
    const mainTop = (orient % 2 === 0);
    const wingLeft = (orient < 2);
    const wyMain = mainTop ? y + 8 : y + h - 50;
    const wxWing = wingLeft ? x + 8 : x + w - 56;
    const villaH = 30 + (clIdx % 3) * 4;

    drawIso3DSolidBuilding(x + 8, wyMain, w - 16, 42, villaH, pal.front, pal.side, roof.light, roof.dark, env, {
      roofType: "mansard",
      roofH: 13,
      awningColor: "#15803d"
    });
    drawIso3DSolidBuilding(wxWing, y + 10, 48, h - 20, villaH, pal.front, pal.side, roof.light, roof.dark, env, {
      roofType: "mansard",
      roofH: 13,
      awningColor: "#15803d"
    });

    const cxCourt = wingLeft ? x + 88 : x + 44;
    const cyCourt = mainTop ? y + 70 : y + 32;
    const pFtn = isoPt(cxCourt, cyCourt, 0.5);
    ctx.fillStyle = "#38bdf8";
    ctx.strokeStyle = "#f8fafc";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(pFtn.x, pFtn.y, 12, 6.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    drawIso3DTree(cxCourt - 16, cyCourt + 10, 0.9, 1);
    drawIso3DTree(cxCourt + 16, cyCourt - 8, 0.85, 3);

  } else if (archetype === "STEPPED_TOWER") {
    // KIỂU 14: TỔ HỢP CAO ỐC KÍNH ĐA SẮC XOAY 4 GÓC ĐẶT THÁP + ĐỘ CAO BIẾN THIÊN (48..92px)
    const towerH = Math.max(48, Math.min(94, 68 + hDelta));
    const podH = 20 + (clIdx % 2) * 4;
    drawIso3DSolidBuilding(x + 8, y + 10, w - 16, h - 18, podH, pal.front, pal.side, "#64748b", "#475569", env, {
      roofType: "flat",
      forceAwning: true,
      awningColor: gPal.accent,
      noRoofProps: true
    });
    const twX = (orient % 2 === 0) ? x + 44 : x + 12;
    const twY = (orient < 2) ? y + 14 : y + 24;
    const plX = (orient % 2 === 0) ? x + 14 : x + w - 42;
    const poolNW = isoPt(plX, y + 54, podH + 0.5), poolNE = isoPt(plX + 28, y + 54, podH + 0.5);
    const poolSE = isoPt(plX + 28, y + h - 14, podH + 0.5), poolSW = isoPt(plX, y + h - 14, podH + 0.5);
    fillStrokePoly([poolNW, poolNE, poolSE, poolSW], "#38bdf8", "#f8fafc", 1.2);

    drawIsoGlassSkyscraper3D(twX, twY, w - 58, h - 34, towerH, gPal.g1, gPal.g2, gPal.accent, env);
    drawIso3DTree(x + 18, y + h - 10, 0.9, 2);
    drawIso3DTree(x + w - 16, y + h - 10, 0.85, 1);

  } else if (archetype === "U_COURTYARD_HALL") {
    // KIỂU 15: TÒA NHÀ HÀNH CHÍNH / KHÁCH SẠN CỔ ĐIỂN CHỮ U ĐA SẮC + SÂN CỜ
    const uH = 28 + (clIdx % 3) * 4;
    drawIso3DSolidBuilding(x + 8, y + 8, w - 16, 34, uH + 4, pal.front, pal.side, roof.light, roof.dark, env, { roofType: "gable_ew", roofH: 13 });
    drawIso3DSolidBuilding(x + 8, y + 34, 36, h - 42, uH, pal2.front, pal2.side, roof.light, roof.dark, env, { roofType: "gable_ns", roofH: 12 });
    drawIso3DSolidBuilding(x + w - 44, y + 34, 36, h - 42, uH, pal2.front, pal2.side, roof.light, roof.dark, env, { roofType: "gable_ns", roofH: 12 });
    const pFlag = isoPt(x + w / 2, y + 68, 0);
    ctx.fillStyle = "#cbd5e1";
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.ellipse(pFlag.x, pFlag.y, 9, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#f8fafc";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(pFlag.x, pFlag.y);
    ctx.lineTo(pFlag.x, pFlag.y - 22);
    ctx.stroke();
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(pFlag.x, pFlag.y - 22, 8, 5);
    drawIso3DTree(x + w / 2 - 14, y + 82, 0.82, 1);
    drawIso3DTree(x + w / 2 + 14, y + 82, 0.82, 3);

  } else {
    // KIỂU 16 (SHOPHOUSE_COURTYARD): QUẦN THỂ 6 NHÀ PHỐ THƯƠNG MẠI HÀ NỘI ĐỘ CAO & MÀU SẮC BIẾN THIÊN THEO TỪNG Ô PHỐ
    const hBase = 24 + (clIdx % 4) * 4;
    const rTypes = ["gable_ns", "flat", "gable_ew", "mansard"];
    const awCols = ["#dc2626", "#0284c7", "#16a34a", "#d97706", "#7c3aed", "#ec4899"];
    const coords = [
      [x + 5,  y + 7,  38, 44, hBase + ((orient * 5) % 16)],
      [x + 46, y + 9,  36, 40, hBase + ((orient * 7 + 6) % 18)],
      [x + 85, y + 7,  40, 45, hBase + ((orient * 3 + 10) % 16)],
      [x + 7,  y + 55, 42, 40, hBase + ((orient * 9 + 4) % 16)],
      [x + 52, y + 56, 34, 38, hBase + ((orient * 4 + 2) % 14)],
      [x + 88, y + 54, 38, 41, hBase + ((orient * 6 + 8) % 18)]
    ];
    coords.forEach(([bx, by, bw, bh, bz], idx) => {
      const pWall = NEUTRAL_WALL_PALETTE[(clIdx + dIdx + idx * 2) % NEUTRAL_WALL_PALETTE.length];
      const pRf = NEUTRAL_ROOF_COLORS[(clIdx + dIdx + idx * 3) % NEUTRAL_ROOF_COLORS.length];
      const rt = rTypes[(idx + orient) % rTypes.length];
      drawIso3DSolidBuilding(bx, by, bw, bh, bz, pWall.front, pWall.side, pRf.light, pRf.dark, env, {
        roofType: rt,
        roofH: 11,
        forceAwning: true,
        awningColor: awCols[(idx + clIdx) % awCols.length]
      });
    });
    drawIso3DTree(x + 48, y + 52, 0.85, 1);
    drawIso3DStreetLamp(x + w - 6, y + h - 6, env);
  }
}


export function drawIsometric3DBuildingBlock(b, env) {
  let shape = b.shape || "opera_dome";
  const dIdx = b.districtIdx || 0;
  const archStyle = b.archStyle || "OLD_QUARTER";
  const bIdx = b.bIdx || 0;

  // Không copy-paste các di tích đặc hữu của Quận Hoàn Kiếm (Bốt Hàng Đậu, Chợ Đồng Xuân, Ô Quan Chưởng, Phùng Hưng, Nhà Thờ Lớn) sang 11 Quận khác!
  if (dIdx !== 0) {
    const isHoanKiemExclusive = (
      shape === "cylinder_tower" ||
      shape === "five_gables" ||
      shape === "city_gate" ||
      shape === "arches_viaduct" ||
      shape === "twin_spires"
    );
    if (isHoanKiemExclusive) {
      if (archStyle === "TECH_CBD" || archStyle === "SPORTS_CBD" || archStyle === "SMART_MEGA") {
        shape = (bIdx % 2 === 0) ? "twin_helipad_towers" : "stepped_green_tower";
      } else if (archStyle === "EURO_TOWERS" || archStyle === "FRENCH_ADMIN") {
        shape = (bIdx % 2 === 0) ? "corner_rotunda" : "opera_dome";
      } else if (archStyle === "LAKE_RESORT" || archStyle === "DENSE_URBAN") {
        shape = (bIdx % 2 === 0) ? "temple_courtyard" : "corner_rotunda";
      } else if (archStyle === "METRO_SILK") {
        shape = (bIdx % 2 === 0) ? "train_station" : "temple_courtyard";
      } else {
        shape = (bIdx % 2 === 0) ? "stepped_green_tower" : "corner_rotunda";
      }
    }
  }

  // Sân nền đá granite trang trọng dưới chân các công trình biểu tượng
  const padNW = isoPt(b.x + 2, b.y + 2, 0);
  const padNE = isoPt(b.x + b.w - 2, b.y + 2, 0);
  const padSE = isoPt(b.x + b.w - 2, b.y + b.h - 2, 0);
  const padSW = isoPt(b.x + 2, b.y + b.h - 2, 0);
  fillStrokePoly([padNW, padNE, padSE, padSW], env.isNight ? "#334155" : "#e2e8f0", "#64748b", 1.2);

  if (shape === "cylinder_tower") {
    // 1. BỐT HÀNG ĐẬU 1894 (AST_LMK_02): Tháp nước đá hộc tròn 3 tầng phào chỉ + 8 cửa sổ vòm lá sách + Mái nón đá phiến có múi & Kim thu lôi
    const pBase = isoPt(b.x + b.w / 2, b.y + b.h / 2 + 8, 0);
    const rx = 40;
    const ry = 23;
    const hTower = 68;

    // Bóng đổ & Bệ đá tròn bậc tam cấp dưới chân tháp
    ctx.fillStyle = "rgba(15, 23, 42, 0.26)";
    ctx.beginPath();
    ctx.ellipse(pBase.x + 7, pBase.y + 5, rx + 7, ry + 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#94a3b8";
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(pBase.x, pBase.y + 2, rx + 4, ry + 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Thân trụ đá tròn dựng đứng thẳng lên trên màn hình
    const grad = ctx.createLinearGradient(pBase.x - rx, pBase.y, pBase.x + rx, pBase.y);
    grad.addColorStop(0, "#f5f5f4");
    grad.addColorStop(0.35, "#e7e5e4");
    grad.addColorStop(0.75, "#a8a29e");
    grad.addColorStop(1, "#78716c");
    ctx.fillStyle = grad;
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.ellipse(pBase.x, pBase.y, rx, ry, 0, 0, Math.PI);
    ctx.lineTo(pBase.x - rx, pBase.y - hTower);
    ctx.ellipse(pBase.x, pBase.y - hTower, rx, ry, 0, Math.PI, 0, true);
    ctx.lineTo(pBase.x + rx, pBase.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Vân mạch đá hộc ngang & 3 Vòng gờ phào đá nổi quanh thân tháp
    [0.24, 0.48, 0.74, 0.92].forEach((frac, idx) => {
      const ringY = pBase.y - hTower * frac;
      ctx.strokeStyle = idx % 2 === 0 ? "#44403c" : "rgba(87, 83, 78, 0.55)";
      ctx.lineWidth = idx % 2 === 0 ? 2.2 : 1.1;
      ctx.beginPath();
      ctx.ellipse(pBase.x, ringY, rx + (idx % 2 === 0 ? 1.5 : 0), ry * 0.95, 0, 0, Math.PI);
      ctx.stroke();
    });

    // Các ô cửa sổ vòm hẹp 2 tầng có khung vòm đá trắng & lá sách
    [-25, -12, 0, 12, 25].forEach(ox => {
      [0.64, 0.30].forEach(vf => {
        const wy = pBase.y - hTower * vf;
        ctx.fillStyle = env.isNight ? "#fde047" : "#1e293b";
        ctx.strokeStyle = "#f5f5f4";
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.roundRect(pBase.x + ox - 3, wy, 6, 12, [3, 3, 0, 0]);
        ctx.fill();
        ctx.stroke();
      });
    });

    // Mái chóp nón đá phiến xám đen có gờ múi tỏa tròn + Chóp đèn đỉnh tháp
    const topY = pBase.y - hTower;
    ctx.fillStyle = "#334155";
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(pBase.x, topY, rx + 6, ry + 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    const coneGrad = ctx.createLinearGradient(pBase.x - rx, topY, pBase.x + rx, topY);
    coneGrad.addColorStop(0, "#64748b");
    coneGrad.addColorStop(0.5, "#475569");
    coneGrad.addColorStop(1, "#1e293b");
    ctx.fillStyle = coneGrad;
    ctx.beginPath();
    ctx.moveTo(pBase.x - rx - 5, topY);
    ctx.lineTo(pBase.x, topY - 36);
    ctx.lineTo(pBase.x + rx + 5, topY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Các đường múi mái đá phiến từ đỉnh chóp tỏa xuống vành mái
    ctx.strokeStyle = "rgba(15, 23, 42, 0.45)";
    ctx.lineWidth = 1.0;
    [-28, -14, 0, 14, 28].forEach(ox => {
      ctx.beginPath();
      ctx.moveTo(pBase.x, topY - 36);
      ctx.lineTo(pBase.x + ox, topY + 6);
      ctx.stroke();
    });

    // Chóp cổ lầu nhỏ & Kim thu lôi trên đỉnh Bốt Hàng Đậu
    ctx.fillStyle = "#475569";
    ctx.beginPath();
    ctx.ellipse(pBase.x, topY - 32, 9, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pBase.x, topY - 36);
    ctx.lineTo(pBase.x, topY - 46);
    ctx.stroke();

    drawIso3DTree(b.x + 16, b.y + b.h - 14, 0.95, 1);
    drawIso3DTree(b.x + b.w - 16, b.y + b.h - 14, 0.95, 3);

  } else if (shape === "five_gables") {
    // 2. CHỢ ĐỒNG XUÂN (AST_LMK_03): 5 Khoang Mái Ngói Đỏ + 5 Trán Tường Tam Giác Vàng Hoàng Gia + 5 Cổng Vòm Hoa Sắt & Biển Hiệu Đỏ
    const bayW = (b.w - 10) / 5;
    for (let i = 0; i < 5; i++) {
      const bx = b.x + 5 + i * bayW;
      drawIso3DSolidBuilding(bx, b.y + 8, bayW, b.h - 16, 30, "#fde047", "#eab308", "#c2410c", "#9a3412", env, {
        roofType: "gable_ns",
        roofH: 16,
        forceAwning: true,
        awningColor: i % 2 === 0 ? "#dc2626" : "#16a34a"
      });
      // Cổng vòm bán nguyệt hoa sắt đặc trưng ở từng khoang Chợ Đồng Xuân
      const pArch = isoPt(bx + bayW / 2, b.y + b.h - 8, 8);
      ctx.fillStyle = "#78350f";
      ctx.strokeStyle = "#fef3c7";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(pArch.x, pArch.y, 6, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    // Biển hiệu đỏ "CHỢ ĐỒNG XUÂN" ở khoang chính giữa
    const pSign = isoPt(b.x + b.w / 2, b.y + b.h - 7, 25);
    ctx.fillStyle = "#dc2626";
    ctx.strokeStyle = "#fde047";
    ctx.lineWidth = 1.2;
    ctx.fillRect(pSign.x - 18, pSign.y - 4, 36, 8);
    ctx.strokeRect(pSign.x - 18, pSign.y - 4, 36, 8);

  } else if (shape === "twin_spires") {
    // 3. NHÀ THỜ LỚN HÀ NỘI (AST_LMK_04): Sảnh Nave + 2 Tháp Chuông Đá Xám Gothic 4 Tầng Gờ Đá + Cửa Sổ Hoa Hồng (Rose Window) + Thánh Giá
    drawIso3DSolidBuilding(b.x + 20, b.y + 8, b.w - 40, b.h - 22, 42, "#a8a29e", "#78716c", "#9a3412", "#7c2d12", env, { roofType: "gable_ns", roofH: 18, noAwning: true });
    // Tháp chuông Trái & Phải cao 74px
    drawIso3DSolidBuilding(b.x + 8, b.y + b.h - 46, 34, 38, 74, "#d6d3d1", "#78716c", "#475569", "#334155", env, { roofType: "flat", noAwning: true, noRoofProps: true });
    drawIso3DSolidBuilding(b.x + b.w - 42, b.y + b.h - 46, 34, 38, 74, "#d6d3d1", "#78716c", "#475569", "#334155", env, { roofType: "flat", noAwning: true, noRoofProps: true });

    // Cửa sổ Hoa Hồng Gothic (Rose Window) & Đồng hồ ở chính giữa mặt tiền
    const pRose = isoPt(b.x + b.w / 2, b.y + b.h - 14, 34);
    ctx.fillStyle = "#1e293b";
    ctx.strokeStyle = "#fef08a";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(pRose.x, pRose.y, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.arc(pRose.x, pRose.y, 4.2, 0, Math.PI * 2);
    ctx.fill();

    // Cây Thánh Giá uy nghiêm trên đỉnh Nhà Thờ Lớn
    const pCross = isoPt(b.x + b.w / 2, b.y + b.h - 26, 68);
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(pCross.x, pCross.y - 16); ctx.lineTo(pCross.x, pCross.y + 3);
    ctx.moveTo(pCross.x - 6, pCross.y - 10); ctx.lineTo(pCross.x + 6, pCross.y - 10);
    ctx.stroke();
    drawIso3DTree(b.x + 12, b.y + 18, 0.95, 1);
    drawIso3DTree(b.x + b.w - 12, b.y + 18, 0.95, 2);

  } else if (shape === "opera_dome") {
    // 4. NHÀ HÁT LỚN HÀ NỘI (AST_LMK_05): Hàng cột Tân Cổ Điển Trắng-Vàng + Bậc Tam Cấp Lớn + Mái Vòm Đá Đen (Cupola Dome) & Chóp Vàng
    drawIso3DSolidBuilding(b.x + 8, b.y + 10, b.w - 16, b.h - 18, 40, "#fef9c3", "#fde047", "#cbd5e1", "#94a3b8", env, { roofType: "mansard", roofH: 12, noAwning: true });

    // Hàng 6 cột đá trắng Ionic mặt tiền Nhà Hát Lớn
    for (let ci = 0; ci < 6; ci++) {
      const u = 0.16 + (ci / 5) * 0.68;
      const pColBot = isoPt(b.x + 8 + (b.w - 16) * u, b.y + b.h - 8, 2);
      const pColTop = isoPt(b.x + 8 + (b.w - 16) * u, b.y + b.h - 8, 28);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(pColBot.x, pColBot.y);
      ctx.lineTo(pColTop.x, pColTop.y);
      ctx.stroke();
    }

    // Mái vòm bán cầu lớn (Cupola Dome) dựng đứng trên đỉnh Nhà Hát Lớn
    const pDome = isoPt(b.x + b.w / 2, b.y + b.h / 2, 48);
    ctx.fillStyle = "#334155";
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(pDome.x, pDome.y, 28, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#475569";
    ctx.beginPath();
    ctx.arc(pDome.x, pDome.y, 26, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Gờ múi vòm & Chóp kim vàng trên đỉnh Nhà Hát Lớn
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pDome.x, pDome.y - 26);
    ctx.lineTo(pDome.x, pDome.y - 38);
    ctx.stroke();
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.arc(pDome.x, pDome.y - 38, 2.5, 0, Math.PI * 2);
    ctx.fill();

  } else if (shape === "city_gate") {
    // 5. THÀNH CỔ CỬA ĐÔNG & Ô QUAN CHƯỞNG (AST_LMK_06): Tường thành gạch cổ có lỗ châu mai + 3 Cổng vòm cuốn + Vọng lâu 2 tầng mái đao cong
    drawIso3DSolidBuilding(b.x + 8, b.y + 22, b.w - 16, b.h - 32, 28, "#d97706", "#b45309", "#94a3b8", "#64748b", env, { roofType: "flat", noAwning: true, noRoofProps: true });
    drawIso3DSolidBuilding(b.x + 32, b.y + 32, b.w - 64, b.h - 50, 46, "#fef3c7", "#fde68a", "#c2410c", "#9a3412", env, { roofType: "gable_ew", roofH: 15, noAwning: true });
    // 3 Cổng vòm cuốn dưới chân Ô Quan Chưởng
    [-26, 0, 26].forEach((ox, idx) => {
      const pArch = isoPt(b.x + b.w / 2 + ox, b.y + b.h - 10, 0);
      const rad = idx === 1 ? 11 : 7.5;
      ctx.fillStyle = "#0f172a";
      ctx.strokeStyle = "#fef3c7";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(pArch.x, pArch.y - 1, rad, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });
    drawIso3DTree(b.x + 16, b.y + b.h - 8, 0.9, 1);
    drawIso3DTree(b.x + b.w - 16, b.y + b.h - 8, 0.9, 3);

  } else if (shape === "arches_viaduct") {
    // 6. VÒM CẦU ĐÁ PHỐ BÍCH HỌA PHÙNG HƯNG (AST_LMK_07): Cầu cạn đá xám + 4 Ô vòm tranh bích họa + Đoàn tàu hỏa cổ điển chạy trên đỉnh cầu!
    drawIso3DSolidBuilding(b.x + 8, b.y + 20, b.w - 16, b.h - 40, 28, "#d6d3d1", "#a8a29e", "#64748b", "#475569", env, { roofType: "flat", noAwning: true, noRoofProps: true });
    const muralColors = ["#f59e0b", "#38bdf8", "#ec4899", "#10b981"];
    for (let i = 0; i < 4; i++) {
      const u = (i + 0.5) / 4;
      const pMural = isoPt(b.x + 12 + u * (b.w - 24), b.y + b.h - 20, 4);
      ctx.fillStyle = muralColors[i];
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(pMural.x, pMural.y, 9, Math.PI, 0);
      ctx.lineTo(pMural.x + 9, pMural.y + 8);
      ctx.lineTo(pMural.x - 9, pMural.y + 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    // Đầu máy tàu hỏa Đỏ-Vàng & Toa tàu Xanh trên mặt cầu cạn Phùng Hưng (AST_TRN_01..02)
    drawIso3DSolidBuilding(b.x + 18, b.y + 30, 38, 18, 42, "#dc2626", "#991b1b", "#fde047", "#ca8a04", env, { roofType: "flat", isSimpleBox: true, noShadow: true });
    drawIso3DSolidBuilding(b.x + 62, b.y + 30, 48, 18, 40, "#0284c7", "#0369a1", "#f8fafc", "#cbd5e1", env, { roofType: "flat", isSimpleBox: true, noShadow: true });

  } else if (shape === "corner_rotunda" || shape === "mansard_hotel") {
    // 7. KHÁCH SẠN METROPOLE & TRÀNG TIỀN PLAZA (AST_LMK_08): Hai cánh Mansard trắng kem + Mái hiên xanh lục bảo + Tháp tròn góc phố có mái vòm
    drawIso3DSolidBuilding(b.x + 8, b.y + 10, b.w - 16, b.h - 18, 40, "#f8fafc", "#e2e8f0", "#475569", "#334155", env, { roofType: "mansard", roofH: 14, forceAwning: true, awningColor: "#047857" });
    const pRot = isoPt(b.x + b.w / 2, b.y + b.h - 14, 50);
    ctx.fillStyle = "#0f766e";
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(pRot.x, pRot.y, 18, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#fbbf24";
    ctx.beginPath();
    ctx.moveTo(pRot.x, pRot.y - 18);
    ctx.lineTo(pRot.x, pRot.y - 26);
    ctx.stroke();

  } else if (shape === "train_station") {
    // 8. GA HÀ NỘI (AST_LMK_09): Sảnh trung tâm có Tháp Đồng Hồ lớn & Kim đồng hồ + 2 cánh nhà ga đối xứng
    drawIso3DSolidBuilding(b.x + 6, b.y + 20, b.w - 12, b.h - 34, 30, "#fef08a", "#eab308", "#475569", "#334155", env, { roofType: "mansard", roofH: 12, forceAwning: true, awningColor: "#dc2626" });
    drawIso3DSolidBuilding(b.x + 34, b.y + 12, b.w - 68, b.h - 22, 46, "#f8fafc", "#cbd5e1", "#334155", "#1e293b", env, { roofType: "mansard", roofH: 13, noAwning: true });
    const pClk = isoPt(b.x + b.w / 2, b.y + b.h - 10, 36);
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#dc2626";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(pClk.x, pClk.y, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(pClk.x, pClk.y); ctx.lineTo(pClk.x, pClk.y - 4.5);
    ctx.moveTo(pClk.x, pClk.y); ctx.lineTo(pClk.x + 3.5, pClk.y);
    ctx.stroke();

  } else if (shape === "temple_courtyard") {
    // 9. CHÙA QUÁN SỨ & ĐỀN BẠCH MÃ (AST_LMK_10): Cổng Tam Quan, Sân chùa, 2 nhà tả-hữu vu, Chính điện 2 tầng mái ngói đỏ & Đỉnh đồng tỏa hương
    drawIso3DSolidBuilding(b.x + 18, b.y + 8, b.w - 36, 44, 36, "#fef3c7", "#fde68a", "#c2410c", "#9a3412", env, { roofType: "gable_ew", roofH: 16, noAwning: true });
    drawIso3DSolidBuilding(b.x + 8, b.y + 42, 32, b.h - 50, 24, "#f5f5f4", "#d6d3d1", "#b45309", "#9a3412", env, { roofType: "gable_ns", roofH: 12, noAwning: true });
    drawIso3DSolidBuilding(b.x + b.w - 40, b.y + 42, 32, b.h - 50, 24, "#f5f5f4", "#d6d3d1", "#b45309", "#9a3412", env, { roofType: "gable_ns", roofH: 12, noAwning: true });
    const pUrn = isoPt(b.x + b.w / 2, b.y + 70, 8);
    ctx.fillStyle = "#b45309";
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(pUrn.x, pUrn.y, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    drawIso3DTree(b.x + b.w / 2 - 16, b.y + 76, 0.8, 1);
    drawIso3DTree(b.x + b.w / 2 + 16, b.y + 76, 0.8, 3);

  } else if (shape === "twin_helipad_towers") {
    // 10. TỔ HỢP THÁP ĐÔI KÍNH XANH 18 TẦNG + KHỐI ĐẾ THƯƠNG MẠI + CẦU NỐI KÍNH SKYBRIDGE + SÂN ĐỖ TRỰC THĂNG HELIPAD "H" & THÁP ĂNG-TEN (AST_SKY_01..03 — Asset Sheet 4 #1!)
    const hTower = b.height3d || 110;
    // Khối đế trung tâm thương mại 2 tầng có vườn thượng uyển xanh mướt trên mái khối đế
    drawIso3DSolidBuilding(b.x + 6, b.y + 8, b.w - 12, b.h - 16, 24, "#fef3c7", "#fde68a", "#65a30d", "#4d7c0f", env, { roofType: "flat", forceAwning: true, awningColor: "#0284c7", noRoofProps: true });

    const twW = Math.floor((b.w - 32) / 2);
    const twH = b.h - 36;
    // Tháp Kính Trái (18 tầng Curtain-Wall sắc nét)
    drawIsoGlassSkyscraper3D(b.x + 10, b.y + 14, twW, twH, hTower, "#38bdf8", "#0284c7", "#334155", env);
    // Cầu nối kính trên không (Skybridge) nối giữa 2 tòa tháp ở độ cao 68%
    drawIsoGlassSkyscraper3D(b.x + 10 + twW - 2, b.y + 26, 14, twH - 24, Math.round(hTower * 0.68), "#7dd3fc", "#0369a1", "#e2e8f0", env);
    // Tháp Kính Phải
    drawIsoGlassSkyscraper3D(b.x + 20 + twW, b.y + 14, twW, twH, hTower - 4, "#7dd3fc", "#0369a1", "#334155", env);

    // 2 Sân đỗ trực thăng Helipad chữ "H" chuẩn quốc tế + Đèn dẫn đường & Cột ăng-ten viễn thông trên đỉnh 2 tòa tháp
    [[b.x + 10 + twW / 2, b.y + 14 + twH / 2, hTower], [b.x + 20 + twW * 1.5, b.y + 14 + twH / 2, hTower - 4]].forEach(([hx, hy, hz], idx) => {
      const pHeli = isoPt(hx, hy, hz);
      ctx.fillStyle = "#334155";
      ctx.strokeStyle = "#facc15";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.ellipse(pHeli.x, pHeli.y, 14.5, 8.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.0;
      ctx.setLineDash([3, 2]);
      ctx.beginPath();
      ctx.ellipse(pHeli.x, pHeli.y, 11, 6.2, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#facc15";
      ctx.font = "900 8.5px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("H", pHeli.x, pHeli.y + 0.5);

      // Cột thu phát sóng ăng-ten & Đèn cảnh báo hàng không đỏ nhấp nháy
      if (idx === 0) {
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(pHeli.x - 10, pHeli.y - 3);
        ctx.lineTo(pHeli.x - 10, pHeli.y - 22);
        ctx.stroke();
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(pHeli.x - 10, pHeli.y - 22, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    drawIso3DTree(b.x + 14, b.y + b.h - 10, 0.9, 1);
    drawIso3DTree(b.x + b.w - 14, b.y + b.h - 10, 0.9, 2);

  } else if (shape === "stepped_green_tower") {
    // 11. CAO ỐC SINH THÁI KÍNH GIẬT 3 CẤP + VƯỜN TREO SÂN THƯỢNG & GIÀN PERGOLA TRÊN MỖI TẦNG THỀM (AST_SKY_04..06 — Asset Sheet 4 #3!)
    const hMax = b.height3d || 96;
    const h1 = Math.round(hMax * 0.36);
    const h2 = Math.round(hMax * 0.68);
    // Cả 3 tầng khối đều dùng mặt dựng kính Curtain-Wall cao cấp kết hợp thảm cỏ xanh trên mỗi tầng giật cấp!
    drawIsoGlassSkyscraper3D(b.x + 8,  b.y + 8,  b.w - 16, b.h - 16, h1,   "#7dd3fc", "#0284c7", "#65a30d", env);
    drawIsoGlassSkyscraper3D(b.x + 20, b.y + 18, b.w - 40, b.h - 36, h2,   "#38bdf8", "#0369a1", "#65a30d", env);
    drawIsoGlassSkyscraper3D(b.x + 34, b.y + 30, b.w - 68, b.h - 60, hMax, "#bae6fd", "#0284c7", "#4d7c0f", env);

    // Cây xanh vườn treo trên cả 3 tầng thềm sân thượng (Sky-Garden Terraces)
    [
      [b.x + 14, b.y + b.h - 14, h1],
      [b.x + b.w - 14, b.y + b.h - 14, h1],
      [b.x + 26, b.y + b.h - 24, h2],
      [b.x + b.w - 26, b.y + b.h - 24, h2],
      [b.x + b.w / 2, b.y + b.h / 2, hMax]
    ].forEach(([gx, gy, gz], gi) => {
      const pG = isoPt(gx, gy, gz);
      ctx.fillStyle = "#365314";
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.arc(pG.x, pG.y - 4, gi === 4 ? 7.5 : 5.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#84cc16";
      ctx.beginPath();
      ctx.arc(pG.x - 1.5, pG.y - 5.5, gi === 4 ? 4.8 : 3.2, 0, Math.PI * 2);
      ctx.fill();
    });

    drawIso3DTree(b.x + 16, b.y + b.h - 10, 0.92, 1);
    drawIso3DTree(b.x + b.w - 16, b.y + b.h - 10, 0.92, 3);

  } else {
    drawIso3DSolidBuilding(b.x + 10, b.y + 10, b.w - 20, b.h - 20, b.height3d || 36, b.wall, b.wallDark, "#475569", "#334155", env, { roofType: "mansard", roofH: 13 });
  }
}

// VẼ 4 BỨC TƯỜNG ÁNH SÁNG BÁN TRONG SUỐT DỰNG ĐỨNG 3D QUANH MÉP LÔ ĐẤT (GIỐNG HỆT HIỆU ỨNG TRẠM SẠC TRONG ẢNH MẪU!)
export function drawIso3DGlowingCurtainWalls(cx, cy, w, h, wallH, rgbStr, baseBorderCol, pulse) {
  const x = cx - w / 2;
  const y = cy - h / 2;
  const bNW = isoPt(x, y, 0);
  const bNE = isoPt(x + w, y, 0);
  const bSE = isoPt(x + w, y + h, 0);
  const bSW = isoPt(x, y + h, 0);

  const tNW = isoPt(x, y, wallH);
  const tNE = isoPt(x + w, y, wallH);
  const tSE = isoPt(x + w, y + h, wallH);
  const tSW = isoPt(x, y + h, wallH);

  // Hào quang lan tỏa trên mặt đất
  const pCenter = isoPt(cx, cy, 0);
  const radGrad = ctx.createRadialGradient(pCenter.x, pCenter.y, 12, pCenter.x, pCenter.y, w * 0.78 + pulse * 10);
  radGrad.addColorStop(0, `rgba(${rgbStr}, ${0.42 + pulse * 0.15})`);
  radGrad.addColorStop(0.65, `rgba(${rgbStr}, 0.18)`);
  radGrad.addColorStop(1, `rgba(${rgbStr}, 0)`);
  ctx.fillStyle = radGrad;
  ctx.beginPath();
  ctx.ellipse(pCenter.x, pCenter.y, w * 0.82 + pulse * 8, h * 0.58 + pulse * 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Vẽ 4 bức tường ánh sáng dựng đứng từ mặt đất (z=0) lên độ cao wallH mờ dần lên trên
  const edges = [
    [bNW, bNE, tNE, tNW],
    [bNE, bSE, tSE, tNE],
    [bNW, bSW, tSW, tNW],
    [bSW, bSE, tSE, tSW]
  ];
  edges.forEach(([p0, p1, p2, p3]) => {
    const minY = Math.min(p2.y, p3.y);
    const maxY = Math.max(p0.y, p1.y);
    const g = ctx.createLinearGradient(0, maxY, 0, minY);
    g.addColorStop(0, `rgba(${rgbStr}, ${0.58 + pulse * 0.18})`);
    g.addColorStop(0.6, `rgba(${rgbStr}, 0.22)`);
    g.addColorStop(1, `rgba(${rgbStr}, 0.0)`);
    fillStrokePoly([p0, p1, p2, p3], g, null, 0);
  });

  // Viền sáng Neon dưới chân 4 cạnh lô đất
  fillStrokePoly([bNW, bNE, bSE, bSW], null, baseBorderCol, 2.8 + pulse * 1.2);
}

// VẼ THẺ CALLOUT NỔI NẰM NGANG CÓ MŨI TÊN CHỈ XUỐNG & THANH TIẾN ĐỘ (GIỐNG HỆT "OUR STATION" / "RIVAL STATION" TRONG ẢNH MẪU!)

// Đăng ký vào globalThis để tương thích ngược với HTML event handlers & các module liên kết
Object.assign(globalThis, {
  drawIso3DSolidBuilding,
  drawIsoGlassSkyscraper3D,
  drawIsoPatioUmbrella3D,
  drawDiverseArchitecturalCluster25D,
  drawIsometric3DBuildingBlock,
  drawIso3DGlowingCurtainWalls,
  NEUTRAL_WALL_PALETTE,
  NEUTRAL_ROOF_COLORS,
  GLASS_TOWER_PALETTES,
  ARCHITECTURAL_CLUSTERS
});
