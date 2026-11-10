/**
 * src/systems/vehicle-physics.js
 * Hệ thống Tìm đường A* trên lưới phố, Đèn giao thông, Vật lý di chuyển xe & Bảo vệ đuổi xe xăng
 */
import { LANE_OFFSET, STOP_LINE_DIST } from "../data/balance.js";

export function getIntersectionLightState(vIdx, hIdx) {
  const cycle = 14.0;
  const phaseOffset = ((vIdx + hIdx) % 2) * (cycle / 2);
  const t = (trafficLightTimer + phaseOffset) % cycle;
  if (t < 5.2) return { ew: "GREEN", ns: "RED" };
  if (t < 6.2) return { ew: "YELLOW", ns: "RED" };
  if (t < 7.0) return { ew: "RED", ns: "RED" };
  if (t < 12.2) return { ew: "RED", ns: "GREEN" };
  if (t < 13.2) return { ew: "RED", ns: "YELLOW" };
  return { ew: "RED", ns: "RED" };
}

export function canTraverseGridEdge(v1, h1, v2, h2) {
  if (v2 === v1) {
    const road = V_ROADS[v1];
    const dy = h2 - h1;
    if (road.oneWay !== 0 && road.oneWay !== dy) return false;
    return true;
  }
  if (h2 === h1) {
    const road = H_ROADS[h1];
    const dx = v2 - v1;
    if (road.oneWay !== 0 && road.oneWay !== dx) return false;
    return true;
  }
  return false;
}

export function findGridNodePath(startV, startH, targetV, targetH) {
  const startKey = `${startV},${startH}`;
  const targetKey = `${targetV},${targetH}`;
  if (startKey === targetKey) return [{ v: startV, h: startH }];

  const queue = [[{ v: startV, h: startH }]];
  const visited = new Set([startKey]);

  while (queue.length > 0) {
    const path = queue.shift();
    const curr = path[path.length - 1];
    const neighbors = [
      { v: curr.v + 1, h: curr.h },
      { v: curr.v - 1, h: curr.h },
      { v: curr.v, h: curr.h + 1 },
      { v: curr.v, h: curr.h - 1 }
    ];
    for (const nb of neighbors) {
      if (nb.v < 0 || nb.v >= V_ROADS.length || nb.h < 0 || nb.h >= H_ROADS.length) continue;
      if (!canTraverseGridEdge(curr.v, curr.h, nb.v, nb.h)) continue;
      const k = `${nb.v},${nb.h}`;
      if (visited.has(k)) continue;
      const nextPath = [...path, nb];
      if (k === targetKey) return nextPath;
      visited.add(k);
      queue.push(nextPath);
    }
  }
  return [{ v: startV, h: startH }, { v: targetV, h: targetH }];
}



export function buildRightLaneWaypointsFromNodes(nodePath, secOx = 0, secOy = 0) {
  const wps = [];
  for (let i = 0; i < nodePath.length - 1; i++) {
    const a = nodePath[i];
    const b = nodePath[i + 1];
    const x1 = V_ROADS[a.v].x + secOx;
    const y1 = H_ROADS[a.h].y + secOy;
    const x2 = V_ROADS[b.v].x + secOx;
    const y2 = H_ROADS[b.h].y + secOy;

    const dx = Math.sign(x2 - x1);
    const dy = Math.sign(y2 - y1);
    const ox = -dy * LANE_OFFSET;
    const oy = dx * LANE_OFFSET;

    wps.push({
      x: x1 + ox + dx * 26,
      y: y1 + oy + dy * 26,
      kind: "INTERSECTION_EXIT",
      vIdx: a.v,
      hIdx: a.h,
      dirX: dx,
      dirY: dy
    });

    wps.push({
      x: x2 + ox - dx * STOP_LINE_DIST,
      y: y2 + oy - dy * STOP_LINE_DIST,
      kind: "STOP_LINE",
      vIdx: b.v,
      hIdx: b.h,
      dirX: dx,
      dirY: dy
    });
  }
  return wps;
}

/*****************************************************************************************
* QUY HOẠCH DIỆN TÍCH MẶT BẰNG V-GREEN
*****************************************************************************************/

