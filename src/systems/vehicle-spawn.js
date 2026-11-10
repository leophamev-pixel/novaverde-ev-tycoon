/**
 * src/systems/vehicle-spawn.js
 * Hệ thống Sinh phương tiện giao thông (EV, Taxi, Xe xăng chiếm chỗ, Xe máy) & Tọa độ Chuồng sạc
 */
export function getLotBoxDimensions(lot) {
  const cols = Math.min(4, Math.max(2, Math.ceil(lot.bays.length / 2)));
  const rows = Math.ceil(lot.bays.length / cols);
  const extraAreaBonusW = (lot.expansionCount || 0) * 8;
  const w = Math.max(136, cols * 34 + 36 + extraAreaBonusW);
  const h = Math.max(108, rows * 34 + 54);
  return { w, h, cols, rows };
}

export function getBayWorldPos(lot, bayIndex) {
  const dim = getLotBoxDimensions(lot);
  const col = bayIndex % dim.cols;
  const row = Math.floor(bayIndex / dim.cols);
  const startX = lot.x - ((dim.cols - 1) * 32) / 2;
  const startY = lot.y - ((dim.rows - 1) * 32) / 2 + 19;
  return { x: startX + col * 32, y: startY + row * 32 };
}

/*****************************************************************************************
 * SINH PHƯƠNG TIỆN LIÊN THÔNG XUYÊN 36 PHƯỜNG (XE ĐIỆN + XE XĂNG + XE MÁY ĐIỆN ĐỔI PIN)
 *****************************************************************************************/
