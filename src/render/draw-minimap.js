/**
 * src/render/draw-minimap.js
 * Vẽ Bản đồ thu nhỏ (Minimap Radar) & xử lý chạm/kéo để di chuyển nhanh Camera
 */
export function toggleRadarMinimap() {
  const card = document.getElementById("radar-card");
  const btn = document.getElementById("btn-toggle-radar");
  const isShow = card.classList.toggle("show");
  btn.classList.toggle("active-tool", isShow);
}

export function setMinimapViewMode(mode) {
  state.minimapMode = mode === "ward" ? "ward" : "world";
  state.minimapCustomRadius = null; // Đặt lại bán kính chuẩn cho chế độ vừa chọn
  const btnW = document.getElementById("mini-mode-world-btn");
  const btnD = document.getElementById("mini-mode-ward-btn");
  if (btnW) btnW.classList.toggle("active", state.minimapMode === "world");
  if (btnD) btnD.classList.toggle("active", state.minimapMode === "ward");
}

export function toggleMinimapExpand() {
  state.minimapExpanded = !state.minimapExpanded;
  const card = document.getElementById("radar-card");
  const expBtn = document.getElementById("mini-expand-btn");
  if (card) card.classList.toggle("expanded", state.minimapExpanded);
  if (minimapCanvas) {
    minimapCanvas.width = state.minimapExpanded ? 620 : 420;
    minimapCanvas.height = state.minimapExpanded ? 620 : 420;
  }
  if (expBtn) {
    expBtn.textContent = state.minimapExpanded
      ? L("🗕 Thu gọn", "🗕 Compact")
      : L("⛶ Phóng to", "⛶ Expand");
  }
}


globalThis.minimapDragging = false;
globalThis.minimapDragMoved = false;
globalThis.miniLastX = 0;
globalThis.miniLastY = 0;

export function getActiveMinimapViewRadius() {
  const mode = state.minimapMode || "world";
  return state.minimapCustomRadius || (mode === "ward" ? 3100 : 11800);
}

export function jumpFromMinimapEvent(e) {
  const rect = minimapCanvas.getBoundingClientRect();
  const cx = rect.width / 2;
  const cy = rect.height / 2;
  const radiusPx = Math.max(1, Math.min(rect.width, rect.height) / 2);
  const viewRadius = getActiveMinimapViewRadius();
  const dxPx = (e.clientX - rect.left) - cx;
  const dyPx = (e.clientY - rect.top) - cy;
  const targetWX = Math.max(WORLD_BOUNDS.minX, Math.min(WORLD_BOUNDS.maxX, camera.x + (dxPx / radiusPx) * viewRadius));
  const targetWY = Math.max(WORLD_BOUNDS.minY, Math.min(WORLD_BOUNDS.maxY, camera.y + (dyPx / radiusPx) * viewRadius));
  camera.glideTargetX = targetWX;
  camera.glideTargetY = targetWY;
  const sec = getSectorAtWorldPos(targetWX, targetWY);
  if (sec && window.mpState) {
    window.mpState.currentDistrictIdx = sec.districtIdx;
    window.mpState.currentWardIdx = sec.wardIdx;
  }
}

minimapCanvas.addEventListener("pointerdown", e => {
  e.preventDefault();
  e.stopPropagation();
  minimapDragging = true;
  minimapDragMoved = false;
  miniLastX = e.clientX;
  miniLastY = e.clientY;
  camera.vx = 0;
  camera.vy = 0;
  camera.glideTargetX = null;
  camera.glideTargetY = null;
  try { minimapCanvas.setPointerCapture(e.pointerId); } catch (_) {}
});

