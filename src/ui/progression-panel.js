/**
 * src/ui/progression-panel.js
 * GIAO DIỆN GIAI ĐOẠN 2:
 * - Banner Nhiệm vụ Chính tuyến & Hướng dẫn Tân thủ (Main Quest & Tutorial Card)
 * - Trạm Pin Lưu Trữ BESS & Biểu giá Điện lưới EVN theo khung giờ + Tài nguyên trung gian (⭐ Danh tiếng, 📜 Giấy phép)
 * - Bảng Quản lý 3 vị trí Nhân sự Trạm sạc (Bảo vệ, Kỹ thuật viên Điện, Quản lý Dịch vụ)
 * - Sơ đồ Cây Công Nghệ Mở Khóa (Tech / Unlock Tree DAG)
 * - Hộp thoại Sự kiện Đô thị Ngẫu nhiên có Lựa chọn (Interactive Decision Event Card)
 */

import {
  BESS_UPGRADE_COST_VND,
  STAFF_TECH_HIRE_COSTS,
  STAFF_TECH_SPEED_BONUS,
  STAFF_MANAGER_HIRE_COSTS,
  STAFF_MANAGER_AMENITY_BONUS
} from "../data/balance.js";
import { UNLOCK_TREE_DAG } from "../data/unlock-tree.js";
import { getActiveMainQuest, MAIN_QUESTS_CHAIN } from "../systems/quest.js";
import {
  ensureProgressionState,
  syncNaturalTechUnlocks,
  getCurrentGridTariffInfo,
  INTERACTIVE_URBAN_EVENTS
} from "../systems/progression.js";

