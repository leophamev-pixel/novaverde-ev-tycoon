/**
 * src/render/draw-station.js
 * Vẽ Trạm Sạc Người Chơi (đã tách thành 5 hàm con rõ ràng) & Trạm Đối Thủ AI
 */
export function drawRivalStationLot25D(rv, env) {
  const w = 136, h = 84;
  const pulse = 0.5 + 0.5 * Math.sin(performance.now() * 0.0035);
  const x = rv.x - w / 2;
  const y = rv.y - h / 2;

  const bNW = isoPt(x, y, 0);
  const bNE = isoPt(x + w, y, 0);
  const bSE = isoPt(x + w, y + h, 0);
  const bSW = isoPt(x, y + h, 0);

  // 1. Đế bê tông vát cạnh 3D + Mặt sân nhựa đường đỏ sẫm của Trạm Đối Thủ
  const dNW = isoPt(x, y, -3.5), dSW = isoPt(x, y + h, -3.5), dSE = isoPt(x + w, y + h, -3.5);
  fillStrokePoly([bNW, bSW, dSW, dNW], "#9f1239", "#1e293b", 1.1);
  fillStrokePoly([bSW, bSE, dSE, dSW], "#881337", "#1e293b", 1.1);
  fillStrokePoly([bNW, bNE, bSE, bSW], "#2d1a22", "#fb7185", 2.2);

  // 2. Bốt điều hành đối thủ & 3 Ô đỗ xe kẻ vạch đỏ + 3 Trụ Sạc DC Đối Thủ chi tiết cao
  drawIso3DSolidBuilding(x + w - 24, y + h - 22, 16, 14, 18, "#fecdd3", "#fb7185", "#be123c", "#881337", env, { roofType: "flat", isSimpleBox: true, noShadow: true });

  for (let i = 0; i < 3; i++) {
    const bx = rv.x - 36 + i * 34;
    const by = rv.y + 8;
    const p0 = isoPt(bx - 10, by - 13, 0), p1 = isoPt(bx + 10, by - 13, 0);
    const p2 = isoPt(bx + 10, by + 13, 0), p3 = isoPt(bx - 10, by + 13, 0);
    fillStrokePoly([p0, p1, p2, p3], "#1e293b", "#f43f5e", 1.3);

    const hasCar = (i === 0 || i === 1);
    drawHighDetail3DCharger(bx, by - 19, 3, hasCar, true, env);
    if (hasCar) {
      drawEV25DRotated(bx, by + 2, -Math.PI / 2, i === 0 ? "#14b8a6" : "#f43f5e", "#f8fafc", i === 0, false, false, env);
    }
  }

  // 3. Mái che Solar Canopy Đỏ San Hô của Trạm Đối Thủ
  const canX = x + 12, canY = y + 8, canW = w - 34, canH = 32, canZ = 30;
  [[canX + 6, canY + canH / 2], [canX + canW - 6, canY + canH / 2]].forEach(([px, py]) => {
    const pb = isoPt(px, py, 0), pt = isoPt(px, py, canZ);
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(pb.x, pb.y); ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
  });
  const cNW = isoPt(canX, canY, canZ + 3), cNE = isoPt(canX + canW, canY, canZ + 3);
  const cSE = isoPt(canX + canW, canY + canH, canZ), cSW = isoPt(canX, canY + canH, canZ);
  fillStrokePoly([cNW, cNE, cSE, cSW], "rgba(159, 18, 57, 0.85)", "#fda4af", 2.0);

  // 4. Bốn bức tường hào quang Đỏ San Hô dựng đứng 3D quanh trạm đối thủ
  drawIso3DGlowingCurtainWalls(rv.x, rv.y, w, h, 24, "244, 63, 94", "#fb7185", pulse);

  // 5. Thẻ Callout nổi "RIVAL STATION"
  const rvDisp = isEn() ? (rv.nameEn || rv.name) : rv.name;
  const shortRv = rvDisp.split("(")[0].trim().toUpperCase();
  drawUprightStationCalloutCard(rv.x, rv.y, 48, shortRv, "⚔️", "#f43f5e", "#e11d48", 0.58, false);
}