export function spawnCrossSectorCommuterOrScooter(tl) {
  const curCamSec = getSectorAtWorldPos(camera.x, camera.y);
  const isEVRoll = (Math.random() * 100) < tl.evSharePct;
  const isScooterRoll = Math.random() < 0.45;

  let model;
  if (isScooterRoll) {
    const pool = SCOOTER_MODELS.filter(m => m.isICE === !isEVRoll);
    model = pool[Math.floor(Math.random() * pool.length)] || SCOOTER_MODELS[0];
  } else if (!isEVRoll) {
    model = ICE_CAR_MODELS[Math.floor(Math.random() * ICE_CAR_MODELS.length)];
  } else {
    model = EV_MODELS[Math.floor(Math.random() * EV_MODELS.length)];
  }

  // 1. Nếu là Xe Máy Điện và người chơi có Tủ Đổi Pin Nhanh (doi_pin > 0), ưu tiên ghé đổi pin trả tiền tươi!
  if (model.isScooter && !model.isICE) {
    const swapLots = state.lots.filter(l => l.owned && !l.lockedByDebt && l.amenities && l.amenities.doi_pin > 0);
    if (swapLots.length > 0 && Math.random() < 0.65) {
      const lot = swapLots[Math.floor(Math.random() * swapLots.length)];
      const secOx = lot.ox || 0;
      const secOy = lot.oy || 0;
      const startV = Math.random() < 0.5 ? 0 : 10;
      const startH = Math.floor(Math.random() * 11);
      const approachV = startV === 0 ? lot.vLeftIdx : lot.vRightIdx;
      const exitV = startV === 0 ? 10 : 0;
      const laneY = lot.roadY + (startV === 0 ? 1 : -1) * LANE_OFFSET;

      const pathIn = findGridNodePath(startV, startH, approachV, lot.roadHIdx);
      const pathOut = findGridNodePath(lot.vRightIdx, lot.roadHIdx, exitV, lot.roadHIdx);
      const fullWps = [
        ...buildRightLaneWaypointsFromNodes(pathIn, secOx, secOy),
        { x: lot.inGateX, y: laneY, kind: "TURN_INTO_GATE", dirX: 1, dirY: 0, blinker: true },
        { x: lot.x, y: lot.y - 12, kind: "SCOOTER_SWAP_DOCK", lotId: lot.id, dirX: 1, dirY: 0, blinker: true },
        { x: lot.outGateX, y: laneY, kind: "MERGE_ROAD", dirX: 1, dirY: 0, blinker: true },
        ...buildRightLaneWaypointsFromNodes(pathOut, secOx, secOy)
      ];
      if (fullWps.length > 0) {
        roadCars.push({
          id: carIdSeq++,
          model,
          needKwh: 3,
          chargedKwh: 0,
          x: fullWps[0].x,
          y: fullWps[0].y,
          heading: 0,
          blinker: false,
          stuckSec: 0,
          ghostSec: 0,
          waypoints: fullWps,
          wpIndex: 0,
          destType: "scooter_swap",
          lotId: lot.id,
          speed: 148 + Math.random() * 25
        });
        return;
      }
    }
  }

  // 2. Nếu là Ô tô Xăng (isICE && !isScooter), có xác suất tự ý phi vào đỗ lấn chiếm chuồng sạc (ICE_SQUATTING - Không thu tiền nhưng làm giảm -15đ thu hút!)
  if (model.isICE && !model.isScooter && Math.random() < (tl.iceSquatProb || 0.09)) {
    const openPlayerLots = state.lots.filter(l => l.owned && !l.lockedByDebt && l.bays.some(b => b.tier > 0 && !b.car && !b.incomingCarId));
    if (openPlayerLots.length > 0) {
      const lot = openPlayerLots[Math.floor(Math.random() * openPlayerLots.length)];
      const freeBay = lot.bays.find(b => b.tier > 0 && !b.car && !b.incomingCarId);
      if (freeBay) {
        const newCarId = carIdSeq++;
        freeBay.incomingCarId = newCarId;
        const secOx = lot.ox || 0;
        const secOy = lot.oy || 0;
        const hRoad = H_ROADS[lot.roadHIdx];
        const enterFromLeft = hRoad.oneWay === 1 ? true : (hRoad.oneWay === -1 ? false : (Math.random() < 0.5));
        const approachV = enterFromLeft ? lot.vLeftIdx : lot.vRightIdx;
        const travelDirX = enterFromLeft ? 1 : -1;
        const laneY = lot.roadY + travelDirX * LANE_OFFSET;
        const nodePath = findGridNodePath(enterFromLeft ? 0 : 10, lot.roadHIdx, approachV, lot.roadHIdx);
        const roadWps = buildRightLaneWaypointsFromNodes(nodePath, secOx, secOy);
        const targetPos = getBayWorldPos(lot, freeBay.id);
        const fullWps = [
          ...roadWps,
          { x: V_ROADS[approachV].x + secOx + travelDirX * 26, y: laneY, kind: "INTERSECTION_EXIT", dirX: travelDirX, dirY: 0, blinker: false },
          { x: lot.inGateX, y: laneY, kind: "TURN_INTO_GATE", dirX: travelDirX, dirY: 0, blinker: true },
          { x: lot.inGateX, y: lot.y, kind: "DRIVEWAY_IN", dirX: 0, dirY: Math.sign(lot.y - laneY), blinker: true },
          { x: targetPos.x, y: targetPos.y, kind: "BAY_DOCK", dirX: 0, dirY: -1, blinker: false }
        ];
        if (fullWps.length > 0) {
          roadCars.push({
            id: newCarId,
            model,
            needKwh: 0,
            chargedKwh: 0,
            x: fullWps[0].x,
            y: fullWps[0].y,
            heading: 0,
            blinker: false,
            stuckSec: 0,
            ghostSec: 0,
            waypoints: fullWps,
            wpIndex: 0,
            destType: "ice_squat",
            lotId: lot.id,
            bayId: freeBay.id,
            speed: 132
          });
          return;
        }
      }
    }
  }

  // 3. Phương tiện di chuyển Liên Thông Xuyên Phường/Quận (Cross-District Multi-Sector Highway Flow):
  // Sinh xe ngay gần vùng Camera hoặc sát vạch ranh giới Quận và chạy xuyên qua 2-3 Quận/Phường liên tiếp!
  const horizFlow = Math.random() < 0.52;
  const secOx = curCamSec.ox;
  const secOy = curCamSec.oy;

  if (horizFlow) {
    const hIdx = Math.floor(Math.random() * H_ROADS.length);
    const hRoad = H_ROADS[hIdx];
    const goEast = hRoad.oneWay === 1 ? true : (hRoad.oneWay === -1 ? false : (Math.random() < 0.5));
    // Điểm xuất phát linh hoạt (từ giữa Phường hoặc sát biên giới Phường trước) để luôn thấy xe băng qua vạch ranh giới Quận!
    const startV = goEast ? (Math.random() < 0.65 ? Math.floor(Math.random() * 8) + 2 : 0) : (Math.random() < 0.65 ? Math.floor(Math.random() * 8) + 1 : 10);
    const endV = goEast ? 10 : 0;
    const nextStartV = goEast ? 0 : 10;
    const stepGx = goEast ? 1 : -1;
    const nextGx1 = Math.max(0, Math.min(5, curCamSec.gx + stepGx));
    const nextGx2 = Math.max(0, Math.min(5, curCamSec.gx + stepGx * 2));
    const nextSec1 = SECTOR_GRID_LOOKUP[curCamSec.gy][nextGx1] || curCamSec;
    const nextSec2 = SECTOR_GRID_LOOKUP[curCamSec.gy][nextGx2] || nextSec1;

    const wps1 = buildRightLaneWaypointsFromNodes(findGridNodePath(startV, hIdx, endV, hIdx), secOx, secOy);
    const wps2 = nextSec1.sIdx !== curCamSec.sIdx
      ? buildRightLaneWaypointsFromNodes(findGridNodePath(nextStartV, hIdx, endV, hIdx), nextSec1.ox, nextSec1.oy)
      : [];
    const wps3 = (nextSec2.sIdx !== nextSec1.sIdx)
      ? buildRightLaneWaypointsFromNodes(findGridNodePath(nextStartV, hIdx, endV, hIdx), nextSec2.ox, nextSec2.oy)
      : [];
    const fullWps = [...wps1, ...wps2, ...wps3];
    if (fullWps.length > 0) {
      roadCars.push({
        id: carIdSeq++,
        model,
        needKwh: 0,
        chargedKwh: 0,
        x: fullWps[0].x,
        y: fullWps[0].y,
        heading: goEast ? 0 : Math.PI,
        blinker: false,
        stuckSec: 0,
        ghostSec: 0,
        waypoints: fullWps,
        wpIndex: 0,
        destType: "commute",
        axis: "H",
        roadIdx: hIdx,
        dirSign: stepGx,
        curGx: nextSec2.gx,
        curGy: curCamSec.gy,
        speed: (model.isScooter ? 148 : 134) + Math.random() * 28
      });
    }
  } else {
    const vIdx = Math.floor(Math.random() * V_ROADS.length);
    const vRoad = V_ROADS[vIdx];
    const goSouth = vRoad.oneWay === 1 ? true : (vRoad.oneWay === -1 ? false : (Math.random() < 0.5));
    const startH = goSouth ? (Math.random() < 0.65 ? Math.floor(Math.random() * 8) + 2 : 0) : (Math.random() < 0.65 ? Math.floor(Math.random() * 8) + 1 : 10);
    const endH = goSouth ? 10 : 0;
    const nextStartH = goSouth ? 0 : 10;
    const stepGy = goSouth ? 1 : -1;
    const nextGy1 = Math.max(0, Math.min(5, curCamSec.gy + stepGy));
    const nextGy2 = Math.max(0, Math.min(5, curCamSec.gy + stepGy * 2));
    const nextSec1 = SECTOR_GRID_LOOKUP[nextGy1][curCamSec.gx] || curCamSec;
    const nextSec2 = SECTOR_GRID_LOOKUP[nextGy2][curCamSec.gx] || nextSec1;

    const wps1 = buildRightLaneWaypointsFromNodes(findGridNodePath(vIdx, startH, vIdx, endH), secOx, secOy);
    const wps2 = nextSec1.sIdx !== curCamSec.sIdx
      ? buildRightLaneWaypointsFromNodes(findGridNodePath(vIdx, nextStartH, vIdx, endH), nextSec1.ox, nextSec1.oy)
      : [];
    const wps3 = (nextSec2.sIdx !== nextSec1.sIdx)
      ? buildRightLaneWaypointsFromNodes(findGridNodePath(vIdx, nextStartH, vIdx, endH), nextSec2.ox, nextSec2.oy)
      : [];
    const fullWps = [...wps1, ...wps2, ...wps3];
    if (fullWps.length > 0) {
      roadCars.push({
        id: carIdSeq++,
        model,
        needKwh: 0,
        chargedKwh: 0,
        x: fullWps[0].x,
        y: fullWps[0].y,
        heading: goSouth ? Math.PI / 2 : -Math.PI / 2,
        blinker: false,
        stuckSec: 0,
        ghostSec: 0,
        waypoints: fullWps,
        wpIndex: 0,
        destType: "commute",
        axis: "V",
        roadIdx: vIdx,
        dirSign: stepGy,
        curGx: curCamSec.gx,
        curGy: nextSec2.gy,
        speed: (model.isScooter ? 148 : 134) + Math.random() * 28
      });
    }
  }
}

