/**
 * src/render/draw-ground.js
 * Nướng nền mặt đất tĩnh (Offscreen Canvas Baking), Vẽ lưới đường phố & Đèn giao thông ngã tư
 */
export function getOrBakeStaticGroundCanvas(isNight, districtIdx = 0) {
  const dIdx = Math.max(0, Math.min(11, Number(districtIdx) || 0));
  const key = `${isNight ? "night" : "day"}_d${dIdx}`;
  if (staticGroundCache[key]) return staticGroundCache[key];

  const dInfo = HANOI_12_DISTRICTS[dIdx] || HANOI_12_DISTRICTS[0];
  const off = document.createElement("canvas");
  off.width = 4320;
  off.height = 3920;
  const octx = off.getContext("2d");
  if (!octx) return null;
  const prevCtx = ctx;
  try {
    ctx = octx;
    ctx.save();
    ctx.translate(2160, 1960);
    const fakeEnv = { isNight: Boolean(isNight), isDusk: false, districtIdx: dIdx, hasRiver: dInfo.hasRiver, archStyle: dInfo.archStyle };

    // Nền mặt đất liền mạch tuyệt đối (3960 × 3740 khớp khít 100% với SECTOR_SPAN_X & SECTOR_SPAN_Y)
    ctx.fillStyle = fakeEnv.isNight ? "#334155" : "#d6d3d1";
    ctx.fillRect(-2020, -1870, 3960, 3740);

    drawLushGrassBlocksAndTrees(fakeEnv, dInfo.hasRiver, dIdx);
    // Sông Hồng chỉ chảy qua các Quận ven sông (Hoàn Kiếm, Tây Hồ, Hai Bà Trưng, Long Biên, Đông Anh, Gia Lâm)
    if (dInfo.hasRiver) {
      drawRedRiverAndBridges(fakeEnv, dIdx);
    }
    // Đường sắt / Cầu cạn chỉ chạy qua các Quận có tuyến đường sắt / metro
    if (dInfo.hasRailway) {
      drawRailwayTrack(fakeEnv);
    }
    drawRoadGridAndTrafficLights(fakeEnv);
    drawAllScenicParksGround(fakeEnv, dIdx);
    ctx.restore();
  } finally {
    ctx = prevCtx;
  }

  staticGroundCache[key] = off;
  return off;
}