export function stepRoadCarsPhysics(subDt, realSubDt) {
  for (let i = roadCars.length - 1; i >= 0; i--) {
    const rc = roadCars[i];
    const wp = rc.waypoints[rc.wpIndex];
    if (!wp) {
      roadCars.splice(i, 1);
      continue;
    }
    const dx = wp.x - rc.x;
    const dy = wp.y - rc.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 0.3) {
      rc.heading = Math.atan2(dy, dx);
    }
    rc.blinker = Boolean(wp.blinker);

    if (rc.ghostSec > 0) {
      rc.ghostSec = Math.max(0, rc.ghostSec - realSubDt);
    }

    let waitingAtRedLight = false;
    if (wp.kind === "STOP_LINE" && dist <= 20) {
      const light = getIntersectionLightState(wp.vIdx, wp.hIdx);
      const isMovingHorizontal = Math.abs(wp.dirX) >= Math.abs(wp.dirY);
      const mySignal = isMovingHorizontal ? light.ew : light.ns;
      if (mySignal !== "GREEN") {
        waitingAtRedLight = true;
      }
    }

    let blockedBySameLaneCar = false;
    const isClearingIntersectionOrGate = (
      wp.kind === "INTERSECTION_EXIT" ||
      wp.kind === "DRIVEWAY_IN" ||
      wp.kind === "DRIVEWAY_OUT" ||
      wp.kind === "MERGE_ROAD" ||
      wp.kind === "BAY_DOCK" ||
      wp.kind === "SCOOTER_SWAP_DOCK"
    );

    if (!isClearingIntersectionOrGate && rc.ghostSec <= 0 && dist > 1) {
      const ux = Math.cos(rc.heading);
      const uy = Math.sin(rc.heading);

      for (let j = 0; j < roadCars.length; j++) {
        if (i === j) continue;
        const other = roadCars[j];
        const otherUx = Math.cos(other.heading);
        const otherUy = Math.sin(other.heading);
        const sameDirDot = ux * otherUx + uy * otherUy;
        if (sameDirDot < 0.88) continue;

        const odx = other.x - rc.x;
        const ody = other.y - rc.y;
        const forwardProj = odx * ux + ody * uy;
        const lateralDist = Math.abs(-odx * uy + ody * ux);

        if (forwardProj > 2 && forwardProj < 25 && lateralDist < 6) {
          blockedBySameLaneCar = true;
          break;
        }
      }
    }

    if (waitingAtRedLight) {
      if (dist > 2) {
        const creep = Math.min(dist - 1, rc.speed * subDt);
        rc.x += (dx / dist) * creep;
        rc.y += (dy / dist) * creep;
      }
      rc.stuckSec = 0;
      continue;
    }

    if (blockedBySameLaneCar) {
      rc.stuckSec = (rc.stuckSec || 0) + realSubDt;
      if (rc.stuckSec > 3.5) {
        rc.ghostSec = 1.2;
        rc.stuckSec = 0;
      } else {
        continue;
      }
    } else {
      rc.stuckSec = 0;
    }

    const step = rc.speed * subDt;
    if (dist <= step) {
      rc.x = wp.x;
      rc.y = wp.y;

      // Nếu Xe Máy Điện chạm điểm Тủ Đổi Pin Nhanh (SCOOTER_SWAP_DOCK)
      if (wp.kind === "SCOOTER_SWAP_DOCK") {
        const swapLot = state.lots[(wp.lotId || 1) - 1];
        if (swapLot && swapLot.owned && !swapLot.lockedByDebt && swapLot.amenities && swapLot.amenities.doi_pin > 0) {
          const swapLvl = swapLot.amenities.doi_pin;
          const swapFee = 25000 + swapLvl * 15000;
          state.money += swapFee;
          state.totalRevenueAllTime += swapFee;
          state.totalProfitAllTime += swapFee;
          state.yearlyGrossRevenue += swapFee;
          state.yearlyOperatingProfit += swapFee;
          swapLot.monthlyAmenityRev = (swapLot.monthlyAmenityRev || 0) + swapFee;
          floatTexts.push({
            x: swapLot.x,
            y: swapLot.y - 22,
            text: L(`🛵🔋 Đổi pin +${formatCompactVND(swapFee)}`, `🛵🔋 Swap +${formatCompactVND(swapFee)}`),
            color: "#10b981",
            life: 1.4
          });
        }
      }

      rc.wpIndex++;
      if (rc.wpIndex >= rc.waypoints.length) {
        if (rc.destType === "player" || rc.destType === "ice_squat") {
          dockCarIntoBay(rc);
          roadCars.splice(i, 1);
        } else if (rc.destType === "commute" && Math.hypot(rc.x - camera.x, rc.y - camera.y) < 2500) {
          // Tự động nối tiếp lộ trình sang Quận/Phường kế tiếp để xe chạy xuyên liên quận không bao giờ biến mất đột ngột!
          if (rc.axis === "H") {
            const nextGx = (rc.curGx || 0) + (rc.dirSign || 1);
            if (nextGx >= 0 && nextGx <= 5) {
              const nextSec = SECTOR_GRID_LOOKUP[rc.curGy || 0][nextGx];
              if (nextSec) {
                const sV = (rc.dirSign || 1) > 0 ? 0 : 10;
                const eV = (rc.dirSign || 1) > 0 ? 10 : 0;
                const moreWps = buildRightLaneWaypointsFromNodes(findGridNodePath(sV, rc.roadIdx || 0, eV, rc.roadIdx || 0), nextSec.ox, nextSec.oy);
                if (moreWps.length > 0) {
                  rc.waypoints.push(...moreWps);
                  rc.curGx = nextGx;
                  continue;
                }
              }
            }
          } else if (rc.axis === "V") {
            const nextGy = (rc.curGy || 0) + (rc.dirSign || 1);
            if (nextGy >= 0 && nextGy <= 5) {
              const nextSec = SECTOR_GRID_LOOKUP[nextGy][rc.curGx || 0];
              if (nextSec) {
                const sH = (rc.dirSign || 1) > 0 ? 0 : 10;
                const eH = (rc.dirSign || 1) > 0 ? 10 : 0;
                const moreWps = buildRightLaneWaypointsFromNodes(findGridNodePath(rc.roadIdx || 0, sH, rc.roadIdx || 0, eH), nextSec.ox, nextSec.oy);
                if (moreWps.length > 0) {
                  rc.waypoints.push(...moreWps);
                  rc.curGy = nextGy;
                  continue;
                }
              }
            }
          }
          roadCars.splice(i, 1);
        } else {
          roadCars.splice(i, 1);
        }
      }
    } else {
      rc.x += (dx / dist) * step;
      rc.y += (dy / dist) * step;
    }
  }
}

