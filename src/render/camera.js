/**
 * src/render/camera.js
 * Quản lý Camera bản đồ, Phóng to/Thu nhỏ (Zoom), Chuyển đổi tọa độ Màn hình <-> Thế giới & Bắt sự kiện chạm
 */

globalThis.camera = {
  x: -280,
  y: -180,
  zoom: 0.65,
  minZoom: 0.22,
  maxZoom: 1.65,
  isDragging: false,
  dragMoved: false,
  lastX: 0,
  lastY: 0,
  pinchDist: null
};

export function bindCanvasElements() {
  globalThis.canvas = document.getElementById("hanoiCanvas");
  globalThis.ctx = globalThis.canvas ? globalThis.canvas.getContext("2d") : null;
  globalThis.minimapCanvas = document.getElementById("minimapCanvas");
  globalThis.mctx = globalThis.minimapCanvas ? globalThis.minimapCanvas.getContext("2d") : null;
}
bindCanvasElements();

export function resizeCanvas() {
  const wrap = document.getElementById("canvas-wrap");
  const dpr = window.devicePixelRatio || 1;
  canvas.width = wrap.clientWidth * dpr;
  canvas.height = wrap.clientHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", resizeCanvas);

// Chuyển đổi chính xác từ tọa độ Màn hình (sx, sy) sang tọa độ Thế giới (wx, wy) ở cả chế độ Isometric 2.5D và Phẳng!
export function screenToWorld(sx, sy) {
  const wrap = document.getElementById("canvas-wrap");
  const cx = wrap.clientWidth / 2;
  const cy = wrap.clientHeight / 2;
  let dx = (sx - cx) / camera.zoom;
  let dy = (sy - cy) / camera.zoom;

  if (state.isoView) {
    dy = dy / ISO_SCALE_Y;
    const cosA = Math.cos(-ISO_ROT_RAD);
    const sinA = Math.sin(-ISO_ROT_RAD);
    const rx = dx * cosA - dy * sinA;
    const ry = dx * sinA + dy * cosA;
    dx = rx;
    dy = ry;
  }

  return {
    x: dx + camera.x,
    y: dy + camera.y
  };
}

export function stepZoom(delta) {
  camera.zoom = Math.max(camera.minZoom, Math.min(camera.maxZoom, camera.zoom + delta));
}

export function resetMapCamera() {
  camera.x = -40;
  camera.y = 0;
  camera.zoom = 0.28;
}

export function zoomToLot(lotId) {
  const lot = state.lots.find(l => l.id === lotId);
  if (!lot) return;
  camera.x = lot.x;
  camera.y = state.sheetMode === "minimized" ? lot.y : lot.y + 85;
  camera.zoom = 0.85;
}


// V2 MOBILE UX: QUÁN TÍNH VUỐT BẢN ĐỒ MƯỢT (INERTIAL SCROLLING) & CHỤM 2 NGÓN PHÓNG TO/THU NHỎ
camera.vx = 0;
camera.vy = 0;

canvas.addEventListener("pointerdown", e => {
  camera.isDragging = true;
  camera.dragMoved = false;
  camera.lastX = e.clientX;
  camera.lastY = e.clientY;
  camera.vx = 0;
  camera.vy = 0;
});

window.addEventListener("pointermove", e => {
  if (!camera.isDragging) return;
  const sdx = e.clientX - camera.lastX;
  const sdy = e.clientY - camera.lastY;
  if (Math.abs(sdx) > 4 || Math.abs(sdy) > 4) camera.dragMoved = true;

  let wdx = sdx / camera.zoom;
  let wdy = sdy / camera.zoom;
  if (state.isoView) {
    wdy = wdy / ISO_SCALE_Y;
    const cosA = Math.cos(-ISO_ROT_RAD);
    const sinA = Math.sin(-ISO_ROT_RAD);
    const rx = wdx * cosA - wdy * sinA;
    const ry = wdx * sinA + wdy * cosA;
    wdx = rx;
    wdy = ry;
  }

  camera.x -= wdx;
  camera.y -= wdy;
  camera.vx = -wdx * 0.85;
  camera.vy = -wdy * 0.85;
  camera.x = Math.max(WORLD_BOUNDS.minX, Math.min(WORLD_BOUNDS.maxX, camera.x));
  camera.y = Math.max(WORLD_BOUNDS.minY, Math.min(WORLD_BOUNDS.maxY, camera.y));
  camera.lastX = e.clientX;
  camera.lastY = e.clientY;
});

window.addEventListener("pointerup", e => {
  if (camera.isDragging && !camera.dragMoved && e.target === canvas) {
    handleCanvasTap(e);
  }
  camera.isDragging = false;
});

canvas.addEventListener("wheel", e => {
  e.preventDefault();
  const factor = e.deltaY > 0 ? 0.9 : 1.11;
  camera.zoom = Math.max(camera.minZoom, Math.min(camera.maxZoom, camera.zoom * factor));
}, { passive: false });

canvas.addEventListener("touchmove", e => {
  if (e.touches.length === 2) {
    e.preventDefault();
    camera.vx = 0;
    camera.vy = 0;
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.hypot(dx, dy);
    if (camera.pinchDist) {
      const ratio = dist / camera.pinchDist;
      camera.zoom = Math.max(camera.minZoom, Math.min(camera.maxZoom, camera.zoom * ratio));
    }
    camera.pinchDist = dist;
  }
}, { passive: false });
canvas.addEventListener("touchend", () => { camera.pinchDist = null; });

export function handleCanvasTap(e) {
  document.getElementById("tools-popover").classList.remove("show");
  document.getElementById("btn-toggle-tools").classList.remove("active-tool");

  const rect = canvas.getBoundingClientRect();
  const sx = e.clientX - rect.left;
  const sy = e.clientY - rect.top;
  const w = screenToWorld(sx, sy);

  const tapSec = getSectorAtWorldPos(w.x, w.y);
  const nearLots = SECTOR_LOTS_MAP[tapSec.sIdx] || [];
  const nearRivals = SECTOR_RIVALS_MAP[tapSec.sIdx] || RIVAL_STATIONS;

  for (const lot of nearLots) {
    if (!lot.owned || lot.lockedByDebt) continue;
    for (let i = 0; i < lot.bays.length; i++) {
      const bay = lot.bays[i];
      if (bay.car && (bay.car.state === "SQUATTING" || bay.car.state === "ICE_SQUATTING")) {
        const pos = getBayWorldPos(lot, i);
        if (Math.hypot(w.x - pos.x, w.y - pos.y) < 30) {
          if (bay.car.state === "ICE_SQUATTING") {
            chaseAwayIceSquatter(lot.id, i, "manual");
          } else {
            fineAndTowSquatter(lot.id, i);
          }
          return;
        }
      }
    }
  }

  for (const rv of nearRivals) {
    if (Math.abs(w.x - rv.x) < 82 && Math.abs(w.y - rv.y) < 56) {
      state.sheetMode = "normal";
      applySheetModeUI();
      openDockTab("tab-rivals", document.getElementById("btn-tab-rivals"));
      state.sheetMode = "normal";
      applySheetModeUI();
      logEvent(L(`⚔️ Đang xem đối thủ: ${rv.name} (🚕Taxi: ${rv.taxiAppeal}đ | 🚗Thường: ${rv.casualAppeal}đ).`, `⚔️ Viewing rival: ${rv.nameEn || rv.name} (🚕Taxi: ${rv.taxiAppeal}pt | 🚗Casual: ${rv.casualAppeal}pt).`));
      return;
    }
  }

  for (const lot of nearLots) {
    const dim = getLotBoxDimensions(lot);
    if (Math.abs(w.x - lot.x) < dim.w / 2 + 14 && Math.abs(w.y - lot.y) < dim.h / 2 + 18) {
      if (window.mpState) {
        window.mpState.currentDistrictIdx = lot.districtIdx;
        window.mpState.currentWardIdx = lot.wardIdx;
      }
      selectLot(lot.id, false);
      if (state.sheetMode === "minimized") {
        state.sheetMode = "normal";
        applySheetModeUI();
      }
      return;
    }
  }

  if (state.sheetMode !== "minimized") {
    state.sheetMode = "minimized";
    applySheetModeUI();
  }
}


// Đăng ký vào globalThis để tương thích ngược với HTML event handlers & các module liên kết
Object.assign(globalThis, {
  resizeCanvas,
  screenToWorld,
  stepZoom,
  resetMapCamera,
  zoomToLot,
  handleCanvasTap,
  bindCanvasElements
});
