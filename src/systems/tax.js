/**
 * src/systems/tax.js
 * Hệ thống Thuế đất, Tiền thuê mặt bằng hàng tháng, Thuế TNDN (CIT) & Quản lý Nợ
 */
export function getLotMonthlyRent(lot) {
  if (!lot.owned || lot.ownershipType !== "leased") return 0;
  const discount = (state.ownedItems && state.ownedItems.item_solar_nano) ? 0.5 : 1.0;
  return Math.round(lot.areaM2 * (lot.monthlyRentPerM2 || 400000) * 0.18 * discount);
}

export function getLotMonthlyServiceLicenseTax(lot) {
  if (!lot.owned) return 0;
  let licenseTax = 250000;
  if (lot.amenities) {
    AMENITY_CATALOG.forEach(item => {
      const lvl = lot.amenities[item.id] || 0;
      if (lvl > 0) licenseTax += lvl * 350000;
    });
  }
  const discount = (state.ownedItems && state.ownedItems.item_solar_nano) ? 0.5 : 1.0;
  return Math.round(licenseTax * discount);
}

export function getLotAnnualLandTax(lot) {
  if (!lot.owned || lot.ownershipType !== "owned") return 0;
  const baseArea = Math.max(60, lot.areaM2 || 90);
  const taxableValue = Math.round((lot.buyLandCost || 80000000) * (baseArea / 90));
  const baseTax = taxableValue * 0.03;
  const sp = getLotSpatialBreakdown(lot);
  const unusedRatio = Math.max(0, sp.freeM2 - 20) / Math.max(1, sp.totalAreaM2);
  const unusedPenaltyTax = unusedRatio > 0.40 ? (taxableValue * unusedRatio * 0.05) : 0;
  return Math.round(baseTax + unusedPenaltyTax);
}

export function getCitRateByRevenue(yearlyGrossRev) {
  if (yearlyGrossRev <= 3000000000) return 0.15;
  if (yearlyGrossRev <= 50000000000) return 0.17;
  return 0.20;
}

export function getEstimatedAnnualCit() {
  const profit = Math.max(0, state.yearlyOperatingProfit);
  const rate = getCitRateByRevenue(state.yearlyGrossRevenue);
  return Math.round(profit * rate);
}

export function getRemainingAnnualTaxDue() {
  let totalLandTax = 0;
  state.lots.forEach(lot => {
    if (lot.owned && lot.ownershipType === "owned") totalLandTax += getLotAnnualLandTax(lot);
  });
  const citTax = getEstimatedAnnualCit();
  const grossAnnualTax = totalLandTax + citTax;
  const remaining = Math.max(0, grossAnnualTax - (state.yearlyPrepaidTax || 0));
  return { totalLandTax, citTax, grossAnnualTax, prepaid: state.yearlyPrepaidTax || 0, remaining };
}

export function getTotalPlayerDebt() {
  let sum = 0;
  state.lots.forEach(l => {
    if (l.owned) sum += (l.debtPrincipal || 0) + (l.debtInterest || 0);
  });
  return Math.round(sum);
}

/*****************************************************************************************
 * ĐIỀU KHIỂN POPOVER, MINIMAP & BOTTOM SHEET 3 NẤC (5.400 LÔ ĐẤT)
 *****************************************************************************************/