export function initRandomSquatterPenalty(carObj) {
  carObj.state = "SQUATTING";
  carObj.currentFine = 150000;
  carObj.maxFineTarget = Math.round((1100000 + Math.random() * 850000) / 10000) * 10000;
  const randomStallSeconds = 4.0 + Math.random() * 7.0;
  carObj.fineRatePerSec = (carObj.maxFineTarget - carObj.currentFine) / randomStallSeconds;
  carObj.overstayMin = 30;
}

export function collectSquatterFineAndRelease(lot, bayIdx, fineAmount, reasonMode) {
  const bay = lot.bays[bayIdx];
  if (!bay || !bay.car) return;
  const fee = Math.round(fineAmount);
  const carModel = bay.car.model;

  state.money += fee;
  state.totalRevenueAllTime += fee;
  state.totalProfitAllTime += fee;
  state.yearlyGrossRevenue += fee;
  state.yearlyOperatingProfit += fee;

  const pos = getBayWorldPos(lot, bayIdx);
  const labelPrefix = reasonMode === "guard"
    ? L("👮 Bảo vệ phạt", "👮 Guard Fine")
    : (reasonMode === "manual" ? L("🚓 Phạt", "🚓 Fine") : L("🚨 Tự nộp phạt", "🚨 Auto Fine"));
  floatTexts.push({
    x: pos.x,
    y: pos.y - 12,
    text: `${labelPrefix} +${formatCompactVND(fee)}`,
    color: "#dc2626",
    life: 2.0
  });

  const carNameDisp = getItemName(carModel);
  const lotNameDisp = getLotDisplayName(lot);
  if (reasonMode === "auto") {
    logEvent(L(
      `🚨 Chủ xe ${carNameDisp} tại ${lotNameDisp} (Trụ #${bayIdx + 1}) tự nộp phạt ${formatVND(fee)} và đánh xe rời đi!`,
      `🚨 ${carNameDisp} owner at ${lotNameDisp} (Bay #${bayIdx + 1}) paid ${formatVND(fee)} overstay fine and departed!`
    ));
  } else if (reasonMode === "guard") {
    logEvent(L(
      `👮 Bảo vệ tại ${lotNameDisp} đã thu khoản phạt ${formatVND(fee)} từ xe ${carNameDisp} và giải phóng Trụ #${bayIdx + 1}!`,
      `👮 Security Guard at ${lotNameDisp} collected ${formatVND(fee)} fine from ${carNameDisp} and freed Bay #${bayIdx + 1}!`
    ));
  } else {
    logEvent(L(
      `🚓 Đã thu tiền phạt chiếm chỗ ${formatVND(fee)} và giải phóng Trụ #${bayIdx + 1} tại ${lotNameDisp}!`,
      `🚓 Collected ${formatVND(fee)} overstay fine and freed Bay #${bayIdx + 1} at ${lotNameDisp}!`
    ));
  }

  bay.car = null;
  bay.incomingCarId = null;
  if (roadCars.length < 64) {
    spawnExitingCarFromLot(lot, bayIdx, carModel);
  }
  refreshAllUI();
}

