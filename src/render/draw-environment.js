/**
 * src/render/draw-environment.js
 * Vẽ Cây xanh 3D, Đèn đường, Công viên, Hồ nước, Sông Ngân Hà, Cầu 3D & Tàu điện
 */
export function drawIso3DTree(wx, wy, scale = 1, variant = -1) {
  const p = isoPt(wx, wy, 0);
  const v = variant >= 0 ? variant : Math.abs(Math.round(wx * 0.13 + wy * 0.17)) % 5;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(scale, scale);

  // 1. Bóng đổ mềm nhiều lớp dưới chân cây
  ctx.fillStyle = "rgba(15, 23, 42, 0.25)";
  ctx.beginPath();
  ctx.ellipse(3, 2.5, 11.5, 6.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Bồn cây xây gạch/đá vát cạnh 3D quanh gốc cây
  ctx.fillStyle = "#cbd5e1";
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(0, 1, 6.2, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#5c4033";
  ctx.beginPath();
  ctx.ellipse(0, 0.5, 4.4, 2.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // 3. Thân gỗ cổ thụ dựng đứng + 2 nhánh cành chữ Y đỡ tán lá
  ctx.fillStyle = "#5c4033";
  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(-2.5, 1);
  ctx.lineTo(-1.8, -12);
  ctx.lineTo(-5.2, -16);
  ctx.lineTo(-3.4, -17);
  ctx.lineTo(-0.5, -13.5);
  ctx.lineTo(3.6, -16.5);
  ctx.lineTo(5.0, -15.2);
  ctx.lineTo(1.8, -11.5);
  ctx.lineTo(2.5, 1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 4. Tán lá 3D nhiều tầng (5 khối cầu chồng lớp tạo chiều sâu ánh sáng vòm lá)
  // Lớp đáy tối (Deep Shadow Foliage)
  ctx.fillStyle = "#365314";
  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = 1.15;
  ctx.beginPath();
  ctx.arc(-6.5, -13.5, 6.8, 0, Math.PI * 2);
  ctx.arc(6.5, -13.5, 6.8, 0, Math.PI * 2);
  ctx.arc(0, -12.5, 7.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Lớp trung gian (Mid Emerald Foliage)
  ctx.fillStyle = "#4d7c0f";
  ctx.beginPath();
  ctx.arc(-5.5, -16.5, 7.2, 0, Math.PI * 2);
  ctx.arc(5.5, -16.2, 7.0, 0, Math.PI * 2);
  ctx.arc(0, -20.5, 8.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Lớp đón nắng (Sunlit Lime Crown)
  ctx.fillStyle = "#65a30d";
  ctx.beginPath();
  ctx.arc(-4.2, -18, 5.4, 0, Math.PI * 2);
  ctx.arc(3.8, -17.5, 5.0, 0, Math.PI * 2);
  ctx.arc(-0.8, -22, 6.5, 0, Math.PI * 2);
  ctx.fill();

  // Điểm sáng vòm lá trên đỉnh (Specular Leaf Clusters)
  ctx.fillStyle = "#84cc16";
  ctx.beginPath();
  ctx.arc(-2.5, -23.2, 3.8, 0, Math.PI * 2);
  ctx.arc(2.2, -19.5, 3.2, 0, Math.PI * 2);
  ctx.arc(-4.8, -18.5, 3.0, 0, Math.PI * 2);
  ctx.fill();

  // Chùm hoa Hà Nội đặc trưng (Hoa Phượng đỏ / Bằng Lăng tím / Hoàng Yến vàng) trên tán cây
  if (v === 1 || v === 3) {
    ctx.fillStyle = v === 1 ? "#ef4444" : "#facc15";
    [[-5, -19], [3, -21], [-1, -16], [5, -15], [-2, -24]].forEach(([bx, by]) => {
      ctx.beginPath();
      ctx.arc(bx, by, 1.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  ctx.restore();
}

// VẼ ĐÈN ĐƯỜNG CỔ ĐIỂN HÀ NỘI 3D (Tự động tỏa quầng sáng vàng ấm áp vào ban đêm)
export function drawIso3DStreetLamp(wx, wy, env) {
  const p = isoPt(wx, wy, 0);
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -16);
  ctx.lineTo(4, -18);
  ctx.stroke();

  if (env && env.isNight) {
    const g = ctx.createRadialGradient(4, -17, 1, 4, -12, 16);
    g.addColorStop(0, "rgba(254, 240, 138, 0.85)");
    g.addColorStop(0.5, "rgba(250, 204, 21, 0.28)");
    g.addColorStop(1, "rgba(250, 204, 21, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(4, -12, 16, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = (env && env.isNight) ? "#fef08a" : "#f8fafc";
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(4, -17.5, 2.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// VẼ KHỐI TÒA NHÀ 3D ISOMETRIC CHI TIẾT CAO (ĐẾ ĐÁ + PHÀO CHỈ TẦNG + CỬA HIỆU TẦNG 1 & MÁI HIÊN SỌC + BAN CÔNG HOA + CỬA SỔ KHUNG LÁ SÁCH + SÓNG NGÓI / CỬA SỔ MÁI MANSARD / BỒN NƯỚC INOX SÂN THƯỢNG)

export function drawLushGrassBlocksAndTrees(env, hasRiver = true, districtIdx = 0) {
  // Mở rộng lưới ô phố sang cả dải tiếp giáp liên Phường (c = -1..10, r = -1..10) để các Phường khớp nối 100%!
  // Đặc biệt: Ở các Quận nội địa không giáp Sông Hồng (hasRiver = false: Ba Đình, Đống Đa, Cầu Giấy, Mỹ Đình, Thanh Xuân, Hà Đông), dải c = 8 là Ô Phố Đại Lộ sầm uất thay vì sông!
  const xEdges = [-2200, ...V_ROADS.map(v => v.x), 2120];
  const yEdges = [-2040, ...H_ROADS.map(h => h.y), 2040];
  for (let ci = 0; ci < xEdges.length - 1; ci++) {
    for (let ri = 0; ri < yEdges.length - 1; ri++) {
      const c = ci - 1;
      const r = ri - 1;
      if (c >= 0 && c < V_ROADS.length - 1 && r >= 0 && r < H_ROADS.length - 1) {
        if ((hasRiver && isRedRiverCorridor(c)) || isMajorParkBlock(c, r)) continue;
      } else if (hasRiver && c === 8) {
        continue;
      }
      const bx = xEdges[ci] + 24;
      const by = yEdges[ri] + 24;
      const bw = (xEdges[ci + 1] - xEdges[ci]) - 48;
      const bh = (yEdges[ri + 1] - yEdges[ri]) - 48;

      // Vỉa hè đá granite bo góc + Gờ bó vỉa 2 lớp sắc nét
      ctx.fillStyle = env.isNight ? "#475569" : "#e2e8f0";
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.roundRect(bx - 5, by - 5, bw + 10, bh + 10, 14);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = env.isNight ? "#334155" : "#d6d3d1";
      ctx.beginPath();
      ctx.roundRect(bx + 3, by + 3, bw - 6, bh - 6, 10);
      ctx.fill();

      // Đường dạo nội khu chữ thập lát gạch & Bồn hoa tròn ở tâm ô phố
      ctx.fillStyle = env.isNight ? "#1e293b" : "#cbd5e1";
      ctx.fillRect(bx + bw / 2 - 7, by + 4, 14, bh - 8);
      ctx.fillRect(bx + 4, by + bh / 2 - 7, bw - 8, 14);

      ctx.fillStyle = "#f8fafc";
      ctx.strokeStyle = "#64748b";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(bx + bw / 2, by + bh / 2, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#16a34a";
      ctx.beginPath();
      ctx.arc(bx + bw / 2, by + bh / 2, 9.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export function drawRedRiverAndBridges(env) {
  // Dòng Sông Hồng chảy xuyên suốt liên Phường từ -1875 đến +1875 không đứt quãng
  ctx.fillStyle = "#fde68a";
  ctx.fillRect(1062, -1875, 316, 3750);

  const rivGrad = ctx.createLinearGradient(1072, 0, 1368, 0);
  rivGrad.addColorStop(0, env.isNight ? "#1e3a8a" : "#0ea5e9");
  rivGrad.addColorStop(0.5, env.isNight ? "#172554" : "#0284c7");
  rivGrad.addColorStop(1, env.isNight ? "#1e3a8a" : "#0ea5e9");
  ctx.fillStyle = rivGrad;
  ctx.fillRect(1072, -1875, 296, 3750);
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = "#7dd3fc";
  ctx.beginPath();
  ctx.moveTo(1072, -1875); ctx.lineTo(1072, 1875);
  ctx.moveTo(1368, -1875); ctx.lineTo(1368, 1875);
  ctx.stroke();

  // Sóng nước lăn tăn dọc Sông Hồng
  ctx.strokeStyle = "rgba(186, 230, 253, 0.38)";
  ctx.lineWidth = 1.5;
  for (let wy = -1800; wy <= 1800; wy += 140) {
    ctx.beginPath();
    ctx.moveTo(1110, wy); ctx.lineTo(1145, wy);
    ctx.moveTo(1295, wy + 60); ctx.lineTo(1335, wy + 60);
    ctx.stroke();
  }

  // 3 Đảo Bãi Giữa Sông Hồng xanh mướt (AST_RIV_03 — Giống hệt mục #10 trong Asset Sheet 4!)
  [[-1350, 240], [-180, 260], [980, 250]].forEach(([iy, ih]) => {
    ctx.fillStyle = "#fde68a";
    ctx.beginPath();
    ctx.ellipse(1220, iy, 64, ih / 2 + 10, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#65a30d";
    ctx.strokeStyle = "#3f6212";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(1220, iy, 52, ih / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#3f6212";
    [[-18, -35, 14], [16, -15, 16], [-12, 22, 15], [14, 38, 12]].forEach(([ox, oy, rad]) => {
      ctx.beginPath();
      ctx.arc(1220 + ox, iy + oy, rad, 0, Math.PI * 2);
      ctx.fill();
    });
  });

  // Mặt cầu phẳng bên dưới (khung giàn thép 3D & trụ dây văng 3D sẽ được vẽ dựng đứng trong drawRedRiverBridge3DSpan!)
  [-1722, -1042, -364, 656].forEach((by, idx) => {
    ctx.fillStyle = idx < 2 ? "#57534e" : "#475569";
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2;
    ctx.fillRect(1040, by, 360, 46);
    ctx.strokeRect(1040, by, 360, 46);
  });
}

// VẼ KẾT CẤU CẦU SÔNG HỒNG 3D DỰNG ĐỨNG (Cầu Nhật Tân 5 trụ tháp chữ A đỏ dây văng & Cầu Long Biên giàn thép lịch sử — Asset Sheet 4!)
export function drawRedRiverBridge3DSpan(by, bridgeIdx, env, secOx = 0, secOy = 0) {
  const wby = by + secOy;
  if (bridgeIdx === 0) {
    // CẦU NHẬT TÂN (by = -1700): 5 Trụ Tháp Dây Văng Chữ A Đỏ Rực + Bó Cáp Trắng Rẽ Quạt 3D
    const pylonXs = [1085, 1152, 1220, 1288, 1355];
    pylonXs.forEach(px0 => {
      const px = px0 + secOx;
      const pBaseN = isoPt(px, wby - 18, 0);
      const pBaseS = isoPt(px, wby + 18, 0);
      const pTop = isoPt(px, wby, 58);

      // Bó cáp dây văng màu trắng tỏa sang 2 phía mặt cầu
      ctx.strokeStyle = "rgba(248, 250, 252, 0.78)";
      ctx.lineWidth = 1.0;
      [-48, -32, -18, 18, 32, 48].forEach(dx => {
        const pDeck = isoPt(px + dx, wby, 2);
        ctx.beginPath();
        ctx.moveTo(pTop.x, pTop.y + 4);
        ctx.lineTo(pDeck.x, pDeck.y);
        ctx.stroke();
      });

      // Trụ tháp chữ A màu đỏ son
      ctx.strokeStyle = "#dc2626";
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(pBaseN.x, pBaseN.y);
      ctx.lineTo(pTop.x, pTop.y);
      ctx.lineTo(pBaseS.x, pBaseS.y);
      ctx.stroke();
    });
  } else if (bridgeIdx === 1) {
    // CẦU LONG BIÊN LỊCH SỬ (by = -1020): Khung giàn thép Cantilever nâu rỉ nhấp nhô 3D
    const xs = [1060, 1110, 1160, 1210, 1260, 1310, 1360];
    for (let i = 0; i < xs.length - 1; i++) {
      const x0 = xs[i] + secOx, x1 = xs[i + 1] + secOx;
      const hTruss = (i % 2 === 0) ? 28 : 18;
      const b0 = isoPt(x0, wby + 20, 0), b1 = isoPt(x1, wby + 20, 0);
      const t0 = isoPt(x0, wby + 20, hTruss), t1 = isoPt(x1, wby + 20, hTruss);
      ctx.strokeStyle = "#78350f";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(b0.x, b0.y); ctx.lineTo(t0.x, t0.y); ctx.lineTo(t1.x, t1.y); ctx.lineTo(b1.x, b1.y);
      ctx.moveTo(b0.x, b0.y); ctx.lineTo(t1.x, t1.y);
      ctx.moveTo(t0.x, t0.y); ctx.lineTo(b1.x, b1.y);
      ctx.stroke();
    }
  }
}

// VẼ ĐOÀN TÀU HỎA HÀ NỘI / TÀU ĐIỆN METRO CÁT LINH - HÀ ĐÔNG 3D CHẠY TRÊN ĐƯỜNG SẮT
export function drawHanoiTrain3DOnTrack(env, secOx = 0, secOy = 0, districtIdx = 0) {
  const tProg = ((performance.now() * 0.00008) % 1);
  const wy = 1400 - tProg * 2300 + secOy;
  const wx = -1180 + secOx;
  if (districtIdx === 9 || districtIdx === 3) {
    // Tàu điện Metro Cát Linh - Hà Đông màu Xanh Lá - Trắng hiện đại (Quận Hà Đông & Đống Đa)
    drawIso3DSolidBuilding(wx - 9, wy - 28, 18, 34, 18, "#10b981", "#047857", "#f8fafc", "#cbd5e1", env, { roofType: "flat", isSimpleBox: true, noShadow: true });
    drawIso3DSolidBuilding(wx - 8, wy + 10, 16, 36, 17, "#34d399", "#059669", "#f8fafc", "#cbd5e1", env, { roofType: "flat", isSimpleBox: true, noShadow: true });
    drawIso3DSolidBuilding(wx - 8, wy + 50, 16, 36, 17, "#10b981", "#047857", "#f8fafc", "#cbd5e1", env, { roofType: "flat", isSimpleBox: true, noShadow: true });
  } else {
    // Đầu máy Đổi Mới Đỏ-Vàng + 2 Toa hành khách Xanh-Trắng (Đoàn tàu Thống Nhất)
    drawIso3DSolidBuilding(wx - 9, wy - 28, 18, 34, 18, "#dc2626", "#991b1b", "#fde047", "#ca8a04", env, { roofType: "flat", isSimpleBox: true, noShadow: true });
    drawIso3DSolidBuilding(wx - 8, wy + 10, 16, 36, 16, "#0284c7", "#0369a1", "#f8fafc", "#cbd5e1", env, { roofType: "flat", isSimpleBox: true, noShadow: true });
    drawIso3DSolidBuilding(wx - 8, wy + 50, 16, 36, 16, "#0284c7", "#0369a1", "#f8fafc", "#cbd5e1", env, { roofType: "flat", isSimpleBox: true, noShadow: true });
  }
}

export function drawRailwayTrack(env) {
  ctx.strokeStyle = "#64748b";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(-1180, 1875);
  ctx.lineTo(-1180, -1875);
  ctx.moveTo(-1180, -1020);
  ctx.lineTo(1945, -1020);
  ctx.stroke();

  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 3.5;
  ctx.setLineDash([6, 8]);
  ctx.beginPath();
  ctx.moveTo(-1180, 1875);
  ctx.lineTo(-1180, -1875);
  ctx.stroke();
  ctx.setLineDash([]);
}

// VẼ NỀN MẶT ĐẤT ĐẶC TRƯNG RIÊNG CHO TỪNG QUẬN TRONG 12 QUẬN HÀ NỘI (KHÔNG COPY-PASTE HỒ GƯƠM SANG QUẬN KHÁC!)
export function drawAllScenicParksGround(env, districtIdx = 0) {
  const dIdx = Number(districtIdx) || 0;
  MAJOR_PARKS.forEach(pk => {
    const lx = V_ROADS[pk.col].x + 24;
    const ly = H_ROADS[pk.row].y + 24;
    const lw = (V_ROADS[pk.col + 1].x - V_ROADS[pk.col].x) - 48;
    const lh = (H_ROADS[pk.row + 1].y - H_ROADS[pk.row].y) - 48;
    const cx = lx + lw / 2;
    const cy = ly + lh / 2;

    // 1. Viền đá granite dạo bộ bo tròn quanh Khu Kỳ Quan / Công viên
    ctx.fillStyle = "#e2e8f0";
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(lx - 8, ly - 8, lw + 16, lh + 16, 46);
    ctx.fill();
    ctx.stroke();

    // 2. Nền thảm cỏ sinh thái mặc định cho các công viên vệ tinh
    const grassGrad = ctx.createRadialGradient(cx, cy, 15, cx, cy, lw * 0.65);
    grassGrad.addColorStop(0, "#65a30d");
    grassGrad.addColorStop(0.7, "#4d7c0f");
    grassGrad.addColorStop(1, "#3f6212");
    ctx.fillStyle = grassGrad;
    ctx.strokeStyle = "#15803d";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(lx + 2, ly + 2, lw - 4, lh - 4, 40);
    ctx.fill();
    ctx.stroke();

    // NẾU LÀ Ô TRUNG TÂM (pk.type === "hoan_kiem" tại col: 5, row: 5): VẼ NỀN KỲ QUAN ĐẶC TRƯNG RIÊNG CỦA TỪNG QUẬN (0..11)!
    if (pk.type === "hoan_kiem") {
      if (dIdx === 0) {
        // Q1. HOÀN KIẾM: Mặt nước Hồ Gươm xanh lục bảo + Đảo Ngọc & Gò Rùa (CHỈ DUY NHẤT QUẬN HOÀN KIẾM CÓ HỒ GƯƠM!)
        const waterGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, 165);
        waterGrad.addColorStop(0, "#2dd4bf");
        waterGrad.addColorStop(0.7, "#0d9488");
        waterGrad.addColorStop(1, "#115e59");
        ctx.fillStyle = waterGrad;
        ctx.strokeStyle = "#fde68a";
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.roundRect(lx + 10, ly + 10, lw - 20, lh - 20, 42);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#65a30d";
        ctx.strokeStyle = "#e7e5e4";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(cx, ly + 70, 44, 24, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(cx, ly + 182, 42, 24, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

      } else if (dIdx === 1) {
        // Q2. BA ĐÌNH: Quảng Trường Ba Đình Lịch Sử (Thảm cỏ ô vuông bàn cờ xanh mướt + Đường Hùng Vương sỏi đỏ + Hồ sen Chùa Một Cột)
        ctx.fillStyle = "#e2e8f0";
        ctx.beginPath();
        ctx.roundRect(lx + 8, ly + 8, lw - 16, lh - 16, 26);
        ctx.fill();
        // Đường diễu hành Hùng Vương lát sỏi đỏ trang nghiêm
        ctx.fillStyle = "#dc2626";
        ctx.fillRect(lx + 82, ly + 12, 34, lh - 24);
        // 20 Ô cỏ vuông xanh mướt đặc trưng Quảng trường Ba Đình
        const gCols = 4, gRows = 5;
        const cellW = (lw - 140) / gCols;
        const cellH = (lh - 40) / gRows;
        for (let gc = 0; gc < gCols; gc++) {
          for (let gr = 0; gr < gRows; gr++) {
            ctx.fillStyle = (gc + gr) % 2 === 0 ? "#16a34a" : "#15803d";
            ctx.fillRect(lx + 122 + gc * cellW + 3, ly + 20 + gr * cellH + 3, cellW - 6, cellH - 6);
          }
        }
        // Hồ sen vuông Linh Chiểu quanh Chùa Một Cột ở góc Nam
        ctx.fillStyle = "#0ea5e9";
        ctx.strokeStyle = "#fde047";
        ctx.lineWidth = 2.5;
        ctx.fillRect(lx + 20, ly + lh - 78, 54, 54);
        ctx.strokeRect(lx + 20, ly + lh - 78, 54, 54);

      } else if (dIdx === 2) {
        // Q3. TÂY HỒ: Đại Hồ Tây Sóng Nước Mênh Mông + Đường Thanh Niên Cổ Thụ + Bán Đảo Chùa Trấn Quốc & Đầm Sen Quảng An
        const westGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, 185);
        westGrad.addColorStop(0, "#38bdf8");
        westGrad.addColorStop(0.65, "#0284c7");
        westGrad.addColorStop(1, "#1e3a8a");
        ctx.fillStyle = westGrad;
        ctx.strokeStyle = "#fde047";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(lx + 6, ly + 6, lw - 12, lh - 12, 48);
        ctx.fill();
        ctx.stroke();

        // Đường Thanh Niên chia đôi Hồ Tây & Hồ Trúc Bạch
        ctx.fillStyle = "#fde68a";
        ctx.fillRect(lx + 10, cy + 28, lw - 20, 18);
        ctx.fillStyle = "#334155";
        ctx.fillRect(lx + 10, cy + 31, lw - 20, 12);

        // Đảo Chùa Trấn Quốc nhô ra Hồ Tây
        ctx.fillStyle = "#fcd34d";
        ctx.strokeStyle = "#b45309";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(cx - 20, ly + 92, 58, 34, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Đầm sen hồng Quảng An nở rộ góc Đông Bắc Hồ Tây
        [[cx + 62, ly + 56], [cx + 82, ly + 68], [cx + 54, ly + 78], [cx + 76, ly + 46]].forEach(([sx, sy]) => {
          ctx.fillStyle = "#15803d";
          ctx.beginPath(); ctx.arc(sx, sy, 8, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#f472b6";
          ctx.beginPath(); ctx.arc(sx + 1, sy - 1, 4, 0, Math.PI * 2); ctx.fill();
        });

      } else if (dIdx === 3) {
        // Q4. ĐỐNG ĐA: Văn Miếu – Quốc Tử Giám (Tường gạch đỏ cổ kính, Đường Thần Đạo lát gạch Bát Tràng & Giếng Thiên Quang hình vuông)
        ctx.fillStyle = "#fef3c7";
        ctx.strokeStyle = "#991b1b";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.roundRect(lx + 10, ly + 10, lw - 20, lh - 20, 20);
        ctx.fill();
        ctx.stroke();

        // Thảm cỏ cổ thụ hai bên & Đường Thần Đạo chính giữa lát gạch đỏ Bát Tràng
        ctx.fillStyle = "#3f6212";
        ctx.fillRect(lx + 18, ly + 18, lw - 36, lh - 36);
        ctx.fillStyle = "#b91c1c";
        ctx.fillRect(cx - 22, ly + 14, 44, lh - 28);

        // Giếng Thiên Quang (Hồ vuông soi bóng Khuê Văn Các) kè đá xanh
        ctx.fillStyle = "#0d9488";
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 4;
        ctx.fillRect(cx - 48, cy - 34, 96, 68);
        ctx.strokeRect(cx - 48, cy - 34, 96, 68);

      } else if (dIdx === 4) {
        // Q5. CẦU GIẤY CBD: Quảng Trường Công Nghệ Silicon Valley (Sàn đá lục giác LED Cyan & Hồ nước ánh sáng)
        ctx.fillStyle = "#1e293b";
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.roundRect(lx + 10, ly + 10, lw - 20, lh - 20, 32);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
        ctx.lineWidth = 2;
        [45, 85, 125].forEach(rad => {
          ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.stroke();
        });
        ctx.beginPath();
        ctx.moveTo(lx + 20, cy); ctx.lineTo(lx + lw - 20, cy);
        ctx.moveTo(cx, ly + 20); ctx.lineTo(cx, ly + lh - 20);
        ctx.stroke();

      } else if (dIdx === 5) {
        // Q6. NAM TỪ LIÊM – MỸ ĐÌNH: Sân Vận Động Quốc Gia Mỹ Đình (Đường chạy điền kinh đỏ gạch + Mặt cỏ bóng đá kẻ vạch trắng chuẩn FIFA!)
        ctx.fillStyle = "#cbd5e1";
        ctx.beginPath();
        ctx.roundRect(lx + 8, ly + 8, lw - 16, lh - 16, 44);
        ctx.fill();

        // Đường pitch điền kinh 8 làn màu đỏ terracotta bao quanh sân cỏ
        ctx.fillStyle = "#c2410c";
        ctx.strokeStyle = "#f8fafc";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(cx, cy, lw * 0.43, lh * 0.42, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Mặt cỏ bóng đá xanh sọc 2 tông màu + Vạch vôi trắng sân bóng Mỹ Đình
        const pitchW = lw * 0.56;
        const pitchH = lh * 0.54;
        const px0 = cx - pitchW / 2;
        const py0 = cy - pitchH / 2;
        ctx.fillStyle = "#16a34a";
        ctx.fillRect(px0, py0, pitchW, pitchH);
        ctx.fillStyle = "#15803d";
        for (let s = 0; s < 6; s += 2) {
          ctx.fillRect(px0 + (s * pitchW) / 6, py0, pitchW / 6, pitchH);
        }
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.strokeRect(px0, py0, pitchW, pitchH);
        ctx.beginPath();
        ctx.moveTo(cx, py0); ctx.lineTo(cx, py0 + pitchH);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, 22, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeRect(px0, cy - 26, 24, 52);
        ctx.strokeRect(px0 + pitchW - 24, cy - 26, 24, 52);

      } else if (dIdx === 6) {
        // Q7. THANH XUÂN: Quảng Trường Hoàng Gia Châu Âu Royal City (Sàn đá cẩm thạch kẻ ô bàn cờ vàng-kem & Hồ phun nước)
        ctx.fillStyle = "#fef3c7";
        ctx.strokeStyle = "#d97706";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(lx + 8, ly + 8, lw - 16, lh - 16, 34);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = "rgba(217, 119, 6, 0.35)";
        ctx.lineWidth = 1.5;
        for (let gx = lx + 24; gx < lx + lw - 20; gx += 28) {
          ctx.beginPath(); ctx.moveTo(gx, ly + 14); ctx.lineTo(gx, ly + lh - 14); ctx.stroke();
        }
        for (let gy = ly + 24; gy < ly + lh - 20; gy += 28) {
          ctx.beginPath(); ctx.moveTo(lx + 14, gy); ctx.lineTo(lx + lw - 14, gy); ctx.stroke();
        }
        // Hồ nước bán nguyệt Châu Âu giữa quảng trường Royal City
        ctx.fillStyle = "#38bdf8";
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(cx, cy - 12, 68, 38, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

      } else if (dIdx === 7) {
        // Q8. HAI BÀ TRƯNG: Công Viên Thống Nhất – Hồ Bảy Mẫu & Đảo Hòa Bình + Quảng trường Parabol Bách Khoa
        const bmGrad = ctx.createRadialGradient(cx, cy - 15, 16, cx, cy - 15, 145);
        bmGrad.addColorStop(0, "#34d399");
        bmGrad.addColorStop(0.7, "#059669");
        bmGrad.addColorStop(1, "#065f46");
        ctx.fillStyle = bmGrad;
        ctx.strokeStyle = "#fde68a";
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.roundRect(lx + 16, ly + 16, lw - 32, lh - 72, 44);
        ctx.fill();
        ctx.stroke();

        // Đảo Hòa Bình xanh mướt giữa Hồ Bảy Mẫu
        ctx.fillStyle = "#65a30d";
        ctx.strokeStyle = "#fef08a";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(cx, cy - 22, 48, 26, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Quảng trường cổng Parabol Bách Khoa ở phía Nam
        ctx.fillStyle = "#e2e8f0";
        ctx.fillRect(cx - 75, ly + lh - 54, 150, 44);

      } else if (dIdx === 8) {
        // Q9. LONG BIÊN: Tổ Hợp Aeon Mall Sakura & Kênh Đào Sinh Thái Vinhomes Riverside
        ctx.fillStyle = "#fdf2f8";
        ctx.strokeStyle = "#ec4899";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(lx + 10, ly + 10, lw - 20, lh - 20, 34);
        ctx.fill();
        ctx.stroke();

        // Dòng kênh đào sinh thái uốn lượn phía Nam
        ctx.fillStyle = "#0ea5e9";
        ctx.strokeStyle = "#bae6fd";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(lx + 18, cy + 18, lw - 36, lh * 0.34, 28);
        ctx.fill();
        ctx.stroke();

      } else if (dIdx === 9) {
        // Q10. HÀ ĐÔNG: Phố Lụa Vạn Phúc Đa Sắc Màu & Quảng Trường Ga Tàu Điện Trên Cao Cát Linh - Hà Đông
        ctx.fillStyle = "#fffbeb";
        ctx.strokeStyle = "#d97706";
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.roundRect(lx + 10, ly + 10, lw - 20, lh - 20, 30);
        ctx.fill();
        ctx.stroke();

        // Con đường dải lụa đỏ-vàng & phố ô lụa rực rỡ
        const silkColors = ["#ef4444", "#f59e0b", "#ec4899", "#8b5cf6", "#10b981", "#3b82f6"];
        for (let i = 0; i < 6; i++) {
          ctx.fillStyle = silkColors[i];
          ctx.fillRect(lx + 24 + i * ((lw - 48) / 6), cy - 36, (lw - 48) / 6 - 4, 72);
        }

      } else if (dIdx === 10) {
        // Q11. ĐÔNG ANH SMART CITY: Hào Nước Xoáy Ốc Thành Cổ Loa & Đế Siêu Tháp Tài Chính 108 Tầng
        ctx.fillStyle = "#0f172a";
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.roundRect(lx + 10, ly + 10, lw - 20, lh - 20, 40);
        ctx.fill();
        ctx.stroke();

        // 3 vòng hào nước đồng tâm lấy cảm hứng từ Thành Cổ Loa bao quanh chân Tháp Tài Chính 108 tầng
        [115, 82, 48].forEach((rad, rIdx) => {
          ctx.strokeStyle = rIdx % 2 === 0 ? "#0ea5e9" : "#fde047";
          ctx.lineWidth = rIdx % 2 === 0 ? 10 : 4;
          ctx.beginPath();
          ctx.arc(cx, cy, rad, 0, Math.PI * 2);
          ctx.stroke();
        });

      } else if (dIdx === 11) {
        // Q12. GIA LÂM OCEAN: Biển Hồ Nước Mặn Nhân Tạo Bãi Cát Trắng Crystal Lagoon & Đảo Dừa Nhiệt Đới
        ctx.fillStyle = "#fef9c3";
        ctx.strokeStyle = "#fde047";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.roundRect(lx + 8, ly + 8, lw - 16, lh - 16, 48);
        ctx.fill();
        ctx.stroke();

        const lagoonGrad = ctx.createRadialGradient(cx, cy, 15, cx, cy, 145);
        lagoonGrad.addColorStop(0, "#67e8f9");
        lagoonGrad.addColorStop(0.55, "#06b6d4");
        lagoonGrad.addColorStop(1, "#0284c7");
        ctx.fillStyle = lagoonGrad;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(lx + 28, ly + 28, lw - 56, lh - 56, 42);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#fef08a";
        ctx.beginPath();
        ctx.ellipse(cx, cy, 46, 26, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      return;
    }

    // 3. Hệ thống đường dạo bộ lát đá chữ thập + Quảng trường tròn cho 6 công viên vệ tinh
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(lx + 14, cy); ctx.lineTo(lx + lw - 14, cy);
    ctx.moveTo(cx, ly + 14); ctx.lineTo(cx, ly + lh - 14);
    ctx.stroke();

    ctx.strokeStyle = "rgba(241, 245, 249, 0.65)";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(cx, cy, Math.min(lw, lh) * 0.34, 0, Math.PI * 2);
    ctx.stroke();

    // 4. Bốn thảm hoa nghệ thuật 4 góc công viên
    [[lx + 52, ly + 52, "#ef4444"], [lx + lw - 52, ly + 52, "#facc15"], [lx + 52, ly + lh - 52, "#ec4899"], [lx + lw - 52, ly + lh - 52, "#f97316"]].forEach(([fx, fy, fcol]) => {
      ctx.fillStyle = "#365314";
      ctx.beginPath();
      ctx.ellipse(fx, fy, 18, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = fcol;
      for (let a = 0; a < Math.PI * 2; a += 1.05) {
        ctx.beginPath();
        ctx.arc(fx + Math.cos(a) * 9, fy + Math.sin(a) * 6, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    if (pk.hasLake) {
      const lakeX = lx + 30;
      const lakeY = ly + 32;
      const lakeW = lw - 110;
      const lakeH = lh - 64;
      const wGrad = ctx.createRadialGradient(lakeX + lakeW / 2, lakeY + lakeH / 2, 12, lakeX + lakeW / 2, lakeY + lakeH / 2, 125);
      wGrad.addColorStop(0, "#38bdf8");
      wGrad.addColorStop(0.65, "#0284c7");
      wGrad.addColorStop(1, "#0369a1");

      ctx.fillStyle = wGrad;
      ctx.strokeStyle = "#fde68a";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(lakeX, lakeY, lakeW, lakeH, 48);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#92400e";
      ctx.strokeStyle = "#451a03";
      ctx.lineWidth = 1.5;
      ctx.fillRect(lakeX + lakeW - 14, cy - 14, 26, 28);
      ctx.strokeRect(lakeX + lakeW - 14, cy - 14, 26, 28);

      [[lakeX + 36, lakeY + 42], [lakeX + 46, lakeY + 52], [lakeX + lakeW - 38, lakeY + 40]].forEach(([lx0, ly0]) => {
        ctx.fillStyle = "#16a34a";
        ctx.beginPath();
        ctx.arc(lx0, ly0, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#f472b6";
        ctx.beginPath();
        ctx.arc(lx0 + 1, ly0 - 1, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      if (pk.hasBoats) {
        [[lakeX + 58, lakeY + 72], [lakeX + lakeW - 52, lakeY + lakeH - 58]].forEach(([bx, by]) => {
          ctx.strokeStyle = "rgba(224, 242, 254, 0.65)";
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.ellipse(bx, by, 15, 7.5, 0.3, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = "#0f172a";
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.ellipse(bx, by, 11, 5.2, 0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = "#38bdf8";
          ctx.beginPath();
          ctx.ellipse(bx, by - 2, 6, 3.2, 0.3, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    }
  });
}

// VẼ BIỂN TÊN KỲ QUAN 3D NỔI TRÊN ĐỈNH BIỂU TƯỢNG TRUNG TÂM CỦA TỪNG QUẬN ĐỂ NGƯỜI CHƠI NHẬN DIỆN NGAY LẬP TỨC
export function drawDistrictWonder3DFloatingBanner(cx, cy, zHeight, badgeText, subText, accentCol = "#fde047") {
  if (camera.zoom < 0.32) return;
  const pTop = isoPt(cx, cy, zHeight);
  ctx.save();
  ctx.font = "900 10.5px 'Segoe UI', sans-serif";
  const wBox = Math.max(168, ctx.measureText(badgeText).width + 24);
  const hBox = subText ? 28 : 18;
  ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
  ctx.strokeStyle = accentCol;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.roundRect(pTop.x - wBox / 2, pTop.y - hBox - 6, wBox, hBox, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = accentCol;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(badgeText, pTop.x, pTop.y - hBox + 4);
  if (subText) {
    ctx.font = "700 8.5px 'Segoe UI', sans-serif";
    ctx.fillStyle = "#e2e8f0";
    ctx.fillText(subText, pTop.x, pTop.y - 8);
  }
  ctx.restore();
}

// VẼ 12 KỲ QUAN 3D ĐỘC BẢN CHO 12 QUẬN HÀ NỘI (MỖI QUẬN MỘT BIỂU TƯỢNG KHÁC NHAU 100%, CHỈ QUẬN 1 HOÀN KIẾM MỚI CÓ HỒ GƯƠM!)
export function drawScenicPark3DStructures(pk, env, secOx = 0, secOy = 0, sec = null) {
  const lx = V_ROADS[pk.col].x + 24 + secOx;
  const ly = H_ROADS[pk.row].y + 24 + secOy;
  const lw = (V_ROADS[pk.col + 1].x - V_ROADS[pk.col].x) - 48;
  const lh = (H_ROADS[pk.row + 1].y - H_ROADS[pk.row].y) - 48;
  const cx = lx + lw / 2;
  const cy = ly + lh / 2;
  const dIdx = sec ? sec.districtIdx : 0;

  if (pk.type === "hoan_kiem") {
    if (dIdx === 0) {
      // =========================================================================
      // Q1. HOÀN KIẾM (dIdx = 0): HỒ HOÀN KIẾM • THÁP RÙA • ĐỀN NGỌC SƠN & CẦU THÊ HÚC ĐỎ SON
      // =========================================================================
      drawIso3DSolidBuilding(cx - 24, ly + 48, 48, 34, 22, "#fef3c7", "#fde68a", "#c2410c", "#9a3412", env, { roofType: "gable_ew", roofH: 13, noAwning: true });
      drawIso3DSolidBuilding(cx - 14, ly + 54, 28, 22, 34, "#fffbeb", "#fef3c7", "#dc2626", "#991b1b", env, { roofType: "gable_ns", roofH: 11, noAwning: true });

      const bStart = isoPt(cx + 22, ly + 66, 4);
      const bMid = isoPt(cx + 82, ly + 54, 14);
      const bEnd = isoPt(lx + lw - 10, ly + 72, 4);
      ctx.strokeStyle = "#991b1b";
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(bStart.x, bStart.y + 3);
      ctx.quadraticCurveTo(bMid.x, bMid.y + 3, bEnd.x, bEnd.y + 3);
      ctx.stroke();

      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(bStart.x, bStart.y);
      ctx.quadraticCurveTo(bMid.x, bMid.y, bEnd.x, bEnd.y);
      ctx.stroke();

      // Tháp Rùa 3 Tầng Cổ Kính Giữa Hồ Gươm
      drawIso3DSolidBuilding(cx - 22, ly + 162, 44, 34, 20, "#e7e5e4", "#a8a29e", "#78716c", "#57534e", env, { roofType: "flat", noRoofProps: true, noAwning: true });
      drawIso3DSolidBuilding(cx - 16, ly + 166, 32, 26, 35, "#f5f5f4", "#d6d3d1", "#78716c", "#57534e", env, { roofType: "flat", noRoofProps: true, noAwning: true });
      drawIso3DSolidBuilding(cx - 10, ly + 170, 20, 18, 48, "#fafaf9", "#e7e5e4", "#b45309", "#9a3412", env, { roofType: "gable_ew", roofH: 11, noAwning: true });

      [
        [lx + 10, ly + 36, 1.15, 1], [lx + 10, ly + 110, 1.05, 0], [lx + 10, ly + 185, 1.15, 3],
        [lx + lw - 10, ly + 38, 1.1, 2], [lx + lw - 10, ly + 125, 1.08, 1], [lx + lw - 10, ly + 195, 1.12, 0],
        [cx - 85, ly + lh - 8, 1.1, 1], [cx, ly + lh - 6, 1.05, 3], [cx + 85, ly + lh - 8, 1.1, 2],
        [cx - 75, ly + 10, 1.05, 0], [cx + 75, ly + 10, 1.05, 1]
      ].forEach(([tx, ty, sc, vr]) => drawIso3DTree(tx, ty, sc, vr));
      drawDistrictWonder3DFloatingBanner(
        cx, cy, 72,
        L("🐢 Q1. HOÀNG KIM • HỒ TINH CẦU & THÁP NGỌC", "🐢 D1. AURUM • STARLIGHT LAKE & EMERALD SPIRE"),
        L("Đền Thái Dương • Cầu Hồng Nhật • 36 Phố Cổ Hoàng Kim", "Sun Temple • Crimson Bridge • 36 Heritage Streets"),
        "#2dd4bf"
      );
      return;

    } else if (dIdx === 1) {
      // =========================================================================
      // Q2. BA ĐÌNH (dIdx = 1): LĂNG CHỦ TỊCH HỒ CHÍ MINH • QUẢNG TRƯỜNG BA ĐÌNH & CHÙA MỘT CỘT 3D
      // =========================================================================
      drawIso3DSolidBuilding(lx + 16, cy - 64, 64, 118, 18, "#78716c", "#57534e", "#a8a29e", "#78716c", env, { roofType: "flat", noAwning: true, noRoofProps: true });
      drawIso3DSolidBuilding(lx + 24, cy - 54, 48, 98, 44, "#d6d3d1", "#78716c", "#57534e", "#44403c", env, { roofType: "flat", noAwning: true, noRoofProps: true });
      drawIso3DSolidBuilding(lx + 30, cy - 46, 36, 82, 56, "#991b1b", "#7f1d1d", "#78716c", "#57534e", env, { roofType: "flat", noAwning: true, noRoofProps: true });

      for (let ci = 0; ci < 6; ci++) {
        const pyCol = (cy - 48) + ci * 18;
        const pBot = isoPt(lx + 72, pyCol, 18);
        const pTop = isoPt(lx + 72, pyCol, 43);
        ctx.strokeStyle = "#44403c";
        ctx.lineWidth = 3.2;
        ctx.beginPath(); ctx.moveTo(pBot.x, pBot.y); ctx.lineTo(pTop.x, pTop.y); ctx.stroke();
      }

      const pFlagBase = isoPt(lx + 102, cy, 0);
      const pFlagTop = isoPt(lx + 102, cy, 58);
      ctx.strokeStyle = "#f8fafc";
      ctx.lineWidth = 2.6;
      ctx.beginPath(); ctx.moveTo(pFlagBase.x, pFlagBase.y); ctx.lineTo(pFlagTop.x, pFlagTop.y); ctx.stroke();
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(pFlagTop.x, pFlagTop.y - 2, 18, 12);
      ctx.fillStyle = "#fde047";
      ctx.beginPath(); ctx.arc(pFlagTop.x + 9, pFlagTop.y + 4, 2.5, 0, Math.PI * 2); ctx.fill();

      const pPillar = isoPt(lx + 47, ly + lh - 51, 0);
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(pPillar.x, pPillar.y); ctx.lineTo(pPillar.x, pPillar.y - 16); ctx.stroke();
      drawIso3DSolidBuilding(lx + 35, ly + lh - 63, 24, 24, 28, "#fef3c7", "#d97706", "#b91c1c", "#7f1d1d", env, { roofType: "gable_ew", roofH: 11, noAwning: true });

      [[lx + 18, ly + 24, 1.1, 1], [lx + lw - 18, ly + 28, 1.1, 2], [lx + lw - 18, ly + lh - 28, 1.1, 3]].forEach(([tx, ty, sc, vr]) => drawIso3DTree(tx, ty, sc, vr));
      drawDistrictWonder3DFloatingBanner(
        cx, cy, 78,
        L("🏛️ Q2. THIÊN ĐÌNH • QUẢNG TRƯỜNG & CUNG ĐIỆN", "🏛️ D2. CELESTIA • CAPITOL SQUARE & HALL"),
        L("Đài Liên Hoa • Hoàng Thành • Khu Ngoại Giao Đoàn", "One-Pillar Lotus Pavilion • Citadel • Embassy Quarter"),
        "#facc15"
      );
      return;

    } else if (dIdx === 2) {
      // =========================================================================
      // Q3. TÂY HỒ (dIdx = 2): ĐẠI HỒ TÂY • BẢO THÁP CHÙA TRẤN QUỐC 11 TẦNG & ĐẦM SEN QUẢNG AN
      // =========================================================================
      drawIso3DSolidBuilding(cx - 48, ly + 76, 48, 32, 24, "#fde047", "#eab308", "#b91c1c", "#7f1d1d", env, { roofType: "gable_ew", roofH: 13, noAwning: true });
      for (let tier = 0; tier < 5; tier++) {
        const sz = 24 - tier * 3.2;
        const zTop = 18 + tier * 16;
        drawIso3DSolidBuilding(cx + 4 - sz / 2, ly + 92 - sz / 2, sz, sz, zTop, "#dc2626", "#991b1b", "#fde047", "#ca8a04", env, { roofType: "flat", noAwning: true, noRoofProps: true });
      }
      const pSpire = isoPt(cx + 4, ly + 92, 92);
      ctx.strokeStyle = "#fde047";
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(pSpire.x, pSpire.y); ctx.lineTo(pSpire.x, pSpire.y - 18); ctx.stroke();

      drawIso3DSolidBuilding(cx - 75, cy - 10, 38, 18, 14, "#ffffff", "#cbd5e1", "#0284c7", "#0369a1", env, { roofType: "flat", isSimpleBox: true, noShadow: true });
      drawIso3DSolidBuilding(cx + 48, cy + 68, 34, 16, 14, "#fef08a", "#d97706", "#dc2626", "#991b1b", env, { roofType: "flat", isSimpleBox: true, noShadow: true });

      [-95, -45, 10, 65, 110].forEach((ox, i) => drawIso3DTree(cx + ox, cy + 36, 1.05, i % 3));
      drawDistrictWonder3DFloatingBanner(
        cx, cy, 106,
        L("🌊 Q3. BÍCH HỒ • ĐẠI BÍCH HỒ & THÁP LIÊN HOA", "🌊 D3. AZURE LAKE • GRAND LAKE & LOTUS STUPA"),
        L("Bảo Tháp 11 Tầng • Đường Cổ Ngư • Đầm Sen Ngọc Bích", "11-Story Lotus Stupa • Causeway • Jade Lotus Lagoon"),
        "#38bdf8"
      );
      return;

    } else if (dIdx === 3) {
      // =========================================================================
      // Q4. ĐỐNG ĐA (dIdx = 3): VĂN MIẾU QUỐC TỬ GIÁM • KHUÊ VĂN CÁC & VƯỜN BIA TIẾN SĨ 3D
      // =========================================================================
      drawIso3DSolidBuilding(cx - 28, ly + lh - 46, 56, 22, 28, "#fef3c7", "#d97706", "#b91c1c", "#7f1d1d", env, { roofType: "gable_ew", roofH: 12, noAwning: true });

      drawIso3DSolidBuilding(cx - 22, cy + 28, 44, 30, 18, "#f5f5f4", "#a8a29e", "#991b1b", "#7f1d1d", env, { roofType: "flat", noAwning: true, noRoofProps: true });
      drawIso3DSolidBuilding(cx - 18, cy + 31, 36, 24, 38, "#dc2626", "#991b1b", "#b45309", "#78350f", env, { roofType: "gable_ew", roofH: 14, noAwning: true });
      const pSunWin = isoPt(cx, cy + 55, 29);
      ctx.fillStyle = "#fde047";
      ctx.strokeStyle = "#7f1d1d";
      ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.arc(pSunWin.x, pSunWin.y, 6.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

      drawIso3DSolidBuilding(cx - 96, cy - 28, 32, 62, 22, "#fef3c7", "#d97706", "#9a3412", "#7c2d12", env, { roofType: "gable_ns", roofH: 10, noAwning: true });
      drawIso3DSolidBuilding(cx + 64, cy - 28, 32, 62, 22, "#fef3c7", "#d97706", "#9a3412", "#7c2d12", env, { roofType: "gable_ns", roofH: 10, noAwning: true });

      drawIso3DSolidBuilding(cx - 52, ly + 22, 104, 42, 34, "#fef08a", "#ca8a04", "#b91c1c", "#7f1d1d", env, { roofType: "gable_ew", roofH: 16, noAwning: true });

      [[lx + 24, ly + 32, 1.15, 1], [lx + lw - 24, ly + 32, 1.15, 2], [lx + 24, ly + lh - 32, 1.1, 0], [lx + lw - 24, ly + lh - 32, 1.1, 3]].forEach(([tx, ty, sc, vr]) => drawIso3DTree(tx, ty, sc, vr));
      drawDistrictWonder3DFloatingBanner(
        cx, cy, 68,
        L("🎓 Q4. VĂN HIẾN • HỌC VIỆN CỔ ĐIỂN & KHUÊ TINH CÁC", "🎓 D4. ACADEMICA • CLASSICAL ACADEMY & PAVILION"),
        L("Khuê Tinh Các 8 Mái • Vườn Bia Tri Thức • Hồ Thiên Quang", "8-Roof Starlight Pavilion • Scholars Steles • Wisdom Well"),
        "#fb7185"
      );
      return;

    } else if (dIdx === 4) {
      // =========================================================================
      // Q5. CẦU GIẤY CBD (dIdx = 4): SIÊU THÁP ĐÔI CÔNG NGHỆ CẦU GIẤY & QUẢNG TRƯỜNG IT
      // =========================================================================
      drawIso3DSolidBuilding(cx - 88, cy - 58, 176, 116, 26, "#e2e8f0", "#94a3b8", "#0f172a", "#1e293b", env, { roofType: "flat", forceAwning: true, awningColor: "#0284c7", noRoofProps: true });
      drawIsoGlassSkyscraper3D(cx - 78, cy - 44, 62, 86, 128, "#38bdf8", "#0284c7", "#0f172a", env);
      drawIsoGlassSkyscraper3D(cx - 18, cy - 28, 36, 52, 88,  "#7dd3fc", "#0369a1", "#38bdf8", env);
      drawIsoGlassSkyscraper3D(cx + 16, cy - 44, 62, 86, 122, "#2dd4bf", "#0d9488", "#0f172a", env);

      [[cx - 47, cy - 1, 128], [cx + 47, cy - 1, 122]].forEach(([hx, hy, hz]) => {
        const pH = isoPt(hx, hy, hz);
        ctx.fillStyle = "#1e293b";
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(pH.x, pH.y, 15, 9, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#fde047";
        ctx.font = "900 9px sans-serif";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("H", pH.x, pH.y);
      });
      drawDistrictWonder3DFloatingBanner(
        cx, cy, 146,
        L("🏙️ Q5. SILICON CBD • SIÊU THÁP ĐÔI CÔNG NGHỆ AI", "🏙️ D5. SILICON CBD • TWIN AI TECH TOWERS"),
        L("Thung Lũng Sáng Tạo • Cầu Kính Skybridge • Helipad H", "Innovation Tech Valley • Glass Skybridge • Helipad H"),
        "#38bdf8"
      );
      return;

    } else if (dIdx === 5) {
      // =========================================================================
      // Q6. NAM TỪ LIÊM - MỸ ĐÌNH (dIdx = 5): SÂN VẬN ĐỘNG QUỐC GIA MỸ ĐÌNH 3D & ĐƯỜNG ĐUA F1
      // =========================================================================
      drawIso3DSolidBuilding(cx - 118, cy - 72, 34, 144, 38, "#e2e8f0", "#94a3b8", "#f8fafc", "#cbd5e1", env, { roofType: "gable_ns", roofH: 14, noAwning: true });
      drawIso3DSolidBuilding(cx + 84,  cy - 72, 34, 144, 38, "#e2e8f0", "#94a3b8", "#f8fafc", "#cbd5e1", env, { roofType: "gable_ns", roofH: 14, noAwning: true });
      drawIso3DSolidBuilding(cx - 78, cy - 92, 156, 22, 22, "#cbd5e1", "#64748b", "#38bdf8", "#0284c7", env, { roofType: "flat", noAwning: true, noRoofProps: true });
      drawIso3DSolidBuilding(cx - 78, cy + 70, 156, 22, 22, "#cbd5e1", "#64748b", "#38bdf8", "#0284c7", env, { roofType: "flat", noAwning: true, noRoofProps: true });

      [-101, 101].forEach(ox => {
        const pN = isoPt(cx + ox, cy - 72, 42);
        const pM = isoPt(cx + ox, cy, 68);
        const pS = isoPt(cx + ox, cy + 72, 42);
        ctx.strokeStyle = "#f8fafc";
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.moveTo(pN.x, pN.y);
        ctx.quadraticCurveTo(pM.x, pM.y, pS.x, pS.y);
        ctx.stroke();
      });

      [[-112, -88], [112, -88], [-112, 88], [112, 88]].forEach(([dx, dy]) => {
        const pB = isoPt(cx + dx, cy + dy, 0);
        const pT = isoPt(cx + dx, cy + dy, 78);
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 2.8;
        ctx.beginPath(); ctx.moveTo(pB.x, pB.y); ctx.lineTo(pT.x, pT.y); ctx.stroke();
        ctx.fillStyle = "#fef08a";
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 1.2;
        ctx.fillRect(pT.x - 7, pT.y - 5, 14, 7);
        ctx.strokeRect(pT.x - 7, pT.y - 5, 14, 7);
      });
      drawDistrictWonder3DFloatingBanner(
        cx, cy, 94,
        L("🏟️ Q6. OLYMPUS • SÂN VẬN ĐỘNG QUỐC TẾ 3D", "🏟️ D6. OLYMPUS • INTERNATIONAL STADIUM 3D"),
        L("40.000 Chỗ Ngồi • Đường Đua F1 Apex • Tháp Aera 72", "40,000 Seats • Apex F1 Circuit • Aera Landmark 72"),
        "#22c55e"
      );
      return;

    } else if (dIdx === 6) {
      // =========================================================================
      // Q7. THANH XUÂN (dIdx = 6): KHẢI HOÀN MÔN HOÀNG GIA PLAZA & TƯỢNG ĐÀI TỨ MÃ CHÂU ÂU
      // =========================================================================
      drawIso3DSolidBuilding(cx - 106, ly + 22, 68, 52, 74, "#fef9c3", "#eab308", "#334155", "#1e293b", env, { roofType: "mansard", roofH: 14, noAwning: true });
      drawIso3DSolidBuilding(cx + 38,  ly + 22, 68, 52, 74, "#fef9c3", "#eab308", "#334155", "#1e293b", env, { roofType: "mansard", roofH: 14, noAwning: true });

      drawIso3DSolidBuilding(cx - 48, cy + 32, 96, 28, 48, "#fffbeb", "#fde047", "#f59e0b", "#d97706", env, { roofType: "flat", noAwning: true, noRoofProps: true });
      const pArch = isoPt(cx, cy + 60, 0);
      ctx.fillStyle = "#0f172a";
      ctx.strokeStyle = "#fde047";
      ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.arc(pArch.x, pArch.y - 2, 14, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();

      const pQuad = isoPt(cx, cy + 46, 52);
      ctx.fillStyle = "#facc15";
      ctx.strokeStyle = "#92400e";
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.ellipse(pQuad.x, pQuad.y, 16, 7, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      [-10, -3, 4, 11].forEach(ox => {
        ctx.beginPath(); ctx.arc(pQuad.x + ox, pQuad.y - 6, 3.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      });
      drawDistrictWonder3DFloatingBanner(
        cx, cy, 98,
        L("🏢 Q7. TÂN CỔ ĐIỂN • KHẢI HOÀN MÔN IMPERIA PLAZA", "🏢 D7. IMPERIA • IMPERIAL ARCH MEGA-PLAZA"),
        L("Quảng Trường Châu Âu • Tượng Tứ Mã Vàng • Vành Đai 3", "European Marble Square • Golden Quadriga • Ring Road 3"),
        "#fde047"
      );
      return;

    } else if (dIdx === 7) {
      // =========================================================================
      // Q8. HAI BÀ TRƯNG (dIdx = 7): CÔNG VIÊN THỐNG NHẤT • HỒ BẢY MẪU & CỔNG PARABOL BÁCH KHOA
      // =========================================================================
      drawIso3DSolidBuilding(cx - 24, cy - 36, 48, 30, 26, "#fef3c7", "#fde68a", "#16a34a", "#15803d", env, { roofType: "gable_ew", roofH: 13, noAwning: true });

      const pLeft = isoPt(cx - 52, ly + lh - 26, 0);
      const pRight = isoPt(cx + 52, ly + lh - 26, 0);
      const pApex = isoPt(cx, ly + lh - 26, 64);
      ctx.strokeStyle = "#dc2626";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(pLeft.x, pLeft.y);
      ctx.quadraticCurveTo(pApex.x, pApex.y - 34, pRight.x, pRight.y);
      ctx.stroke();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(pLeft.x + 3, pLeft.y);
      ctx.quadraticCurveTo(pApex.x, pApex.y - 30, pRight.x - 3, pRight.y);
      ctx.stroke();

      [[lx + 24, ly + 36, 1.15, 1], [lx + lw - 24, ly + 36, 1.15, 2], [lx + 24, cy + 20, 1.1, 0], [lx + lw - 24, cy + 20, 1.1, 3]].forEach(([tx, ty, sc, vr]) => drawIso3DTree(tx, ty, sc, vr));
      drawDistrictWonder3DFloatingBanner(
        cx, cy, 82,
        L("🌳 Q8. ĐẠI CÔNG VIÊN • HỒ LỤC THỦY & ĐH BÁCH KHOA", "🌳 D8. CENTRAL PARK • EMERALD LAKE & POLYTECHNIC"),
        L("Đại Công Viên Trung Tâm • Cổng Parabol • V-Plaza Thái Dương", "Grand Central Park • Parabolic Arch • V-Plaza Twin Towers"),
        "#34d399"
      );
      return;

    } else if (dIdx === 8) {
      // =========================================================================
      // Q9. LONG BIÊN (dIdx = 8): ĐẠI SIÊU THỊ SAKURA MALL & KHU BIỆT THỰ KÊNH ĐÀO LỤC BẢO
      // =========================================================================
      drawIso3DSolidBuilding(cx - 104, ly + 22, 208, 76, 38, "#fdf2f8", "#fbcfe8", "#db2777", "#be185d", env, { roofType: "flat", forceAwning: true, awningColor: "#ec4899", noRoofProps: true });
      drawIso3DSolidBuilding(cx - 48,  ly + 32, 96,  52, 54, "#ffffff", "#f1f5f9", "#ec4899", "#be185d", env, { roofType: "mansard", roofH: 12, noAwning: true });

      drawIso3DSolidBuilding(lx + 26, cy + 28, 46, 38, 30, "#ffffff", "#e2e8f0", "#0284c7", "#0369a1", env, { roofType: "mansard", roofH: 12, noAwning: true });
      drawIso3DSolidBuilding(lx + lw - 72, cy + 28, 46, 38, 30, "#ffffff", "#e2e8f0", "#0284c7", "#0369a1", env, { roofType: "mansard", roofH: 12, noAwning: true });
      drawDistrictWonder3DFloatingBanner(
        cx, cy, 82,
        L("🌉 Q9. ĐÔNG GIANG • SAKURA MALL & KÊNH ĐÀO LỤC BẢO", "🌉 D9. EASTBANK • SAKURA MEGA MALL & EMERALD CANAL"),
        L("Cầu Giàn Thép Lịch Sử • Biệt Thự Kênh Đào Sinh Thái", "Historic Cantilever Bridge • Emerald Canal Eco-Villas"),
        "#f472b6"
      );
      return;

    } else if (dIdx === 9) {
      // =========================================================================
      // Q10. HÀ ĐÔNG (dIdx = 9): GA TÀU ĐIỆN TRÊN CAO CÁT LINH - HÀ ĐÔNG & LÀNG LỤA VẠN PHÚC
      // =========================================================================
      drawIso3DSolidBuilding(lx + 10, cy - 16, lw - 20, 32, 26, "#cbd5e1", "#94a3b8", "#64748b", "#475569", env, { roofType: "flat", noAwning: true, noRoofProps: true });
      drawIso3DSolidBuilding(cx - 64, cy - 26, 128, 52, 48, "#dcfce7", "#86efac", "#10b981", "#047857", env, { roofType: "gable_ew", roofH: 14, noAwning: true });
      drawIso3DSolidBuilding(lx + 22, cy - 10, 44, 18, 38, "#10b981", "#047857", "#f8fafc", "#cbd5e1", env, { roofType: "flat", isSimpleBox: true, noShadow: true });
      drawIso3DSolidBuilding(lx + lw - 66, cy - 10, 44, 18, 38, "#10b981", "#047857", "#f8fafc", "#cbd5e1", env, { roofType: "flat", isSimpleBox: true, noShadow: true });

      drawIso3DSolidBuilding(cx - 28, ly + lh - 46, 56, 24, 32, "#fde68a", "#d97706", "#b91c1c", "#7f1d1d", env, { roofType: "gable_ew", roofH: 13, noAwning: true });
      drawDistrictWonder3DFloatingBanner(
        cx, cy, 84,
        L("🚇 Q10. METRO LỤA • TÀU SKYTRAIN & LÀNG LỤA CỔ", "🚇 D10. METRO SILK • SKYTRAIN & ARTISAN SILK VILLAGE"),
        L("Tuyến Tàu Điện Trên Cao • Phố Ô Lụa Cổ Truyền 1.000 Năm", "Elevated SkyTrain Line • 1,000-Year Artisan Silk Street"),
        "#34d399"
      );
      return;

    } else if (dIdx === 10) {
      // =========================================================================
      // Q11. ĐÔNG ANH SMART CITY (dIdx = 10): SIÊU THÁP TÀI CHÍNH PHƯƠNG TRẠCH 108 TẦNG & THÀNH CỔ LOA
      // =========================================================================
      drawIsoGlassSkyscraper3D(cx - 56, cy - 56, 112, 112, 54,  "#38bdf8", "#0284c7", "#0f172a", env);
      drawIsoGlassSkyscraper3D(cx - 42, cy - 42, 84,  84,  102, "#7dd3fc", "#0369a1", "#0f172a", env);
      drawIsoGlassSkyscraper3D(cx - 28, cy - 28, 56,  56,  148, "#e0f2fe", "#0284c7", "#fde047", env);

      const pTop108 = isoPt(cx, cy, 148);
      ctx.strokeStyle = "#fde047";
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(pTop108.x, pTop108.y); ctx.lineTo(pTop108.x, pTop108.y - 26); ctx.stroke();
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath(); ctx.arc(pTop108.x, pTop108.y - 26, 4, 0, Math.PI * 2); ctx.fill();

      drawIso3DSolidBuilding(cx - 26, ly + lh - 46, 52, 26, 26, "#fef3c7", "#d97706", "#b91c1c", "#7f1d1d", env, { roofType: "gable_ew", roofH: 12, noAwning: true });
      drawDistrictWonder3DFloatingBanner(
        cx, cy, 178,
        L("🚀 Q11. BẮC NGÂN HÀ • THÁP SOLARIS 108 TẦNG & THÀNH CỔ", "🚀 D11. NORTH GALAXY • 108F SOLARIS TOWER & CITADEL"),
        L("Siêu Đô Thị Thông Minh Bắc Sông Ngân Hà • Cầu Dây Văng", "North Silverstar Smart Megacity • 5-Pylon Cable Bridge"),
        "#38bdf8"
      );
      return;

    } else if (dIdx === 11) {
      // =========================================================================
      // Q12. GIA LÂM OCEAN (dIdx = 11): BIỂN HỒ NƯỚC MẶN CÁT TRẮNG VỊNH NGỌC TRAI & LÒ GỐM BÁT TRÀNG
      // =========================================================================
      drawIso3DSolidBuilding(cx - 24, cy - 16, 48, 32, 26, "#ffffff", "#e2e8f0", "#06b6d4", "#0891b2", env, { roofType: "mansard", roofH: 12, noAwning: true });
      drawIso3DSolidBuilding(cx - 82, cy - 54, 34, 16, 12, "#ffffff", "#cbd5e1", "#38bdf8", "#0284c7", env, { roofType: "flat", isSimpleBox: true, noShadow: true });
      drawIso3DSolidBuilding(cx + 52, cy + 44, 34, 16, 12, "#ffffff", "#cbd5e1", "#f43f5e", "#e11d48", env, { roofType: "flat", isSimpleBox: true, noShadow: true });

      drawIso3DSolidBuilding(cx - 32, ly + lh - 44, 64, 26, 24, "#ea580c", "#9a3412", "#7c2d12", "#431407", env, { roofType: "gable_ew", roofH: 12, noAwning: true });

      [[lx + 22, ly + 26, 1.15, 1], [lx + lw - 22, ly + 26, 1.15, 2], [lx + 22, ly + lh - 26, 1.15, 0], [lx + lw - 22, ly + lh - 26, 1.15, 3], [cx - 32, cy, 1.0, 1], [cx + 32, cy, 1.0, 2]].forEach(([tx, ty, sc, vr]) => drawIso3DTree(tx, ty, sc, vr));
      drawDistrictWonder3DFloatingBanner(
        cx, cy, 74,
        L("🌴 Q12. VỊNH NGỌC TRAI • BIỂN HỒ CÁT TRẮNG & LÀNG GỐM", "🌴 D12. PEARL LAGOON • SALTWATER LAGOON & KILNS"),
        L("Biển Hồ Nước Mặn Nhân Tạo • Bến Du Thuyền • Làng Gốm Sứ", "White-Sand Saltwater Lagoon • Yacht Marina • Ceramic Kilns"),
        "#2dd4bf"
      );
      return;
    }
  }

  // Quảng trường Đài Phun Nước Đá Cẩm Thạch 3 Tầng Phun Nước cho 6 công viên vệ tinh
  if (pk.hasFountain) {
    const fx = pk.hasLake ? (lx + lw - 50) : cx;
    const fy = cy;
    const pf = isoPt(fx, fy, 0);

    ctx.fillStyle = "#f1f5f9";
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(pf.x, pf.y, 30, 17.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#0ea5e9";
    ctx.beginPath();
    ctx.ellipse(pf.x, pf.y - 2, 24, 13.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.ellipse(pf.x, pf.y - 8, 14, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.ellipse(pf.x, pf.y - 9.5, 10.5, 5.8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(pf.x, pf.y - 16, 5.5, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "#e0f2fe";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(pf.x, pf.y - 17);
    ctx.lineTo(pf.x, pf.y - 30);
    [-10, -5, 5, 10].forEach(dx => {
      ctx.moveTo(pf.x, pf.y - 28);
      ctx.quadraticCurveTo(pf.x + dx * 0.6, pf.y - 31, pf.x + dx, pf.y - 14);
    });
    ctx.stroke();
  }

  if (pk.hasLake) {
    drawIso3DSolidBuilding(lx + lw - 68, ly + 44, 28, 24, 18, "#fef3c7", "#fde68a", "#c2410c", "#9a3412", env, { roofType: "gable_ew", roofH: 10, noAwning: true });
  }

  const treeOffsets = [
    [24, 28, 1.15, 1], [68, 22, 1.0, 0], [124, 22, 1.1, 3], [188, 24, 1.05, 2], [256, 28, 1.15, 1],
    [20, 95, 1.05, 0], [20, 165, 1.1, 3], [278, 95, 1.08, 1], [276, 185, 1.0, 2], [24, 225, 1.12, 1],
    [52, 264, 1.1, 3], [118, 268, 1.0, 0], [186, 266, 1.15, 1], [248, 262, 1.05, 2]
  ];
  treeOffsets.forEach(([ox, oy, sc, vr]) => {
    drawIso3DTree(lx + ox, ly + oy, sc, vr);
  });
  drawIso3DStreetLamp(cx - 28, cy - 22, env);
  drawIso3DStreetLamp(cx + 28, cy + 22, env);
}


// Đăng ký vào globalThis để tương thích ngược với HTML event handlers & các module liên kết
Object.assign(globalThis, {
  drawIso3DTree,
  drawIso3DStreetLamp,
  drawLushGrassBlocksAndTrees,
  drawRedRiverAndBridges,
  drawRedRiverBridge3DSpan,
  drawHanoiTrain3DOnTrack,
  drawRailwayTrack,
  drawAllScenicParksGround,
  drawDistrictWonder3DFloatingBanner,
  drawScenicPark3DStructures
});