// VẼ 150 LÔ ĐẤT CỦA NGƯỜI CHƠI VỚI ĐỘ CHI TIẾT CAO NHẤT THEO ĐÚNG ASSET SHEET 1 & ASSET SHEET 2:
// - CHƯA MỞ (!lot.owned): Đế bê tông 3D vát cạnh màu xám sáng trung tính + Viền nét đứt mảnh + 4 cọc tiêu góc + Lối dẫn + Biểu tượng quy hoạch EV
// - ĐÃ MỞ (lot.owned): Sân trạm 3D + 4 cấp Trụ sạc chi tiết + 6 Tiện ích 3 cấp độ có mô hình 3D trên mái + Mái Solar Canopy 3D + Tường hào quang xanh

// ============================================================================
// TÁCH HÀM VẼ TRẠM SẠC 480 DÒNG THÀNH 5 HÀM CON ĐỘC LẬP (BƯỚC 1.5 BÁO CÁO)
// ============================================================================

// Hàm con 1/5: Vẽ Lô đất chưa mở khóa ("BUY PLOT" / Đấu giá / Lô người chơi khác)
export function drawUnownedPlot25D(lot, env, x, y, w, h, bNW, bNE, bSE, bSW, isSelected, pulse) {
    // 1. Thành đế bê tông 3D dày 3.5px tạo khối nổi rõ ràng trên mặt đất
    const dNW = isoPt(x, y, -3.5);
    const dSW = isoPt(x, y + h, -3.5);
    const dSE = isoPt(x + w, y + h, -3.5);
    fillStrokePoly([bNW, bSW, dSW, dNW], isSelected ? "#f59e0b" : "#94a3b8", "#334155", 1.0);
    fillStrokePoly([bSW, bSE, dSE, dSW], isSelected ? "#d97706" : "#64748b", "#334155", 1.0);

    // 2. Mặt nền ô quy hoạch màu xám sáng trung tính (#D8DEE6 / #E2E8F0) đúng chuẩn yêu cầu
    fillStrokePoly(
      [bNW, bNE, bSE, bSW],
      isSelected ? "rgba(254, 243, 199, 0.96)" : "rgba(216, 222, 230, 0.95)",
      isSelected ? "#f59e0b" : "#475569",
      isSelected ? 2.5 : 1.6
    );

    // 3. Đường viền nét đứt mảnh bên trong (Inner Dashed Line)
    const ins = 6.5;
    const iNW = isoPt(x + ins, y + ins, 0);
    const iNE = isoPt(x + w - ins, y + ins, 0);
    const iSE = isoPt(x + w - ins, y + h - ins, 0);
    const iSW = isoPt(x + ins, y + h - ins, 0);
    ctx.save();
    ctx.setLineDash([5, 3.5]);
    fillStrokePoly([iNW, iNE, iSE, iSW], null, isSelected ? "#b45309" : "#475569", 1.35);
    ctx.restore();

    // 4. Lưới chia ô quy hoạch & 4 Cọc tiêu mốc giới Vàng-Đen ở 4 góc lô đất (AST_PAD_01 — Asset Sheet 1!)
    const mN = isoPt(lot.x, y + ins, 0), mS = isoPt(lot.x, y + h - ins, 0);
    const mW = isoPt(x + ins, lot.y, 0), mE = isoPt(x + w - ins, lot.y, 0);
    ctx.strokeStyle = "rgba(71, 85, 105, 0.30)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(mN.x, mN.y); ctx.lineTo(mS.x, mS.y);
    ctx.moveTo(mW.x, mW.y); ctx.lineTo(mE.x, mE.y);
    ctx.stroke();

    [[x + 5, y + 5], [x + w - 5, y + 5], [x + w - 5, y + h - 5], [x + 5, y + h - 5]].forEach(([px, py]) => {
      const pb = isoPt(px, py, 0);
      ctx.fillStyle = "#facc15";
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 1;
      ctx.fillRect(pb.x - 1.6, pb.y - 5.5, 3.2, 5.5);
      ctx.strokeRect(pb.x - 1.6, pb.y - 5.5, 3.2, 5.5);
    });

    // 5. Thẻ nổi "BUY PLOT" (Hỗ trợ 3 mức Semantic Zoom LOD & Hiển thị Lô Đang Đấu Giá Sổ Đỏ trên Server Multiplayer!)
    const isAuctionLot = Boolean(window.mpState && window.mpState.activeAuction && window.mpState.activeAuction.lotId === lot.id);
    const mpOwner = (!isAuctionLot && window.mpState && window.mpState.lotOwners && window.mpState.lotOwners[lot.id]) ? window.mpState.lotOwners[lot.id] : null;
    if (isAuctionLot) {
      drawIso3DGlowingCurtainWalls(lot.x, lot.y, w, h, 26, "245, 158, 11", "#fde047", pulse);
    } else if (mpOwner && mpOwner.ownerId !== (window.mpState && window.mpState.playerId)) {
      drawIso3DGlowingCurtainWalls(lot.x, lot.y, w, h, 20, "56, 189, 248", "#38bdf8", pulse);
    }

    const lod = getSemanticZoomLOD();
    const pCard = isoPt(lot.x, lot.y, isAuctionLot ? 24 : 13);
    const isCompactZoom = lod === 1 && !isSelected && !isAuctionLot;
    const bw = isAuctionLot ? 98 : (isSelected ? 94 : (isCompactZoom ? 34 : 64));
    const bh = isAuctionLot ? 26 : (isSelected ? 28 : (isCompactZoom ? 14 : 20));
    ctx.fillStyle = isAuctionLot ? "#fef08a" : (isSelected ? "#fef3c7" : (mpOwner ? "#e0f2fe" : "rgba(248, 250, 252, 0.94)"));
    ctx.strokeStyle = isAuctionLot ? "#b45309" : (isSelected ? "#d97706" : (mpOwner ? "#0284c7" : "#475569"));
    ctx.lineWidth = (isSelected || isAuctionLot) ? 1.9 : 1.25;
    ctx.beginPath();
    ctx.roundRect(pCard.x - bw / 2, pCard.y - bh / 2, bw, bh, 5);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isAuctionLot ? "#78350f" : (isSelected ? "#92400e" : "#1e293b");
    ctx.font = isCompactZoom ? "900 6.8px sans-serif" : "900 7.8px sans-serif";
    ctx.textAlign = "center";
    if (isAuctionLot) {
      ctx.fillText(L(`🔨 ĐẤU GIÁ #${lot.id}`, `🔨 AUCTION #${lot.id}`), pCard.x, pCard.y - 2);
      ctx.font = "800 6.8px sans-serif";
      ctx.fillText(`${formatCompactVND(window.mpState.activeAuction.currentBid)}`, pCard.x, pCard.y + 7);
    } else if (mpOwner && mpOwner.ownerId !== (window.mpState && window.mpState.playerId)) {
      ctx.fillText(isCompactZoom ? `🌐#${lot.id}` : `🌐 ${mpOwner.ownerName.slice(0, 8)}`, pCard.x, pCard.y + 2.5);
    } else {
      ctx.fillText(isCompactZoom ? `#${lot.id}` : L(`➕ LÔ #${lot.id}`, `➕ LOT #${lot.id}`), pCard.x, pCard.y - (isSelected ? 2 : -2.5));
      if (isSelected) {
        ctx.font = "800 7px sans-serif";
        ctx.fillText(L(`Thuê ${formatCompactVND(lot.leaseCostInitial)}`, `Lease ${formatCompactVND(lot.leaseCostInitial)}`), pCard.x, pCard.y + 8);
      }
    }
    return;
}