export function chaseAwayIceSquatter(lotId, bayIdx, reasonMode = "manual") {
  const lot = state.lots[lotId - 1] || state.lots.find(l => l.id === lotId);
  if (!lot) return;
  const bay = lot.bays[bayIdx];
  if (!bay || !bay.car || bay.car.state !== "ICE_SQUATTING") return;

  const carModel = bay.car.model;
  const carNameDisp = getItemName(carModel);
  const lotNameDisp = getLotDisplayName(lot);
  const pos = getBayWorldPos(lot, bayIdx);
  floatTexts.push({
    x: pos.x,
    y: pos.y - 14,
    text: reasonMode === "guard"
      ? L("👮 Bảo vệ đuổi Xe Xăng (+15đ thu hút!)", "👮 Guard Evicted Gas Car (+15pt!)")
      : L("📢 Đã đuổi Xe Xăng (+15đ thu hút!)", "📢 Evicted Gas Car (+15pt!)"),
    color: "#0284c7",
    life: 2.1
  });

  if (reasonMode === "guard") {
    logEvent(L(
      `👮 Bảo vệ tại ${lotNameDisp} đã tự động xua đuổi ${carNameDisp} đỗ lấn Trụ #${bayIdx + 1} (Khôi phục +15đ thu hút)!`,
      `👮 Guard at ${lotNameDisp} automatically evicted ${carNameDisp} from Bay #${bayIdx + 1} (Restored +15pt appeal)!`
    ));
  } else if (reasonMode === "manual") {
    if (typeof playSfx === "function") playSfx("click");
    if (typeof triggerHaptic === "function") triggerHaptic(22);
    logEvent(L(
      `📢 Bạn đã đuổi ${carNameDisp} đỗ lấn Trụ #${bayIdx + 1} tại ${lotNameDisp} (0 G$ • Khôi phục +15đ thu hút trạm)!`,
      `📢 You evicted ${carNameDisp} blocking Bay #${bayIdx + 1} at ${lotNameDisp} (0 G$ • Restored +15pt station appeal)!`
    ));
  }

  bay.car = null;
  bay.incomingCarId = null;
  if (roadCars.length < 64) {
    spawnExitingCarFromLot(lot, bayIdx, carModel);
  }
  refreshAllUI();
}