export function spawnEVOnMap() {
  const tl = getHanoiWeeklyTimelineState();
  // 64% phương tiện là dòng xe lưu thông liên quận (Xe điện + Taxi Lục Bảo + Xe xăng + Xe máy điện/xăng chạy xuyên qua vạch ranh giới Quận!)
  if (Math.random() < 0.64) {
    spawnCrossSectorCommuterOrScooter(tl);
    return;
  }

  const model = EV_MODELS[Math.floor(Math.random() * EV_MODELS.length)];
  const needKwh = Math.round(model.batteryKwh * (0.35 + Math.random() * 0.45));
  const candidates = [];

  state.lots.forEach(lot => {
    if (!lot.owned || lot.lockedByDebt) return;
    const freeBay = lot.bays.find(b => b.tier > 0 && !b.car && !b.incomingCarId);
    if (freeBay) {
      const scores = getLotAppealScores(lot);
      const relevantAppeal = model.isTaxi ? scores.taxiTotal : scores.casualTotal;
      const priceFactor = getLotBusinessMode(lot) === "franchise" ? 18 : 12;
      const weight = Math.max(4, 15 + relevantAppeal * 1.45 + priceFactor);
      candidates.push({ type: "player", lot, bay: freeBay, weight });
    }
  });

  const curCamSec = getSectorAtWorldPos(camera.x, camera.y);
  const activeRivals = SECTOR_RIVALS_MAP[curCamSec.sIdx] || RIVAL_STATIONS;
  activeRivals.forEach(rv => {
    const relevantAppeal = model.isTaxi ? rv.taxiAppeal : rv.casualAppeal;
    const weight = Math.max(10, 15 + relevantAppeal * 1.15);
    candidates.push({ type: "rival", rival: rv, weight });
  });

  if (candidates.length === 0) return;

  let totalWeight = candidates.reduce((acc, c) => acc + c.weight, 0);
  let roll = Math.random() * totalWeight;
  let chosen = candidates[0];
  for (const c of candidates) {
    roll -= c.weight;
    if (roll <= 0) {
      chosen = c;
      break;
    }
  }

  const borderNodes = [
    { v: 0, h: 0 }, { v: 0, h: 3 }, { v: 0, h: 6 }, { v: 0, h: 10 },
    { v: 10, h: 0 }, { v: 10, h: 3 }, { v: 10, h: 6 }, { v: 10, h: 10 },
    { v: 2, h: 0 }, { v: 5, h: 0 }, { v: 2, h: 10 }, { v: 8, h: 10 },
    { v: 4, h: 4 }, { v: 6, h: 5 }, { v: 3, h: 7 }, { v: 7, h: 3 }
  ];
  const startNode = borderNodes[Math.floor(Math.random() * borderNodes.length)];
  const newCarId = carIdSeq++;

  if (chosen.type === "player") {
    const lot = chosen.lot;
    const secOx = lot.ox || 0;
    const secOy = lot.oy || 0;
    chosen.bay.incomingCarId = newCarId;

    const hRoad = H_ROADS[lot.roadHIdx];
    const enterFromLeft = hRoad.oneWay === 1 ? true : (hRoad.oneWay === -1 ? false : (Math.random() < 0.5));
    const approachV = enterFromLeft ? lot.vLeftIdx : lot.vRightIdx;
    const travelDirX = enterFromLeft ? 1 : -1;
    const laneY = lot.roadY + travelDirX * LANE_OFFSET;

    const nodePath = findGridNodePath(startNode.v, startNode.h, approachV, lot.roadHIdx);
    const roadWps = buildRightLaneWaypointsFromNodes(nodePath, secOx, secOy);
    const targetPos = getBayWorldPos(lot, chosen.bay.id);

    const fullWps = [
      ...roadWps,
      { x: V_ROADS[approachV].x + secOx + travelDirX * 26, y: laneY, kind: "INTERSECTION_EXIT", dirX: travelDirX, dirY: 0, blinker: false },
      { x: lot.inGateX, y: laneY, kind: "TURN_INTO_GATE", dirX: travelDirX, dirY: 0, blinker: true },
      { x: lot.inGateX, y: lot.y, kind: "DRIVEWAY_IN", dirX: 0, dirY: Math.sign(lot.y - laneY), blinker: true },
      { x: targetPos.x, y: targetPos.y, kind: "BAY_DOCK", dirX: 0, dirY: -1, blinker: false }
    ];

    const firstWp = fullWps[0];
    roadCars.push({
      id: newCarId,
      model,
      needKwh,
      chargedKwh: 0,
      x: firstWp.x,
      y: firstWp.y,
      heading: Math.atan2(firstWp.dirY || 0, firstWp.dirX || 1),
      blinker: false,
      stuckSec: 0,
      ghostSec: 0,
      waypoints: fullWps,
      wpIndex: 0,
      destType: "player",
      lotId: lot.id,
      bayId: chosen.bay.id,
      speed: 130 + Math.random() * 25
    });
  } else {
    const rv = chosen.rival;
    const secOx = rv.ox || 0;
    const secOy = rv.oy || 0;
    const hRoad = H_ROADS[rv.hIdx];
    const enterFromLeft = hRoad.oneWay === 1 ? true : (hRoad.oneWay === -1 ? false : (Math.random() < 0.5));
    const approachV = enterFromLeft ? rv.vLeftIdx : rv.vRightIdx;
    const exitV = enterFromLeft ? rv.vRightIdx : rv.vLeftIdx;
    const travelDirX = enterFromLeft ? 1 : -1;
    const laneY = hRoad.y + secOy + travelDirX * LANE_OFFSET;

    const nodePath1 = findGridNodePath(startNode.v, startNode.h, approachV, rv.hIdx);
    const exitNode = borderNodes[Math.floor(Math.random() * borderNodes.length)];
    const nodePath2 = findGridNodePath(exitV, rv.hIdx, exitNode.v, exitNode.h);

    const fullWps = [
      ...buildRightLaneWaypointsFromNodes(nodePath1, secOx, secOy),
      { x: V_ROADS[approachV].x + secOx + travelDirX * 26, y: laneY, kind: "INTERSECTION_EXIT", dirX: travelDirX, dirY: 0, blinker: false },
      { x: rv.x - 10, y: laneY, kind: "TURN_INTO_GATE", dirX: travelDirX, dirY: 0, blinker: true },
      { x: rv.x - 10, y: rv.y, kind: "DRIVEWAY_IN", dirX: 0, dirY: Math.sign(rv.y - laneY), blinker: true },
      { x: rv.x + 10, y: rv.y, kind: "DRIVEWAY_OUT", dirX: 1, dirY: 0, blinker: true },
      { x: rv.x + 10, y: laneY, kind: "MERGE_ROAD", dirX: 0, dirY: Math.sign(laneY - rv.y), blinker: true },
      { x: V_ROADS[exitV].x + secOx - travelDirX * STOP_LINE_DIST, y: laneY, kind: "STOP_LINE", vIdx: exitV, hIdx: rv.hIdx, dirX: travelDirX, dirY: 0, blinker: false },
      ...buildRightLaneWaypointsFromNodes(nodePath2, secOx, secOy)
    ];
    if (fullWps.length === 0) return;
    roadCars.push({
      id: newCarId,
      model,
      needKwh,
      chargedKwh: 0,
      x: fullWps[0].x,
      y: fullWps[0].y,
      heading: 0,
      blinker: false,
      stuckSec: 0,
      ghostSec: 0,
      waypoints: fullWps,
      wpIndex: 0,
      destType: "rival",
      speed: 135
    });
  }
}