export function renderStage2LotProgressionBox(lot) {
  if (!lot) return "";
  syncNaturalTechUnlocks();
  const prog = ensureProgressionState();
  if (!prog) return "";

  const Lfn = globalThis.L || ((v) => v);
  const fmt = globalThis.formatCompactVND || ((v) => v);
  const en = Boolean(globalThis.isEn && globalThis.isEn());

  // 1. Khung Nhiệm vụ Chính tuyến & Hướng dẫn Tân thủ
  const activeQ = getActiveMainQuest();
  const completedCount = Object.keys((globalThis.state.quests && globalThis.state.quests.claimedMainIds) || {}).length;
  let questHtml = "";

  if (activeQ) {
    const qTitle = en ? activeQ.titleEn : activeQ.title;
    const qDesc = en ? activeQ.descEn : activeQ.desc;
    questHtml = `
      <div style="background:linear-gradient(135deg,#064e3b,#0f172a);color:#fff;border:2px solid ${activeQ.isReadyToClaim ? "#facc15" : "#10b981"};border-radius:12px;padding:8px 10px;margin-bottom:8px;box-shadow:0 4px 12px rgba(0,0,0,0.2);">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;">
          <span style="font-size:10px;font-weight:900;color:#fde047;">
            🎯 ${Lfn("NHIỆM VỤ TÂN THỦ & TIẾN TRÌNH", "MAIN PROGRESSION QUEST")} (${completedCount}/${MAIN_QUESTS_CHAIN.length})
          </span>
          <span style="font-size:8.5px;background:rgba(255,255,255,0.12);padding:2px 6px;border-radius:99px;color:#6ee7b7;font-weight:800;">
            ⭐ ${prog.driverReputation || 0} ${Lfn("Danh tiếng", "Rep")} • 📜 ${prog.expansionPermits || 0} ${Lfn("Giấy phép", "Permits")}
          </span>
        </div>
        <div style="font-size:10.5px;font-weight:900;color:#ecfdf5;margin-top:4px;">${activeQ.icon} ${qTitle}</div>
        <div style="font-size:8.8px;color:#cbd5e1;margin-top:2px;line-height:1.35;">${qDesc}</div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;padding-top:5px;border-top:1px dashed rgba(148,163,184,0.3);">
          <span style="font-size:8.5px;color:#fde047;font-weight:800;">
            🎁 ${Lfn("Thưởng:", "Reward:")} +${fmt(activeQ.rewardMoney)} • +${activeQ.rewardGc} GC • +${activeQ.rewardReputation}⭐ • +${activeQ.rewardKwh} kWh
          </span>
          ${
            activeQ.isReadyToClaim
              ? `<button class="u-btn" style="background:linear-gradient(180deg,#facc15,#eab308);color:#1e293b;font-weight:900;padding:4px 10px;font-size:9.5px;" onclick="claimMainQuestReward('${activeQ.id}')">🎁 ${Lfn("NHẬN THƯỞNG NGAY", "CLAIM REWARD")}</button>`
              : `<span style="font-size:8.2px;color:#93c5fd;font-weight:800;">⏳ ${Lfn("Đang thực hiện...", "In progress...")}</span>`
          }
        </div>
      </div>
    `;
  } else {
    questHtml = `
      <div style="background:#ecfdf5;border:1.5px solid #059669;border-radius:10px;padding:6px 10px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:9.5px;font-weight:900;color:#065f46;">🏆 ${Lfn("Đã hoàn thành trọn bộ 6/6 Nhiệm vụ Chính tuyến!", "All 6/6 Main Quests Completed!")}</span>
        <span style="font-size:9px;font-weight:900;color:#b45309;">⭐ ${prog.driverReputation || 0} • 📜 ${prog.expansionPermits || 0}</span>
      </div>
    `;
  }

  // 2. Hộp Sự kiện Đô thị Ngẫu nhiên có Lựa chọn (nếu đang kích hoạt)
  let choiceEvtHtml = "";
  if (prog.activeChoiceEvent) {
    const evt = INTERACTIVE_URBAN_EVENTS.find(e => e.id === prog.activeChoiceEvent);
    if (evt) {
      const eTitle = en ? evt.titleEn : evt.title;
      const eDesc = en ? evt.descEn : evt.desc;
      const lblA = en ? evt.optionA.labelEn : evt.optionA.label;
      const lblB = en ? evt.optionB.labelEn : evt.optionB.label;
      choiceEvtHtml = `
        <div style="background:#fff1f2;border:2px solid #e11d48;border-radius:11px;padding:8px 10px;margin-bottom:8px;">
          <div style="font-size:10px;font-weight:900;color:#9f1239;">${evt.icon} ${Lfn("SỰ KIỆN ĐÔ THỊ KHẨN CẤP:", "URBAN DECISION EVENT:")} ${eTitle}</div>
          <div style="font-size:8.6px;color:#4c0519;margin:3px 0 6px;line-height:1.35;">${eDesc}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
            <button class="u-btn" style="background:#059669;color:#fff;font-size:8.8px;padding:5px 6px;" onclick="resolveInteractiveUrbanEvent('A')">${lblA}</button>
            <button class="u-btn secondary" style="font-size:8.8px;padding:5px 6px;" onclick="resolveInteractiveUrbanEvent('B')">${lblB}</button>
          </div>
        </div>
      `;
    }
  }

  // 3. Khung Tài nguyên Trung gian: Điện năng lưới EVN & Pin Lưu Trữ BESS
  const tariff = getCurrentGridTariffInfo();
  const kwhStored = Math.round(prog.gridKwhStored || 0);
  const kwhCap = Math.round(prog.gridKwhCapacity || 800);
  const fillPct = Math.max(0, Math.min(100, Math.round((kwhStored / Math.max(1, kwhCap)) * 100)));
  const bessUpgCost = BESS_UPGRADE_COST_VND * (prog.bessLevel || 1);
  const buy300Cost = Math.round(300 * tariff.pricePerKwhVnd);

  const gridBessHtml = `
    <div style="background:#f8fafc;border:1.8px solid #0284c7;border-radius:11px;padding:8px 10px;margin-bottom:8px;">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:4px;">
        <span style="font-size:9.8px;font-weight:900;color:#0f172a;">
          🔋 ${Lfn("ĐIỆN LƯỚI EVN & PIN LƯU TRỮ BESS", "EVN GRID & BESS BATTERY STORAGE")} (Lv${prog.bessLevel || 1})
        </span>
        <span style="font-size:8.5px;font-weight:900;color:${tariff.color};background:#e0f2fe;padding:2px 7px;border-radius:99px;">
          ${tariff.label}: ${(tariff.pricePerKwhVnd / 1000).toFixed(2)} G$/kWh
        </span>
      </div>

      <div style="margin:6px 0 4px;background:#e2e8f0;height:11px;border-radius:99px;overflow:hidden;border:1px solid #94a3b8;">
        <div style="width:${fillPct}%;height:100%;background:linear-gradient(90deg,#10b981,#0284c7);transition:width 0.25s;"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:8.4px;font-weight:800;color:#334155;margin-bottom:6px;">
        <span>⚡ ${Lfn("Dự trữ:", "Stored:")} <b>${kwhStored.toLocaleString()} / ${kwhCap.toLocaleString()} kWh</b> (${fillPct}%)</span>
        <span style="color:${kwhStored > 0 ? "#047857" : "#64748b"};">
          ${kwhStored > 0 ? Lfn("🟢 Đang kích hoạt +35% Lợi nhuận sạc!", "🟢 +35% Charging Margin Active!") : Lfn("⚪ Hết điện dự trữ (Dùng điện lưới trực tiếp)", "⚪ Empty (Using direct grid power)")}
        </span>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:5px;">
        <button class="u-btn" style="font-size:8.4px;padding:5px 4px;" onclick="buyWholesaleGridKwh(300)">
          ⚡ ${Lfn("Nạp +300 kWh", "Buy +300 kWh")}<br/><small>(${fmt(buy300Cost)})</small>
        </button>
        <button class="u-btn secondary" style="font-size:8.4px;padding:5px 4px;" onclick="upgradeBessCapacity()">
          🔋 ${Lfn("Nâng Cấp Pin", "Upgrade BESS")}<br/><small>(${fmt(bessUpgCost)})</small>
        </button>
        <button class="u-btn ${prog.autoBuyOffPeak ? "" : "secondary"}" style="font-size:8.4px;padding:5px 4px;" onclick="toggleAutoBuyOffPeak()">
          🌙 ${Lfn("Tự Nạp Đêm:", "Auto Off-Peak:")}<br/><small>${prog.autoBuyOffPeak ? Lfn("ĐANG BẬT", "ON") : Lfn("ĐANG TẮT", "OFF")}</small>
        </button>
      </div>
    </div>
  `;

  // 4. Khung Quản lý Nhân sự Trạm sạc (chỉ hiện khi lô đất đã thuộc sở hữu của người chơi)
  let staffHtml = "";
  if (lot.owned) {
    const techLvl = Math.max(0, Math.min(3, Number(lot.techStaffLevel) || 0));
    const mgrLvl = Math.max(0, Math.min(3, Number(lot.managerStaffLevel) || 0));
    const techNextCost = STAFF_TECH_HIRE_COSTS[techLvl + 1] || 0;
    const mgrNextCost = STAFF_MANAGER_HIRE_COSTS[mgrLvl + 1] || 0;
    const techPct = Math.round((STAFF_TECH_SPEED_BONUS[techLvl] || 0) * 100);
    const mgrPct = Math.round((STAFF_MANAGER_AMENITY_BONUS[mgrLvl] || 0) * 100);

    staffHtml = `
      <div style="background:#fffbeb;border:1.8px solid #d97706;border-radius:11px;padding:8px 10px;margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
          <span style="font-size:9.6px;font-weight:900;color:#78350f;">
            👷 ${Lfn("ĐỘI NGŨ NHÂN SỰ VẬN HÀNH TRẠM", "STATION STAFF MANAGEMENT")} (Lô #${lot.id})
          </span>
          <button class="sheet-mini-btn" style="font-size:8px;padding:2px 6px;" onclick="triggerInteractiveUrbanEvent()">
            🎲 ${Lfn("Sự Kiện Đô Thị", "Urban Event")}
          </button>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:5px;">
          <div style="background:#fff;border:1px solid #fcd34d;border-radius:8px;padding:5px;text-align:center;">
            <div style="font-size:9px;font-weight:900;color:#1e293b;">🛡️ ${Lfn("Bảo Vệ 24/7", "24/7 Guard")}</div>
            <div style="font-size:8px;color:#047857;margin:2px 0;">${lot.hasGuard ? Lfn("Chống xe xăng 100%", "Anti-Squatter ON") : Lfn("Chưa thuê", "Not hired")}</div>
            <button class="u-btn ${lot.hasGuard ? "secondary" : ""}" style="width:100%;font-size:8px;padding:3px;" onclick="hireOrUpgradeLotStaff(${lot.id}, 'guard')">
              ${lot.hasGuard ? Lfn("Đang trực (Nghỉ)", "Active (Dismiss)") : Lfn("Thuê (6K G$/th)", "Hire (6K G$/mo)")}
            </button>
          </div>

          <div style="background:#fff;border:1px solid #fcd34d;border-radius:8px;padding:5px;text-align:center;">
            <div style="font-size:9px;font-weight:900;color:#1e293b;">🔧 ${Lfn("Kỹ Thuật Viên", "EV Tech")} (Lv${techLvl}/3)</div>
            <div style="font-size:8px;color:#0284c7;margin:2px 0;">+${techPct}% ${Lfn("Tốc độ sạc", "Charge Spd")}</div>
            ${
              techLvl < 3
                ? `<button class="u-btn" style="width:100%;font-size:8px;padding:3px;" onclick="hireOrUpgradeLotStaff(${lot.id}, 'tech')">${Lfn("Đào tạo", "Train")} (${fmt(techNextCost)})</button>`
                : `<span style="font-size:8px;font-weight:900;color:#059669;">${Lfn("✓ Cấp Tối Đa", "✓ Max Level")}</span>`
            }
          </div>

          <div style="background:#fff;border:1px solid #fcd34d;border-radius:8px;padding:5px;text-align:center;">
            <div style="font-size:9px;font-weight:900;color:#1e293b;">👩‍💼 ${Lfn("Quản Lý DV", "Manager")} (Lv${mgrLvl}/3)</div>
            <div style="font-size:8px;color:#7c3aed;margin:2px 0;">+${mgrPct}% ${Lfn("Lãi Tiện ích", "Amenity Rev")}</div>
            ${
              mgrLvl < 3
                ? `<button class="u-btn" style="width:100%;font-size:8px;padding:3px;" onclick="hireOrUpgradeLotStaff(${lot.id}, 'manager')">${Lfn("Bổ nhiệm", "Appoint")} (${fmt(mgrNextCost)})</button>`
                : `<span style="font-size:8px;font-weight:900;color:#059669;">${Lfn("✓ Cấp Tối Đa", "✓ Max Level")}</span>`
            }
          </div>
        </div>
      </div>
    `;
  }

  const stg3Html = typeof globalThis.renderStage3AnalyticsAndAudioBox === "function" ? globalThis.renderStage3AnalyticsAndAudioBox() : "";
  return questHtml + choiceEvtHtml + gridBessHtml + staffHtml + stg3Html;
}

