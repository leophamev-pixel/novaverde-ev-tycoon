/**
 * src/ui/finance-tab.js
 * Hiển thị Tab Sổ Cái Kế Toán, Thuế TNDN (CIT), Tiền thuê mặt bằng & Thanh toán Nợ
 */
export function renderTaxAndDebtTab() {
  const panel = document.getElementById("tax-and-debt-panel");
  if (!panel) return;

  let totalMonthlyRent = 0;
  let totalMonthlyGuardWage = 0;
  let activeGuardCount = 0;
  let totalMonthlyServiceTax = 0;
  state.lots.forEach(l => {
    if (!l.owned) return;
    totalMonthlyRent += getLotMonthlyRent(l);
    if (l.hasGuard) {
      totalMonthlyGuardWage += (l.guardMonthlyWage || 6000000);
      activeGuardCount++;
    }
    totalMonthlyServiceTax += getLotMonthlyServiceLicenseTax(l) + Math.round((l.monthlyAmenityRev || 0) * 0.05);
  });

  const taxInfo = getRemainingAnnualTaxDue();
  const citRatePct = Math.round(getCitRateByRevenue(state.yearlyGrossRevenue) * 100);
  const totalDebt = getTotalPlayerDebt();

  let html = `
    <div class="upgrade-card selected-lot">
      <div class="u-info">
        <div class="u-title">
          <span>${L("🧾 Chi Phí Định Kỳ Tháng (Thuê Đất • Lương Bảo Vệ • Thuế) & Quyết Toán Năm", "🧾 Monthly Fixed Costs (Lease • Guard Salary • Tax) & Annual Settlement")}</span>
          <span class="u-badge">${isEn() ? `M${state.month}/12 • D${state.dayOfMonth}/30` : `T${state.month}/12 • Ng${state.dayOfMonth}/30`}</span>
        </div>
        <div class="u-desc">
          • <b>${L("Hàng tháng (Ngày 30):", "Monthly (Day 30):")}</b> ${L("Thuê đất", "Land Lease")} <b style="color:#dc2626">${formatCompactVND(totalMonthlyRent)}</b> + ${L(`Lương Bảo vệ (${activeGuardCount} bốt)`, `Guard Salary (${activeGuardCount} booths)`)} <b style="color:#0284c7">${formatCompactVND(totalMonthlyGuardWage)}</b> + ${L("Thuế DV 5%", "5% Service Tax")} <b style="color:#b45309">${formatCompactVND(totalMonthlyServiceTax)}</b>.<br/>
          • <b>${L("Hàng năm (Tháng 12):", "Annually (Month 12):")}</b> ${L("Thuế Đất", "Land Tax")} <b style="color:#0369a1">${formatCompactVND(taxInfo.totalLandTax)}</b> + ${L("TNDN", "CIT")} ${citRatePct}% <b style="color:#047857">${formatCompactVND(taxInfo.citTax)}</b> (${L("Đã nộp trước:", "Prepaid:")} <b>${formatCompactVND(taxInfo.prepaid)}</b>).
        </div>
      </div>
      <div style="display:flex; flex-direction:column; gap:4px;">
        <button class="u-btn" ${taxInfo.remaining <= 0 || state.money <= 0 ? "disabled" : ""} onclick="payTaxNowManual()">
          🧾 ${L("Nộp Thuế Ngay", "Pay Tax Now")}<br/>(${formatCompactVND(taxInfo.remaining)})
        </button>
      </div>
    </div>
  `;

  if (totalDebt > 0) {
    html += `
      <div class="upgrade-card debt-card">
        <div class="u-info">
          <div class="u-title" style="color:#dc2626;">
            <span>${L("🚨 DƯ NỢ QUÁ HẠN (LÃI PHẠT 0,03%/NGÀY)", "🚨 OVERDUE DEBT (0.03%/DAY PENALTY)")}</span>
          </div>
          <div class="u-desc" style="color:#991b1b;">
            ${L("Tổng nợ:", "Total Debt:")} <b>${formatVND(totalDebt)}</b> (${L("Quá 360 ngày sẽ khóa lô đất", "Station locks after 360 overdue days")}).
          </div>
        </div>
        <button class="u-btn danger" onclick="payAllLotDebts()">
          💳 ${L("Tất Toán", "Pay All")}<br/>(${formatCompactVND(totalDebt)})
        </button>
      </div>
    `;
  }

  panel.innerHTML = html;

  document.getElementById("fin-yr-rev").textContent = formatVND(state.yearlyGrossRevenue);
  document.getElementById("fin-charge-rev").textContent = formatVND(state.totalProfitAllTime);
  document.getElementById("fin-tax-paid").textContent = formatVND(state.totalRentAndTaxPaid);
  document.getElementById("fin-debt-total").textContent = formatVND(totalDebt);
}


// Đăng ký vào globalThis để tương thích ngược với HTML event handlers & các module liên kết
Object.assign(globalThis, {
  renderTaxAndDebtTab
});
