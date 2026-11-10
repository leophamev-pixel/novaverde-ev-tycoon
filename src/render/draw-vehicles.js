/**
 * src/render/draw-vehicles.js
 * Vẽ Phương tiện 3D Isometric xoay theo góc di chuyển (EV, Taxi, Xe xăng, Xe máy)
 */
export function drawEV25DRotated(wx, wy, headingRad, bodyColor, roofColor, isTaxi, isSquatting, blinkerOn, env, isScooter = false, isICE = false) {
  const p = isoPt(wx, wy, 0);
  const dirX = Math.cos(headingRad);
  const dirY = Math.sin(headingRad);
  const pAhead = isoPt(wx + dirX * 10, wy + dirY * 10, 0);
  const screenAngle = Math.atan2(pAhead.y - p.y, pAhead.x - p.x);

  ctx.save();
  ctx.translate(p.x, p.y);

  if (isScooter) {
    // VẼ XE MÁY ĐIỆN / XE MÁY XĂNG & SHIPPER HÀ NỘI 3D (Có Bánh Xe, Yếm Xe, Người Lái Đội Mũ Bảo Hiểm & Thùng Hàng Shipper!)
    ctx.fillStyle = "rgba(15, 23, 42, 0.28)";
    ctx.beginPath();
    ctx.ellipse(1, 2, 6.2, 3.8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.rotate(screenAngle + Math.PI / 2);

    if (env && env.isNight) {
      ctx.fillStyle = "rgba(254, 240, 138, 0.42)";
      ctx.beginPath();
      ctx.moveTo(-2.5, -6); ctx.lineTo(-6, -16); ctx.lineTo(6, -16); ctx.lineTo(2.5, -6);
      ctx.closePath();
      ctx.fill();
    }

    // Bánh trước & bánh sau
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(-1.3, -6.8, 2.6, 3.2);
    ctx.fillRect(-1.3, 3.4, 2.6, 3.2);

    // Thân xe máy / xe ga
    ctx.fillStyle = bodyColor;
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.roundRect(-2.8, -5.2, 5.6, 10.4, 2.4);
    ctx.fill();
    ctx.stroke();

    // Tay lái ngang
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-4.2, -3.2); ctx.lineTo(4.2, -3.2);
    ctx.stroke();

    // Thùng chở hàng sau yên nếu là Shipper (isTaxi === true)
    if (isTaxi) {
      ctx.fillStyle = "#f97316";
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 1;
      ctx.fillRect(-2.6, 1.8, 5.2, 3.6);
      ctx.strokeRect(-2.6, 1.8, 5.2, 3.6);
    }

    // Người lái đội mũ bảo hiểm 3D
    ctx.fillStyle = isICE ? "#38bdf8" : "#10b981";
    ctx.beginPath();
    ctx.arc(0, -0.5, 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = roofColor || "#fef08a";
    ctx.beginPath();
    ctx.arc(0, -1.0, 2.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
    return;
  }

  // Bóng đổ mềm dưới gầm ô tô
  ctx.fillStyle = "rgba(15, 23, 42, 0.32)";
  ctx.beginPath();
  ctx.ellipse(1.5, 2.5, 10.5, 6.8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.rotate(screenAngle + Math.PI / 2);

  // Chùm sáng đèn pha LED chiếu về phía trước vào ban đêm
  if (env && env.isNight && !isSquatting) {
    const beamGrad = ctx.createLinearGradient(0, -9, 0, -24);
    beamGrad.addColorStop(0, "rgba(254, 240, 138, 0.55)");
    beamGrad.addColorStop(1, "rgba(254, 240, 138, 0)");
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(-5, -9);
    ctx.lineTo(-11, -24);
    ctx.lineTo(11, -24);
    ctx.lineTo(5, -9);
    ctx.closePath();
    ctx.fill();
  }

  // 4 Bánh xe đen + Mâm hợp kim bạc 3D
  [[-7.2, -6.0], [5.2, -6.0], [-7.2, 3.0], [5.2, 3.0]].forEach(([wxOff, wyOff]) => {
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(wxOff, wyOff, 2.2, 4.4);
    ctx.fillStyle = "#cbd5e1";
    ctx.fillRect(wxOff + 0.4, wyOff + 1.1, 1.4, 2.2);
  });

  // Thân dưới (Lower Chassis) tạo độ dày 3D cho xe
  ctx.fillStyle = isSquatting ? "#b91c1c" : "#1e293b";
  ctx.beginPath();
  ctx.roundRect(-6.8, -9.2, 13.6, 19.2, 4.5);
  ctx.fill();

  // Thân chính xe 3D bo tròn có nắp capo & cốp sau
  ctx.fillStyle = isSquatting ? "#ef4444" : bodyColor;
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.roundRect(-6.4, -9.5, 12.8, 18.5, 4.2);
  ctx.fill();
  ctx.stroke();

  // Đường gân nắp capo trước
  ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(-3.8, -8.5); ctx.lineTo(-3.2, -5.8);
  ctx.moveTo(3.8, -8.5);  ctx.lineTo(3.2, -5.8);
  ctx.stroke();

  // Khối kính vòng quanh cabin (Windshield, Side Windows & Rear Glass)
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.roundRect(-5.2, -6.2, 10.4, 12.2, 2.8);
  ctx.fill();

  // Vệt phản quang trắng trên kính chắn gió trước
  ctx.strokeStyle = "rgba(186, 230, 253, 0.65)";
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(-3.5, -5.4);
  ctx.lineTo(1.5, -3.8);
  ctx.stroke();

  // Nóc cabin xe 3D nổi cao
  ctx.fillStyle = isSquatting ? "#fca5a5" : roofColor;
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.roundRect(-4.6, -3.4, 9.2, 7.2, 2.2);
  ctx.fill();
  ctx.stroke();

  // Mào đèn "TAXI" phát sáng 3D trên nóc cho dòng Green Taxi EV & Cyan Pro Taxi EV
  if (isTaxi && !isSquatting) {
    ctx.fillStyle = "#fef08a";
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.roundRect(-3.4, -1.2, 6.8, 2.8, 1.2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#047857";
    ctx.fillRect(-1.8, -0.4, 3.6, 1.2);
  }

  // Đèn pha LED phía trước & Đèn hậu Đỏ phía sau
  ctx.fillStyle = (blinkerOn && Math.floor(performance.now() / 180) % 2 === 0) ? "#f97316" : "#fef08a";
  ctx.beginPath();
  ctx.arc(-4.4, -8.8, 1.6, 0, Math.PI * 2);
  ctx.arc(4.4, -8.8, 1.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ef4444";
  ctx.fillRect(-5.0, 8.0, 2.8, 1.2);
  ctx.fillRect(2.2, 8.0, 2.8, 1.2);

  ctx.restore();
}


// Đăng ký vào globalThis để tương thích ngược với HTML event handlers & các module liên kết
Object.assign(globalThis, {
  drawEV25DRotated
});
