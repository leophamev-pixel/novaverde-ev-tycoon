/**
 * src/render/draw-charger.js
 * Vẽ chi tiết 5 cấp Trụ sạc 3D & Thẻ thông tin nổi (Callout Card)
 */
export function drawUprightStationCalloutCard(cx, cy, zHeight, titleTxt, iconTxt, badgeBg, barColor, progressPct, isSelected) {
  const p = isoPt(cx, cy, zHeight);
  const cardW = 148;
  const cardH = 34;
  const x = p.x - cardW / 2;
  const y = p.y - cardH;

  ctx.save();
  ctx.fillStyle = "rgba(15, 23, 42, 0.28)";
  ctx.beginPath();
  ctx.roundRect(x + 2, y + 3, cardW, cardH, 9);
  ctx.fill();

  ctx.fillStyle = "#f8fafc";
  ctx.strokeStyle = isSelected ? "#f59e0b" : "#334155";
  ctx.lineWidth = isSelected ? 2.6 : 1.8;
  ctx.beginPath();
  ctx.roundRect(x, y, cardW, cardH, 9);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(p.x - 7, y + cardH - 1);
  ctx.lineTo(p.x, y + cardH + 8);
  ctx.lineTo(p.x + 7, y + cardH - 1);
  ctx.closePath();
  ctx.fillStyle = "#f8fafc";
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = badgeBg;
  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(x + 5, y + 5, 24, 24, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 12px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(iconTxt, x + 17, y + 21);

  ctx.fillStyle = "#1e293b";
  ctx.font = "900 8.5px 'Segoe UI', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(titleTxt, x + 34, y + 14.5);

  const barX = x + 34;
  const barY = y + 19.5;
  const barW = cardW - 42;
  const barH = 8;
  ctx.fillStyle = "#cbd5e1";
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(barX, barY, barW, barH, 4);
  ctx.fill();
  ctx.stroke();

  const fillW = Math.max(8, Math.min(barW, barW * progressPct));
  ctx.fillStyle = barColor;
  ctx.beginPath();
  ctx.roundRect(barX, barY, fillW, barH, 4);
  ctx.fill();

  ctx.restore();
}

// CHUYÊN DỤNG VẼ 4 CẤP TRỤ SẠC EV 3D CHI TIẾT CAO (AST_CHG_01..04 — Có Bệ Đảo Bê Tông, Màn Hình Cảm Ứng LCD Phát Sáng, Dây Cáp Xoắn Đen & Cổng Vòm Siêu Sạc 120kW!)
export function drawHighDetail3DCharger(wx, wy, tier, hasCarCharging, isRival, env) {
  // 1. Bệ đảo bê tông vát cạnh dưới chân trụ sạc
  const pPad0 = isoPt(wx - 7, wy - 5, 0), pPad1 = isoPt(wx + 7, wy - 5, 0);
  const pPad2 = isoPt(wx + 7, wy + 5, 0), pPad3 = isoPt(wx - 7, wy + 5, 0);
  fillStrokePoly([pPad0, pPad1, pPad2, pPad3], "#cbd5e1", "#475569", 1.0);

  const zH = isRival ? 19 : (15 + tier * 2.2);
  const wC = isRival ? 11 : (8.5 + tier * 1.1);
  const hC = 7.5;
  const x0 = wx - wC / 2;
  const y0 = wy - hC / 2;

  const frontCol = isRival ? "#fca5a5" : (tier === 1 ? "#f8fafc" : (tier === 2 ? "#2dd4bf" : (tier === 3 ? "#10b981" : "#14b8a6")));
  const sideCol  = isRival ? "#ef4444" : (tier === 1 ? "#cbd5e1" : (tier === 2 ? "#0d9488" : (tier === 3 ? "#047857" : "#0f766e")));
  const topCol   = isRival ? "#be123c" : (tier === 4 ? "#fbbf24" : "#22c55e");

  // Thân tủ sạc 3D nguyên khối (không vẽ cửa sổ nhà!)
  drawIso3DSolidBuilding(x0, y0, wC, hC, zH, frontCol, sideCol, topCol, topCol, env, {
    roofType: "flat",
    isSimpleBox: true,
    noShadow: true
  });

  // Màn hình cảm ứng HMI phát sáng + Đèn LED báo trạng thái trên đỉnh trụ
  const pScr = isoPt(wx, wy + hC / 2, zH * 0.58);
  ctx.fillStyle = "#0f172a";
  ctx.strokeStyle = isRival ? "#fda4af" : "#67e8f9";
  ctx.lineWidth = 1.0;
  ctx.fillRect(pScr.x - 3.2, pScr.y - 4.2, 6.4, 7.2);
  ctx.strokeRect(pScr.x - 3.2, pScr.y - 4.2, 6.4, 7.2);

  // Màn hình LCD con hiển thị thanh năng lượng
  ctx.fillStyle = isRival ? "#fb7185" : (hasCarCharging ? "#4ade80" : "#38bdf8");
  ctx.fillRect(pScr.x - 2.1, pScr.y - 3.0, 4.2, 3.2);

  // Dây cáp sạc đen uốn cong treo bên hông trụ (hoặc cắm trực tiếp vào xe khi đang sạc!)
  const pGun = isoPt(wx + wC / 2, wy, zH * 0.45);
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(pGun.x, pGun.y);
  if (hasCarCharging) {
    const pCarPort = isoPt(wx + 3, wy + 16, 7);
    ctx.quadraticCurveTo(pGun.x + 6, pGun.y + 8, pCarPort.x, pCarPort.y);
  } else {
    ctx.quadraticCurveTo(pGun.x + 5, pGun.y + 4, pGun.x + 1, pGun.y + 7);
  }
  ctx.stroke();

  // Cấp 4 (120kW SuperCharger): Cổng vòm năng lượng vàng kim + Vòng Hào Quang Neon trên đỉnh
  if (tier >= 4 && !isRival) {
    const pHalo = isoPt(wx, wy, zH + 4);
    ctx.fillStyle = "rgba(250, 204, 21, 0.35)";
    ctx.strokeStyle = "#fde047";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(pHalo.x, pHalo.y, 10, 4.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}

// VẼ TRẠM ĐỐI THỦ 2.5D CHI TIẾT ĐẦY ĐỦ: ĐẾ BÊ TÔNG 3D + Mái Solar Canopy Đỏ + 3 Trụ Sạc DC Đỏ + Xe Đang Sạc + Tường Hào Quang (AST_PAD_02 — Asset Sheet 1!)

// Đăng ký vào globalThis để tương thích ngược với HTML event handlers & các module liên kết
Object.assign(globalThis, {
  drawUprightStationCalloutCard,
  drawHighDetail3DCharger
});
