/**
 * src/render/dirty-tracker.js
 * HỆ THỐNG TỐI ƯU HIỆU NĂNG RENDER CANVAS 2.5D & VIEWPORT DIRTY TRACKER (BƯỚC 3.2 BÁO CÁO)
 * Bao gồm:
 * 1. Theo dõi trạng thái thay đổi Camera & Ánh sáng (Viewport Signature & Dirty Flag)
 * 2. Bộ kiểm tra Frustum / Viewport Culling nhanh cho các thực thể 2.5D ngoài màn hình
 * 3. Thống kê hiệu năng thời gian thực (Frame Time ms, FPS, Culling Ratio, Static Cache Hits)
 */

export const renderPerfStats = {
  lastFrameTimeMs: 1.8,
  avgFrameTimeMs: 2.1,
  staticCacheHits: 0,
  staticCacheMisses: 0,
  culledEntitiesLastFrame: 0,
  drawnEntitiesLastFrame: 0,
  lastCameraSignature: "",
  viewportDirty: true
};

export function computeViewportSignature(cam, vw, vh, isoView, isNightNow, districtIdx, wardIdx) {
  const cx = Math.round((cam && cam.x) || 0);
  const cy = Math.round((cam && cam.y) || 0);
  const cz = Math.round(((cam && cam.zoom) || 1) * 100);
  return `${cx}_${cy}_${cz}_${vw}x${vh}_${isoView ? 1 : 0}_${isNightNow ? 1 : 0}_D${districtIdx || 0}W${wardIdx || 0}`;
}

export function checkAndUpdateViewportDirty(cam, vw, vh, isoView, isNightNow, districtIdx, wardIdx) {
  const sig = computeViewportSignature(cam, vw, vh, isoView, isNightNow, districtIdx, wardIdx);
  if (sig !== renderPerfStats.lastCameraSignature) {
    renderPerfStats.lastCameraSignature = sig;
    renderPerfStats.viewportDirty = true;
    renderPerfStats.staticCacheMisses++;
    return true;
  }
  renderPerfStats.viewportDirty = false;
  renderPerfStats.staticCacheHits++;
  return false;
}

export function isWorldPointInViewport(wx, wy, cam, vw, vh, marginPx = 280) {
  if (!cam) return true;
  const zoom = cam.zoom || 1;
  const halfW = (vw || 420) / (2 * zoom) + marginPx;
  const halfH = (vh || 800) / (2 * zoom) + marginPx;
  return Math.abs(wx - cam.x) <= halfW && Math.abs(wy - cam.y) <= halfH;
}

export function recordRenderFrameTiming(durationMs, drawnCount = 0, culledCount = 0) {
  const safeMs = Math.max(0.1, Math.min(100, Number(durationMs) || 1.5));
  renderPerfStats.lastFrameTimeMs = Math.round(safeMs * 100) / 100;
  renderPerfStats.avgFrameTimeMs = Math.round((renderPerfStats.avgFrameTimeMs * 0.85 + safeMs * 0.15) * 100) / 100;
  renderPerfStats.drawnEntitiesLastFrame = drawnCount;
  renderPerfStats.culledEntitiesLastFrame = culledCount;
  return renderPerfStats;
}

export function getRenderOptimizationSummary() {
  const totalChecks = Math.max(1, renderPerfStats.staticCacheHits + renderPerfStats.staticCacheMisses);
  const cacheHitRatePct = Math.round((renderPerfStats.staticCacheHits / totalChecks) * 100);
  return {
    avgFrameTimeMs: renderPerfStats.avgFrameTimeMs,
    cacheHitRatePct,
    staticCacheHits: renderPerfStats.staticCacheHits,
    staticCacheMisses: renderPerfStats.staticCacheMisses,
    viewportDirty: renderPerfStats.viewportDirty
  };
}

Object.assign(globalThis, {
  renderPerfStats,
  computeViewportSignature,
  checkAndUpdateViewportDirty,
  isWorldPointInViewport,
  recordRenderFrameTiming,
  getRenderOptimizationSummary
});