minimapCanvas.addEventListener("pointermove", e => {
  if (!minimapDragging) return;
  e.preventDefault();
  e.stopPropagation();
  const dx = e.clientX - miniLastX;
  const dy = e.clientY - miniLastY;
  if (Math.abs(dx) > 2 || Math.abs(dy) > 2) minimapDragMoved = true;

  const rect = minimapCanvas.getBoundingClientRect();
  const radiusPx = Math.max(1, Math.min(rect.width, rect.height) / 2);
  const viewRadius = getActiveMinimapViewRadius();
  const worldPerPx = viewRadius / radiusPx;

  // Kéo ngón tay/chuột trong đĩa tròn Minimap giúp trượt bản đồ mượt mà liên tục 1:1 kèm quán tính
  const wdx = -dx * worldPerPx;
  const wdy = -dy * worldPerPx;
  camera.x = Math.max(WORLD_BOUNDS.minX, Math.min(WORLD_BOUNDS.maxX, camera.x + wdx));
  camera.y = Math.max(WORLD_BOUNDS.minY, Math.min(WORLD_BOUNDS.maxY, camera.y + wdy));
  camera.vx = wdx * 0.85;
  camera.vy = wdy * 0.85;

  const sec = getSectorAtWorldPos(camera.x, camera.y);
  if (sec && window.mpState) {
    window.mpState.currentDistrictIdx = sec.districtIdx;
    window.mpState.currentWardIdx = sec.wardIdx;
  }
  miniLastX = e.clientX;
  miniLastY = e.clientY;
});

minimapCanvas.addEventListener("pointerup", e => {
  if (!minimapDragging) return;
  e.preventDefault();
  e.stopPropagation();
  if (!minimapDragMoved) {
    jumpFromMinimapEvent(e);
  }
  minimapDragging = false;
  try { minimapCanvas.releasePointerCapture(e.pointerId); } catch (_) {}
});

minimapCanvas.addEventListener("wheel", e => {
  e.preventDefault();
  e.stopPropagation();
  const curR = getActiveMinimapViewRadius();
  const factor = e.deltaY > 0 ? 1.15 : 0.87;
  state.minimapCustomRadius = Math.max(1400, Math.min(14500, curR * factor));
}, { passive: false });