export function drawDynamicTrafficLightBoxesOnly(secOx = 0, secOy = 0) {
  for (let vi = 0; vi < V_ROADS.length; vi++) {
    for (let hi = 0; hi < H_ROADS.length; hi++) {
      const ix = V_ROADS[vi].x + secOx;
      const iy = H_ROADS[hi].y + secOy;
      const light = getIntersectionLightState(vi, hi);
      const ewColor = light.ew === "GREEN" ? "#22c55e" : (light.ew === "YELLOW" ? "#facc15" : "#ef4444");
      const nsColor = light.ns === "GREEN" ? "#22c55e" : (light.ns === "YELLOW" ? "#facc15" : "#ef4444");

      ctx.fillStyle = ewColor;
      ctx.beginPath();
      ctx.arc(ix + 23, iy + 23.5, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = nsColor;
      ctx.beginPath();
      ctx.arc(ix + 30, iy + 23.5, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// VẼ VẠCH SƠN KẺ ĐƯỜNG PHÁT SÁNG NHẸ KÈM TÊN QUẬN/PHƯỜNG & ĐẶC TRƯNG QUẬN DƯỚI MẶT ĐƯỜNG TẠI ĐIỂM GIÁP RANH GIỮA 36 PHƯỜNG
export function drawSubtleRoadBoundaryAndDistrictPaint(sec, isActiveSec, isNight) {
  const xLeft = sec.ox - 2020;
  const yTop = sec.oy - 1870;
  const wSpan = 3960;
  const hSpan = 3740;

  ctx.save();
  // 1. Vạch sơn kẻ đường phát sáng nhẹ tại điểm tiếp giáp liên Phường/Quận
  ctx.strokeStyle = isActiveSec
    ? (isNight ? "rgba(250, 204, 21, 0.55)" : "rgba(217, 119, 6, 0.45)")
    : (isNight ? "rgba(56, 189, 248, 0.32)" : "rgba(2, 132, 199, 0.28)");
  ctx.lineWidth = isActiveSec ? 3.2 : 2.0;
  ctx.setLineDash([18, 14]);
  ctx.strokeRect(xLeft, yTop, wSpan, hSpan);
  ctx.setLineDash([]);

  // 2. Chữ sơn kẻ mặt đường phát sáng nhẹ ghi tên Quận • Phường & Kỳ quan đặc trưng dưới mặt đại lộ (Song ngữ VI / EN)
  const roadLabel = isEn()
    ? `✦ ${sec.districtCodeEn}. ${(sec.districtNameEn || sec.districtName).toUpperCase()} • ${(sec.wardNameEn || sec.wardName).toUpperCase()} (LOTS #${sec.startLot}–#${sec.endLot}) ✦`
    : `✦ ${sec.districtCode}. ${sec.districtName.toUpperCase()} • ${sec.wardName.toUpperCase()} (LÔ #${sec.startLot}–#${sec.endLot}) ✦`;
  const paintPositions = [
    { x: sec.ox - 220, y: sec.oy - 1700 },
    { x: sec.ox - 220, y: sec.oy },
    { x: sec.ox - 220, y: sec.oy + 1700 },
    { x: sec.ox - 1300, y: sec.oy - 680 },
    { x: sec.ox + 500, y: sec.oy + 1020 }
  ];

  ctx.font = "900 15px 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  paintPositions.forEach(pt => {
    ctx.fillStyle = isNight ? "rgba(15, 23, 42, 0.72)" : "rgba(30, 41, 59, 0.68)";
    ctx.beginPath();
    ctx.roundRect(pt.x - 235, pt.y - 13, 470, 26, 8);
    ctx.fill();

    ctx.strokeStyle = isActiveSec ? "rgba(250, 204, 21, 0.70)" : "rgba(56, 189, 248, 0.55)";
    ctx.lineWidth = 1.4;
    ctx.stroke();

    ctx.fillStyle = isActiveSec ? "#fde047" : "#7dd3fc";
    ctx.fillText(roadLabel, pt.x, pt.y);
  });
  ctx.restore();
}


export function drawRoadGridAndTrafficLights(env) {
  // Kéo dài toàn bộ 11 trục dọc & 11 trục ngang chạm khít mép Phường (-2020..+1940 và -1870..+1870) để nối liền mạch 100% giữa 36 Phường!
  const minX = -2022;
  const maxX = 1942;
  const minY = -1872;
  const maxY = 1872;

  V_ROADS.forEach(vr => {
    ctx.strokeStyle = env.isNight ? "#1e293b" : "#334155";
    ctx.lineWidth = vr.width;
    ctx.beginPath();
    ctx.moveTo(vr.x, minY);
    ctx.lineTo(vr.x, maxY);
    ctx.stroke();

    ctx.strokeStyle = "rgba(226, 232, 240, 0.45)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([14, 14]);
    ctx.beginPath();
    ctx.moveTo(vr.x, minY);
    ctx.lineTo(vr.x, maxY);
    ctx.stroke();
    ctx.setLineDash([]);
  });

  H_ROADS.forEach(hr => {
    ctx.strokeStyle = env.isNight ? "#1e293b" : "#334155";
    ctx.lineWidth = hr.width;
    ctx.beginPath();
    ctx.moveTo(minX, hr.y);
    ctx.lineTo(maxX, hr.y);
    ctx.stroke();

    ctx.strokeStyle = "rgba(226, 232, 240, 0.45)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([14, 14]);
    ctx.beginPath();
    ctx.moveTo(minX, hr.y);
    ctx.lineTo(maxX, hr.y);
    ctx.stroke();
    ctx.setLineDash([]);
  });

  for (let vi = 0; vi < V_ROADS.length; vi++) {
    for (let hi = 0; hi < H_ROADS.length; hi++) {
      const ix = V_ROADS[vi].x;
      const iy = H_ROADS[hi].y;
      const light = getIntersectionLightState(vi, hi);

      ctx.strokeStyle = "rgba(248, 250, 252, 0.65)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ix - 24, iy - 15); ctx.lineTo(ix - 24, iy + 15);
      ctx.moveTo(ix + 24, iy - 15); ctx.lineTo(ix + 24, iy + 15);
      ctx.moveTo(ix - 15, iy - 24); ctx.lineTo(ix + 15, iy - 24);
      ctx.moveTo(ix - 15, iy + 24); ctx.lineTo(ix + 15, iy + 24);
      ctx.stroke();

      const ewColor = light.ew === "GREEN" ? "#22c55e" : (light.ew === "YELLOW" ? "#facc15" : "#ef4444");
      const nsColor = light.ns === "GREEN" ? "#22c55e" : (light.ns === "YELLOW" ? "#facc15" : "#ef4444");

      ctx.fillStyle = "#0f172a";
      ctx.strokeStyle = "#64748b";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(ix + 19, iy + 19, 15, 9, 3);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = ewColor;
      ctx.beginPath();
      ctx.arc(ix + 23, iy + 23.5, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = nsColor;
      ctx.beginPath();
      ctx.arc(ix + 30, iy + 23.5, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// VẼ 18 DI TÍCH HÀ NỘI VỚI HÌNH KHỐI 3D DỰNG ĐỨNG ĐỘC BẢN (GIỐNG HỆT BỐT HÀNG ĐẬU, NHÀ THỜ LỚN, NHÀ HÁT LỚN, CHỢ ĐỒNG XUÂN TRONG ẢNH CONCEPT ART!)
// VẼ 10 DI SẢN HÀ NỘI & 6 TÒA THÁP CHỌC TRỜI CBD VỚI ĐỘ CHI TIẾT KIẾN TRÚC 3D CAO CẤP (AST_LMK_01..10 & AST_SKY_01..06 — Asset Sheet 3 & Sheet 4!)

// Đăng ký vào globalThis để tương thích ngược với HTML event handlers & các module liên kết
Object.assign(globalThis, {
  getOrBakeStaticGroundCanvas,
  drawDynamicTrafficLightBoxesOnly,
  drawSubtleRoadBoundaryAndDistrictPaint,
  drawRoadGridAndTrafficLights
});