export function processMonthlyBilling() {
  let totalRentPaid = 0;
  let totalTaxPaidThisMonth = 0;
  let totalDebtAdded = 0;

  state.lots.forEach(lot => {
    if (!lot.owned) return;
    const rentDue = getLotMonthlyRent(lot);
    const guardDue = lot.hasGuard ? (lot.guardMonthlyWage || 6000000) : 0;
    const licenseTax = getLotMonthlyServiceLicenseTax(lot);
    const vatAmenityTax = Math.round((lot.monthlyAmenityRev || 0) * 0.05);
    const serviceTaxDue = licenseTax + vatAmenityTax;
    lot.monthlyAmenityRev = 0;

    const totalLotMonthlyDue = rentDue + guardDue + serviceTaxDue;
    if (totalLotMonthlyDue <= 0) return;

    if (state.money >= totalLotMonthlyDue) {
      state.money -= totalLotMonthlyDue;
      state.totalRentAndTaxPaid += (rentDue + serviceTaxDue);
      state.yearlyOperatingProfit -= totalLotMonthlyDue;
      totalRentPaid += (rentDue + guardDue);
      totalTaxPaidThisMonth += serviceTaxDue;
    } else {
      const paidPart = Math.max(0, state.money);
      const unpaid = totalLotMonthlyDue - paidPart;
      state.money -= paidPart;
      state.totalRentAndTaxPaid += paidPart;
      state.yearlyOperatingProfit -= paidPart;
      lot.debtPrincipal = (lot.debtPrincipal || 0) + unpaid;
      if (!lot.debtDaysOverdue || lot.debtDaysOverdue === 0) lot.debtDaysOverdue = 1;
      totalDebtAdded += unpaid;
    }
  });

  if (totalDebtAdded > 0) {
    logEvent(L(
      `⚠️ Cuối Tháng ${state.month}: Thiếu tiền đóng Thuê đất / Lương Bảo vệ / Thuế DV, nợ gốc +${formatVND(totalDebtAdded)} (Lãi phạt 0,03%/ngày)!`,
      `⚠️ End of Month ${state.month}: Insufficient funds for Lease / Guard Salary / Service Tax, principal debt +${formatVND(totalDebtAdded)} (0.03%/day penalty)!`
    ));
  } else if (totalRentPaid + totalTaxPaidThisMonth > 0) {
    logEvent(L(
      `📅 Cuối Tháng ${state.month}: Đã thanh toán Thuê đất & Lương Bảo vệ (${formatVND(totalRentPaid)}) + Thuế DV (${formatVND(totalTaxPaidThisMonth)}).`,
      `📅 End of Month ${state.month}: Paid Land Lease & Guard Salaries (${formatVND(totalRentPaid)}) + Service Tax (${formatVND(totalTaxPaidThisMonth)}).`
    ));
  }
}

export function processAnnualTaxSettlement() {
  const citRate = getCitRateByRevenue(state.yearlyGrossRevenue);
  const citDue = getEstimatedAnnualCit();

  let totalLandTax = 0;
  const ownedLots = state.lots.filter(l => l.owned && l.ownershipType === "owned");
  ownedLots.forEach(lot => { totalLandTax += getLotAnnualLandTax(lot); });

  const grossYearTax = totalLandTax + citDue;
  const prepaid = state.yearlyPrepaidTax || 0;
  const totalYearTaxDue = Math.max(0, grossYearTax - prepaid);

  if (totalYearTaxDue <= 0 && grossYearTax <= 0) return;

  let paidNow = 0;
  let unpaidTax = 0;
  if (state.money >= totalYearTaxDue) {
    paidNow = totalYearTaxDue;
    state.money -= totalYearTaxDue;
    state.totalRentAndTaxPaid += totalYearTaxDue;
  } else {
    paidNow = Math.max(0, state.money);
    unpaidTax = totalYearTaxDue - paidNow;
    state.money = 0;
    state.totalRentAndTaxPaid += paidNow;

    const targetLots = ownedLots.length > 0 ? ownedLots : state.lots.filter(l => l.owned);
    if (targetLots.length > 0) {
      const splitDebt = Math.round(unpaidTax / targetLots.length);
      targetLots.forEach(l => {
        l.debtPrincipal = (l.debtPrincipal || 0) + splitDebt;
        if (!l.debtDaysOverdue || l.debtDaysOverdue === 0) l.debtDaysOverdue = 1;
      });
    }
  }

  const modal = document.getElementById("offline-modal");
  const titleEl = document.getElementById("report-modal-title");
  const body = document.getElementById("offline-modal-body");
  if (modal && body) {
    titleEl.textContent = L(`🧾 QUYẾT TOÁN THUẾ ĐẤT & TNDN NĂM THỨ ${state.year}`, `🧾 YEAR ${state.year} LAND & CORPORATE TAX SETTLEMENT`);
    body.innerHTML = `
      <div style="font-weight:800; margin-bottom:8px;">
        ${L(`Tổng kết kỳ tính thuế cuối Năm ${state.year} (12 Tháng vận hành):`, `Annual corporate & land tax summary for Year ${state.year} (12 months):`)}
      </div>
      <div class="offline-lot-row">
        <div>• <b>${L("Doanh thu gộp cả năm:", "Annual Gross Revenue:")}</b> ${formatVND(state.yearlyGrossRevenue)}</div>
        <div>• <b>${L("Lợi nhuận chịu thuế TNDN:", "Taxable Operating Profit:")}</b> ${formatVND(Math.max(0, state.yearlyOperatingProfit))}</div>
        <div>• <b>${L(`Thuế TNDN (${Math.round(citRate * 100)}%):`, `Corporate Tax (${Math.round(citRate * 100)}%):`)}</b> <b>${formatVND(citDue)}</b></div>
        <div>• <b>${L("Thuế đất KD (0,03%/năm):", "Commercial Land Tax (0.03%/yr):")}</b> <b>${formatVND(totalLandTax)}</b></div>
        <div>• <b>${L("Đã chủ động tạm nộp:", "Prepaid Tax Credits:")}</b> <span style="color:#047857; font-weight:900;">-${formatVND(prepaid)}</span></div>
      </div>
      <div style="background:${unpaidTax > 0 ? '#fef2f2' : '#dcfce7'}; border:2px solid ${unpaidTax > 0 ? '#dc2626' : '#047857'}; border-radius:12px; padding:9px 10px; margin-top:8px;">
        <div style="font-weight:900; font-size:11.5px; color:${unpaidTax > 0 ? '#dc2626' : '#047857'};">
          ${L("Tổng Thuế Còn Phải Khấu Trừ:", "Remaining Tax Due:")} ${formatVND(totalYearTaxDue)}
        </div>
        <div style="font-size:9.8px; margin-top:4px; font-weight:700;">
          ${unpaidTax > 0
            ? L(`⚠️ Thiếu <b>${formatVND(unpaidTax)}</b> đã ghi vào Nợ Gốc (lãi phạt 0,03%/ngày, quá 360 ngày khóa lô đất)!`, `⚠️ Shortfall of <b>${formatVND(unpaidTax)}</b> added to Principal Debt (0.03%/day penalty, locks after 360 days)!`)
            : L(`✅ Đã khấu trừ đủ <b>${formatVND(paidNow)}</b> từ ngân quỹ!`, `✅ Deducted <b>${formatVND(paidNow)}</b> in full from your balance!`)}
        </div>
      </div>
    `;
    modal.classList.add("show");
  }
  logEvent(L(`🧾 Quyết toán Năm ${state.year}: Thuế Đất ${formatVND(totalLandTax)} + TNDN ${formatVND(citDue)}.`, `🧾 Year ${state.year} Tax Settlement: Land Tax ${formatVND(totalLandTax)} + CIT ${formatVND(citDue)}.`));
}