export function spawnExitingCarFromLot(lot, bayIdx, model) {
  const secOx = lot.ox || 0;
  const secOy = lot.oy || 0;
  const bayPos = getBayWorldPos(lot, bayIdx);
  const hRoad = H_ROADS[lot.roadHIdx];
  const exitRight = hRoad.oneWay === 1 ? true : (hRoad.oneWay === -1 ? false : (Math.random() < 0.5));
  const travelDirX = exitRight ? 1 : -1;
  const laneY = lot.roadY + travelDirX * LANE_OFFSET;
  const nextV = exitRight ? lot.vRightIdx : lot.vLeftIdx;

  const borderTargets = [
    { v: 0, h: 0 }, { v: 10, h: 0 }, { v: 0, h: 10 }, { v: 10, h: 10 }
  ];
  const finalBorder = borderTargets[Math.floor(Math.random() * borderTargets.length)];
  const nodePath = findGridNodePath(nextV, lot.roadHIdx, finalBorder.v, finalBorder.h);
  const roadWps = buildRightLaneWaypointsFromNodes(nodePath, secOx, secOy);

  const exitWps = [
    { x: lot.outGateX, y: bayPos.y, kind: "DRIVEWAY_OUT", dirX: Math.sign(lot.outGateX - bayPos.x) || 1, dirY: 0, blinker: true },
    { x: lot.outGateX, y: laneY, kind: "MERGE_ROAD", dirX: 0, dirY: Math.sign(laneY - bayPos.y) || 1, blinker: true },
    { x: V_ROADS[nextV].x + secOx - travelDirX * STOP_LINE_DIST, y: laneY, kind: "STOP_LINE", vIdx: nextV, hIdx: lot.roadHIdx, dirX: travelDirX, dirY: 0, blinker: false },
    ...roadWps
  ];

  roadCars.push({
    id: carIdSeq++,
    model,
    needKwh: 0,
    chargedKwh: 0,
    x: bayPos.x,
    y: bayPos.y,
    heading: Math.PI / 2,
    blinker: true,
    stuckSec: 0,
    ghostSec: 0,
    waypoints: exitWps,
    wpIndex: 0,
    destType: "exiting",
    speed: 135
  });
}


// Đăng ký vào globalThis để tương thích ngược với HTML event handlers & các module liên kết
Object.assign(globalThis, {
  getLotBoxDimensions,
  getBayWorldPos,
  spawnCrossSectorCommuterOrScooter,
  spawnEVOnMap,
  spawnExitingCarFromLot
});