export function renderStage2UnlockTreeBox() {
  syncNaturalTechUnlocks();
  const prog = ensureProgressionState();
  if (!prog) return "";

  const Lfn = globalThis.L || ((v) => v);
  const fmt = globalThis.formatCompactVND || ((v) => v);
  const en = Boolean(globalThis.isEn && globalThis.isEn());
  const unlocked = prog.unlockedTechIds || {};

  const cardsHtml = UNLOCK_TREE_DAG.map(node => {
    const isUnl = Boolean(unlocked[node.id]);
    const parentsOk = (node.parents || []).every(pid => Boolean(unlocked[pid]));
    const title = en ? node.nameEn : node.name;
    const reqTxt = en ? node.reqDescEn : node.reqDesc;
    const benTxt = en ? node.benefitDescEn : node.benefitDesc;

    return `
      <div style="background:${isUnl ? "#ecfdf5" : (parentsOk ? "#fffbeb" : "#f1f5f9")};border:1.5px solid ${isUnl ? "#10b981" : (parentsOk ? "#f59e0b" : "#cbd5e1")};border-radius:9px;padding:6px 8px;display:flex;justify-content:space-between;align-items:center;gap:6px;">
        <div style="flex:1;min-width:0;">
          <div style="font-size:9.3px;font-weight:900;color:#0f172a;">
            ${node.icon} ${title}
            <span style="font-size:7.8px;padding:1px 5px;border-radius:99px;background:${isUnl ? "#059669" : "#475569"};color:#fff;margin-left:4px;">
              ${isUnl ? Lfn("✓ ĐÃ MỞ KHÓA", "✓ UNLOCKED") : Lfn("🔒 CHƯA MỞ", "🔒 LOCKED")}
            </span>
          </div>
          <div style="font-size:8px;color:#475569;margin-top:1px;">• ${reqTxt}</div>
          <div style="font-size:8px;color:#047857;font-weight:700;">• ${benTxt}</div>
        </div>
        <div>
          ${
            isUnl
              ? `<span style="font-size:11px;font-weight:900;color:#059669;">✅</span>`
              : parentsOk
              ? `<button class="u-btn" style="font-size:8px;padding:4px 7px;white-space:nowrap;" onclick="researchTechNode('${node.id}')">🔬 ${Lfn("Nghiên cứu", "Research")}<br/>(${fmt(node.researchCostVnd)})</button>`
              : `<span style="font-size:8px;color:#94a3b8;font-weight:800;">${Lfn("Cần nhánh trước", "Locked")}</span>`
          }
        </div>
      </div>
    `;
  }).join("");

  return `
    <div style="background:#f8fafc;border:2px solid #6366f1;border-radius:12px;padding:8px 10px;margin-bottom:8px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <span style="font-size:10px;font-weight:900;color:#312e81;">
          🔬 ${Lfn("CÂY CÔNG NGHỆ & ĐỒ THỊ MỞ KHÓA (TECH DAG)", "TECH & UNLOCK TREE (DAG)")}
        </span>
        <span style="font-size:8.2px;font-weight:800;color:#4338ca;">
          ${Object.keys(unlocked).filter(k => unlocked[k]).length}/${UNLOCK_TREE_DAG.length} ${Lfn("Công nghệ", "Unlocked")}
        </span>
      </div>
      <div style="display:flex;flex-direction:column;gap:5px;">
        ${cardsHtml}
      </div>
      <div style="margin-top:7px;padding-top:6px;border-top:1px dashed #cbd5e1;font-size:8px;color:#334155;">
        <b>📊 ${Lfn("BẢNG SO SÁNH ROI TRỤ SẠC & TIỆN ÍCH (BƯỚC 2.1):", "CHARGER & AMENITY ROI BENCHMARK:")}</b>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:3px;">
          <div>${Lfn("• AC 11kW: ~180 G$/ph (~55p hoàn vốn)", "• AC 11kW: ~180 G$/min (~55m payback)")}</div>
          <div>${Lfn("• DC 30kW: ~490 G$/ph (+172% tốc độ)", "• DC 30kW: ~490 G$/min (+172% speed)")}</div>
          <div>${Lfn("• DC 60kW: ~980 G$/ph (~56p hoàn vốn)", "• DC 60kW: ~980 G$/min (~56m payback)")}</div>
          <div>${Lfn("• Siêu Trụ 120kW: ~1,960 G$/ph (~48p hoàn vốn)", "• 120kW Supercharger: ~1,960 G$/min (~48m payback)")}</div>
        </div>
      </div>
    </div>
  `;
}

Object.assign(globalThis, {
  renderStage2LotProgressionBox,
  renderStage2UnlockTreeBox
});