export function drawMinimapRadar(vw, vh) {
  const mw = minimapCanvas.width;
  const mh = minimapCanvas.height;
  const cx = mw / 2;
  const cy = mh / 2;
  const radius = Math.min(mw, mh) / 2 - 2;
  const scaleFont = mw / 220;

  mctx.clearRect(0, 0, mw, mh);

  // Cắt mặt gương Hình Tròn Radar 360° (Circular Clipping Mask)
  mctx.save();
  mctx.beginPath();
  mctx.arc(cx, cy, radius, 0, Math.PI * 2);
  mctx.clip();

  // Nền Radar đêm xanh thẫm
  const radGrad = mctx.createRadialGradient(cx, cy, radius * 0.1, cx, cy, radius);
  radGrad.addColorStop(0, "#1e293b");
  radGrad.addColorStop(1, "#0f172a");
  mctx.fillStyle = radGrad;
  mctx.fillRect(0, 0, mw, mh);

  const curSec = getSectorAtWorldPos(camera.x, camera.y);
  const mode = state.minimapMode || "world";
  const isExp = !!state.minimapExpanded;

  // Bán kính tầm nhìn Radar tính theo đơn vị bản đồ (Cho phép trượt liên tục mượt mà tâm = camera.x, camera.y!)
  const defaultRadius = mode === "ward" ? 3100 : 11800;
  const viewRadius = state.minimapCustomRadius || defaultRadius;
  const toRadX = wx => cx + ((wx - camera.x) / viewRadius) * radius;
  const toRadY = wy => cy + ((wy - camera.y) / viewRadius) * radius;
  const toRadLen = wLen => (wLen / viewRadius) * radius;

  // Vẽ toàn bộ 36 Phân khu Phường (12 Quận) trượt mượt mà liên tục dưới mặt kính hình tròn
  MEGA_SECTORS_36.forEach(sec => {
    const sx0 = toRadX(sec.ox - 1980);
    const sy0 = toRadY(sec.oy - 1870);
    const sw = toRadLen(3960);
    const sh = toRadLen(3740);

    // Bỏ qua các Phường nằm hoàn toàn ngoài mặt đĩa tròn để giữ 60 FPS
    if (sx0 + sw < 0 || sx0 > mw || sy0 + sh < 0 || sy0 > mh) return;

    const isCur = sec.sIdx === curSec.sIdx;

    // 1. Nền phân khu theo màu 12 Quận
    mctx.fillStyle = isCur
      ? "rgba(250, 204, 21, 0.22)"
      : (MINIMAP_DISTRICT_FILLS[sec.districtIdx % MINIMAP_DISTRICT_FILLS.length] || "rgba(30, 41, 59, 0.85)");
    mctx.fillRect(sx0, sy0, sw, sh);

    if (mode === "ward") {
      // --- CHI TIẾT ĐƯỜNG PHỐ, CÔNG VIÊN, SÔNG HỒNG & XE CHẠY LIÊN TỤC QUA CÁC PHƯỜNG ---
      MAJOR_PARKS.forEach(pk => {
        const px = toRadX(sec.ox + V_ROADS[pk.col].x);
        const py = toRadY(sec.oy + H_ROADS[pk.row].y);
        const pw = toRadLen(V_ROADS[pk.col + 1].x - V_ROADS[pk.col].x);
        const ph = toRadLen(H_ROADS[pk.row + 1].y - H_ROADS[pk.row].y);
        mctx.fillStyle = pk.col === 5 && pk.row === 5 ? "rgba(16, 185, 129, 0.55)" : "rgba(22, 163, 74, 0.38)";
        mctx.fillRect(px, py, pw, ph);
        if (pk.hasLake) {
          mctx.fillStyle = "rgba(14, 165, 233, 0.70)";
          mctx.fillRect(px + pw * 0.14, py + ph * 0.14, pw * 0.72, ph * 0.72);
        }
      });

      if (sec.hasRiver) {
        const rx0 = toRadX(sec.ox + V_ROADS[8].x + 22);
        const rwRiv = Math.max(3 * scaleFont, toRadLen(V_ROADS[9].x - V_ROADS[8].x - 44));
        mctx.fillStyle = "rgba(2, 132, 199, 0.82)";
        mctx.fillRect(rx0, sy0, rwRiv, sh);
        [2, 5, 8].forEach(brRow => {
          const by = toRadY(sec.oy + H_ROADS[brRow].y);
          mctx.fillStyle = "#fde047";
          mctx.fillRect(rx0 - 2, by - 2 * scaleFont, rwRiv + 4, 4 * scaleFont);
        });
      }

      // Vẽ các cụm TTTM & Ẩm thực (Màu tím hồng nhẹ)
      ARCHITECTURAL_CLUSTERS.forEach(cl => {
        if (cl.onlyInland && sec.hasRiver) return;
        if (!COMMERCIAL_DINING_ARCHETYPES.has(cl.archetype)) return;
        mctx.fillStyle = "rgba(192, 132, 252, 0.52)";
        mctx.fillRect(toRadX(sec.ox + cl.x), toRadY(sec.oy + cl.y), Math.max(2.2, toRadLen(cl.w)), Math.max(2.2, toRadLen(cl.h)));
      });

      // Lưới 11×11 trục đường của từng Phường nối liền mạch
      mctx.strokeStyle = "rgba(148, 163, 184, 0.45)";
      mctx.lineWidth = 1.3 * scaleFont;
      V_ROADS.forEach(vr => {
        const vx = toRadX(sec.ox + vr.x);
        mctx.beginPath(); mctx.moveTo(vx, sy0); mctx.lineTo(vx, sy0 + sh); mctx.stroke();
      });
      H_ROADS.forEach(hr => {
        const hy = toRadY(sec.oy + hr.y);
        mctx.beginPath(); mctx.moveTo(sx0, hy); mctx.lineTo(sx0 + sw, hy); mctx.stroke();
      });

      // Tên Kỳ quan Quận & Tên các tuyến phố chính
      const wonderName = isEn() ? (sec.centralWonderNameEn || sec.centralWonderName) : sec.centralWonderName;
      const wCx = toRadX(sec.ox + (V_ROADS[5].x + V_ROADS[6].x) / 2);
      const wCy = toRadY(sec.oy + (H_ROADS[5].y + H_ROADS[6].y) / 2);
      mctx.textAlign = "center";
      mctx.fillStyle = "rgba(15, 23, 42, 0.82)";
      mctx.fillRect(wCx - 44 * scaleFont, wCy - 5.5 * scaleFont, 88 * scaleFont, 10.5 * scaleFont);
      mctx.fillStyle = "#fef08a";
      mctx.font = `900 ${Math.round(6.3 * scaleFont)}px -apple-system, sans-serif`;
      mctx.fillText(wonderName.slice(0, 20), wCx, wCy + 2.2 * scaleFont);

      const distStreets = isEn() ? (sec.streetsEn || sec.streets) : (sec.streets || ["Kim Ngân", "Ngọc Hồ", "Trường Thịnh", "Thái Dương"]);
      const dCodeLbl = isEn() ? (sec.districtCodeEn || sec.districtCode) : sec.districtCode;
      [2, 5, 8].forEach((rIdx, sIdx) => {
        const stName = distStreets[sIdx % distStreets.length];
        const sy = toRadY(sec.oy + H_ROADS[rIdx].y) - 2.2 * scaleFont;
        mctx.fillStyle = "rgba(226, 232, 240, 0.88)";
        mctx.font = `800 ${Math.round(5.8 * scaleFont)}px -apple-system, sans-serif`;
        mctx.fillText(`${dCodeLbl} • ${stName}`, sx0 + sw * 0.34, sy);
      });

      // Vẽ 150 Lô đất trong Phường
      const secLots = SECTOR_LOTS_MAP[sec.sIdx] || [];
      secLots.forEach(l => {
        if (l.owned || l.id === state.selectedLotId) return;
        mctx.fillStyle = "rgba(203, 213, 225, 0.55)";
        mctx.fillRect(toRadX(l.x) - 1.3 * scaleFont, toRadY(l.y) - 1.3 * scaleFont, 2.6 * scaleFont, 2.6 * scaleFont);
      });
    } else {
      // --- CHẾ ĐỘ 🌐 TOÀN CẢNH 12 QUẬN (36 PHƯỜNG): ĐƯỜNG TRỤC + HỒ KỲ QUAN + SÔNG HỒNG + TÊN QUẬN/PHƯỜNG ---
      mctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
      mctx.lineWidth = 0.85 * scaleFont;
      mctx.beginPath();
      mctx.moveTo(sx0 + sw * 0.33, sy0); mctx.lineTo(sx0 + sw * 0.33, sy0 + sh);
      mctx.moveTo(sx0 + sw * 0.66, sy0); mctx.lineTo(sx0 + sw * 0.66, sy0 + sh);
      mctx.moveTo(sx0, sy0 + sh * 0.35); mctx.lineTo(sx0 + sw, sy0 + sh * 0.35);
      mctx.moveTo(sx0, sy0 + sh * 0.68); mctx.lineTo(sx0 + sw, sy0 + sh * 0.68);
      mctx.stroke();

      mctx.fillStyle = "rgba(16, 185, 129, 0.45)";
      mctx.fillRect(sx0 + sw * 0.39, sy0 + sh * 0.39, sw * 0.22, sh * 0.22);
      mctx.fillStyle = "rgba(56, 189, 248, 0.68)";
      mctx.fillRect(sx0 + sw * 0.43, sy0 + sh * 0.43, sw * 0.14, sh * 0.14);

      if (sec.hasRiver) {
        const rivX = toRadX(sec.ox + 1120);
        const rivW = Math.max(2.4 * scaleFont, toRadLen(300));
        mctx.fillStyle = "rgba(2, 132, 199, 0.84)";
        mctx.fillRect(rivX, sy0, rivW, sh);
        mctx.fillStyle = "#fde047";
        mctx.fillRect(rivX - 0.8, sy0 + sh * 0.5, rivW + 1.6, 1.6 * scaleFont);
      }

      const dCode = isEn() ? sec.districtCodeEn : sec.districtCode;
      const shortDist = isEn()
        ? (sec.districtNameEn || "").replace(" District", "").replace(" Smart City", "").replace(" Lagoon", "")
        : sec.districtName.replace("Quận ", "");
      const wShort = isEn()
        ? (sec.wardNameEn || "").replace(" Ward", "")
        : sec.shortWard;

      mctx.textAlign = "center";
      mctx.fillStyle = "rgba(15, 23, 42, 0.72)";
      mctx.fillRect(sx0 + 1.5, sy0 + 1.5, Math.max(10, sw - 3), (isExp ? 15.5 : 13) * scaleFont);

      mctx.fillStyle = isCur ? "#fde047" : "#f8fafc";
      mctx.font = `900 ${Math.round((isExp ? 6.5 : 5.7) * scaleFont)}px -apple-system, sans-serif`;
      mctx.fillText(isExp ? `${dCode}.${shortDist.slice(0, 9)}` : `${dCode}•${wShort.slice(0, 7)}`, sx0 + sw / 2, sy0 + 7.2 * scaleFont);

      mctx.fillStyle = isCur ? "#a7f3d0" : "#cbd5e1";
      mctx.font = `700 ${Math.round((isExp ? 5.6 : 4.9) * scaleFont)}px -apple-system, sans-serif`;
      mctx.fillText(isExp ? `${wShort} (#${sec.startLot})` : `#${sec.startLot}..`, sx0 + sw / 2, sy0 + (isExp ? 13.5 : 11.4) * scaleFont);
    }

    // Khung ranh giới Phường
    mctx.strokeStyle = isCur ? "#fde047" : "rgba(148, 163, 184, 0.42)";
    mctx.lineWidth = (isCur ? 1.7 : 0.8) * scaleFont;
    mctx.strokeRect(sx0, sy0, sw, sh);
  });

  // Vẽ Trạm Đối Thủ (🔴)
  MEGA_SECTORS_36.forEach(sec => {
    const rList = SECTOR_RIVALS_MAP[sec.sIdx] || [];
    rList.forEach(rv => {
      const rx = toRadX(rv.x);
      const ry = toRadY(rv.y);
      if (rx < 0 || rx > mw || ry < 0 || ry > mh) return;
      mctx.fillStyle = "#ef4444";
      mctx.beginPath();
      mctx.arc(rx, ry, (mode === "ward" ? 3.2 : 1.7) * scaleFont, 0, Math.PI * 2);
      mctx.fill();
    });
  });

  // Vẽ các phương tiện EV (Xanh) & Xe Xăng (Cam) đang di chuyển thời gian thực
  (state.evs || []).forEach(v => {
    const vx = toRadX(v.x);
    const vy = toRadY(v.y);
    if (vx < 0 || vx > mw || vy < 0 || vy > mh) return;
    mctx.fillStyle = v.isICE ? "#fb923c" : "#38bdf8";
    mctx.beginPath();
    mctx.arc(vx, vy, (mode === "ward" ? 2.1 : 1.2) * scaleFont, 0, Math.PI * 2);
    mctx.fill();
  });

  // Vẽ Lô Đang Đấu Giá Sổ Đỏ (Chấm Cam/Vàng phát sáng 🔨)
  if (window.mpState && window.mpState.activeAuction) {
    const aucLot = state.lots[window.mpState.activeAuction.lotId - 1];
    if (aucLot) {
      const ax = toRadX(aucLot.x);
      const ay = toRadY(aucLot.y);
      mctx.fillStyle = "#f97316";
      mctx.strokeStyle = "#fef08a";
      mctx.lineWidth = 1.5 * scaleFont;
      mctx.beginPath();
      mctx.arc(ax, ay, 4.4 * scaleFont, 0, Math.PI * 2);
      mctx.fill();
      mctx.stroke();
    }
  }

  // Vẽ nổi bật TẤT CẢ Lô Trạm Sạc Của Người Chơi (🟢 kèm số #Lô) & Lô Đang Chọn (🟡)
  state.lots.forEach(l => {
    if (!l.owned && l.id !== state.selectedLotId) return;
    const lx = toRadX(l.x);
    const ly = toRadY(l.y);
    if (lx < -20 || lx > mw + 20 || ly < -20 || ly > mh + 20) return;
    const isSel = l.id === state.selectedLotId;
    mctx.fillStyle = l.owned ? "#22c55e" : "#fde047";
    mctx.strokeStyle = isSel ? "#fde047" : "#ffffff";
    mctx.lineWidth = (isSel ? 2.1 : 1.4) * scaleFont;
    mctx.beginPath();
    mctx.arc(lx, ly, (l.owned ? 4.5 : 3.6) * scaleFont, 0, Math.PI * 2);
    mctx.fill();
    mctx.stroke();

    if (l.owned) {
      mctx.fillStyle = "#fef08a";
      mctx.font = `900 ${Math.round(6.0 * scaleFont)}px -apple-system, sans-serif`;
      mctx.textAlign = "center";
      mctx.fillText(`#${l.id}`, lx, ly - 5.5 * scaleFont);
    }
  });

  // Vòng radar đồng tâm & Tâm ngắm Camera ở chính giữa Đĩa Tròn
  mctx.strokeStyle = "rgba(56, 189, 248, 0.22)";
  mctx.lineWidth = 1.0 * scaleFont;
  [0.35, 0.70].forEach(ratio => {
    mctx.beginPath();
    mctx.arc(cx, cy, radius * ratio, 0, Math.PI * 2);
    mctx.stroke();
  });

  const halfWorldW = (vw / 2) / camera.zoom;
  const halfWorldH = (vh / 2) / camera.zoom;
  const rw = Math.max(10 * scaleFont, toRadLen(halfWorldW * 2));
  const rh = Math.max(8 * scaleFont, toRadLen(halfWorldH * 2));
  mctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
  mctx.lineWidth = 1.5 * scaleFont;
  mctx.strokeRect(cx - rw / 2, cy - rh / 2, rw, rh);

  // Tâm chữ thập vàng giữa Radar
  mctx.strokeStyle = "#fde047";
  mctx.lineWidth = 1.3 * scaleFont;
  mctx.beginPath();
  mctx.moveTo(cx - 5 * scaleFont, cy); mctx.lineTo(cx + 5 * scaleFont, cy);
  mctx.moveTo(cx, cy - 5 * scaleFont); mctx.lineTo(cx, cy + 5 * scaleFont);
  mctx.stroke();

  mctx.restore();

  // Viền Vòng La Bàn Hình Tròn Vàng Kim + 4 Hướng Bắc • Đông • Nam • Tây
  mctx.strokeStyle = "#fbbf24";
  mctx.lineWidth = 2.4 * scaleFont;
  mctx.beginPath();
  mctx.arc(cx, cy, radius, 0, Math.PI * 2);
  mctx.stroke();

  const dirs = isEn()
    ? [["N", cx, 9 * scaleFont], ["S", cx, mh - 4 * scaleFont], ["W", 8 * scaleFont, cy + 3 * scaleFont], ["E", mw - 8 * scaleFont, cy + 3 * scaleFont]]
    : [["B", cx, 9 * scaleFont], ["N", cx, mh - 4 * scaleFont], ["T", 8 * scaleFont, cy + 3 * scaleFont], ["Đ", mw - 8 * scaleFont, cy + 3 * scaleFont]];
  mctx.font = `900 ${Math.round(6.6 * scaleFont)}px -apple-system, sans-serif`;
  mctx.textAlign = "center";
  dirs.forEach(([lbl, dx, dy]) => {
    mctx.fillStyle = lbl === "N" || lbl === "B" ? "#ef4444" : "#fde047";
    mctx.fillText(lbl, dx, dy);
  });
}

/*****************************************************************************************
 * THAO TÁC MUA/THUÊ LÔ ĐẤT, MỞ RỘNG M² ĐẤT, LẮP TRỤ SẠC & MỞ TIỆN ÍCH 2.5D
 *****************************************************************************************/

// Đăng ký vào globalThis để tương thích ngược với HTML event handlers & các module liên kết
Object.assign(globalThis, {
  toggleRadarMinimap,
  setMinimapViewMode,
  toggleMinimapExpand,
  getActiveMinimapViewRadius,
  jumpFromMinimapEvent,
  drawMinimapRadar
});
