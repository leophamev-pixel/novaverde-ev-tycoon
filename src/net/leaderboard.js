/**
 * src/net/leaderboard.js
 * Tính toán Xếp hạng Thị phần Người chơi vs Tập đoàn AI & Thưởng Tuần
 */
export function getPlayerLeaderboardRankInfo() {
  const totalOwned5400 = getTotalOwnedLotsAcrossAll5400();
  let totalChargers = 0;
  state.lots.forEach(l => {
    if (l.owned && !l.lockedByDebt) totalChargers += l.bays.length;
  });
  const myNetWorth = calcPlayerNetWorth();

  const meEntry = {
    id: window.mpState.playerId,
    name: `${window.mpState.playerName} (${L("Bạn", "You")})`,
    netWorth: myNetWorth,
    ownedLots: totalOwned5400,
    totalChargers,
    priceKwh: window.mpState.retailPriceKwh,
    isMe: true
  };

  const rawList = [
    ...window.mpState.leaderboard.filter(p => p.id !== window.mpState.playerId),
    meEntry
  ];

  const sortMode = (window.mpState && window.mpState.leaderboardSort) || "netWorth";
  // LDB-06 Tie-Breaker: Khi bằng điểm số với Bot, luôn ưu tiên xếp Người Chơi (isMe) lên hạng cao hơn!
  const tieBreakMeFirst = (a, b) => (a.isMe === b.isMe ? 0 : (a.isMe ? -1 : 1));
  const sorted = [...rawList].sort((a, b) => {
    if (sortMode === "chargers") return (b.totalChargers - a.totalChargers) || (b.netWorth - a.netWorth) || tieBreakMeFirst(a, b);
    if (sortMode === "lots") return (b.ownedLots - a.ownedLots) || (b.netWorth - a.netWorth) || tieBreakMeFirst(a, b);
    return (b.netWorth - a.netWorth) || tieBreakMeFirst(a, b);
  });

  const myRank = Math.max(1, sorted.findIndex(p => p.isMe) + 1);
  let tierTitleVi = "🥉 Doanh Nhân Khởi Nghiệp";
  let tierTitleEn = "🥉 Startup Founder";
  let rewardGd = 10000 * GREEN_DOLLAR_UNIT;
  let rewardGc = 3;
  let appealBonus = 2;

  if (myRank === 1) {
    tierTitleVi = "👑 Vua Trạm Sạc NovaVerde";
    tierTitleEn = "👑 NovaVerde EV King";
    rewardGd = 120000 * GREEN_DOLLAR_UNIT;
    rewardGc = 40;
    appealBonus = 15;
  } else if (myRank === 2) {
    tierTitleVi = "💎 Tài Phiệt Năng Lượng";
    tierTitleEn = "💎 Energy Magnate";
    rewardGd = 75000 * GREEN_DOLLAR_UNIT;
    rewardGc = 25;
    appealBonus = 10;
  } else if (myRank === 3) {
    tierTitleVi = "🥇 Chủ Tịch Tập Đoàn";
    tierTitleEn = "🥇 Corp Chairman";
    rewardGd = 45000 * GREEN_DOLLAR_UNIT;
    rewardGc = 15;
    appealBonus = 6;
  } else if (myRank <= 5) {
    tierTitleVi = "🥈 Giám Đốc Khu Vực";
    tierTitleEn = "🥈 Regional Director";
    rewardGd = 25000 * GREEN_DOLLAR_UNIT;
    rewardGc = 8;
    appealBonus = 3;
  }

  const rankBadge = document.getElementById("mp-conn-badge");
  if (rankBadge) {
    rankBadge.textContent = L(`🏆 Hạng #${myRank}`, `🏆 Rank #${myRank}`);
  }

  return {
    sorted,
    myRank,
    sortMode,
    tierTitle: isEn() ? tierTitleEn : tierTitleVi,
    rewardGd,
    rewardGc,
    appealBonus,
    totalOwned5400,
    totalChargers,
    myNetWorth
  };
}

export function setLeaderboardSortMode(mode) {
  if (window.mpState) window.mpState.leaderboardSort = mode;
  if (typeof playSfx === "function") playSfx("click");
  renderMultiplayerAndRivalsTab();
}

export function saveCustomPlayerCeoName() {
  const inp = document.getElementById("ceo-name-input");
  if (!inp) return;
  const cleaned = (inp.value || "").trim().slice(0, 24);
  if (!cleaned) return;
  window.mpState.playerName = cleaned;
  localStorage.setItem("HN_EV_MP_PLAYER_NAME", cleaned);
  if (typeof playSfx === "function") playSfx("cash");
  logEvent(L(`👔 Đã đổi tên Tập đoàn của bạn trên Bảng Xếp Hạng thành: "${cleaned}"!`, `👔 Updated your Corporation name on the Leaderboard to: "${cleaned}"!`));
  refreshAllUI();
}

globalThis._lastLeaderboardRewardClaimMs = 0;
export function processWeeklyLeaderboardReward(isManualDemo = false) {
  if (isManualDemo) return false;
  const nowMs = Date.now();
  // LDB-05: Chống spam-click nhận đúp phần thưởng mùa giải trong cùng thao tác
  if (nowMs - _lastLeaderboardRewardClaimMs < 800) return false;
  const curSeasonId = Math.floor((state.totalDaysElapsed || 1) / 7);
  if (state.lastAutoClaimedSeasonId === curSeasonId) return false;
  _lastLeaderboardRewardClaimMs = nowMs;
  if (!isManualDemo) state.lastAutoClaimedSeasonId = curSeasonId;

  const rk = getPlayerLeaderboardRankInfo();
  state.money += rk.rewardGd;
  state.greenCoins = (state.greenCoins || 0) + rk.rewardGc;
  state.weeklyRankAppealBonus = rk.appealBonus;
  state.totalRevenueAllTime += rk.rewardGd;
  state.totalProfitAllTime += rk.rewardGd;

  updateGreenCoinHUD();
  if (typeof playSfx === "function") playSfx("cash");
  if (typeof triggerHaptic === "function") triggerHaptic(40);

  const prefix = isManualDemo
    ? L("🎁 [THƯỞNG ĐUA TOP TUẦN]", "🎁 [WEEKLY RANK REWARD]")
    : L("🏆 [TỔNG KẾT ĐUA TOP CHỦ NHẬT]", "🏆 [SUNDAY LEADERBOARD PAYOUT]");

  window.mpState.recentFeed.unshift(
    `${prefix} #${rk.myRank} (${rk.tierTitle}): +${formatCompactVND(rk.rewardGd)} & +${formatGreenCoin(rk.rewardGc)}!`
  );
  logEvent(L(
    `${prefix} Đạt Hạng #${rk.myRank} (${rk.tierTitle}) — Nhận thưởng +${formatVND(rk.rewardGd)}, +${formatGreenCoin(rk.rewardGc)} & Buff +${rk.appealBonus}đ thu hút xe cho tuần mới!`,
    `${prefix} Ranked #${rk.myRank} (${rk.tierTitle}) — Awarded +${formatVND(rk.rewardGd)}, +${formatGreenCoin(rk.rewardGc)} & +${rk.appealBonus}pt appeal buff for the new week!`
  ));
  saveGameToStorage(false);
  refreshAllUI();
}


// Đăng ký vào globalThis để tương thích ngược với HTML event handlers & các module liên kết
Object.assign(globalThis, {
  getPlayerLeaderboardRankInfo,
  setLeaderboardSortMode,
  saveCustomPlayerCeoName,
  processWeeklyLeaderboardReward
});
