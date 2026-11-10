/**
 * src/render/render-loop.js
 * Vòng lặp Render chính drawCartoonMap() với thuật toán xếp lớp chiều sâu Painter's Algorithm
 */
export function drawCartoonMap() {
  const wrap = document.getElementById("canvas-wrap");
  const vw = wrap.clientWidth || 420;
  const vh = wrap.clientHeight || 800;
  const _dpr = window.devicePixelRatio || 1;
  if (canvas && (canvas.width !== Math.round(vw * _dpr) || canvas.height !== Math.round(vh * _dpr))) { resizeCanvas(); }
  const env = getLightingEnvironment();

  // Lướt êm (Smooth Glide) khi chạm điểm trên Minimap Hình Tròn hoặc Quán tính vuốt (Inertial Panning) 60 FPS
  if (typeof camera.glideTargetX === "number" && typeof camera.glideTargetY === "number") {
    const gdx = camera.glideTargetX - camera.x;
    const gdy = camera.glideTargetY - camera.y;
    if (Math.hypot(gdx, gdy) > 2.5) {
      camera.x += gdx * 0.22;
      camera.y += gdy * 0.22;
    } else {
      camera.x = camera.glideTargetX;
      camera.y = camera.glideTargetY;
      camera.glideTargetX = null;
      camera.glideTargetY = null;
    }
  } else if (!camera.isDragging && !minimapDragging && (Math.abs(camera.vx || 0) > 0.15 || Math.abs(camera.vy || 0) > 0.15)) {
    camera.x = Math.max(WORLD_BOUNDS.minX, Math.min(WORLD_BOUNDS.maxX, camera.x + camera.vx));
    camera.y = Math.max(WORLD_BOUNDS.minY, Math.min(WORLD_BOUNDS.maxY, camera.y + camera.vy));
    camera.vx *= 0.90;
    camera.vy *= 0.90;
  }

  // Cập nhật trực tiếp Thanh Định Vị Phường/Quận gọn gàng trên HUD Hàng 2 khi người chơi lướt camera qua 36 Phường
  const curCamSec = getSectorAtWorldPos(camera.x, camera.y);
  const navLbl = document.getElementById("hud-ward-navigator-lbl");
  if (navLbl && curCamSec) {
    const expectedTxt = isEn()
      ? `${curCamSec.districtCodeEn}. ${(curCamSec.districtNameEn || "").replace(" District", "")} • ${(curCamSec.wardNameEn || "").replace(" Ward", "")}`
      : `${curCamSec.districtCode}. ${curCamSec.districtName.replace("Quận ", "")} • ${curCamSec.wardName.replace("P. ", "")}`;
    if (navLbl.textContent !== expectedTxt) navLbl.textContent = expectedTxt;
  }

  // SPATIAL SECTOR CULLING (6 × 6 = 36 PHƯỜNG LIỀN KỀ): Chỉ kết xuất các Phường đang lọt trong khung nhìn Camera để khóa cứng 60 FPS!
  let visibleSectors = MEGA_SECTORS_36.filter(sec => isIsoVisible(sec.ox, sec.oy, vw, vh, 3150));
  if (visibleSectors.length === 0) visibleSectors = [curCamSec];

  ctx.clearRect(0, 0, vw, vh);
  ctx.fillStyle = env.isNight ? "#334155" : "#d6d3d1";
  ctx.fillRect(0, 0, vw, vh);

  // BƯỚC 1: VẼ MẶT ĐẤT ĐẶC TRƯNG TỪNG QUẬN TỪ BỘ NHỚ ĐỆM OFFSCREEN GPU + VẠCH SƠN KẺ ĐƯỜNG PHÁT SÁNG NHẸ KÈM TÊN QUẬN DƯỚI MẶT ĐƯỜNG
  ctx.save();
  ctx.translate(vw / 2, vh / 2);
  ctx.scale(camera.zoom, camera.zoom);
  if (state.isoView) {
    ctx.scale(1, ISO_SCALE_Y);
    ctx.rotate(ISO_ROT_RAD);
  }
  ctx.translate(-camera.x, -camera.y);

  visibleSectors.forEach(sec => {
    const bakedGround = getOrBakeStaticGroundCanvas(env.isNight, sec.districtIdx);
    if (bakedGround) {
      ctx.drawImage(bakedGround, sec.ox - 2160, sec.oy - 1960);
    }
    drawDynamicTrafficLightBoxesOnly(sec.ox, sec.oy);
    drawSubtleRoadBoundaryAndDistrictPaint(sec, sec.sIdx === curCamSec.sIdx, env.isNight);
  });
  ctx.restore();

  // BƯỚC 2: VẼ TOÀN BỘ KHỐI 3D DỰNG ĐỨNG (TRUE 3D VERTICAL Z-EXTRUSION) CÓ SẮP XẾP ĐỘ SÂU (PAINTER'S ALGORITHM)
  ctx.save();
  ctx.translate(vw / 2, vh / 2);
  ctx.scale(camera.zoom, camera.zoom);

  const renderQueue = [];

  visibleSectors.forEach(sec => {
    const sOx = sec.ox;
    const sOy = sec.oy;

    // 2a. Kỳ quan Trung tâm Đặc trưng của từng Quận (Hồ Gươm chỉ ở Hoàn Kiếm; Ba Đình có Lăng Bác; Tây Hồ có Đại Hồ Tây & Chùa Trấn Quốc; Đống Đa có Văn Miếu; Mỹ Đình có SVĐ Mỹ Đình...)
    MAJOR_PARKS.forEach(pk => {
      const pkX = (V_ROADS[pk.col].x + V_ROADS[pk.col + 1].x) / 2 + sOx;
      const pkY = (H_ROADS[pk.row].y + H_ROADS[pk.row + 1].y) / 2 + sOy;
      if (!isIsoVisible(pkX, pkY, vw, vh, 340)) return;
      renderQueue.push({
        depthY: isoPt(pkX, pkY, 0).y,
        draw: () => drawScenicPark3DStructures(pk, env, sOx, sOy, sec)
      });
    });

    // 2a-bis. Hệ thống Cầu Vượt Sông Hồng 3D (CHỈ vẽ tại các Quận ven Sông Hồng!) & Đoàn Tàu Hỏa / Metro 3D
    if (sec.hasRiver) {
      [-1700, -1020, -340, 680].forEach((by, bIdx) => {
        if (!isIsoVisible(1220 + sOx, by + sOy, vw, vh, 360)) return;
        renderQueue.push({
          depthY: isoPt(1220 + sOx, by + sOy, 0).y,
          draw: () => drawRedRiverBridge3DSpan(by, bIdx, env, sOx, sOy)
        });
      });
    }
    if (sec.hasRailway && isIsoVisible(-1180 + sOx, -340 + sOy, vw, vh, 500)) {
      renderQueue.push({
        depthY: isoPt(-1180 + sOx, -340 + sOy, 0).y + 4,
        draw: () => drawHanoiTrain3DOnTrack(env, sOx, sOy, sec.districtIdx)
      });
    }

    // 2b. Các quần thể kiến trúc nền biến thiên theo đúng bản sắc quy hoạch của từng Quận (Bao gồm cả dải biên giới liên Quận c=10, r=10 và dải c=8 của Quận nội địa!)
    ARCHITECTURAL_CLUSTERS.forEach((cl, clIdx) => {
      if (cl.onlyInland && sec.hasRiver) return;
      const wcx = cl.cx + sOx;
      const wcy = cl.cy + sOy;
      if (!isIsoVisible(wcx, wcy, vw, vh, 220)) return;
      renderQueue.push({
        depthY: isoPt(wcx, wcy, 0).y,
        draw: () => drawDiverseArchitecturalCluster25D({ ...cl, cx: wcx, cy: wcy, x: cl.x + sOx, y: cl.y + sOy, districtIdx: sec.districtIdx, archStyle: sec.archStyle, clIdx }, env)
      });
    });

    // 2c. 30 Công trình Di tích & Tòa Tháp 3D biến thiên theo từng Quận
    HOAN_KIEM_BUILDINGS.forEach((b, bIdx) => {
      const bx = b.x + sOx;
      const by = b.y + sOy;
      const bcx = bx + b.w / 2;
      const bcy = by + b.h / 2;
      if (!isIsoVisible(bcx, bcy, vw, vh, 320)) return;
      renderQueue.push({
        depthY: isoPt(bcx, bcy, 0).y,
        draw: () => drawIsometric3DBuildingBlock({ ...b, x: bx, y: by, districtIdx: sec.districtIdx, archStyle: sec.archStyle, hasRiver: sec.hasRiver, bIdx }, env)
      });
    });

    // 2d. 8 Trạm Đối Thủ mỗi Phường (Tổng 288 Trạm Đối Thủ trên toàn Server)
    const secRivals = SECTOR_RIVALS_MAP[sec.sIdx] || [];
    secRivals.forEach(rv => {
      if (!isIsoVisible(rv.x, rv.y, vw, vh, 260)) return;
      renderQueue.push({
        depthY: isoPt(rv.x, rv.y, 0).y,
        draw: () => drawRivalStationLot25D(rv, env)
      });
    });

    // 2e. 150 Lô Đất của Người Chơi trong Phường này (Tổng 36 × 150 = 5.400 Lô Đất #1 đến #5400!)
    const secLots = SECTOR_LOTS_MAP[sec.sIdx] || [];
    secLots.forEach(lot => {
      if (!isIsoVisible(lot.x, lot.y, vw, vh, 260)) return;
      renderQueue.push({
        depthY: isoPt(lot.x, lot.y, 0).y,
        draw: () => drawPlayerStationLot25D(lot, env)
      });
    });
  });

  // 2f. Phương tiện lưu thông liên thông trên đường (Ô tô điện, Taxi Xanh, Ô tô xăng, Xe máy điện Shipper & Xe máy xăng)
  roadCars.forEach(rc => {
    if (!isIsoVisible(rc.x, rc.y, vw, vh, 160)) return;
    renderQueue.push({
      depthY: isoPt(rc.x, rc.y, 0).y + 2,
      draw: () => drawEV25DRotated(rc.x, rc.y, rc.heading, rc.model.color, rc.model.roof, rc.model.isTaxi, false, rc.blinker, env, rc.model.isScooter, rc.model.isICE)
    });
  });

  // Sắp xếp từ xa đến gần (nhỏ đến lớn theo trục màn hình Y) để khối nhà trước che khối nhà sau chuẩn 3D!
  renderQueue.sort((a, b) => a.depthY - b.depthY);
  renderQueue.forEach(item => item.draw());

  // Floating Money & Tax Popups (luôn nổi trên cùng)
  floatTexts.forEach(ft => {
    const p = isoPt(ft.x, ft.y, 38);
    ctx.font = "900 11.5px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = "#fffbeb";
    ctx.strokeText(ft.text, p.x, p.y);
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, p.x, p.y);
  });

  ctx.restore();

  if (env.ambientAlpha > 0) {
    ctx.fillStyle = env.ambientColor;
    ctx.globalAlpha = env.ambientAlpha;
    ctx.fillRect(0, 0, vw, vh);
    ctx.globalAlpha = 1;
  }

  if (state.isRaining) {
    ctx.strokeStyle = "rgba(186, 230, 253, 0.65)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    rainDrops.forEach(r => {
      ctx.moveTo(r.x, r.y);
      ctx.lineTo(r.x - 4, r.y + r.len);
    });
    ctx.stroke();
  }

  if (document.getElementById("radar-card").classList.contains("show")) {
    drawMinimapRadar(vw, vh);
  }
}

// VẼ CÂY XANH CỔ THỤ HÀ NỘI 3D NHIỀU TẦNG TÁN + BỒN GẠCH BO GỐC + HOA THEO MÙA (AST_TRE_01..03 — Giống hệt Asset Sheet 4!)

// Đăng ký vào globalThis để tương thích ngược với HTML event handlers & các module liên kết
Object.assign(globalThis, {
  drawCartoonMap
});