// Hàm con 2/5: Vẽ Đế bê tông 3D, Mặt sân trạm sạc, Khách đi bộ (LOD 3), Cổng Barie & Bốt Bảo vệ
export function drawStationPadAndGates25D(lot, env, x, y, w, h, bNW, bNE, bSE, bSW, isSelected, pulse) {
  // 1. Thành đế bê tông 3D + Mặt sân nhựa đường đen-xanh lục bảo + Bồn cây cảnh góc trạm
  const dNW = isoPt(x, y, -4), dSW = isoPt(x, y + h, -4), dSE = isoPt(x + w, y + h, -4);
  fillStrokePoly([bNW, bSW, dSW, dNW], "#059669", "#0f172a", 1.2);
  fillStrokePoly([bSW, bSE, dSE, dSW], "#047857", "#0f172a", 1.2);
  fillStrokePoly([bNW, bNE, bSE, bSW], "#1e293b", "#34d399", 2.4);

  // Vỉa hè bê tông nội khu bao quanh mép trong trạm sạc
  const curbIns = 4;
  const kNW = isoPt(x + curbIns, y + curbIns, 0), kNE = isoPt(x + w - curbIns, y + curbIns, 0);
  const kSE = isoPt(x + w - curbIns, y + h - curbIns, 0), kSW = isoPt(x + curbIns, y + h - curbIns, 0);
  fillStrokePoly([kNW, kNE, kSE, kSW], "#334155", "#64748b", 1.0);

  // LOD 3 (Zoom > 1.05): Vẽ Khách Hàng Đi Bộ 3D trong sân trạm (uống trà đá, vào quán phở/café)
  if (getSemanticZoomLOD() === 3) {
    const tWalk = performance.now() * 0.0018;
    for (let pi = 0; pi < 3; pi++) {
      const wxP = lot.x + Math.sin(tWalk + pi * 2.1 + lot.id) * (w * 0.28);
      const wyP = lot.y + Math.cos(tWalk * 0.8 + pi * 1.7) * (h * 0.22);
      const pPed = isoPt(wxP, wyP, 0);
      ctx.fillStyle = pi === 0 ? "#fde047" : (pi === 1 ? "#38bdf8" : "#f472b6");
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(pPed.x, pPed.y - 6, 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#f8fafc";
      ctx.beginPath();
      ctx.arc(pPed.x, pPed.y - 9.5, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  // 2. Vẽ CỔNG BARIE ĐỎ-TRẮNG IN/OUT (AST_GAT_01..02) & BỐT BẢO VỆ KÍNH 24/7 (AST_GRD_01 — Asset Sheet 1!)
  const gateY = lot.roadY < lot.y ? (y + 4) : (y + h - 8);
  drawIso3DSolidBuilding(lot.inGateX - 4.5, gateY - 3, 8, 6.5, 14, "#f97316", "#ea580c", "#fef08a", "#f59e0b", env, { roofType: "flat", isSimpleBox: true, noShadow: true });
  const pBar0 = isoPt(lot.inGateX + 2, gateY, 10);
  const pBar1 = isoPt(lot.inGateX + 20, gateY, 12);
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(pBar0.x, pBar0.y); ctx.lineTo(pBar1.x, pBar1.y);
  ctx.stroke();
  ctx.strokeStyle = "#ef4444";
  ctx.setLineDash([3.5, 3]);
  ctx.beginPath();
  ctx.moveTo(pBar0.x, pBar0.y); ctx.lineTo(pBar1.x, pBar1.y);
  ctx.stroke();
  ctx.setLineDash([]);

  // Bốt Bảo Vệ 24/7 có ô kính xanh, mái đua & cục nóng điều hòa (AST_GRD_01)
  if (lot.hasGuard) {
    drawIso3DSolidBuilding(x + w - 24, gateY - 9, 18, 15, 20, "#e0f2fe", "#38bdf8", "#0d9488", "#0f766e", env, { roofType: "flat", isSimpleBox: true, noShadow: true });
    const pGrd = isoPt(x + w - 15, gateY - 1, 22);
    ctx.fillStyle = "#fef08a";
    ctx.font = "900 9px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("👮", pGrd.x, pGrd.y);
  }

}

// Hàm con 3/5: Vẽ Tổ hợp 6 Tiện ích 3D (Trà đá, Đổi pin, Café, Phòng nghỉ VIP, Phở bò, Nhà hàng)
export function drawStationAmenities25D(lot, env, x, y, w, h) {
  // 3. Vẽ TỔ HỢP 6 TIỆN ÍCH VIỆT NAM CẤP 1 -> CẤP 3 VỚI MÔ HÌNH 3D NỔI BẬT TRÊN MÁI (AST_AMN_01..18 — Giống hệt Asset Sheet 2!)
  if (lot.amenities) {
    const amPositions = [
      [x + 6, y + h - 26],
      [x + w - 30, y + h - 26],
      [x + 6, y + 6],
      [x + w - 30, y + 6],
      [x + 6, lot.y - 12],
      [x + w - 30, lot.y - 12]
    ];
    let slotIdx = 0;
    AMENITY_CATALOG.forEach(item => {
      const lvl = lot.amenities[item.id] || 0;
      if (lvl <= 0 || slotIdx >= amPositions.length) return;
      const [ax, ay] = amPositions[slotIdx++];
      const aw = 20 + lvl * 2.5;
      const ah = 17 + lvl * 2.5;
      const az = 15 + lvl * 4.5;

      if (item.id === "tra_da") {
        // 🍵 Quầy Trà Đá Vỉa Hè: Kiosk gỗ + Dù che nắng 8 múi xanh-trắng + Phích nước & 4 Ghế nhựa xanh/đỏ
        drawIso3DSolidBuilding(ax, ay, aw, ah, az, "#fef3c7", "#fde68a", "#b45309", "#9a3412", env, { roofType: lvl >= 2 ? "gable_ew" : "flat", roofH: 8, isSimpleBox: true });
        const pUmb = isoPt(ax + aw + 5, ay + ah / 2, 14);
        // 4 Ghế nhựa đỏ/xanh quanh bàn trà đá
        [[-6, 5, "#ef4444"], [6, 5, "#2563eb"], [-4, 9, "#2563eb"], [4, 9, "#ef4444"]].forEach(([sx, sy, scol]) => {
          ctx.fillStyle = scol;
          ctx.fillRect(pUmb.x + sx - 1.8, pUmb.y + sy, 3.6, 3.6);
        });
        // Tán dù che nắng sọc xanh-trắng
        ctx.fillStyle = "#16a34a";
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.ellipse(pUmb.x, pUmb.y, 9.5, 5.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

      } else if (item.id === "doi_pin") {
        // 🔋 Tủ Đổi Pin V-Green (Ma trận 9 ô pin LED sáng xanh/vàng) & Cổng Vòm Rửa Xe Tự Động
        drawIso3DSolidBuilding(ax, ay, 13, 12, 22, "#1e293b", "#0f172a", "#10b981", "#059669", env, { roofType: "flat", isSimpleBox: true });
        const pCab = isoPt(ax + 6.5, ay + 12, 11);
        for (let r = -1; r <= 1; r++) {
          for (let c = -1; c <= 1; c++) {
            ctx.fillStyle = (r + c) % 2 === 0 ? "#4ade80" : "#facc15";
            ctx.fillRect(pCab.x + c * 3 - 1, pCab.y + r * 3 - 1, 2.2, 2.0);
          }
        }
        if (lvl >= 2) {
          drawIso3DSolidBuilding(ax + 14, ay, 14, 14, 20, "#bae6fd", "#0284c7", "#0369a1", "#1e3a8a", env, { roofType: "flat", isSimpleBox: true });
        }

      } else if (item.id === "cafe") {
        // ☕ Café Trứng Phố Cổ: Nhà Pháp tường vàng + Mái hiên sọc đỏ-trắng + Mô hình LY CÀ PHÊ PHIN 3D LỚN BỐC KHÓI trên mái!
        drawIso3DSolidBuilding(ax, ay, aw, ah, az + 4, "#fde047", "#eab308", "#9a3412", "#78350f", env, { roofType: "flat", forceAwning: true, awningColor: "#dc2626", noRoofProps: true });
        const pCup = isoPt(ax + aw / 2, ay + ah / 2, az + 9);
        // Đĩa sứ trắng dưới đáy ly
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#1e293b";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(pCup.x, pCup.y + 4, 9, 4.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Thân ly cà phê + Quai cầm
        ctx.fillStyle = "#fef3c7";
        ctx.beginPath();
        ctx.arc(pCup.x, pCup.y - 1, 6.8, 0, Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(pCup.x + 6.8, pCup.y + 1.5, 2.6, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();
        // Mặt cà phê nâu sóng sánh + Làn khói trắng bốc lên
        ctx.fillStyle = "#78350f";
        ctx.beginPath();
        ctx.ellipse(pCup.x, pCup.y - 1, 6.4, 2.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(pCup.x - 2, pCup.y - 4); ctx.quadraticCurveTo(pCup.x - 4, pCup.y - 8, pCup.x - 1, pCup.y - 12);
        ctx.moveTo(pCup.x + 2, pCup.y - 4); ctx.quadraticCurveTo(pCup.x + 4, pCup.y - 8, pCup.x + 1, pCup.y - 12);
        ctx.stroke();

      } else if (item.id === "phong_nghi") {
        // 🛋️ Phòng Nghỉ Tài Xế Máy Lạnh (VIP AC Lounge): Kính xanh toàn cảnh + 2 Cục nóng Chiller trên mái + Biển Neon VIP
        drawIso3DSolidBuilding(ax, ay, aw, ah, az + 3, "#7dd3fc", "#0284c7", "#cbd5e1", "#94a3b8", env, { roofType: "flat", noRoofProps: true });
        drawIso3DSolidBuilding(ax + 4, ay + 4, 8, 6, az + 8, "#f8fafc", "#cbd5e1", "#64748b", "#475569", env, { roofType: "flat", isSimpleBox: true, noShadow: true });

      } else if (item.id === "nha_an") {
        // 🍜 Nhà Ăn Canteen Phở Bò: Nhà mái ngói đỏ + Đèn lồng đỏ + Mô hình TÔ PHỞ SỨ TRẮNG 3D & ĐÔI ĐŨA GẮP PHỞ trên mái!
        drawIso3DSolidBuilding(ax, ay, aw + 2, ah + 2, az + 4, "#ffedd5", "#fdba74", "#c2410c", "#9a3412", env, { roofType: "gable_ew", roofH: 9 });
        const pBowl = isoPt(ax + (aw + 2) / 2, ay + (ah + 2) / 2, az + 14);
        // Tô sứ trắng lớn
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#1e293b";
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.arc(pBowl.x, pBowl.y, 8, 0, Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Nước dùng phở, thịt bò đỏ & hành lá xanh
        ctx.fillStyle = "#f59e0b";
        ctx.beginPath();
        ctx.ellipse(pBowl.x, pBowl.y - 1, 7.5, 3.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#dc2626";
        ctx.beginPath();
        ctx.arc(pBowl.x - 2.5, pBowl.y - 1, 2.0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#16a34a";
        ctx.beginPath();
        ctx.arc(pBowl.x + 2.5, pBowl.y - 1, 1.8, 0, Math.PI * 2);
        ctx.fill();
        // Đôi đũa đỏ gắp sợi phở trắng vươn cao trên tô phở
        ctx.strokeStyle = "#dc2626";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(pBowl.x, pBowl.y - 3); ctx.lineTo(pBowl.x + 9, pBowl.y - 11);
        ctx.moveTo(pBowl.x + 2, pBowl.y - 2); ctx.lineTo(pBowl.x + 10, pBowl.y - 8);
        ctx.stroke();

      } else if (item.id === "nha_hang") {
        // 🍽️ Nhà Hàng Sân Vườn Bistro: Biệt thự 2 tầng + Giàn gỗ Pergola & Dù trắng sân vườn
        drawIso3DSolidBuilding(ax, ay, aw + 4, ah + 2, az + 6, "#fef9c3", "#fde047", "#b45309", "#9a3412", env, { roofType: "gable_ns", roofH: 10, forceAwning: true, awningColor: "#15803d" });
        drawIso3DTree(ax + aw + 5, ay + ah, 0.72, 1);
      }
    });
  }

}

// Hàm con 4/5: Vẽ Các Ô đỗ xe, Trụ sạc 3D, Xe đang sạc / Xe xăng đỗ lấn & Thanh tiến độ pin
export function drawStationChargingBays25D(lot, env) {
  // 4. Vẽ từng Ô đỗ xe Isometric có Kẻ Vạch Trắng-Xanh, Icon ⚡ dưới sàn & 4 CẤP TRỤ SẠC 3D CHI TIẾT CAO (AST_CHG_01..04 — Asset Sheet 1!)
  lot.bays.forEach((bay, idx) => {
    const pos = getBayWorldPos(lot, idx);
    const p0 = isoPt(pos.x - 10.5, pos.y - 13.5, 0);
    const p1 = isoPt(pos.x + 10.5, pos.y - 13.5, 0);
    const p2 = isoPt(pos.x + 10.5, pos.y + 13.5, 0);
    const p3 = isoPt(pos.x - 10.5, pos.y + 13.5, 0);
    fillStrokePoly([p0, p1, p2, p3], "#0f172a", "#34d399", 1.5);

    // Ký hiệu ⚡ sơn xanh lá giữa ô đỗ xe khi chưa có xe đỗ
    if (!bay.car) {
      const pMark = isoPt(pos.x, pos.y + 2, 0);
      ctx.fillStyle = "rgba(52, 211, 153, 0.65)";
      ctx.font = "900 8px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("⚡", pMark.x, pMark.y);
    }

    // Trụ sạc 3D chi tiết cao + Cáp sạc cắm vào xe
    const bTier = bay.tier || 1;
    const isChargingNow = Boolean(bay.car && bay.car.state === "CHARGING");
    drawHighDetail3DCharger(pos.x, pos.y - 19, bTier, isChargingNow, false, env);

    if (bay.car) {
      const isSquat = bay.car.state === "SQUATTING";
      const isIceSquat = bay.car.state === "ICE_SQUATTING";
      drawEV25DRotated(pos.x, pos.y + 1, -Math.PI / 2, bay.car.model.color, bay.car.model.roof, bay.car.model.isTaxi, isSquat, false, env);

      if (isIceSquat) {
        const pIce = isoPt(pos.x, pos.y, 24);
        ctx.fillStyle = "rgba(194, 65, 12, 0.96)";
        ctx.strokeStyle = "#fde047";
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.roundRect(pIce.x - 24, pIce.y - 7, 48, 13, 4);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#fffbeb";
        ctx.font = "900 6.8px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(L("⛽XĂNG(-15đ)", "⛽GAS(-15pt)"), pIce.x, pIce.y + 2);
      } else if (isSquat) {
        const pFine = isoPt(pos.x, pos.y, 24);
        const curFineTxt = `🚨${formatCompactVND(bay.car.currentFine || 150000)}`;
        ctx.fillStyle = "rgba(153, 27, 27, 0.96)";
        ctx.strokeStyle = "#fde047";
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.roundRect(pFine.x - 19, pFine.y - 7, 38, 13, 4);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#fef08a";
        ctx.font = "900 7.2px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(curFineTxt, pFine.x, pFine.y + 2);
      } else {
        // Thanh phần trăm pin đang sạc nổi ngay trên nóc xe
        const pct = Math.min(1, (bay.car.chargedKwh || 0) / Math.max(1, bay.car.needKwh || 30));
        const pBar = isoPt(pos.x, pos.y + 1, 18);
        ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
        ctx.fillRect(pBar.x - 9, pBar.y - 3, 18, 4.5);
        ctx.fillStyle = "#4ade80";
        ctx.fillRect(pBar.x - 8, pBar.y - 2, 16 * pct, 2.5);
      }
    }
  });

}

// Hàm con 5/5: Vẽ Mái đón Pin Mặt Trời (Solar Canopy 3D), Hào quang Skin & Thẻ Callout "OUR STATION"
export function drawStationCanopyAndCallout25D(lot, env, x, y, w, h, bNW, bNE, bSE, bSW, sp, isSelected, pulse) {
  // 5. Vẽ MÁI ĐÓN PIN MẶT TRỜI 3D (AST_CNP_01..03 — Có Cột Thép Chữ Y, Thành Mái 3D, Lưới Tế Bào Quang Điện & Hộp Đỉnh Mái Tia Sét!)
  const canX = x + 12;
  const canY = y + 6;
  const canW = w - 24;
  const canH = Math.min(34, h * 0.42);
  const canZ = 34;

  // Cột thép chữ Y đỡ mái Solar Canopy
  [
    [canX + 7, canY + canH / 2],
    [canX + canW - 7, canY + canH / 2]
  ].forEach(([px, py]) => {
    const pb = isoPt(px, py, 0);
    const pm = isoPt(px, py, canZ - 7);
    const ptL = isoPt(px - 5, py, canZ);
    const ptR = isoPt(px + 5, py, canZ);
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(pb.x, pb.y); ctx.lineTo(pm.x, pm.y);
    ctx.moveTo(pm.x, pm.y); ctx.lineTo(ptL.x, ptL.y);
    ctx.moveTo(pm.x, pm.y); ctx.lineTo(ptR.x, ptR.y);
    ctx.stroke();
  });

  // Độ dày thành mái 3D (Fascia Bevel) + Mặt kính pin mặt trời xanh Sapphire kẻ lưới tế bào quang điện
  const cNW = isoPt(canX, canY, canZ + 4);
  const cNE = isoPt(canX + canW, canY, canZ + 4);
  const cSE = isoPt(canX + canW, canY + canH, canZ);
  const cSW = isoPt(canX, canY + canH, canZ);
  const cSW_bot = isoPt(canX, canY + canH, canZ - 3.5);
  const cSE_bot = isoPt(canX + canW, canY + canH, canZ - 3.5);
  const cNW_bot = isoPt(canX, canY, canZ + 0.5);

  const activeSkin = getActiveStationSkin();
  fillStrokePoly([cNW, cSW, cSW_bot, cNW_bot], activeSkin.bevelLeft, activeSkin.bevelStroke, 1.1);
  fillStrokePoly([cSW, cSE, cSE_bot, cSW_bot], activeSkin.bevelFront, activeSkin.bevelStroke, 1.1);
  fillStrokePoly([cNW, cNE, cSE, cSW], activeSkin.glassFill, activeSkin.glassStroke, 2.4);

  // Lưới tế bào quang điện (Solar Wafer Grid) + Vệt phản quang trắng chéo trên mặt pin
  ctx.strokeStyle = "rgba(226, 232, 240, 0.82)";
  ctx.lineWidth = 1.0;
  for (let u = 0.16; u < 0.9; u += 0.16) {
    const g0 = quadLerp(cNW, cNE, cSE, cSW, u, 0);
    const g1 = quadLerp(cNW, cNE, cSE, cSW, u, 1);
    ctx.beginPath();
    ctx.moveTo(g0.x, g0.y);
    ctx.lineTo(g1.x, g1.y);
    ctx.stroke();
  }
  [0.33, 0.67].forEach(v => {
    const m0 = quadLerp(cNW, cNE, cSE, cSW, 0, v);
    const m1 = quadLerp(cNW, cNE, cSE, cSW, 1, v);
    ctx.beginPath();
    ctx.moveTo(m0.x, m0.y);
    ctx.lineTo(m1.x, m1.y);
    ctx.stroke();
  });

  // Hộp biến tần trung tâm trên đỉnh mái Solar Canopy kèm Biểu Tượng Skin 3D (⚡ / 👑 / 🔮 / 🏮)
  const pCrest = isoPt(lot.x, canY + canH / 2, canZ + 6);
  ctx.fillStyle = activeSkin.crestBg;
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(pCrest.x - 15, pCrest.y - 8.5, 30, 15, 5);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = activeSkin.crestCircle;
  ctx.beginPath();
  ctx.arc(pCrest.x, pCrest.y - 1, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#fef08a";
  ctx.font = "900 8px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(activeSkin.crestIcon || "⚡", pCrest.x, pCrest.y - 0.5);

  // 6. Bốn bức tường hào quang 3D quanh chu vi lô đất theo màu Skin đã trang bị!
  drawIso3DGlowingCurtainWalls(
    lot.x,
    lot.y,
    w,
    h,
    30,
    lot.lockedByDebt ? "239, 68, 68" : activeSkin.curtainRgb,
    lot.lockedByDebt ? "#ef4444" : activeSkin.curtainBorder,
    pulse
  );

  // 7. Thẻ Callout nổi nằm ngang "OUR STATION"
  const dispName = getLotDisplayName(lot);
  const shortName = dispName.split(":")[1]?.split("(")[0].trim().slice(0, 12).toUpperCase() || L(`TRẠM #${lot.id}`, `STA #${lot.id}`);
  const capRatio = sp.activeChargers / Math.max(1, sp.maxChargersPossibleNow);
  drawUprightStationCalloutCard(
    lot.x,
    lot.y,
    64,
    `#${lot.id} ${shortName} (${sp.activeChargers}/${sp.maxChargersPossibleNow}🔌)`,
    activeSkin.icon || "🌿",
    lot.lockedByDebt ? "#ef4444" : activeSkin.bevelLeft,
    lot.lockedByDebt ? "#dc2626" : activeSkin.bevelFront,
    capRatio,
    isSelected
  );
}

// Hàm điều phối chính (Coordinator) gọi 5 hàm con theo đúng thứ tự chiều sâu 2.5D
export function drawPlayerStationLot25D(lot, env) {
  const isSelected = lot.id === state.selectedLotId;
  const dim = getLotBoxDimensions(lot);
  const w = dim.w, h = dim.h;
  const sp = getLotSpatialBreakdown(lot);
  const pulse = 0.5 + 0.5 * Math.sin(performance.now() * 0.0045);
  const x = lot.x - w / 2;
  const y = lot.y - h / 2;

  const bNW = isoPt(x, y, 0);
  const bNE = isoPt(x + w, y, 0);
  const bSE = isoPt(x + w, y + h, 0);
  const bSW = isoPt(x, y + h, 0);

  if (!lot.owned) {
    drawUnownedPlot25D(lot, env, x, y, w, h, bNW, bNE, bSE, bSW, isSelected, pulse);
    return;
  }

  drawStationPadAndGates25D(lot, env, x, y, w, h, bNW, bNE, bSE, bSW, isSelected, pulse);
  drawStationAmenities25D(lot, env, x, y, w, h);
  drawStationChargingBays25D(lot, env);
  drawStationCanopyAndCallout25D(lot, env, x, y, w, h, bNW, bNE, bSE, bSW, sp, isSelected, pulse);
}


// Đăng ký vào globalThis để tương thích ngược với HTML event handlers & các module liên kết
Object.assign(globalThis, {
  drawRivalStationLot25D,
  drawUnownedPlot25D,
  drawStationPadAndGates25D,
  drawStationAmenities25D,
  drawStationChargingBays25D,
  drawStationCanopyAndCallout25D,
  drawPlayerStationLot25D
});