export function payTaxNowManual() {
  const info = getRemainingAnnualTaxDue();
  if (info.remaining <= 0) {
    logEvent(L("🧾 Bạn đã nộp đủ toàn bộ Thuế Đất KD & Thuế TNDN tạm tính tới hiện tại!", "🧾 You have already prepaid all estimated Land & Corporate Taxes to date!"));
    return false;
  }
  if ((state.money || 0) < info.remaining) {
    logEvent(L(
      `⚠️ Không đủ ngân quỹ để nộp thuế! Cần ${formatVND(info.remaining)} nhưng số dư hiện tại chỉ có ${formatVND(state.money)}.`,
      `⚠️ Insufficient funds to pay taxes! Need ${formatVND(info.remaining)} but current balance is only ${formatVND(state.money)}.`
    ));
    return false;
  }
  const payAmount = info.remaining;
  state.money -= payAmount;
  state.yearlyPrepaidTax = (state.yearlyPrepaidTax || 0) + payAmount;
  state.totalRentAndTaxPaid += payAmount;

  if (typeof playSfx === "function") playSfx("cash");
  const lot = getSelectedLot();
  if (lot) {
    floatTexts.push({
      x: lot.x,
      y: lot.y - 25,
      text: L(`🧾 Đã nộp thuế -${formatCompactVND(payAmount)}`, `🧾 Tax Paid -${formatCompactVND(payAmount)}`),
      color: "#0284c7",
      life: 2.0
    });
  }
  logEvent(L(`🧾 Đã nộp đủ ${formatVND(payAmount)} tiền Thuế Đất KD & Thuế TNDN năm ${state.year}!`, `🧾 Paid ${formatVND(payAmount)} in full for Year ${state.year} Land & Corporate Taxes!`));
  saveGameToStorage(false);
  refreshAllUI();
  return true;
}