export function dockCarIntoBay(rc) {
  const lot = state.lots[rc.lotId - 1] || state.lots.find(l => l.id === rc.lotId);
  if (!lot || !lot.owned || lot.lockedByDebt) return;
  let bay = lot.bays.find(b => b.id === rc.bayId);
  if (!bay || bay.car) bay = lot.bays.find(b => b.tier > 0 && !b.car);
  if (!bay) return;
  bay.incomingCarId = null;

  if (rc.destType === "ice_squat" || (rc.model && rc.model.isICE)) {
    bay.car = {
      model: rc.model,
      needKwh: 0,
      chargedKwh: 0,
      state: "ICE_SQUATTING",
      guardChaseTimer: lot.hasGuard ? 3.5 : 999999,
      overstayMin: 0,
      currentFine: 0,
      maxFineTarget: 0,
      fineRatePerSec: 0
    };
    const pos = getBayWorldPos(lot, bay.id);
    floatTexts.push({
      x: pos.x,
      y: pos.y - 16,
      text: L(`⛽ Xe Xăng lấn chỗ (-15đ thu hút!)`, `⛽ Gas Car Squatting (-15pt appeal!)`),
      color: "#f97316",
      life: 2.2
    });
    logEvent(L(
      `⛽ Cảnh báo: ${getItemName(rc.model)} vừa đỗ lấn chiếm Trụ #${bay.id + 1} tại ${getLotDisplayName(lot)}! Không thu được tiền sạc và bị giảm -15đ thu hút (${lot.hasGuard ? "Bảo vệ đang ra đuổi..." : "Hãy bấm vào xe để đuổi ngay!"}).`,
      `⛽ Alert: ${getItemName(rc.model)} illegally parked in Bay #${bay.id + 1} at ${getLotDisplayName(lot)}! Zero charging revenue & -15pt appeal penalty (${lot.hasGuard ? "Guard is evicting..." : "Tap the car to evict immediately!"}).`
    ));
    refreshAllUI();
    return;
  }

  bay.car = {
    model: rc.model,
    needKwh: rc.needKwh,
    chargedKwh: 0,
    state: "CHARGING",
    overstayMin: 0,
    currentFine: 0,
    maxFineTarget: 0,
    fineRatePerSec: 0
  };
}

export function fineAndTowSquatter(lotId, bayIdx) {
  const lot = state.lots[lotId - 1] || state.lots.find(l => l.id === lotId);
  if (!lot) return;
  const bay = lot.bays[bayIdx];
  if (!bay || !bay.car) return;
  if (bay.car.state === "ICE_SQUATTING") {
    chaseAwayIceSquatter(lotId, bayIdx, "manual");
    return;
  }
  if (bay.car.state !== "SQUATTING") return;

  const fee = Math.max(bay.car.currentFine || 1100000, bay.car.maxFineTarget || 1350000);
  collectSquatterFineAndRelease(lot, bayIdx, fee, "manual");
  saveGameToStorage(false);
  refreshAllUI();
}

/*****************************************************************************************
 * ENGINE ĐỒ HOẠ TRUE 3D ISOMETRIC (DỰNG KHỐI Z THẲNG ĐỨNG + DEPTH-SORTING GIỐNG HỆT ẢNH CONCEPT ART)
 * - Thay vì chỉ xoay mặt phẳng 2D làm tòa nhà bị bẹp xuống sàn, mọi công trình nay được chiếu
 *   qua hàm `isoPt(wx, wy, wz)` với trục chiều cao `wz` dựng THẲNG ĐỨNG vuông góc màn hình!
 * - Tất cả công trình, tháp tròn Bốt Hàng Đậu, 2 tháp chuông Nhà Thờ Lớn, mái vòm Nhà Hát Lớn,
 *   5 mái tam giác Chợ Đồng Xuân, biệt thự chữ L mái Mansard, trạm sạc và cây xanh đều được
 *   sắp xếp thứ tự vẽ từ xa đến gần (Painter's Algorithm Depth-Sorting) che khuất 3D tự nhiên.
 * - Trạm của bạn (🟢 OUR STATION): Có 4 bức tường ánh sáng Xanh Lục Bảo bán trong suốt dựng đứng
 *   quanh mép lô đất + Mái Solar Canopy 3D + Thẻ Callout nổi nằm ngang có thanh tiến độ xanh.
 * - Trạm đối thủ (🔴 RIVAL STATION): Có 4 bức tường ánh sáng Đỏ San Hô nhẹ dựng đứng + Thẻ nổi đỏ.
 * - Lô chưa mở (⚪ BUY PLOT): Ô kim cương xám sáng viền nét đứt mảnh + Thẻ nổi `➕ MỞ LÔ`.
 *****************************************************************************************/

// Đăng ký vào globalThis để tương thích ngược với HTML event handlers & các module liên kết
Object.assign(globalThis, {
  getIntersectionLightState,
  canTraverseGridEdge,
  findGridNodePath,
  buildRightLaneWaypointsFromNodes,
  stepRoadCarsPhysics,
  initRandomSquatterPenalty,
  collectSquatterFineAndRelease,
  chaseAwayIceSquatter,
  dockCarIntoBay,
  fineAndTowSquatter
});
