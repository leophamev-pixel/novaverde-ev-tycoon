/**
 * src/render/iso-utils.js
 * Các hàm Toán học Chiếu trục đo Isometric 2.5D, Nội suy tứ giác, Ánh sáng Ngày/Đêm & Mức độ chi tiết (LOD)
 */
import { ISO_ROT_RAD, ISO_SCALE_Y } from "../data/balance.js";

// Hàm chiếu 3D Isometric thực thụ: (wx, wy) nằm trên mặt đất kim cương, còn chiều cao wz dựng THẲNG ĐỨNG!
export function isoPt(wx, wy, wz = 0) {
  const dx = wx - camera.x;
  const dy = wy - camera.y;
  if (!state.isoView) {
    return { x: dx, y: dy - wz * 0.72 };
  }
  const cosA = Math.cos(ISO_ROT_RAD);
  const sinA = Math.sin(ISO_ROT_RAD);
  return {
    x: dx * cosA - dy * sinA,
    y: (dx * sinA + dy * cosA) * ISO_SCALE_Y - wz
  };
}

// Nội suy điểm trên mặt tường 3D tứ giác (p00: đáy trái, p10: đáy phải, p11: đỉnh phải, p01: đỉnh trái)
export function quadLerp(p00, p10, p11, p01, u, v) {
  const bx = p00.x + (p10.x - p00.x) * u;
  const by = p00.y + (p10.y - p00.y) * u;
  const tx = p01.x + (p11.x - p01.x) * u;
  const ty = p01.y + (p11.y - p01.y) * u;
  return {
    x: bx + (tx - bx) * v,
    y: by + (ty - by) * v
  };
}

export function fillStrokePoly(pts, fillCol, strokeCol = "#1e293b", lineW = 1.3) {
  if (!pts || pts.length < 3) return;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
  if (fillCol) {
    ctx.fillStyle = fillCol;
    ctx.fill();
  }
  if (strokeCol && lineW > 0) {
    ctx.strokeStyle = strokeCol;
    ctx.lineWidth = lineW;
    ctx.stroke();
  }
}

// Sinh tự động 16 kiểu Quần thể Kiến trúc Thương mại, Nhà hàng, Giải trí, Thể thao & Tiểu cảnh Trang trí 3D rải đều khắp các ô phố

export function getLightingEnvironment() {
  const hour = state.simMinute / 60;
  if (state.weatherMode === "night") {
    return { isNight: true, isDusk: false, ambientAlpha: 0.14, ambientColor: "#0f172a" };
  }
  if (state.weatherMode === "sunny") {
    return { isNight: false, isDusk: false, ambientAlpha: 0, ambientColor: "#000" };
  }
  if (hour >= 19.0 || hour < 5.5) {
    return { isNight: true, isDusk: false, ambientAlpha: 0.14, ambientColor: "#0f172a" };
  }
  if (hour >= 16.5 && hour < 19.0) {
    return { isNight: false, isDusk: true, ambientAlpha: 0.06, ambientColor: "#475569" };
  }
  return { isNight: false, isDusk: false, ambientAlpha: 0, ambientColor: "#000" };
}

// Kiểm tra Frustum Culling thông minh để 150 Lô + 7 Công Viên + 30 Tòa Tháp luôn mượt 60 FPS
export function isIsoVisible(wx, wy, vw, vh, pad = 260) {
  const p = isoPt(wx, wy, 0);
  const halfW = (vw / 2) / camera.zoom + pad;
  const halfH = (vh / 2) / camera.zoom + pad;
  return Math.abs(p.x) <= halfW && Math.abs(p.y) <= halfH;
}

// V2 MOBILE 60 FPS OPTIMIZATION: BỘ NHỚ ĐỆM MẶT ĐẤT TĨNH (OFFSCREEN STATIC GROUND BAKING) & 3 MỨC ZOOM LOD
export const staticGroundCache = {
  dayCanvas: null,
  nightCanvas: null
};

export function getSemanticZoomLOD() {
  if (camera.zoom < 0.54) return 1; // LOD 1: Toàn cảnh Chiến lược (Strategic Overview)
  if (camera.zoom <= 1.05) return 2; // LOD 2: Quản lý Khu phố (District Management)
  return 3; // LOD 3: Cận cảnh Trạm sạc (Close-Up Inspector + Walking Pedestrians)
}


// Đăng ký vào globalThis để tương thích ngược với HTML event handlers & các module liên kết
Object.assign(globalThis, {
  isoPt,
  quadLerp,
  fillStrokePoly,
  getLightingEnvironment,
  isIsoVisible,
  getSemanticZoomLOD,
  staticGroundCache
});