export function advanceOneMonthBillingDemo() {
  for (let d = 0; d < 30; d++) {
    state.lots.forEach(lot => {
      if (!lot.owned || lot.lockedByDebt) return;
      const appeal = getLotAppealScores(lot);
      const dailyRev = (lot.bays.length * 480000) + (appeal.avgAppeal * 16000);
      const dailyAmenity = getLotAmenityBonusPerCar(lot) * 9;
      lot.monthlyAmenityRev = (lot.monthlyAmenityRev || 0) + dailyAmenity;
      state.money += dailyRev;
      state.totalRevenueAllTime += dailyRev;
      state.totalProfitAllTime += dailyRev;
      state.yearlyGrossRevenue += dailyRev;
      state.yearlyOperatingProfit += dailyRev;
    });
    processDailyDebtAndCalendar();
  }
  saveGameToStorage(false);
  refreshAllUI();
}

export function payLotDebt(lotId) {
  const lot = state.lots.find(l => l.id === lotId);
  if (!lot) return false;
  const totalDue = Math.round((lot.debtPrincipal || 0) + (lot.debtInterest || 0));
  if (totalDue <= 0) return false;

  if ((state.money || 0) < totalDue) {
    logEvent(L(
      `⚠️ Không đủ ngân quỹ để tất toán nợ cho ${getLotDisplayName(lot)}! Cần ${formatVND(totalDue)} nhưng số dư hiện tại chỉ có ${formatVND(state.money)}.`,
      `⚠️ Insufficient funds to pay off debt for ${getLotDisplayName(lot)}! Need ${formatVND(totalDue)} but current balance is only ${formatVND(state.money)}.`
    ));
    return false;
  }

  state.money -= totalDue;
  state.totalRentAndTaxPaid += totalDue;
  lot.debtPrincipal = 0;
  lot.debtInterest = 0;
  lot.debtDaysOverdue = 0;
  lot.lockedByDebt = false;
  if (typeof playSfx === "function") playSfx("cash");
  logEvent(L(`✅ Đã tất toán 100% nợ quá hạn (${formatVND(totalDue)}) cho ${getLotDisplayName(lot)}!`, `✅ Paid off 100% of overdue debt (${formatVND(totalDue)}) for ${getLotDisplayName(lot)}!`));
  saveGameToStorage(false);
  refreshAllUI();
  return true;
}

export function payAllLotDebts() {
  const totalDebt = getTotalPlayerDebt();
  if (totalDebt <= 0) return false;
  if ((state.money || 0) < totalDebt) {
    logEvent(L(
      `⚠️ Không đủ ngân quỹ để tất toán toàn bộ dư nợ! Cần ${formatVND(totalDebt)} nhưng số dư hiện tại chỉ có ${formatVND(state.money)}.`,
      `⚠️ Insufficient funds to pay off all overdue debts! Need ${formatVND(totalDebt)} but current balance is only ${formatVND(state.money)}.`
    ));
    return false;
  }
  state.lots.forEach(l => {
    if (l.owned && (l.debtPrincipal > 0 || l.debtInterest > 0)) {
      const due = Math.round((l.debtPrincipal || 0) + (l.debtInterest || 0));
      state.money = Math.max(0, state.money - due);
      state.totalRentAndTaxPaid += due;
      l.debtPrincipal = 0;
      l.debtInterest = 0;
      l.debtDaysOverdue = 0;
      l.lockedByDebt = false;
    }
  });
  if (typeof playSfx === "function") playSfx("cash");
  logEvent(L(`✅ Đã tất toán toàn bộ dư nợ quá hạn (${formatVND(totalDebt)}) trên hệ thống!`, `✅ Paid off all overdue debts (${formatVND(totalDebt)}) across your network!`));
  saveGameToStorage(false);
  refreshAllUI();
  return true;
}

/*****************************************************************************************
 * CAMERA PAN & ZOOM (TÍCH HỢP MA TRẬN NGHỊCH ĐẢO ISOMETRIC 2.5D CHÍNH XÁC TUYỆT ĐỐI)
 *****************************************************************************************/

// Đăng ký vào globalThis để tương thích ngược với HTML event handlers & các module liên kết
Object.assign(globalThis, {
  getLotMonthlyRent,
  getLotMonthlyServiceLicenseTax,
  getLotAnnualLandTax,
  getCitRateByRevenue,
  getEstimatedAnnualCit,
  getRemainingAnnualTaxDue,
  getTotalPlayerDebt,
  processMonthlyBilling,
  processAnnualTaxSettlement,
  payTaxNowManual,
  advanceOneMonthBillingDemo,
  payLotDebt,
  payAllLotDebts
});
